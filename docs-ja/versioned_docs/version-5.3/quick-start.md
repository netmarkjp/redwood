---
description: Redwood quick start
---

# Quick Start

:::info Prerequisites

<!--
- Redwood requires [Node.js](https://nodejs.org/en/) (=18.x) and [Yarn](https://yarnpkg.com/) (>=1.15)
- Are you on Windows? For best results, follow our [Windows development setup](how-to/windows-development-setup.md) guide
-->

- Redwoodには [Node.js](https://nodejs.org/en/) (=18.x) と [Yarn](https://yarnpkg.com/) (>=1.15)が必要です
- Windowsを利用しているのであれば、最良の結果を得るために [Windows development setup](how-to/windows-development-setup.md) を読んでください

:::

<!--
Create a Redwood project with `yarn create redwood-app`:
-->

Redwoodプロジェクトを新規作成するために `yarn create redwood-app` を実行します:

```
yarn create redwood-app my-redwood-project
```

:::tip Prefer TypeScript?

<!--
Redwood comes with full TypeScript support from the get-go:
-->

Redwoodは最初からTypeScriptをフルサポートしています：

```
yarn create redwood-app my-redwood-project --typescript
```

:::

<!--
Then change into that directory, yarn install, and start the development server:
-->

次に、ディレクトリに移動して、yarn installして、開発サーバを起動します：

```
cd my-redwood-project
yarn install
yarn redwood dev
```

<!--
Your browser should automatically open to [http://localhost:8910](http://localhost:8910) where you'll see the Welcome Page, which links out to a many great resources:
-->

ブラウザで自動的に[http://localhost:8910](http://localhost:8910)が開き、Welcomeページが表示され、たくさんの素晴らしいリソースへのリンクがあります。

<img data-mode="light" src="https://user-images.githubusercontent.com/300/145314717-431cdb7a-1c45-4aca-9bbc-74df4f05cc3b.png" alt="Redwood Welcome Page" style={{ marginBottom: 20 }} />

<img data-mode="dark" src="https://user-images.githubusercontent.com/32992335/161387013-2fc6702c-dfd8-4afe-aa2f-9b06d575ba82.png" alt="Redwood Welcome Page" style={{ marginBottom: 20 }} />

<!--
Congratulations on running your first Redwood CLI command!
From dev to deploy, the CLI is with you the whole way.
And there's quite a few commands at your disposal:
-->

Redwood CLIコマンドの初実行おめでとうございます！
開発からデプロイまで、CLIはずっとあなたと一緒です。
そして、あなたが自由に使えるコマンドがたくさんあります：

```
yarn redwood --help
```

<!--
For all the details, see the [CLI reference](cli-commands.md).
-->

詳しくは [CLI reference](cli-commands.md) を参照してください。

## Prisma and the database

<!--
Redwood wouldn't be a full-stack framework without a database. It all starts with the schema. Open the `schema.prisma` file in `api/db` and replace the `UserExample` model with the following `Post` model:
-->
データベースがなければ、Redwoodはフルスタックフレームワークとは言えません。全てはスキーマから始まります。 `api/db` にある `schema.prisma` を開いて、 `UserExample` モデルを以下の `Post` モデルに書き換えてください。

```js title="api/db/schema.prisma"
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}
```

<!--
Redwood uses [Prisma](https://www.prisma.io/), a next-gen Node.js and TypeScript ORM, to talk to the database. Prisma's schema offers a declarative way of defining your app's data models. And Prisma [Migrate](https://www.prisma.io/migrate) uses that schema to make database migrations hassle-free:
-->

Redwoodは、次世代のNode.jsおよびTypeScript ORMである[Prisma](https://www.prisma.io/)を利用してデータベースと対話します。Prismaのスキーマは、アプリケーションのデータモデルを宣言的に定義する方法を提供します。また、Prisma [Migrate](https://www.prisma.io/migrate)はそのスキーマを使うことで、データベースのマイグレーションを簡単に行うことができます：

```
yarn rw prisma migrate dev

# ...

? Enter a name for the new migration: › create posts
```

<!--
> `rw` is short for `redwood`
-->

:::tip

`rw` は `redwood` の短縮形です

:::

<!--
You'll be prompted for the name of your migration. `create posts` will do.

Now let's generate everything we need to perform all the CRUD (Create, Retrieve, Update, Delete) actions on our `Post` model:
-->

マイグレーション名を入力するプロンプトが表示されるでしょう。 `create posts` で十分です。

それでは、 `Post` モデルに対してCRUD（Create、Retrieve、Update、Delete）操作を実行するために必要なものを生成してみましょう：

```
yarn redwood generate scaffold post
```

<!--
Navigate to [http://localhost:8910/posts/new](http://localhost:8910/posts/new), fill in the title and body, and click "Save":
-->

[http://localhost:8910/posts/new](http://localhost:8910/posts/new) に移動して、titleとbodyを入力し "Save" をクリックしてください：

<img src="https://user-images.githubusercontent.com/300/73028004-72262c00-3de9-11ea-8924-66d1cc1fceb6.png" alt="Create a new post" />

<!--
Did we just create a post in the database? Yup! With `yarn rw generate scaffold <model>`, Redwood created all the pages, components, and services necessary to perform all CRUD actions on our posts table.
-->

データベースにPOSTしただけ？そのとおり！ `yarn rw generate scaffold <model>` したことで、Redwoodはpostsテーブルに対するCRUD操作に必要なすべてのページ、コンポーネント、サービスを作成しました。

## Frontend first with Storybook

<!--
Don't know what your data models look like?
That's more than ok—Redwood integrates Storybook so that you can work on design without worrying about data.
Mockup, build, and verify your React components, even in complete isolation from the backend:
-->

データモデルがどのようなものかわからない？
大丈夫です。RedwoodはStorybookを統合しているので、データのことを心配せずにデザインに取り組めます。
Reactコンポーネントのモックアップ、ビルド、検証は、バックエンドから完全に切り離せます：

```
yarn rw storybook
```

<!--
Before you start, see if the CLI's `setup ui` command has your favorite styling library:
-->

始める前に、CLI の `setup ui` コマンドにあなたの好きなスタイリングライブラリがあるか確認してください：

```
yarn rw setup ui --help
```

## Testing with Jest

<!--
It'd be hard to scale from side project to startup without a few tests.
Redwood fully integrates Jest with both the front- and back-ends, and makes it easy to keep your whole app covered by generating test files with all your components and services:
-->

サイドプロジェクトでもスタートアップでも、テストなしでスケールするのは難しいでしょう。
Redwood はフロントエンドとバックエンドの両方で　Jest　を完全に統合し、すべてのコンポーネントとサービスのテストファイルを生成することで、アプリ全体を簡単にカバーできるようにします：

```
yarn rw test
```

<!--
To make the integration even more seamless, Redwood augments Jest with database [scenarios](testing.md#scenarios)  and [GraphQL mocking](testing.md#mocking-graphql-calls).
-->

さらにシームレスに統合するために、Redwoodはデータベースの[scenarios](testing.md#scenarios)と[GraphQL mocking](testing.md#mocking-graphql-calls)でJestを強化しています。

## Ship it

<!--
Redwood is designed for both serverless deploy targets like Netlify and Vercel and serverful deploy targets like Render and AWS:
-->

Redwoodは、NetlifyやVercelなどのサーバレスデプロイターゲットと、RenderやAWSなどのサーバフルデプロイターゲットの両方に対応するよう設計されています：

```
yarn rw setup deploy --help
```

<!--
Don't go live without auth!
Lock down your app with Redwood's built-in, database-backed authentication system ([dbAuth](authentication.md#self-hosted-auth-installation-and-setup)), or integrate with nearly a dozen third-party auth providers:
-->

認証なしで稼動させないでください！
Redwood組み込みのデータベースバックエンドな認証システム（[dbAuth](authentication.md#self-hosted-auth-installation-and-setup)） でアプリをロックすることも、十数のサードパーティ認証プロバイダと統合することもできます：

```
yarn rw setup auth --help
```

## Next Steps

<!--
The best way to learn Redwood is by going through the comprehensive [tutorial](tutorial/foreword.md) and joining the community (via the [Discourse forum](https://community.redwoodjs.com) or the [Discord server](https://discord.gg/redwoodjs)).
-->

Redwoodを学ぶ最良の方法は、包括的な [tutorial](tutorial/foreword.md) を読み、コミュニティ（[Discourse forum](https://community.redwoodjs.com) または [Discord server](https://discord.gg/redwoodjs)）に参加することです。
