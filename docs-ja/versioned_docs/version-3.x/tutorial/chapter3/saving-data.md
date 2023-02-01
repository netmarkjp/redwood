# Saving Data

### Add a Contact Model

<!--
Let's add a new database table. Open up `api/db/schema.prisma` and add a Contact model after the Post model that's there now:
-->

新しいデータベーステーブルを追加してみましょう。 `api/db/schema.prisma` を開いて、Postモデルの後にContactモデルを追加します：

```js title="api/db/schema.prisma"
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = "native"
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}

// highlight-start
model Contact {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}
// highlight-end
```

:::tip

<!--
To mark a field as optional (that is, allowing `NULL` as a value) you can suffix the datatype with a question mark, e.g. `name String?`. This will allow `name`'s value to be either a `String` or `NULL`.
-->

フィールドをオプショナルにする（つまり、値として `NULL` を許可する） には、例えば `name String?` のように、データ型の後ろにクエスチョンマークを付加します。この場合、 `name` の値は `String` または `NULL` のいずれかになります。

:::

<!--
Next we create and apply a migration:
-->

次に、マイグレーションを作成し、適用します：

```bash
yarn rw prisma migrate dev
```

<!--
We can name this one something like "create contact".
-->

これには "create contact" のような名前を付けることができます。

### Create an SDL & Service

<!--
Now we'll create the GraphQL interface to access this table. We haven't used this `generate` command yet (although the `scaffold` command did use it behind the scenes):
-->

では、このテーブルにアクセスするためのGraphQLインターフェイスを作成します。この `generate` コマンドはまだ使っていません（ `scaffold` コマンドは裏で使っていましたが）：

```bash
yarn rw g sdl Contact
```

<!--
Just like the `scaffold` command, this will create a few new files under the `api` directory:

1. `api/src/graphql/contacts.sdl.{js,ts}`: defines the GraphQL schema in GraphQL's schema definition language
2. `api/src/services/contacts/contacts.{js,ts}`: contains your app's business logic (also creates associated test files)
-->

`scaffold` コマンドと同じように、`api` ディレクトリの下にいくつかの新しいファイルを作成します：

1. `api/src/graphql/contacts.sdl.{js,ts}` ： GraphQLのスキーマ定義言語でGraphQLスキーマを定義する
2. `api/src/services/contacts/contacts.{js,ts}` ： アプリのビジネスロジックを含む（関連するテストファイルも作成される）

<!--
If you remember our discussion in [how Redwood works with data](../chapter2/side-quest.md) you'll recall that queries and mutations in an SDL file are automatically mapped to resolvers defined in a service, so when you generate an SDL file you'll get a service file as well, since one requires the other.
-->

[how Redwood works with data（Redwoodはデータをどのように取り扱うのか）](../chapter2/side-quest.md) での議論を思い出してもらえれば、SDL ファイル内のクエリやミューテーションが、サービスで定義されたリゾルバに自動的にマップされることがわかります。したがって SDL ファイルを生成したときにサービスファイルも作成されるのは、依存関係があるからです。

<!--
Open up `api/src/graphql/contacts.sdl.{js,ts}` and you'll see the same Query and Mutation types defined for Contact that were created for the Post scaffold. `Contact`, `CreateContactInput` and `UpdateContactInput` types, as well as a `Query` type with `contacts` and `contact`, and a `Mutation` type with `createContact`, `updateContact` and `deleteContact`.
-->

