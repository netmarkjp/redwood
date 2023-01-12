# Cells

<!--
The features we listed at the end of the last page (loading state, error messaging, blank slate text) are common in most web apps. We wanted to see if there was something we could do to make developers' lives easier when it comes to adding them to a typical component. We think we've come up with something to help. We call them _Cells_. Cells provide a simpler and more declarative approach to data fetching. ([Read the full documentation about Cells](../../cells.md).)
-->

前のページの最後に挙げた機能（ロード状態、エラーメッセージ、空白のテキスト）は、ほとんどのWebアプリで一般的なものです。私たちは、典型的なコンポーネントにこれらの機能を追加する際に、開発者の生活を楽にするために何ができるか考えました。私たちは、そのための方法を編み出しました。これを _Cells_ （セル）と呼んでいます。セルはデータ取得のための、よりシンプルで宣言的なアプローチを提供します（[セルに関する完全なドキュメントを読む](../../cells.md)）。

<!--
In addition to these states, cells are also responsible for their own data fetching. This means that rather than fetching data in some parent component and then passing props down to the child components that need them, a cell is completely self-contained and fetches and displays its own data! Let's add one to our blog to get a feel for how they work.
-->

これらのロード状態に加えて、セルは自分自身のデータ取得にも責任を持ちます。つまり、親コンポーネントでデータを取得して、それを必要とする子コンポーネントに props を渡すのではなく、セルは完全に自己完結しており、自分自身のデータを取得して表示します！ブログにセルを追加して、セルがどのように動作するか見てみましょう。

<!--
When you create a cell you export several specially named constants and then Redwood takes it from there. A typical cell may look something like:
-->

