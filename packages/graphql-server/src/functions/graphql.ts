/* eslint-disable react-hooks/rules-of-hooks */
import { useDisableIntrospection } from '@envelop/disable-introspection'
import { useFilterAllowedOperations } from '@envelop/filter-operation-type'
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda'
import { GraphQLSchema, OperationTypeNode } from 'graphql'
import { Plugin, useReadinessCheck, createYoga } from 'graphql-yoga'

import { getConfig } from '@redwoodjs/project-config'

import { mapRwCorsOptionsToYoga } from '../cors'
import { makeDirectivesForPlugin } from '../directives/makeDirectives'
import { getAsyncStoreInstance } from '../globalContext'
import { makeMergedSchema } from '../makeMergedSchema/makeMergedSchema'
import {
  useArmor,
  useRedwoodAuthContext,
  useRedwoodDirective,
  useRedwoodError,
  useRedwoodGlobalContextSetter,
  useRedwoodOpenTelemetry,
  useRedwoodLogger,
  useRedwoodPopulateContext,
} from '../plugins'
import type {
  useRedwoodDirectiveReturn,
  DirectivePluginOptions,
} from '../plugins/useRedwoodDirective'

import type { GraphQLHandlerOptions } from './types'
/**
 * Creates an Enveloped GraphQL Server, configured with default Redwood plugins
 *
 * You can add your own plugins by passing them to the extraPlugins object
 *
 * @see https://www.envelop.dev/ for information about envelop
 * @see https://www.envelop.dev/plugins for available envelop plugins
 * ```js
 * export const handler = createGraphQLHandler({ schema, context, getCurrentUser })
 * ```
 */