`api/src/graphql/contacts.sdl.{js,ts}` を開くと、Post scaffold で作成したのと同じ Query 型と Mutation 型が Contact 用に定義されているのがわかります。 `Contact` 、 `CreateContactInput` 、 `UpdateContactInput` 、そして `contacts` と `contact` を含む `Query` 型、さらに `createContact` 、 `updateContact` 、 `deleteContact` を含む `Mutation` 型が定義されています。

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```graphql title="api/src/graphql/contacts.sdl.js"
export const schema = gql`
  type Contact {
    id: Int!
    name: String!
    email: String!
    message: String!
    createdAt: DateTime!
  }

  type Query {
    contacts: [Contact!]! @requireAuth
    contact(id: Int!): Contact @requireAuth
  }

  input CreateContactInput {
    name: String!
    email: String!
    message: String!
  }

  input UpdateContactInput {
    name: String
    email: String
    message: String
  }

  type Mutation {
    createContact(input: CreateContactInput!): Contact! @requireAuth
    updateContact(id: Int!, input: UpdateContactInput!): Contact! @requireAuth
    deleteContact(id: Int!): Contact! @requireAuth
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```graphql title="api/src/graphql/contacts.sdl.ts"
export const schema = gql`
  type Contact {
    id: Int!
    name: String!
    email: String!
    message: String!
    createdAt: DateTime!
  }

  type Query {
    contacts: [Contact!]! @requireAuth
    contact(id: Int!): Contact @requireAuth
  }

  input CreateContactInput {
    name: String!
    email: String!
    message: String!
  }

  input UpdateContactInput {
    name: String
    email: String
    message: String
  }

  type Mutation {
    createContact(input: CreateContactInput!): Contact! @requireAuth
    updateContact(id: Int!, input: UpdateContactInput!): Contact! @requireAuth
    deleteContact(id: Int!): Contact! @requireAuth
  }
`
```

</TabItem>
</Tabs>

<!--
The `@requireAuth` string you see after the `Query` and `Mutation` types is a [schema directive](https://www.graphql-tools.com/docs/schema-directives) which says that in order to access this GraphQL query the user is required to be authenticated. We haven't added authentication yet, so this won't have any effect—anyone will be able to query it, logged in or not, because until you add authentication the function behind `@requireAuth` always returns `true`.
-->

`Query` 型と `Mutation` 型の後にある `@requireAuth` の文字列は [schema directive](https://www.graphql-tools.com/docs/schema-directives) で、この GraphQL クエリにアクセスするにはユーザ認証が必要であることを示しています。認証を追加するまでは `@requireAuth` （の背後で動作する関数）は常に `true` を返すので、ログインしていようがいまいが、誰でもクエリを実行することができます。

<!--
What's `CreateContactInput` and `UpdateContactInput`? Redwood follows the GraphQL recommendation of using [Input Types](https://graphql.org/graphql-js/mutations-and-input-types/) in mutations rather than listing out each and every field that can be set. Any fields required in `schema.prisma` are also required in `CreateContactInput` (you can't create a valid record without them) but nothing is explicitly required in `UpdateContactInput`. This is because you could want to update only a single field, or two fields, or all fields. The alternative would be to create separate Input types for every permutation of fields you would want to update. We felt that only having one update input type was a good compromise for optimal developer experience.
-->

`CreateContactInput` と `UpdateContactInput` とは何でしょうか？Redwood はミューテーションにおいて設定可能なフィールドを一つ一つ列挙するのではなく、GraphQL が推奨する [Input Types](https://graphql.org/graphql-js/mutations-and-input-types/) を使います。 `schema.prisma` で必要なフィールドは `CreateContactInput` でも必要ですが （それがないと有効なレコードを作成できません）、 `UpdateContactInput` では必須のフィールドはありません。これは、1つのフィールドのみ、または2つのフィールド、あるいはすべてのフィールドを更新したい場合があるからです。別の方法は、更新したいフィールドの組み合わせごとに、別々の Input 型を作成することです。私たちは、更新用の Input 型を1つだけ持つことが、開発者のエクスペリエンスを最適化するための良い妥協点だと考えています。

:::info

<!--
Redwood assumes your code won't try to set a value on any field named `id` or `createdAt` so it left those out of the Input types, but if your database allowed either of those to be set manually you can update `CreateContactInput` or `UpdateContactInput` and add them.
-->

Redwood はコードが `id` や `createdAt` という名前のフィールドに値を設定しようとしないことを想定しているので、これらを Input 型から外しています。しかし、もしデータベースがこれらの値を手動で設定できるようになっていれば、 `CreateContactInput` や `UpdateContactInput` を更新してこれらを追加できます。

:::

<!--
Since all of the DB columns were required in the `schema.prisma` file they are marked as required in the GraphQL Types with the `!` suffix on the datatype (e.g. `name: String!`).
-->

DB のカラムはすべて `schema.prisma` ファイルで必須とされていたため、GraphQL Types ではデータ型に `!` サフィックスをつけて必須としてマークされています（例: `name: String!` ）。

:::tip

<!--
GraphQL's SDL syntax requires an extra `!` when a field _is_ required. Remember: `schema.prisma` syntax requires an extra `?` character when a field is _not_ required.
-->

GraphQL の SDL 構文では、フィールドが必須で _ある_ 場合、末尾の `!` が必要です。覚えておいてください： `schema.prisma` の構文では、フィールドが必須で _ない_ 場合、末尾の `?` 文字が必要です。

:::

<!--
As described in [Side Quest: How Redwood Deals with Data](../chapter2/side-quest.md), there are no explicit resolvers defined in the SDL file. Redwood follows a simple naming convention: each field listed in the `Query` and `Mutation` types in the `sdl` file (`api/src/graphql/contacts.sdl.{js,ts}`) maps to a function with the same name in the `services` file (`api/src/services/contacts/contacts.{js,ts}`).
-->

[Side Quest: How Redwood Deals with Data](../chapter2/side-quest.md) で説明したように、SDL ファイルには明示的なリゾルバが定義されていません。Redwood はシンプルな命名規則に従っています： `sdl` ファイル（ `api/src/graphql/contacts.sdl.{js,ts}` ）の `Query` 型と `Mutation` 型にリストされている各フィールドは、`services` ファイル（ `api/src/services/contacts/contacts.{js,ts}` ）の同じ名前を持つ関数と対応づけられています。

:::tip

<!--
*Psssstttt* I'll let you in on a little secret: if you just need a simple read-only SDL, you can skip creating the create/update/delete mutations by passing a flag to the SDL generator like so:
-->

*Psssstttt* ちょっとした秘密を教えましょう：単純な読み取り専用の SDL が必要なだけなら、次のように SDL ジェネレータにフラグを渡すことで create/update/delete ミューテーションの作成を省略することができます：

`yarn rw g sdl Contact --no-crud`

<!--
You'd only get a single `contacts` type to return them all.
-->

すべてを返す `contacts` 型しか生成されません。

:::

<!--
We'll only need `createContact` for our contact page. It accepts a single variable, `input`, that is an object that conforms to what we expect for a `CreateContactInput`, namely `{ name, email, message }`. This mutation should be able to be accessed by anyone, so we'll need to change `@requireAuth` to `@skipAuth`. This one says that authentication is *not* required and will allow anyone to anonymously send us a message. Note that having at least one schema directive is required for each `Query` and `Mutation` or you'll get an error: Redwood embraces the idea of "secure by default" meaning that we try and keep your application safe, even if you do nothing special to prevent access. In this case it's much safer to throw an error than to accidentally expose all of your users' data to the internet!
-->

お問い合わせページでは `createContact` だけが必要です。 `createContact` は変数 `input` をひとつだけ受け取ります。 `input` は `CreateContactInput` に期待されるもの、すなわち `{ name, email, message }` に適合するオブジェクトです。このミューテーションは誰でもアクセスできるようにする必要がありますので、 `@requireAuth` を `@skipAuth` に変更する必要があります。これは認証が必要で *なく* 、誰でも匿名でメッセージを送ることができるようにする、というものです。
それぞれの `Query` と `Mutation` には少なくとも1つのスキーマディレクティブが必要で、さもないとエラーになることに注意してください： Redwood は "secure by default" という考え方を取り入れています。つまり、アクセスを防ぐために特別なことをしなくても、あなたのアプリケーションを安全に保とうとするのです。この場合、誤ってユーザのデータをインターネットに公開してしまうよりも、エラーを投げる方がずっと安全です！

:::info

<!--
Serendipitously, the default schema directive of `@requireAuth` is exactly what we want for the `contacts` query that returns ALL contacts—only we, the owners of the blog, should have access to read them all.
-->

偶然にも、デフォルトのスキーマディレクティブである `@requireAuth` は、まさにすべてのお問い合わせを返す `contacts` クエリに必要なもので -- 私たちブログのオーナーだけがそれらをすべて読むことができるアクセス権を持っているはずです。

:::

<!--
We're not going to let anyone update or delete a message, so we can remove those fields completely. Here's what the SDL file looks like after the changes:
-->

メッセージの更新や削除を誰にもさせないようにするため、 これらのフィールドを完全に削除することができます。変更後の SDL ファイルは以下のようになります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```graphql title="api/src/graphql/contacts.sdl.js"
export const schema = gql`
  type Contact {
    id: Int!
    name: String!
    email: String!
    message: String!
    createdAt: DateTime!
  }

  type Query {
    contacts: [Contact!]! @requireAuth
    contact(id: Int!): Contact @requireAuth
  }

  input CreateContactInput {
    name: String!
    email: String!
    message: String!
  }

  // highlight-start
  type Mutation {
    createContact(input: CreateContactInput!): Contact! @skipAuth
  }
  // highlight-end
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```graphql title="api/src/graphql/contacts.sdl.ts"
export const schema = gql`
  type Contact {
    id: Int!
    name: String!
    email: String!
    message: String!
    createdAt: DateTime!
  }

  type Query {
    contacts: [Contact!]! @requireAuth
    contact(id: Int!): Contact @requireAuth
  }

  input CreateContactInput {
    name: String!
    email: String!
    message: String!
  }

  input UpdateContactInput {
    name: String
    email: String
    message: String
  }

  // highlight-start
  type Mutation {
    createContact(input: CreateContactInput!): Contact! @skipAuth
  }
  // highlight-end
`
```

</TabItem>
</Tabs>

<!--
That's it for the SDL file, let's take a look at the service:
-->

SDL ファイルについては以上です。次はサービスを見てみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="api/src/services/contacts/contacts.js"
import { db } from 'src/lib/db'

export const contacts = () => {
  return db.contact.findMany()
}

export const contact = ({ id }) => {
  return db.contact.findUnique({
    where: { id },
  })
}

export const createContact = ({ input }) => {
  return db.contact.create({
    data: input,
  })
}

export const updateContact = ({ id, input }) => {
  return db.contact.update({
    data: input,
    where: { id },
  })
}

export const deleteContact = ({ id }) => {
  return db.contact.delete({
    where: { id },
  })
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```js title="api/src/services/contacts/contacts.ts"
import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'

export const contacts: QueryResolvers['contacts'] = () => {
  return db.contact.findMany()
}

export const contact: QueryResolvers['contact'] = ({ id }) => {
  return db.contact.findUnique({
    where: { id },
  })
}

export const createContact: MutationResolvers['createContact'] = ({ input }) => {
  return db.contact.create({
    data: input,
  })
}

export const updateContact: MutationResolvers['updateContact'] = ({ id, input }) => {
  return db.contact.update({
    data: input,
    where: { id },
  })
}

export const deleteContact: MutationResolvers['deleteContact'] = ({ id }) => {
  return db.contact.delete({
    where: { id },
  })
}
```

</TabItem>
</Tabs>

<!--
Pretty simple. You can see here how the `createContact()` function expects the `input` argument and just passes that on to Prisma in the `create()` call.
-->

とてもシンプルですね。ここで `createContact()` 関数が `input` 引数を想定し、 `create()` 呼び出しの中でそれをPrismaに渡すだけであることがわかるでしょう。

<!--
You can delete `updateContact` and `deleteContact` here if you want, but since there's no longer an accessible GraphQL field for them they can't be used by the client anyway.
-->

ここで `updateContact` と `deleteContact` を削除することもできますが、アクセス可能な GraphQL フィールドがなくなったため、いずれにしてもクライアントからは使用できなくなりました。

<!--
Before we plug this into the UI, let's take a look at a nifty GUI you get just by running `yarn redwood dev`.
-->

これをUIに繋ぎこむ前に、`yarn redwood dev` を実行するだけで得られる気の利いたGUIを見てみましょう。

### GraphQL Playground

<!--
Often it's nice to experiment and call your API in a more "raw" form before you get too far down the path of implementation only to find out something is missing. Is there a typo in the API layer or the web layer? Let's find out by accessing just the API layer.
-->

実装の道を進みすぎてから何かが欠けていることに気づく前に、 "生の" API呼び出しで実験することは良いことです。APIレイヤかWebレイヤのどちらかに typo （タイプミス）がありますか？APIレイヤにだけアクセスして調べてみましょう。

<!--
When you started development with `yarn redwood dev` (or `yarn rw dev`) you actually started a second process running at the same time. Open a new browser tab and head to [http://localhost:8911/graphql](http://localhost:8911/graphql) This is GraphQL Yoga's [GraphiQL](https://www.graphql-yoga.com/docs/features/graphiql), a web-based GUI for GraphQL APIs:
-->

`yarn redwood dev` （または `yarn rw dev` ）で開発を開始したとき、実は同時に2つ目のプロセスを起動していました。ブラウザで新しいタブを開いて、[http://localhost:8911/graphql](http://localhost:8911/graphql) にアクセスしてください。これは GraphQL Yoga の [GraphiQL](https://www.graphql-yoga.com/docs/features/graphiql) で、GraphQL API 用の Web ベースの GUI です：

<img width="1410" alt="image" src="https://user-images.githubusercontent.com/32992335/161488164-37663b8a-0bfa-4d52-8312-8cfaac7c2915.png" />

<!--
Not very exciting yet, but select the "Docs" tab on the far right and click on `query: Query`.
-->

まだあまりエキサイティングではありませんが、右端の "Docs" タブを選択し、`query: Query` をクリックします

<img width="1410" alt="image" src="https://user-images.githubusercontent.com/32992335/161487889-8525abd6-1b44-4ba6-b637-8a3426f53197.png" />

<!--
It's the complete schema as defined by our SDL files! The Playground will ingest these definitions and give you autocomplete hints on the left to help you build queries from scratch. Try getting the IDs of all the posts in the database; type the query at the left and then click the "Play" button to execute:
-->

これは、SDL ファイルで定義された完全なスキーマです！プレイグラウンドはこれらの定義を取り込み、左側にオートコンプリートのヒントを表示するので、イチからクエリを作成するのに役立ちます。データベース内のすべてのブログ記事の ID を取得してみましょう；左側にクエリを入力し、 "Play" ボタンをクリックすると実行されます：

<img width="1410" alt="image" src="https://user-images.githubusercontent.com/32992335/161488332-53547702-81e7-4c8b-b674-aef2f3773ace.png" />

<!--
The GraphQL Playground is a great way to experiment with your API or troubleshoot when you come across a query or mutation that isn't behaving in the way you expect.
-->

GraphQL Playgroundは、APIの実験や、期待通りの動作をしないクエリやミューテーションに遭遇した時のトラブルシューティングに最適な方法です。

### Creating a Contact

<!--
Our GraphQL mutation is ready to go on the backend so all that's left is to invoke it on the frontend. Everything related to our form is in `ContactPage` so that's where we'll put the mutation call. First we define the mutation as a constant that we call later (this can be defined outside of the component itself, right after the `import` statements):
-->

GraphQL ミューテーションはバックエンドで実行する準備ができているので、あとはフロントエンドから呼び出すだけです。フォームに関連するものはすべて `ContactPage` にあるので、そこでミューテーションを呼び出します。まず、ミューテーションを定数として定義し、後で呼び出すことにします（これはコンポーネントの外側で、 `import` ステートメントの直後に定義することができます）：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
import { MetaTags } from '@redwoodjs/web'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'

// highlight-start
const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`
// highlight-end

const ContactPage = () => {
  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
import { MetaTags } from '@redwoodjs/web'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
  SubmitHandler,
} from '@redwoodjs/forms'

// highlight-start
const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`
// highlight-end

interface FormValues {
  name: string
  email: string
  message: string
}

const ContactPage = () => {
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data)
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
</Tabs>

<!--
We reference the `createContact` mutation we defined in the Contacts SDL passing it an `input` object which will contain the actual name, email and message values.
-->

Contacts SDL で定義した `createContact` ミューテーションを参照し、 `input` オブジェクトを渡します。このオブジェクトには、実際の名前、メールアドレス、メッセージの値が入ります。

<!--
Next we'll call the `useMutation` hook provided by Redwood which will allow us to execute the mutation when we're ready (don't forget to `import` it):
-->

次に、Redwoodが提供する `useMutation` フックを呼び出し、準備ができたときにミューテーションを実行できるようにします（ `import` を忘れずに）：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
// highlight-next-line
import { MetaTags, useMutation } from '@redwoodjs/web'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

const ContactPage = () => {
  // highlight-next-line
  const [create] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
// highlight-next-line
import { MetaTags, useMutation } from '@redwoodjs/web'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
  SubmitHandler,
} from '@redwoodjs/forms'

// highlight-start
import {
  CreateContactMutation,
  CreateContactMutationVariables,
} from 'types/graphql'
// highlight-end

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

interface FormValues {
  name: string
  email: string
  message: string
}

const ContactPage = () => {
  // highlight-start
  const [create] = useMutation<
    CreateContactMutation,
    CreateContactMutationVariables
  >(CREATE_CONTACT)
  // highlight-end

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data)
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
</Tabs>

<ShowForTs>

:::tip Reminder about generated types

<!--
Just a quick reminder that Redwood will automatically generate types for your GraphQL queries and mutations if you have the dev server running (or if you run `yarn rw generate types`).
-->

quick reminder：開発サーバを起動していれば（あるいは `yarn rw generate types` を実行したら）、Redwood が GraphQL クエリやミューテーションの型を自動的に生成してくれます。

<!--
Once you define the `CreateContactMutation` (the GraphQL one), Redwood will generate the `CreateContactMutation` and `CreateContactMutationVariables` types from it for you.
-->

一旦 `CreateContactMutation` （GraphQL のもの）を定義すると、Redwood はそこから `CreateContactMutation` 型と `CreateContactMutationVariables` 型を生成してくれます。

<!--
Take a look at our [Generated Types](typescript/generated-types.md) docs for a deeper dive!
-->

より深く掘り下げるには私たちの [Generated Types](typescript/generated-types.md) ドキュメントをご覧ください！

:::

</ShowForTs>

<!--
`create` is a function that invokes the mutation and takes an object with a `variables` key, containing another object with an `input` key. As an example, we could call it like:
-->

`create` はミューテーションを呼び出す関数で、 `variables` キーを持つオブジェクトを受け取り、 `input` キーを持つ別のオブジェクトを格納します。例えば、次のように呼び出すことができます：

```js
create({
  variables: {
    input: {
      name: 'Rob',
      email: 'rob@redwoodjs.com',
      message: 'I love Redwood!',
    },
  },
})
```

<!--
If you'll recall `<Form>` gives us all of the fields in a nice object where the key is the name of the field, which means the `data` object we're receiving in `onSubmit` is already in the proper format that we need for the `input`!
-->

思い出してほしいのですが、 `<Form>` はすべてのフィールドを、フィールド名をキーとするオブジェクトで提供してくれます。つまり、 `onSubmit` で受け取る `data` オブジェクトは、 `input` に必要な適切なフォーマットになっています！

<!--
That means we can update the `onSubmit` function to invoke the mutation with the data it receives:
-->

つまり、 `onSubmit` 関数を更新して、受け取ったデータでミューテーションを呼び出すことができるのです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
import { MetaTags, useMutation } from '@redwoodjs/web'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

const ContactPage = () => {
  const [create] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) => {
    // highlight-next-line
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
import { MetaTags, useMutation } from '@redwoodjs/web'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
  SubmitHandler,
} from '@redwoodjs/forms'

import {
  CreateContactMutation,
  CreateContactMutationVariables,
} from 'types/graphql'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

interface FormValues {
  name: string
  email: string
  message: string
}

const ContactPage = () => {
  const [create] = useMutation<
    CreateContactMutation,
    CreateContactMutationVariables
  >(CREATE_CONTACT)

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // highlight-next-line
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
</Tabs>

<!--
Try filling out the form and submitting—you should have a new Contact in the database! You can verify that with [Prisma Studio](/docs/tutorial/chapter2/getting-dynamic#prisma-studio) or [GraphQL Playground](#graphql-playground) if you were so inclined:
-->

フォームに入力して送信してみてください。データベースに新しいContactが追加されているはずです！ [Prisma Studio](/docs/tutorial/chapter2/getting-dynamic#prisma-studio) や [GraphQL Playground](#graphql-playground) で確認することができます：

<img width="1410" alt="image" src="https://user-images.githubusercontent.com/32992335/161488540-a7ad1a57-7432-4171-bd75-500eeaa17bcb.png" />

:::info Wait, I thought you said this was secure by default and someone couldn't view all contacts without being logged in?

<!--
Remember: we haven't added authentication yet, so the concept of someone being logged in is meaningless right now. In order to prevent frustrating errors in a new application, the `@requireAuth` directive simply returns `true` until you setup an authentication system. At that point the directive will use real logic for determining if the user is logged in or not and behave accordingly.
-->

Remember: 私たちはまだ認証を追加していないので、誰かがログインしているという概念は今は無意味です。新しいアプリケーションでイライラするようなエラーを防ぐために、 `@requireAuth` ディレクティブは認証システムをセットアップするまでは単に `true` を返します。その時点で、ディレクティブはユーザがログインしているかどうかを判断するための実際のロジックを使用し、それに応じて動作するようになります。

:::

### Improving the Contact Form

<!--
Our contact form works but it has a couple of issues at the moment:

* Clicking the submit button multiple times will result in multiple submits
* The user has no idea if their submission was successful
* If an error was to occur on the server, we have no way of notifying the user

Let's address these issues.
-->

お問い合わせフォームは正常に動作しますが、現在いくつかの課題があります：

* 送信ボタンを複数回クリックすると、複数回送信される
* 投稿が成功したかどうか、ユーザにはわからない
* サーバでエラーが発生した場合、ユーザに通知する方法がない

これらの課題を解決しましょう。

#### Disable Save on Loading

<!--
The `useMutation` hook returns a couple more elements along with the function to invoke it. We can destructure these as the second element in the array that's returned. The two we care about are `loading` and `error`:
-->

フックの `useMutation` は、それを呼び出す関数と一緒にさらにいくつかの要素を返します。これらは、返される配列の2番目の要素としてデストラクトすることができます。気になるのは `loading` と `error` の2つです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
// ...

const ContactPage = () => {
  // highlight-next-line
  const [create, { loading, error }] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) => {
    create({ variables: { input: data } })
  }

  return (...)
}

// ...
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
// ...

const ContactPage = () => {
  // highlight-next-line
  const [create, { loading, error }] = useMutation<
    CreateContactMutation,
    CreateContactMutationVariables
  >(CREATE_CONTACT)

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    create({ variables: { input: data } })
  }

  return (...)
}

// ...
```

</TabItem>
</Tabs>

<!--
Now we know if the database call is still in progress by looking at `loading`. An easy fix for our multiple submit issue would be to disable the submit button if the response is still in progress. We can set the `disabled` attribute on the "Save" button to the value of `loading`:
-->

これで `loading` を見ることで、データベースの呼び出しがまだ進行中かどうかを知ることができます。多重投稿の問題を簡単に解決するには、応答がまだ進行中の場合は送信ボタンを無効にすることです。 "Save" ボタンの `disabled` 属性に `loading` の値を設定すればよいのです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
return (
  // ...
  // highlight-next-line
  <Submit disabled={loading}>Save</Submit>
  // ...
)
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
return (
  // ...
  // highlight-next-line
  <Submit disabled={loading}>Save</Submit>
  // ...
)
```

</TabItem>
</Tabs>

<!--
It may be hard to see a difference in development because the submit is so fast, but you could enable network throttling via the Network tab Chrome's Web Inspector to simulate a slow connection:
-->

送信が速いので開発中は違いがわかりにくいかもしれませんが、ChromeのWebインスペクタのNetworkタブでネットワークのスロットリングを有効にすれば、遅い接続をシミュレートすることができます：

<img src="https://user-images.githubusercontent.com/300/71037869-6dc56f80-20d5-11ea-8b26-3dadb8a1ed86.png" />

<!--
You'll see that the "Save" button become disabled for a second or two while waiting for the response.
-->

応答を待つ間、 "Save" ボタンが1〜2秒無効になるのがわかります。

#### Notification on Save

<!--
Next, let's show a notification to let the user know their submission was successful. Redwood includes [react-hot-toast](https://react-hot-toast.com/) to quickly show a popup notification on a page.
-->

次に、送信が成功したことをユーザに知らせる通知を表示しましょう。Redwoodには [react-hot-toast](https://react-hot-toast.com/) があり、ページ上にポップアップ通知を素早く表示することができます。

<!--
`useMutation` accepts an options object as a second argument. One of the options is a callback function, `onCompleted`, that will be invoked when the mutation successfully completes. We'll use that callback to invoke a `toast()` function which will add a message to be displayed in a **&lt;Toaster&gt;** component.
-->

`useMutation` は、第二引数としてオプションオブジェクトを受け取ります。オプションの1つはコールバック関数の `onCompleted` で、これはミューテーションが正常に完了したときに呼び出されます。このコールバックを使って `toast()` 関数を呼び出すと、 **&lt;Toaster&gt;** コンポーネントに表示するメッセージが追加されます。

<!--
Add the `onCompleted` callback to `useMutation` and include the **&lt;Toaster&gt;** component in our `return`, just before the **&lt;Form&gt;**:
-->

`useMutation` に `onCompleted` コールバックを追加し、 **&lt;Toaster&gt;** コンポーネントを、 `return` の **&lt;Form&gt;** の直前に追加してください：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
import { MetaTags, useMutation } from '@redwoodjs/web'
// highlight-next-line
import { toast, Toaster } from '@redwoodjs/web/toast'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

const ContactPage = () => {
  // highlight-start
  const [create, { loading, error }] = useMutation(CREATE_CONTACT, {
    onCompleted: () => {
      toast.success('Thank you for your submission!')
    },
  })
  // highlight-end

  const onSubmit = (data) => {
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      // highlight-next-line
      <Toaster />
      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit disabled={loading}>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
import { MetaTags, useMutation } from '@redwoodjs/web'
// highlight-next-line
import { toast, Toaster } from '@redwoodjs/web/toast'
import {
  FieldError,
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
  SubmitHandler,
} from '@redwoodjs/forms'

import {
  CreateContactMutation,
  CreateContactMutationVariables,
} from 'types/graphql'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

interface FormValues {
  name: string
  email: string
  message: string
}

const ContactPage = () => {
  // highlight-start
  const [create, { loading, error }] = useMutation<
    CreateContactMutation,
    CreateContactMutationVariables
  >(CREATE_CONTACT, {
    onCompleted: () => {
      toast.success('Thank you for your submission!')
    },
  })
  // highlight-end

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      // highlight-next-line
      <Toaster />
      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }}>
        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit disabled={loading}>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
</Tabs>

![Toast notification on successful submission](https://user-images.githubusercontent.com/300/146271487-f6b77e76-99c1-43e8-bcda-5ba3c9b03137.png)

<!--
You can read the full documentation for Toast [here](../../toast-notifications.md).
-->

Toast の完全なドキュメントは [ここ](../../toast-notifications.md) で読むことができます。

### Displaying Server Errors

<!--
Next we'll inform the user of any server errors. So far we've only notified the user of _client_ errors: a field was missing or formatted incorrectly. But if we have server-side constraints in place `<Form>` can't know about those, but we still need to let the user know something went wrong.
-->

次に、サーバのエラーをユーザに通知します。今までは _client_ エラーしか表示できませんでした：フィールドがないか、フォーマットが正しくないといったものです。しかし、サーバサイドの制約がある場合 `<Form>` はそれらについて知ることができませんが、それでも何か問題があったことをユーザに知らせる必要があります。

<!--
We have email validation on the client, but any developer worth their silicon knows [never trust the client](https://www.codebyamir.com/blog/never-trust-data-from-the-browser). Let's add the email validation into the api side as well to be sure no bad data gets into our database, even if someone somehow bypassed our client-side validation (l33t hackers do this all the time).
-->

クライアント側にメールアドレスの検証を実装しましたが、シリコンバレーに見合う開発者なら誰でも [クライアントを信用してはいけない](https://www.codebyamir.com/blog/never-trust-data-from-the-browser) ことを知っています。

たとえクライアント側の検証を回避する人がいたとしても（エリートハッカーはいつもこれをやっています）、データベースによくないデータが入らないようにするために、APIサイドにもメールアドレスの検証を追加しましょう。

:::info No server-side validation for some fields?

<!--
Why don't we need server-side validation for the existence of name, email and message? Because GraphQL is already doing that for us! You may remember the `String!` declaration in our SDL file for the `Contact` type: that adds a constraint that those fields cannot be `null` as soon as it arrives on the api side. If it is, GraphQL would reject the request and throw an error back to us on the client.
-->

なぜ、名前、メールアドレス、メッセージの存在をサーバサイドで検証する必要がないのでしょうか？なぜなら、GraphQL がすでにそれを行っているからです！SDL ファイルの `Contact` 型にある `String!` 宣言を覚えているかもしれません：これは、これらのフィールドが APIサイドに到達した時点で `null` であってはならないという制約を追加するものです。もしそうであれば、GraphQL はリクエストを拒否して、クライアントにエラーを返します。

<!--
However, if you start using one service from within another, there would be no validation! GraphQL is only involved if an "outside" party is making a request (like a browser). If you really want to make sure that a field is present or formatted correctly, you'll need to add validation inside the Service itself. Then, no matter who is calling that service function (GraphQL or another Service) your data is guaranteed to be checked.
-->

しかし、あるサービスを別のサービスの中から使い始めると、検証は行われないでしょう！GraphQLは "外部" からのリクエスト（ブラウザなど）があった場合にのみ関与します。フィールドが存在するか、正しくフォーマットされているかを本当に確認したいのであれば、サービス自体の中にバリデーションを追加する必要があります。そうすれば、誰がそのサービス関数を呼び出しても（GraphQLや他のサービス）、あなたのデータは確実にチェックされることになります。

<!--
We do have an additional layer of validation for free: because name, email and message were set as required in our `schema.prisma` file, the database itself will prevent any `null`s from being recorded. It's usually recommended to not rely solely on the database for input validation: what format your data should be in is a concern of your business logic, and in a Redwood app the business logic lives in the Services!
-->

わたしたちは自由にバリデーションを実装できる追加レイヤを設けています：名前、メールアドレス、メッセージは `schema.prisma` ファイルで必須として設定されているので、データベースは `null` が記録されないようにします。通常、入力の検証をデータベースのみに依存しないことをお勧めします：データのフォーマットはビジネスロジックの範疇であり、Redwoodのアプリではビジネスロジックはサービスにあります！

:::

<!--
We talked about business logic belonging in our services files and this is a perfect example. And since validating inputs is such a common requirement, Redwood once again makes our lives easier with  [Service Validations](../../services.md#service-validations).
-->

ビジネスロジックはサービスファイルに属するという話をしましたが、これはその好例です。入力の検証はよくあることなので、Redwood は [Service Validations](../../services.md#service-validations) で再び私たちの生活を楽にしてくれています。

<!--
We'll make a call to a new `validate` function to our `contacts` service, which will do the work of making sure that the `email` field is actually formatted like an email address:
-->

この`contacts` サービスの `validate` 関数は、 `email` フィールドが実際にメールアドレスのようにフォーマットされているかどうかを検証するためのものです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="api/src/services/contacts/contacts.js"
// highlight-next-line
import { validate } from '@redwoodjs/api'

// ...

export const createContact = ({ input }) => {
  // highlight-next-line
  validate(input.email, 'email', { email: true })
  return db.contact.create({ data: input })
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="api/src/services/contacts/contacts.ts"
import type { QueryResolvers, MutationResolvers } from 'types/graphql'

// highlight-next-line
import { validate } from '@redwoodjs/api'

// ...

export const createContact: MutationResolvers['createContact'] = ({ input }) => {
  // highlight-next-line
  validate(input.email, 'email', { email: true })
  return db.contact.create({ data: input })
}
```

</TabItem>
</Tabs>

<!--
That's a lot of references to `email` so let's break them down:

1. The first argument is the value that we want to check. In this case `input` contains all our contact data and the value of `email` is the one we want to check
2. The second argument is the `name` prop from the `<TextField>`, so that we know which input field on the page has an error
3. The third argument is an object containing the **validation directives** we want to invoke. In this case it's just one, and `email: true` means we want to use the built-in email validator
-->

`email` への言及が多いので、分解してみましょう：

1. 第一引数はチェックしたい値。この場合、 `input` にはすべてのお問い合わせデータが含まれており、 `email` の値がチェックしたい値
2. 第二引数は `<TextField>` の `name` プロパティで、ページ上のどの入力フィールドでエラーが発生したかを知ることができる
3. 第三引数は呼び出したい **バリデーションディレクティブ** を含むオブジェクト。この場合1つだけで、`email: true` は組み込みのEメールアドレスバリデータを使うことを意味する

<!--
So when `createContact` is called it will first validate the inputs and only if no errors are thrown will it continue to actually create the record in the database.
-->

したがって、`createContact` が呼ばれると、まず入力を検証し、エラーがスローされない場合にのみ、実際のデータベースへのレコード作成に進みます。

<!--
Right now we won't even be able to test our validation on the server because we're already checking that the input is formatted like an email address with the `validation` prop in `<TextField>`. Let's temporarily remove it so that the bad data will be sent up to the server:
-->

今すぐには、サーバ上でバリデーションをテストすることすらできないでしょう。なぜなら `<TextField>` の `validation` propsで、入力がメールアドレスのようにフォーマットされていることをすでにチェックしているからです。一時的にこれを削除して、不正なデータがサーバに送信されるようにしましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```diff title="web/src/pages/ContactPage/ContactPage.js"
 <TextField
   name="email"
   validation={{
     required: true,
-    pattern: {
-      value: /^[^@]+@[^.]+\..+$/,
-      message: 'Please enter a valid email address',
-    },
   }}
   errorClassName="error"
 />
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```diff title="web/src/pages/ContactPage/ContactPage.tsx"
 <TextField
   name="email"
   validation={{
     required: true,
-    pattern: {
-      value: /^[^@]+@[^.]+\..+$/,
-      message: 'Please enter a valid email address',
-    },
   }}
   errorClassName="error"
 />
```

</TabItem>
</Tabs>

<!--
Remember when we said that `<Form>` had one more trick up its sleeve? Here it comes!
-->

以前 `<Form>` にはもう一つトリックがあると言ったのを覚えていますか？それがこれです！

<!--
Add a `<FormError>` component, passing the `error` constant we got from `useMutation` and a little bit of styling to `wrapperStyle` (don't forget the `import`). We'll also pass `error` to `<Form>` so it can setup a context:
-->

`<FormError>` コンポーネントを追加し、 `useMutation` から取得した `error` 定数を渡し、 `wrapperStyle` に少しスタイルを指定します（ `import` をお忘れなく）。また、`<Form>` に `error` を渡して、コンテキストをセットアップできるようにします：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
import { MetaTags, useMutation } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'
import {
  FieldError,
  Form,
  // highlight-next-line
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

const ContactPage = () => {
  const [create, { loading, error }] = useMutation(CREATE_CONTACT, {
    onCompleted: () => {
      toast.success('Thank you for your submission!')
    },
  })

  const onSubmit = (data) => {
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Toaster />
      // highlight-start
      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }} error={error}>
        <FormError error={error} wrapperClassName="form-error" />
        // highlight-end

        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit disabled={loading}>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
import { MetaTags, useMutation } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'
import {
  FieldError,
  Form,
  // highlight-next-line
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
  SubmitHandler,
} from '@redwoodjs/forms'

import {
  CreateContactMutation,
  CreateContactMutationVariables,
} from 'types/graphql'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

interface FormValues {
  name: string
  email: string
  message: string
}

const ContactPage = () => {
  const [create, { loading, error }] = useMutation<
    CreateContactMutation,
    CreateContactMutationVariables
  >(CREATE_CONTACT, {
    onCompleted: () => {
      toast.success('Thank you for your submission!')
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Toaster />
      // highlight-start
      <Form onSubmit={onSubmit} config={{ mode: 'onBlur' }} error={error}>
        <FormError error={error} wrapperClassName="form-error" />
        // highlight-end

        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit disabled={loading}>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
</Tabs>

<!--
Now submit a message with an invalid email address:
-->

それでは無効なメールアドレスでメッセージを送信してください：

![Email error from the server side](https://user-images.githubusercontent.com/300/158897801-8a3f7ae8-6e67-4fc0-b828-3095c264507e.png)

<!--
We get that error message at the top saying something went wrong in plain English _and_ the actual field is highlighted for us, just like the inline validation! The message at the top may be overkill for such a short form, but it can be key if a form is multiple screens long; the user gets a summary of what went wrong all in one place and they don't have to resort to hunting through a long form looking for red boxes. You don't *have* to use that message box at the top, though; just remove `<FormError>` and the field will still be highlighted as expected.
-->

何か問題があったという素の英語のエラーメッセージが上部に表示され、 _かつ_ 実際の入力フィールドがインラインバリデーションのようにハイライトされます！上部のメッセージは短いフォームでは過剰かもしれませんが、フォームが複数画面に及ぶ場合は重要です；何が問題だったのかがまとめて一度にわかるので、長いフォームの中で赤枠を探す手間が省けます。しかし、上部にあるメッセージボックスを使用する必要は *ありません* 。 `<FormError>` を削除するだけでよく、ハイライトはそのままになります。

:::info

<!--
`<FormError>` has several styling options which are attached to different parts of the message:

* `wrapperStyle` / `wrapperClassName`: the container for the entire message
* `titleStyle` / `titleClassName`: the "Errors prevented this form..." title
* `listStyle` / `listClassName`: the `<ul>` that contains the list of errors
* `listItemStyle` / `listItemClassName`: each individual `<li>` around each error
-->

`<FormError>` にはいくつかのスタイルオプションがあり、メッセージの異なる部分に付加されます：

* `wrapperStyle` / `wrapperClassName` ： メッセージ全体のコンテナ
* `titleStyle` / `titleClassName` ： "Errors prevents this form..." というタイトル
* `listStyle` / `listClassName` ： エラーのリストを格納する `<ul>`
* `listItemStyle` / `listItemClassName` ： 各エラーを囲むそれぞれの `<li>`

:::

<!--
This just scratches the surface of what Service Validations can do. You can perform more complex validations, including combining multiple directives in a single call. What if we had a model representing a `Car`, and users could submit them to us for sale on our exclusive car shopping site. How do we make sure we only get the cream of the crop of motorized vehicles? Service validations would allow us to be very particular about the values someone would be allowed to submit, all without any custom checks, just built-in `validate()` calls:
-->

これは、Service Validationsでできることのほんの一部です。1度の呼び出しで複数のディレクティブを組み合わせるなど、より複雑なバリデーションを実行することができます。もし "車" を表すモデルがあり、ユーザが私たちの独占的な車のショッピングサイトにそれらを送信することができるとしたらどうでしょう？どのようにすれば、よりすぐりの電気自動車だけを入手できるでしょうか？サービスバリデーションを使えば、カスタムチェックをせずに、組み込みの `validate()` 呼び出しだけで、ユーザが送信できる値について非常に細かく指定することができるようになります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
export const createCar = ({ input }) => {
  validate(input.make, 'make', {
    inclusion: ['Audi', 'BMW', 'Ferrari', 'Lexus', 'Tesla'],
  })
  validate(input.color, 'color', {
    exclusion: { in: ['Beige', 'Mauve'], message: "No one wants that color" }
  })
  validate(input.hasDamage, 'hasDamage', {
    absence: true
  })
  validate(input.vin, 'vin', {
    format: /[A-Z0-9]+/,
    length: { equal: 17 }
  })
  validate(input.odometer, 'odometer', {
    numericality: { positive: true, lessThanOrEqual: 10000 }
  })

  return db.car.create({ data: input })
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
export const createCar = ({ input }: Car) => {
  validate(input.make, 'make', {
    inclusion: ['Audi', 'BMW', 'Ferrari', 'Lexus', 'Tesla'],
  })
  validate(input.color, 'color', {
    exclusion: { in: ['Beige', 'Mauve'], message: "No one wants that color" }
  })
  validate(input.hasDamage, 'hasDamage', {
    absence: true
  })
  validate(input.vin, 'vin', {
    format: /[A-Z0-9]+/,
    length: { equal: 17 }
  })
  validate(input.odometer, 'odometer', {
    numericality: { positive: true, lessThanOrEqual: 10000 }
  })

  return db.car.create({ data: input })
}
```

</TabItem>
</Tabs>

<!--
You can still include your own custom validation logic and have the errors handled in the same manner as the built-in validations:
-->

独自のバリデーションロジックを組み込んで、組み込みのバリデーションと同じようにエラーを処理させることもできます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
validateWith(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  if (input.lastCarWashDate < oneWeekAgo) {
    throw new Error("We don't accept dirty cars")
  }
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```js
validateWith(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  if (input.lastCarWashDate < oneWeekAgo) {
    throw new Error("We don't accept dirty cars")
  }
})
```

</TabItem>
</Tabs>

<!--
Now you can be sure you won't be getting some old jalopy!
-->

これで、ポンコツは排除できます！

### One more thing...

<!--
Since we're not redirecting after the form submits, we should at least clear out the form fields. This requires we get access to a `reset()` function that's part of [React Hook Form](https://react-hook-form.com/), but we don't have access to it with the basic usage of `<Form>` (like we're currently using).
-->

フォームが送信された後にリダイレクトを行わないので、少なくともフォームフィールドをクリアする必要があります。そのためには [React Hook Form](https://react-hook-form.com/) の一部である `reset()` 関数にアクセスする必要がありますが、（現在使用しているような） `<Form>` の基本的な使い方ではアクセスすることができません。

<!--
Redwood includes a hook called `useForm()` (from React Hook Form) which is normally called for us within `<Form>`. In order to reset the form we need to invoke that hook ourselves. But the functionality that `useForm()` provides still needs to be used in `Form`. Here's how we do that.
-->

Redwood には `useForm()` （ React Hook Form 由来）というフックがあり、通常は `<Form>` 内で呼び出されます。フォームをリセットするには、このフックを自分自身で呼び出す必要があります。しかし `useForm()` が提供する機能は `Form` の中で使用する必要があります。ここでは、その方法を説明します：

<!--
First we'll import `useForm`:
-->

まず、 `useForm` をインポートします：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
import {
  FieldError,
  Form,
  FormError,
  Label,
  Submit,
  TextAreaField,
  TextField,
  // highlight-next-line
  useForm,
} from '@redwoodjs/forms'
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
import {
  FieldError,
  Form,
  FormError,
  Label,
  Submit,
  TextAreaField,
  TextField,
  // highlight-next-line
  useForm,
} from '@redwoodjs/forms'
```

</TabItem>
</Tabs>

<!--
And now call it inside of our component:
-->

そして、コンポーネントの中で呼び出します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
const ContactPage = () => {
  // highlight-next-line
  const formMethods = useForm()
  //...
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/pages/ContactPage/ContactPage.tsx"
const ContactPage = () => {
  // highlight-next-line
  const formMethods = useForm()
  //...
```

</TabItem>
</Tabs>

<!--
Finally we'll tell `<Form>` to use the `formMethods` we just got from `useForm()` instead of doing it itself:
-->

最後に、 `<Form>` に対して `useForm()` から取得した `formMethods` を使うよう指示します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
return (
  <>
    <Toaster />
    <Form
      onSubmit={onSubmit}
      config={{ mode: 'onBlur' }}
      error={error}
      // highlight-next-line
      formMethods={formMethods}
    >
    // ...
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
return (
  <>
    <Toaster />
    <Form
      onSubmit={onSubmit}
      config={{ mode: 'onBlur' }}
      error={error}
      // highlight-next-line
      formMethods={formMethods}
    >
    // ...
```

</TabItem>
</Tabs>

<!--
Now we can call `reset()` on `formMethods` after we call `toast()`:
-->

これで、 `toast()` を呼び出した後に `formMethods` で `reset()` を呼べるようになりました：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
// ...

const [create, { loading, error }] = useMutation(CREATE_CONTACT, {
  onCompleted: () => {
    toast.success('Thank you for your submission!')
    // highlight-next-line
    formMethods.reset()
  },
})

// ...
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
// ...

const [create, { loading, error }] = useMutation<
  CreateContactMutation,
  CreateContactMutationVariables
>(CREATE_CONTACT, {
  onCompleted: () => {
    toast.success('Thank you for your submission!')
    // highlight-next-line
    formMethods.reset()
  },
})

// ...
```

</TabItem>
</Tabs>

:::caution

<!--
You can put the email validation back into the `<TextField>` now, but you should leave the server validation in place, just in case.
-->

これで `<TextField>` にメールアドレス検証を戻すことができますが、念のためサーババリデーションも残しておきましょう。

:::

<!--
Here's the entire page:
-->

ページ全体はこちらです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/ContactPage/ContactPage.js"
import { MetaTags, useMutation } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'
import {
  FieldError,
  Form,
  FormError,
  Label,
  Submit,
  TextAreaField,
  TextField,
  useForm,
} from '@redwoodjs/forms'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

const ContactPage = () => {
  const formMethods = useForm()

  const [create, { loading, error }] = useMutation(CREATE_CONTACT, {
    onCompleted: () => {
      toast.success('Thank you for your submission!')
      formMethods.reset()
    },
  })

  const onSubmit = (data) => {
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Toaster />
      <Form
        onSubmit={onSubmit}
        config={{ mode: 'onBlur' }}
        error={error}
        formMethods={formMethods}
      >
        <FormError error={error} wrapperClassName="form-error" />

        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit disabled={loading}>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
import { MetaTags, useMutation } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'
import {
  FieldError,
  Form,
  FormError,
  Label,
  Submit,
  SubmitHandler,
  TextAreaField,
  TextField,
  useForm,
} from '@redwoodjs/forms'

import {
  CreateContactMutation,
  CreateContactMutationVariables,
} from 'types/graphql'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

interface FormValues {
  name: string
  email: string
  message: string
}

const ContactPage = () => {
  const formMethods = useForm()

  const [create, { loading, error }] = useMutation<
    CreateContactMutation,
    CreateContactMutationVariables
  >(CREATE_CONTACT, {
    onCompleted: () => {
      toast.success('Thank you for your submission!')
      formMethods.reset()
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    create({ variables: { input: data } })
  }

  return (
    <>
      <MetaTags title="Contact" description="Contact page" />

      <Toaster />
      <Form
        onSubmit={onSubmit}
        config={{ mode: 'onBlur' }}
        error={error}
        formMethods={formMethods}
      >
        <FormError error={error} wrapperClassName="form-error" />

        <Label name="name" errorClassName="error">
          Name
        </Label>
        <TextField
          name="name"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="name" className="error" />

        <Label name="email" errorClassName="error">
          Email
        </Label>
        <TextField
          name="email"
          validation={{
            required: true,
            pattern: {
              value: /^[^@]+@[^.]+\..+$/,
              message: 'Please enter a valid email address',
            },
          }}
          errorClassName="error"
        />
        <FieldError name="email" className="error" />

        <Label name="message" errorClassName="error">
          Message
        </Label>
        <TextAreaField
          name="message"
          validation={{ required: true }}
          errorClassName="error"
        />
        <FieldError name="message" className="error" />

        <Submit disabled={loading}>Save</Submit>
      </Form>
    </>
  )
}

export default ContactPage
```

</TabItem>
</Tabs>

<!--
That's it! [React Hook Form](https://react-hook-form.com/) provides a bunch of [functionality](https://react-hook-form.com/api) that `<Form>` doesn't expose. When you want to get to that functionality you can call `useForm()` yourself, but make sure to pass the returned object (we called it `formMethods`) as a prop to `<Form>` so that the validation and other functionality keeps working.
-->

以上です！ [React Hook Form](https://react-hook-form.com/) は `<Form>` が公開しないたくさんの [機能](https://react-hook-form.com/api) を提供します。それらの機能を利用したい場合は、自分で `useForm()` を呼び出しますが、返されたオブジェクト (ここでは `formMethods` と呼びます) を `<Form>` に props として渡して、バリデーションやその他の機能が動作し続けるようにしなければなりません。

:::info

<!--
You may have noticed that the onBlur form config stopped working once you started calling `useForm()` yourself. That's because Redwood calls `useForm()` behind the scenes and automatically passes it the `config` prop that you gave to `<Form>`. Redwood is no longer calling `useForm()` for you so if you need some options passed you need to do it manually:
-->

onBlur フォームの設定は、自分で `useForm()` を呼び出すと動作しなくなることにお気づきかもしれません。これは、Redwood が裏で `useForm()` を呼び出し、あなたが `<Form>` に与えた `config` propsを自動的に渡しているためです。Redwood はもはやあなたのために `useForm()` を呼び出さないので、もし何らかのオプションを渡す必要がある場合は手動で行う必要があります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="web/src/pages/ContactPage/ContactPage.js"
const ContactPage = () => {
  const formMethods = useForm({ mode: 'onBlur' })
  //...
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/pages/ContactPage/ContactPage.tsx"
const ContactPage = () => {
  const formMethods = useForm({ mode: 'onBlur' })
  //...
```

</TabItem>
</Tabs>

:::

<!--
The public site is looking pretty good. How about the administrative features that let us create and edit posts? We should move them to some kind of admin section and put them behind a login so that random users poking around at URLs can't create ads for discount pharmaceuticals.
-->

公開サイトはかなりいい感じになってきましたね。ブログ記事を作成したり編集したりする管理機能はどうでしょうか？管理セクションのようなものに移動して、ログインの後ろに置くべきでしょう。そうすれば、URLを詮索するランダムなユーザが勝手に割引医薬品の広告を作成することができなくなります。