セルを作成する際には、いくつかの特別な名前の定数をエクスポートし、Redwoodがそれを処理します。典型的なセルは次のようなものです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx
export const QUERY = gql`
  query FindPosts {
    posts {
      id
      title
      body
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>No posts yet!</div>

export const Failure = ({ error }) => (
  <div>Error loading posts: {error.message}</div>
)

export const Success = ({ posts }) => {
  return posts.map((post) => (
    <article key={post.id}>
      <h2>{post.title}</h2>
      <div>{post.body}</div>
    </article>
  ))
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx
import type { FindPosts } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

export const QUERY = gql`
  query FindPosts {
    posts {
      id
      title
      body
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>No posts yet!</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div>Error loading posts: {error.message}</div>
)

export const Success = ({ posts }: CellSuccessProps<FindPosts>) => {
  return posts.map((post) => (
    <article key={post.id}>
      <h2>{post.title}</h2>
      <div>{post.body}</div>
    </article>
  ))
}
```

</TabItem>
</Tabs>

<!--
When React renders this component, Redwood will perform the `QUERY` and display the `Loading` component until a response is received.
-->

React がこのコンポーネントをレンダリングすると、Redwood は `QUERY` を実行し、レスポンスを受け取るまでは `Loading` コンポーネントを表示します。

<!--
Once the query returns, it will display one of three states:
  - If there was an error, the `Failure` component
  - If the data return is empty (`null` or empty array), the `Empty` component
  - Otherwise, the `Success` component
-->

クエリ結果が返ってきたら、3つの状態のうち1つが表示されます：
  - エラーが発生した場合は `Failure` コンポーネントが表示される
  - 返されたデータが空だった場合（ `null` または空の配列）は `Empty` コンポーネントが表示される
  - それ以外の場合は `Success` コンポーネントが表示される

<!--
There are also some lifecycle helpers like `beforeQuery` (for manipulating any props before being given to the `QUERY`) and `afterQuery` (for manipulating the data returned from GraphQL but before being sent to the `Success` component).
-->

また `beforeQuery` （ `QUERY` に渡す前の props を操作する）や `afterQuery` （GraphQL から返されるが `Success` コンポーネントに送られる前のデータを操作する）といったライフサイクルヘルパーも用意されています。

<!--
The minimum you need for a cell are the `QUERY` and `Success` exports. If you don't export an `Empty` component, empty results will be sent to your `Success` component. If you don't provide a `Failure` component, you'll get error output sent to the console.
-->

セルで最低限必要なのは `QUERY` と `Success` のエクスポートです。 `Empty` コンポーネントをエクスポートしない場合、空の結果が `Success` コンポーネントに送信されます。 `Failure` コンポーネントがない場合、コンソールにエラー出力が送られます。

<!--
A guideline for when to use cells is if your component needs some data from the database or other service that may be delayed in responding. Let Redwood worry about juggling what is displayed when and you can focus on the happy path of the final, rendered component populated with data.
-->

セルをいつ使うかのガイドラインは、コンポーネントがデータベースや他のサービスから何らかのデータを必要とし、その応答が遅れる可能性がある場合です。いつ何を表示するかはRedwoodに任せて、受け取ったデータでレンダリングされたコンポーネントというハッピーパスに集中することができます。

<ShowForTs>

:::tip Wait... what are those types?

<!--
Redwood comes with some built-in utility types. You can see two of them in the example above: `CellSuccessProps` and `CellFailureProps`. Read more about them [here](typescript/utility-types.md).
-->

Redwood には、いくつかの組み込みユーティリティ型があります。上の例では、そのうちの2つを見ることができます： `CellSuccessProps` と `CellFailureProps` です。これらについて詳しくは [ここ](typescript/utility-types.md) を参照してください。

<!--
Also notice the `FindPosts` type imported from `types/graphql`. This and other types are generated for you automatically—when you have the dev server running—based on the GraphQL query in your Cell. More about generated types [here](typescript/generated-types.md).
-->

また `types/graphql` からインポートされた `FindPosts` 型にも注目してください。
この型やその他の型は、開発サーバが動作している間、セルのGraphQLクエリに基づいて自動的に生成されます。生成された型の詳細は[こちら](typescript/generated-types.md)を参照してください。

:::

</ShowForTs>

### Our First Cell

<!--
Usually in a blog the homepage will display a list of recent posts. This list is a perfect candidate for our first cell.
-->

通常、ブログではホームページに最近のブログ記事のリストが表示されます。このリストは、私たちの最初のセルにピッタリです。

:::info Wait, don't we already have a home page?

<!--
We do, but you will generally want to use a *cell* when you need data from the database. A best practice for Redwood is to create a Page for each unique URL your app has, but that you fetch and display data in Cells. So the existing HomePage will render this new cell as a child.
-->

データベースからデータが必要な場合、一般的に *セル* を使いたいと思うでしょう。Redwoodのベストプラクティスは、アプリが持つ固有のURLごとにページを作成し、セルでデータを取得して表示することです。そのため、既存の HomePage はこの新しいセルを子ページとしてレンダリングします。

:::

<!--
As you'll see repeatedly going forward, Redwood has a generator for this feature! Let's call this the "Articles" cell, since "Posts" was already used by our scaffold generator, and although the names won't clash (the scaffold files were created in the `Post` directory), it will be easier to keep them straight in our heads if the names are fairly different from each other. We're going to be showing multiple things, so we'll use the plural version "Articles," rather than "Article":
-->

これから繰り返し見ていきますが、Redwoodにはこの機能のためのジェネレータがあります！ "Posts" はすでに scaffold ジェネレータで使われていたので、これを "Articles" セルと呼ぶことにしましょう（雛形ファイルは `Post` ディレクトリに作成されました）。名前がお互いにかなり異なる方が、頭の中で整理しやすいでしょう。複数のものを表示するつもりなので、 "Article" ではなく、複数形の "Articles" を使うことにします。

```bash
yarn rw g cell Articles
```

<!--
This command will result in a new file at `/web/src/components/ArticlesCell/ArticlesCell.{js,tsx}` (and `test.{js,tsx}` `mock.{js,ts}` and `stories.{js,tsx}` files—more on those in [chapter 5 of the tutorial](../chapter5/storybook.md)!). This file will contain some boilerplate to get you started:
-->

このコマンドは `/web/src/components/ArticlesCell/ArticlesCell.{js,tsx}` に新しいファイルを作成します（ `test.{js,tsx}` と `mock.{js,ts}` と `stories.{js,tsx}` ファイルも作成されます）。詳しくは[チュートリアルの第5章](../chapter5/storybook.md)で詳しく説明します！）。このファイルには、使い始めに必要な boilerplate がいくつか含まれています：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.js"
export const QUERY = gql`
  query ArticlesQuery {
    articles {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({ articles }) => {
  return (
    <ul>
      {articles.map((item) => {
        return <li key={item.id}>{JSON.stringify(item)}</li>
      })}
    </ul>
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.tsx"
import type { ArticlesQuery } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

export const QUERY = gql`
  query ArticlesQuery {
    articles {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({ articles }: CellSuccessProps<ArticlesQuery>) => {
  return (
    <ul>
      {articles.map((item) => {
        return <li key={item.id}>{JSON.stringify(item)}</li>
      })}
    </ul>
  )
}
```

</TabItem>
</Tabs>

:::info Indicating Multiplicity to the Cell Generator

<!--
When generating a cell you can use any case you'd like and Redwood will do the right thing when it comes to naming. These will all create the same filename (`web/src/components/BlogArticlesCell/BlogArticlesCell.{js,tsx}`):
-->

セルを生成するときには、大文字小文字いずれも使うことができ、Redwoodは命名するときにこれを正します。これらはすべて同じファイル名（ `web/src/components/BlogArticlesCell/BlogArticlesCell.{js,tsx}` ）で作成されます：

```bash
yarn rw g cell blog_articles
yarn rw g cell blog-articles
yarn rw g cell blogArticles
yarn rw g cell BlogArticles
```

<!--
You will need _some_ kind of indication that you're using more than one word: either snake_case (`blog_articles`), kebab-case (`blog-articles`), camelCase (`blogArticles`) or PascalCase (`BlogArticles`).
-->

複数の単語を使用していることを示す _何らかの_ しるしが必要です：スネークケース（ `blog_articles` ）、ケバブケース（ `blog-articles` ）、キャメルケース（ `blogArticles` ）, パスカルケース（`BlogArticles`）のいずれかです。

<!--
Calling `yarn redwood g cell blogarticles` (without any indication that we're using two words) will generate a file at `web/src/components/BlogarticlesCell/BlogarticlesCell.{js,tsx}`.
-->

（2つの単語を使っていることを示さずに） `yarn redwood g cell blogarticles` を実行すると、 `web/src/components/BlogarticlesCell/BlogarticlesCell.{js,tsx}` にファイルが生成されます。

:::

<!--
To get you off and running as quickly as possible the generator assumes you've got a root GraphQL query named the same thing as your cell and gives you the minimum query needed to get something out of the database. In this case the query is named `articles`:
-->

できるだけ早く実行できるように、ジェネレータはセルと同じ名前のルートGraphQLクエリを持っていると仮定し、データベースから何かを取得するために必要な最小限のクエリを提供します。この場合、クエリの名前は `articles` です：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.js"
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    articles {
      id
    }
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.tsx"
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    articles {
      id
    }
  }
`
```

</TabItem>
</Tabs>

<!--
However, this is not a valid query name for our existing Posts SDL (`api/src/graphql/posts.sdl.{js,ts}`) and Service (`api/src/services/posts/posts.{js,ts}`). (To see where these files come from, go back to the [Creating a Post Editor section](getting-dynamic.md#creating-a-post-editor) in the *Getting Dynamic* part.) Redwood names the query elements after the cell itself for convenience (more often than not you'll be creating a cell for a specific model), but in this case our cell name doesn't match our model name so we'll need to make some manual tweaks.
-->

しかし、これは既存の Posts SDL （ `api/src/graphql/posts.sdl.{js,ts}` ） やサービス （ `api/src/services/posts/posts.{js,ts}` ）では有効なクエリ名ではありません（これらのファイルがどこから来たのかは *Getting Dynamic* の [Creating Post Editor セクション](getting-dynamic.md#create-aosteditor) をご覧ください）。
Redwoodは便宜上、クエリ要素にセル自体の名前を付けていますが（多くの場合、特定のモデルのためにセルを作成します）、今回はセル名がモデル名と一致していないので、手動で微調整をする必要があります。

<!--
We'll have to rename them to `posts` in both the query name and in the prop name in `Success`:
-->

クエリ名と `Success` の props の両方を `posts` に変更する必要があります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.js"
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    posts {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

// highlight-next-line
export const Success = ({ posts }) => {
  return (
    <ul>
      // highlight-next-line
      {posts.map((item) => {
        return <li key={item.id}>{JSON.stringify(item)}</li>
      })}
    </ul>
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.tsx"
import type { ArticlesQuery } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    posts {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

// highlight-next-line
export const Success = ({ posts }: CellSuccessProps<ArticlesQuery>) => {
  return (
    <ul>
      // highlight-next-line
      {posts.map((item) => {
        return <li key={item.id}>{JSON.stringify(item)}</li>
      })}
    </ul>
  )
}
```

</TabItem>
</Tabs>

<ShowForTs>

:::tip Using generated types

<!--
At this point, you might see an error in your Cell while trying to import from `types/graphql`: "The type ArticlesQuery does not exist"

When you have the dev server (via `yarn rw dev`) running, the CLI watches files for changes and triggers type generation automatically, but you can trigger it manually too by running:
-->

このとき `types/graphql` からインポートしようとして、Cellにエラーが表示されることがあります："The type ArticlesQuery does not exist"

開発サーバ（ `yarn rw dev` ）を起動しておくと、CLIがファイルの変更を監視して自動的に型生成をトリガーしてくれますが、手動実行することもできます：

```bash
yarn rw g types
```

<!--
This looks at your Cell's `QUERY` and—as long as it's valid—tries to automatically create a TypeScript type for you to use in your code.
-->

これはセルの `QUERY` を見て、それが有効である限り、自動的にTypeScriptの型を生成し、コードで使えるようにします。

:::

</ShowForTs>

<!--
Let's plug this cell into our `HomePage` and see what happens:
-->

このセルを `HomePage` に差し込んで、どうなるか見てみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/HomePage/HomePage.js"
import { MetaTags } from '@redwoodjs/web'

// highlight-next-line
import ArticlesCell from 'src/components/ArticlesCell'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />
      // highlight-next-line
      <ArticlesCell />
    </>
  )
}

export default HomePage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/pages/HomePage/HomePage.tsx"
import { MetaTags } from '@redwoodjs/web'

// highlight-next-line
import ArticlesCell from 'src/components/ArticlesCell'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />
      // highlight-next-line
      <ArticlesCell />
    </>
  )
}

export default HomePage
```

</TabItem>
</Tabs>

<!--
The browser should actually show the `id` and a GraphQL-specific `__typename` properties for any posts in the database. If you just see "Empty" then return to the scaffold we created [last time](getting-dynamic.md#creating-a-post-editor) and add a couple. Neat!
-->

ブラウザには、データベースにあるブログ記事の `id` と GraphQL 固有の `__typename` プロパティが実際に表示されるはずです。もし "Empty" と表示されるだけなら [前回作成した scaffold](getting-dynamic.md#creating-a-post-editor) に戻り、いくつかブログ記事を追加してください。いいですね！

<img src="https://user-images.githubusercontent.com/300/145910525-6a9814d1-0808-4f7e-aeab-303bd5dbac5e.png" alt="Showing articles in the database" />

:::info

<!--
**In the `Success` component, where did `posts` come from?**
-->

**`Success` コンポーネントの `posts` はどこからきたのでしょうか？**

<!--
In the `QUERY` statement, the query we're calling is `posts`. Whatever the name of this query is, that's the name of the prop that will be available in `Success` with your data.
-->

この `QUERY` ステートメントで呼び出しているクエリは `posts` です。このクエリの名前が何であれ、それが `Success` でデータを利用できるようになる props の名前になります。

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    posts {
      id
    }
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    posts {
      id
    }
  }
`
```

</TabItem>
</Tabs>

<!--
You can also alias the name of the variable containing the result of the GraphQL query, and that will be the name of the prop:
-->

また、GraphQLクエリの結果を格納した変数名をエイリアスにすると、それが props の名前になります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    articles: posts {
      id
    }
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    articles: posts {
      id
    }
  }
`
```

</TabItem>
</Tabs>

<!--
Now `articles` will be available in `Success` instead of `posts`:
-->

これで `posts` の代わりに `articles` が `Success` で使えるようになります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript
export const Success = ({ articles }) => { ... }
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
export const Success = ({ articles }: CellSuccessProps<ArticlesQuery>) => { ... }
```

</TabItem>
</Tabs>

:::

<!--
In fact, let's use the aforementioned alias so that the name of our cell, and the data we're iterating over, is consistent:
-->

それでは前述のエイリアスを使用して、セルの名前と反復処理するデータの一貫性を保つようにしましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.js"
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    articles: posts {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

// highlight-next-line
export const Success = ({ articles }) => {
  return (
    <ul>
      // highlight-next-line
      {articles.map((item) => {
        return <li key={item.id}>{JSON.stringify(item)}</li>
      })}
    </ul>
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.tsx"
export const QUERY = gql`
  query ArticlesQuery {
    // highlight-next-line
    articles: posts {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

// highlight-next-line
export const Success = ({ articles }: CellSuccessProps<ArticlesQuery>) => {
  return (
    <ul>
      // highlight-next-line
      {articles.map((item) => {
        return <li key={item.id}>{JSON.stringify(item)}</li>
      })}
    </ul>
  )
}
```

</TabItem>
</Tabs>

<!--
In addition to the `id` that was added to the `query` by the generator, let's get the `title`, `body`, and `createdAt` values as well:
-->

ジェネレータによって `query` に追加された `id` に加えて、 `title` 、 `body` 、 `createdAt` の値も取得しましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="web/src/components/ArticlesCell/ArticlesCell.js"
export const QUERY = gql`
  query ArticlesQuery {
    articles: posts {
      id
      // highlight-start
      title
      body
      createdAt
      // highlight-end
    }
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/ArticlesCell/ArticlesCell.tsx"
export const QUERY = gql`
  query ArticlesQuery {
    articles: posts {
      id
      // highlight-start
      title
      body
      createdAt
      // highlight-end
    }
  }
`
```

</TabItem>
</Tabs>

<!--
The page should now show a dump of all the data you created for any blog posts you scaffolded:
-->

このページには、scaffoldで作成したブログ記事のデータのすべてが表示されます：

<img src="https://user-images.githubusercontent.com/300/145911009-b83fd07f-0412-489c-a088-4e89faceea1c.png" alt="Articles with all DB values" />

<!--
Now we're in the realm of good ol' React components, so just build out the `Success` component to display the blog post in a nicer format:
-->

さて、ここからは古き良きReactコンポーネントの領域です。ブログ記事をいい感じに表示するために、`Success` コンポーネントを作り上げます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/ArticlesCell/ArticlesCell.js"
export const Success = ({ articles }) => {
  return (
    // highlight-start
    <>
      {articles.map((article) => (
        <article key={article.id}>
          <header>
            <h2>{article.title}</h2>
          </header>
          <p>{article.body}</p>
          <div>Posted at: {article.createdAt}</div>
        </article>
      ))}
    </>
    // highlight-end
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/ArticlesCell/ArticlesCell.tsx"
export const Success = ({ articles }: CellSuccessProps<ArticlesQuery>) => {
  return (
    // highlight-start
    <>
      {articles.map((article) => (
        <article key={article.id}>
          <header>
            <h2>{article.title}</h2>
          </header>
          <p>{article.body}</p>
          <div>Posted at: {article.createdAt}</div>
        </article>
      ))}
    </>
    // highlight-end
  )
}
```

</TabItem>
</Tabs>

<!--
And just like that we have a blog! It may be the most basic blog that ever graced the internet, but it's something! You can create/edit/delete posts and the world can view them on the homepage. (Don't worry, we've got more features to add.)
-->

ついに私たちはブログサイトを開設しました！インターネットを飾る最も基本的なブログかもしれませんが、それがどうした！ブログ記事の作成、編集、削除ができ、ホームページで世界中の人が見ることができます（心配しないでください、もっと多くの機能を追加する予定です）。

![Nicely formatted blog articles](https://user-images.githubusercontent.com/300/145911342-b3a4bb44-e635-4bc5-8df7-a824661b2714.png)

### Summary

<!--
To recap, what did we actually do to get this far?
-->

おさらいですが、ここまで実際に何をしてきたのでしょうか？

<!--
1. Generate the homepage
2. Generate the blog layout
3. Define the database schema
4. Run migrations to update the database and create a table
5. Scaffold a CRUD interface to the database table
6. Create a cell to load the data and take care of loading/empty/failure/success states
7. Add the cell to the page
-->

1. ホームページを作成
2. ブログのレイアウトを作成
3. データベーススキーマを定義
4. マイグレーションを実行してデータベースを更新しテーブルを作成
5. データベーステーブルへのCRUDインターフェイスの足場作り（scaffold）
6. データをロードするセルを作成し、loading/empty/failure/successの状態を管理
7. セルをページに追加

<!--
The last few steps will become a standard lifecycle of new features as you build a Redwood app.
-->

最後の数ステップは、Redwoodアプリで新機能を構築する際の標準的なライフサイクルです。

<!--
So far, other than a little HTML, we haven't had to do much by hand. And we especially didn't have to write a bunch of plumbing just to move data from one place to another. It makes web development a little more enjoyable, don't you think?
-->

今のところ、ちょっとしたHTML以外は、手作業はほとんどありません。特に、データをある場所から別の場所に移動するためだけのコード（plumbing）をたくさん書く必要はありませんでした。こうすると、Web開発はもうちょっと楽しくなると思いませんか？

<!--
We're going to add some more features to our app, but first let's take a detour to learn about how Redwood accesses our database and what these SDL and services files are for.
-->

これからこのアプリにいくつかの機能を追加していきますが、まずは少し寄り道して、Redwoodがデータベースにアクセスする方法と、SDLやサービスファイルが何のためにあるのかを知りましょう。