export const createGraphQLHandler = ({
  healthCheckId,
  loggerConfig,
  context,
  getCurrentUser,
  onException,
  generateGraphiQLHeader,
  extraPlugins,
  authDecoder,
  cors,
  services,
  sdls,
  directives = [],
  armorConfig,
  allowedOperations,
  allowIntrospection,
  defaultError = 'Something went wrong.',
  graphiQLEndpoint = '/graphql',
  schemaOptions,
}: GraphQLHandlerOptions) => {
  let schema: GraphQLSchema
  let redwoodDirectivePlugins = [] as Plugin[]
  const logger = loggerConfig.logger

  try {
    // @NOTE: Directives are optional
    const projectDirectives = makeDirectivesForPlugin(directives)

    if (projectDirectives.length > 0) {
      ;(redwoodDirectivePlugins as useRedwoodDirectiveReturn[]) =
        projectDirectives.map((directive) =>
          useRedwoodDirective(directive as DirectivePluginOptions)
        )
    }

    schema = makeMergedSchema({
      sdls,
      services,
      directives: projectDirectives,
      schemaOptions,
    })
  } catch (e) {
    logger.fatal(e as Error, '\n ⚠️ GraphQL server crashed \n')

    // Forcefully crash the graphql server
    // so users know that a misconfiguration has happened
    process.exit(1)
  }

  // Important: Plugins are executed in order of their usage, and inject functionality serially,
  // so the order here matters
  const isDevEnv = process.env.NODE_ENV === 'development'

  const plugins: Array<Plugin<any>> = []

  if (
    (allowIntrospection == null && !isDevEnv) ||
    allowIntrospection === false
  ) {
    plugins.push(useDisableIntrospection())
  }

  // Custom Redwood plugins
  plugins.push(useRedwoodAuthContext(getCurrentUser, authDecoder))
  plugins.push(useRedwoodGlobalContextSetter())

  if (context) {
    plugins.push(useRedwoodPopulateContext(context))
  }

  // Custom Redwood plugins
  plugins.push(...redwoodDirectivePlugins)

  // Custom Redwood OpenTelemetry plugin
  let openTelemetryPluginEnabled = false
  try {
    openTelemetryPluginEnabled = getConfig().experimental.opentelemetry.enabled
  } catch (_error) {
    // Swallow this error for the time being as we don't always have access to the
    // config toml depending on the deploy environment
  }
  if (openTelemetryPluginEnabled) {
    plugins.push(useRedwoodOpenTelemetry())
  }

  // Secure the GraphQL server
  plugins.push(useArmor(logger, armorConfig))

  // Only allow execution of specific operation types
  plugins.push(
    useFilterAllowedOperations(
      allowedOperations || [OperationTypeNode.QUERY, OperationTypeNode.MUTATION]
    )
  )

  // App-defined plugins
  if (extraPlugins && extraPlugins.length > 0) {
    plugins.push(...extraPlugins)
  }

  plugins.push(useRedwoodError(logger))

  plugins.push(
    useReadinessCheck({
      endpoint: graphiQLEndpoint + '/readiness',
      check: async ({ request }) => {
        try {
          // if we can reach the health check endpoint ...
          const response = await yoga.fetch(
            new URL(graphiQLEndpoint + '/health', request.url)
          )

          const expectedHealthCheckId = healthCheckId || 'yoga'

          // ... and the health check id's match the request and response's
          const status =
            response.headers.get('x-yoga-id') === expectedHealthCheckId &&
            request.headers.get('x-yoga-id') === expectedHealthCheckId

          // then we're good to go (or not)
          return status
        } catch (err) {
          logger.error(err)
          return false
        }
      },
    })
  )

  // Must be "last" in plugin chain, but before error masking
  // so can process any data added to results and extensions
  plugins.push(useRedwoodLogger(loggerConfig))

  const yoga = createYoga({
    id: healthCheckId,
    landingPage: isDevEnv,
    schema,
    plugins,
    maskedErrors: {
      errorMessage: defaultError,
      isDev: isDevEnv,
    },
    logging: logger,
    healthCheckEndpoint: graphiQLEndpoint + '/health',
    graphqlEndpoint: graphiQLEndpoint,
    graphiql: isDevEnv
      ? {
          title: 'Redwood GraphQL Playground',
          headers: generateGraphiQLHeader
            ? generateGraphiQLHeader()
            : `{"x-auth-comment": "See documentation: https://redwoodjs.com/docs/cli-commands#setup-graphiQL-headers on how to auto generate auth headers"}`,
          defaultQuery: `query Redwood {
  redwood {
    version
  }
}`,
          headerEditorEnabled: true,
        }
      : false,
    cors: (request: Request) => {
      const requestOrigin = request.headers.get('origin')
      return mapRwCorsOptionsToYoga(cors, requestOrigin)
    },
  })

  const handlerFn = async (
    event: APIGatewayProxyEvent,
    requestContext: LambdaContext
  ): Promise<APIGatewayProxyResult> => {
    // In the future, this could be part of a specific handler for AWS lambdas
    requestContext.callbackWaitsForEmptyEventLoop = false

    let lambdaResponse: APIGatewayProxyResult

    try {
      // url needs to be normalized
      const [, rest = ''] = event.path.split(graphiQLEndpoint)
      const url = new URL(graphiQLEndpoint + rest, 'http://localhost')

      if (event.queryStringParameters != null) {
        for (const queryName in event.queryStringParameters) {
          const queryValue = event.queryStringParameters[queryName]
          if (queryValue != null) {
            url.searchParams.set(queryName, queryValue)
          }
        }
      }

      const response = await yoga.fetch(
        url,
        {
          method: event.httpMethod,
          headers: event.headers as HeadersInit,
          body: event.body
            ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
            : undefined,
        },
        {
          event,
          requestContext,
        }
      )

      // @WARN - multivalue headers aren't supported on all deployment targets correctly
      // Netlify ✅, Vercel 🛑, AWS ✅,...
      // From https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
      // If you specify values for both headers and multiValueHeaders, API Gateway merges them into a single list.
      const responseHeaders: Record<string, string> = {}

      // @ts-expect-error - https://github.com/ardatan/whatwg-node/issues/574
      response.headers.forEach((value, name) => {
        responseHeaders[name] = value
      })

      lambdaResponse = {
        body: await response.text(),
        statusCode: response.status,
        headers: responseHeaders,
        isBase64Encoded: false,
      }
    } catch (e: any) {
      logger.error(e)
      onException && onException()

      lambdaResponse = {
        body: JSON.stringify({ error: 'GraphQL execution failed' }),
        statusCode: 200, // should be 500
      }
    }

    if (!lambdaResponse.headers) {
      lambdaResponse.headers = {}
    }

    /**
     * The header keys are case insensitive, but Fastify prefers these to be lowercase.
     * Therefore, we want to ensure that the headers are always lowercase and unique
     * for compliance with HTTP/2.
     *
     * @see: https://www.rfc-editor.org/rfc/rfc7540#section-8.1.2
     */
    // DT: Yoga v3 uses `application/graphql-response+json; charset=utf-8`
    // But we still do want to make sure the header is lowercase.
    // Comment out for now since GraphiQL doesn't work with this header anymore
    // because it loads its UI from a CDN and needs text/html to be the response type
    // lambdaResponse.headers['content-type'] = 'application/json'
    return lambdaResponse
  }

  return (
    event: APIGatewayProxyEvent,
    context: LambdaContext
  ): Promise<any> => {
    const execFn = async () => {
      try {
        return await handlerFn(event, context)
      } catch (e) {
        onException && onException()

        throw e
      }
    }

    if (getAsyncStoreInstance()) {
      // This must be used when you're self-hosting RedwoodJS.
      return getAsyncStoreInstance().run(new Map(), execFn)
    } else {
      // This is OK for AWS (Netlify/Vercel) because each Lambda request
      // is handled individually.
      return execFn()
    }
  }
}
