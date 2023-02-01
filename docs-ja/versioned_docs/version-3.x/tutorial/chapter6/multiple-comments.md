# Multiple Comments

<!--
Our amazing blog posts will obviously garner a huge and passionate fanbase and we will very rarely have only a single comment. Let's work on displaying a list of comments.
-->

私たちの素晴らしいブログ記事は、すさまじい数の情熱的なファンを集め、コメントが1つしかないことはほとんどないでしょう。コメントの一覧を表示させましょう。

<!--
Let's think about where our comments are being displayed. Probably not on the homepage, since that only shows a summary of each post. A user would need to go to the full page to show the comments for that blog post. But that page is only fetching the data for the single blog post itself, nothing else. We'll need to get the comments and since we'll be fetching *and* displaying them, that sounds like a job for a Cell.
-->

私たちのコメントがどこに表示されるかを考えてみましょう。おそらくホームページではないでしょう。それぞれのブログ記事のサマリしか表示されないですからね。ユーザは、そのブログ記事のコメントを表示するために、フルページに移動する必要があるでしょう。しかし、このページは単一のブログ記事自体のデータを取得するだけで、他には何もありません。コメントを取得し *かつ* 表示する必要があるので、これはセルのお仕事のようですね。

:::info Couldn't the query for the blog post page also fetch the comments?

<!--
Yes, it could! But the idea behind Cells is to make components even more [composable](https://en.wikipedia.org/wiki/Composability) by having them be responsible for their own data fetching *and* display. If we rely on a blog post to fetch the comments then the new Comments component we're about to create now requires something *else* to fetch the comments and pass them in. If we re-use the Comments component somewhere, now we're fetching comments in two different places.
-->

はい、できます！しかし、セルの背後にあるアイデアは、コンポーネントが自身のデータフェッチ *と* 表示の責務を担うことで、コンポーネントをさらに[composable](https://en.wikipedia.org/wiki/Composability)にすることです。コメントの取得がブログ記事に依存するとしたら、これから作成する新しいCommentsコンポーネントは、コメントを取得して渡すために *コメントとは別の何か* が必要になります。Commentsコンポーネントをどこかで再利用すると、今度は2つの異なる場所でコメントを取得することになります。

<!--
**But what about the Comment component we just made, why doesn't that fetch its own data?**
-->

**しかし、先ほど作ったCommentコンポーネントはどうでしょうか、なぜそれ自身のデータを取得しないのでしょうか？**

<!--
There aren't any instances I (the author) could think of where we would ever want to display only a single comment in isolation—it would always be a list of all comments on a post. If displaying a single comment was common for your use case then it could definitely be converted to a **CommentCell** and have it responsible for pulling the data for that single comment itself. But keep in mind that if you have 50 comments on a blog post, that's now 50 GraphQL calls that need to go out, one for each comment. There's always a trade-off!
-->

私（作者）が思いつく限りでは、単一のコメントだけを単独で表示したいようなケースはないでしょう -- それは常に投稿されたすべてのコメントのリストです。もしあなたのユースケースで単一のコメントを表示することが一般的であれば、それは間違いなく **CommentCell** に書き換えて、その単一のコメント自体のデータを取得する責務を担うべきです。しかし、ブログの記事に50のコメントがある場合、それぞれ個別の、計50回のGraphQLコールが必要であることに留意してください。常にトレードオフの関係にあるのです！

<!--
**Then why make a standalone Comment component at all? Why not just do all the display in the CommentsCell?**
-->

**では、なぜスタンドアローン（独立した）のCommentコンポーネントを作るのでしょうか？すべての表示をCommentsCellで行えばよいのではないでしょうか？**

<!--
We're trying to start in small chunks to make the tutorial more digestible for a new audience so we're starting simple and getting more complex as we go. But it also just feels *nice* to build up a UI from these smaller chunks that are easier to reason about and keep separate in your head.
-->

私たちはチュートリアルを小さなチャンク（塊）から始めています。チュートリアルを新しい読者にとってよりわかりやすいものにするために、シンプルなものから初めて、徐々に複雑にしていきます。このような小さなチャンクからUIを構築していくのは、理屈を考えやすく、頭の中で分離しておくことができるので、とても良いことだと感じています。

<!--
**But what about—**
-->

**でも、どうなんでしょうか --**

<!--
Look, we gotta end this sidebar and get back to building this thing. You can ask more questions later, promise!
-->

いいですか、このサイドバーを終わらせて、これを構築に戻るのです。質問は後でどうぞ、約束です！

:::

### Storybook

<!--
Let's generate a **CommentsCell**:
-->

**CommentsCell** を生成しましょう：

```bash
yarn rw g cell Comments
```

<!--
Storybook updates with a new **CommentsCell** under the **Cells** folder, and it's actually showing something:
-->

**Cells** フォルダの下に新しい **CommentsCell** が追加されてStorybookが更新され、何か表示されています：

![image](https://user-images.githubusercontent.com/300/153477642-0d5a15a5-f96f-485a-b8b0-dbc1c4515279.png)

<!--
Where did that come from? Check out `CommentsCell.mock.{js,ts}`: there's no Prisma model for a Comment yet, so Redwood took a guess that your model would at least contain an `id` field and just used that for the mock data.
-->

これはどこから来たのでしょうか？ `CommentsCell.mock.{js,ts}` をチェックしてみてください：コメント用のPrismaモデルはまだないので、Redwoodはあなたのモデルが少なくとも `id` フィールドを持つと推測して、それをモックデータに使用しました。

<!--
Let's update the `Success` component to use the `Comment` component created earlier, and add all of the fields we'll need for the **Comment** to render to the `QUERY`:
-->

先ほど作成した `Comment` コンポーネントを使うよう `Success` コンポーネントを更新し、 **Comment** を描画するのに必要なフィールドすべてを `QUERY` に追加しましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentsCell/CommentsCell.js"
// highlight-next-line
import Comment from 'src/components/Comment'

export const QUERY = gql`
  query CommentsQuery {
    comments {
      id
      // highlight-start
      name
      body
      createdAt
      // highlight-end
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({ comments }) => {
  return (
  // highlight-start
    <>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </>
  // highlight-end
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/CommentsCell/CommentsCell.tsx"
// highlight-next-line
import Comment from 'src/components/Comment'

import type { CommentsQuery } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

export const QUERY = gql`
  query CommentsQuery {
    comments {
      id
      // highlight-start
      name
      body
      createdAt
      // highlight-end
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({ comments }: CellSuccessProps<CommentsQuery>) => {
  return (
  // highlight-start
    <>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </>
  // highlight-end
  )
}
```

</TabItem>
</Tabs>

<!--
We're passing an additional `key` prop to make React happy when iterating over an array with `map`.
-->

Reactが配列を `map` で反復処理して幸せになるために、追加で `key` propsを渡します。

<!--
If you check Storybook, you'll see that we do indeed render the `Comment` component three times, but there's no data to display. Let's update the mock with some sample data:
-->

Storybookを確認すると、確かに `Comment` コンポーネントを3回レンダリングしていますが、表示するデータがありません。サンプルデータでモックを更新してみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="web/src/components/CommentsCell/CommentsCell.mock.js"
export const standard = () => ({
  // highlight-start
  comments: [
    {
      id: 1,
      name: 'Rob Cameron',
      body: 'First comment',
      createdAt: '2020-01-02T12:34:56Z',
    },
    {
      id: 2,
      name: 'David Price',
      body: 'Second comment',
      createdAt: '2020-02-03T23:00:00Z',
    },
  ],
  // highlight-end
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="web/src/components/CommentsCell/CommentsCell.mock.ts"
export const standard = () => ({
  // highlight-start
  comments: [
    {
      id: 1,
      name: 'Rob Cameron',
      body: 'First comment',
      createdAt: '2020-01-02T12:34:56Z',
    },
    {
      id: 2,
      name: 'David Price',
      body: 'Second comment',
      createdAt: '2020-02-03T23:00:00Z',
    },
  ],
  // highlight-end
})
```

</TabItem>
</Tabs>

:::info What's this `standard` thing?

<!--
Think of it as the standard, default mock if you don't do anything else. We would have loved to use the name "default" but that's already a reserved word in Javascript!
-->

これは、何もしない場合の標準的な、デフォルトのモックだと考えてください。私たちは "default" という名前を使いたかったのですが、これはすでにJavascriptでは予約語になっています！

:::

<!--
Storybook refreshes and we've got comments! It's a little hard to distinguish between the two separate comments because they're right next to each other:
-->

ストーリーブックが更新され、コメントがつきました！2つの別々のコメントがすぐ隣り合っていて区別がつきづらいですね：

![image](https://user-images.githubusercontent.com/300/153478670-14c32c29-6d1d-491b-bc2b-b033557a6d84.png)

<!--
Since `CommentsCell` is the one responsible for drawing multiple comments, it makes sense that it should be "in charge" of how they're displayed, including the gap between them. Let's add a style to do that in `CommentsCell`:
-->

`CommentsCell` は複数のコメントを描画する責務を担っているので、コメント間の隙間含めコメントの表示方法を "担う" ことは理にかなっています。そのためのスタイルを `CommentsCell` に追加してみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentsCell/CommentsCell.js"
export const Success = ({ comments }) => {
  return (
    // highlight-next-line
    <div className="space-y-8">
      {comments.map((comment) => (
        <Comment comment={comment} key={comment.id} />
      ))}
    // highlight-next-line
    </div>
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/CommentsCell/CommentsCell.tsx"
export const Success = ({ comments }) => {
  return (
    // highlight-next-line
    <div className="space-y-8">
      {comments.map((comment) => (
        <Comment comment={comment} key={comment.id} />
      ))}
    // highlight-next-line
    </div>
  )
}
```

</TabItem>
</Tabs>

:::tip

<!--
`space-y-8` is a handy Tailwind class that puts a space *between* elements, but not above or below the entire stack (which is what would happen if you gave each `<Comment>` its own top/bottom margin).
-->

`space-y-8` は Tailwind の便利なクラスで、要素の間に *between* のスペースを入れますが、スタック全体の上や下には入れません（各 `<Comment>` に独自の上下マージンを与えると、このようになります）。

:::

<!--
Looking good! Let's add our CommentsCell to the actual blog post display page:
-->

いい感じ！CommentsCellを、実際にブログ記事を表示するページに追加してみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.js"
import { Link, routes } from '@redwoodjs/router'
// highlight-next-line
import CommentsCell from 'src/components/CommentsCell'

const truncate = (text, length) => {
  return text.substring(0, length) + '...'
}

const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      // highlight-next-line
      {!summary && <CommentsCell />}
    </article>
  )
}

export default Article
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Article/Article.tsx"
import { Link, routes } from '@redwoodjs/router'
// highlight-next-line
import CommentsCell from 'src/components/CommentsCell'

import type { Post } from 'types/graphql'

const truncate = (text: string, length: number) => {
  return text.substring(0, length) + '...'
}

interface Props {
  article: Omit<Post, 'createdAt'>
  summary?: boolean
}

const Article = ({ article, summary = false }: Props) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      // highlight-next-line
      {!summary && <CommentsCell />}
    </article>
  )
}

export default Article
```

</TabItem>
</Tabs>

<!--
If we are *not* showing the summary, then we'll show the comments. Take a look at the **Full** and **Summary** stories in Storybook and you should see comments on one and not on the other.
-->

要約を表示 *しない* のであれば、コメントを表示することになります。Storybookの **Full** と **Summary** のストーリーを見てみると、片方にはコメントが表示され、もう片方には表示されないはずです。

:::info Shouldn't the `CommentsCell` cause an actual GraphQL request? How does this work?

<!--
Redwood has added some functionality around Storybook so that if you're testing a component that itself isn't a Cell (like the `Article` component) but that renders a cell (like `CommentsCell`), then it will mock the GraphQL and use the `standard` mock that goes along with that Cell. Pretty cool, huh?
-->

RedwoodはStorybookにいくつかの機能を追加しました。（ `Article` コンポーネントのように）セルではないものの、（ `CommentsCell` のように）セルをレンダリングするコンポーネントをテストする場合、GraphQLをモックしてそのセルに対応した `standard` （標準的な）モックを使用します。かなりクールでしょう？

:::

<!--
Adding the comments to the article display has exposed another design issue: the comments are sitting right up underneath the article text:
-->

ブログ記事表示にコメントを追加することで、別のデザイン上の問題が露呈しました：それは、コメントがブログ記事本文のすぐ下に表示されることです：

![image](https://user-images.githubusercontent.com/300/153480229-ea483d75-62bf-4b56-b248-10ca1597a7a8.png)

<!--
Let's add a gap between the two:
-->

本文とコメントの間に隙間を空けましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.js"
const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      // highlight-start
      {!summary && (
        <div className="mt-12">
          <CommentsCell />
        </div>
      )}
      // highlight-end
    </article>
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Article/Article.tsx"
const Article = ({ article, summary = false }: Props) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      // highlight-start
      {!summary && (
        <div className="mt-12">
          <CommentsCell />
        </div>
      )}
      // highlight-end
    </article>
  )
}
```

</TabItem>
</Tabs>

![image](https://user-images.githubusercontent.com/300/153480489-a59f27e3-6d70-4548-9a1e-4036b6860444.png)

<!--
Okay, comment display is looking good! However, you may have noticed that if you tried going to the actual site there's an error where the comments should be:
-->

さて、コメントの表示もいい感じです！しかし、実際のサイトにアクセスしてみると、コメントが表示されるはずの場所にエラーがあることにお気づきかもしれません：

![image](https://user-images.githubusercontent.com/300/153480635-58ada8e8-ed5b-41b6-875b-501a07a36d9a.png)

<!--
Why is that? Remember that we started with the `CommentsCell`, but never actually created a Comment model in `schema.prisma` or created an SDL and service! We'll be rectifying this soon. But this demonstrates another huge benefit of working with Storybook: you can build out UI functionality completely isolated from the api-side. In a team setting this is great because a web-side team can work on the UI while the api-side team can be building the backend end simultaneously and one doesn't have to wait for the other.
-->

なぜでしょうか？私たちは `CommentsCell` から始めましたが、実際には `schema.prisma` にコメントモデルを作成したり、SDL やサービスを作成していませんでした！これはすぐに修正する予定です。しかし、これはStorybookで作業することのもう一つの大きな利点を示しています：それは、UI機能をAPIサイドから完全に分離して構築できることです。WebサイドのチームがUIに取り組み、APIサイドのチームがバックエンドエンドを並行して構築することができます。チーム開発において一方が他方を待つ必要がないのは素晴らしいことです。

### Testing

<!--
We added a component, `CommentsCell`, and edited another, `Article`, so what do we test, and where?
-->

コンポーネントである `CommentsCell` を追加し、別のコンポーネントである `Article` を編集しました。では何を、どこでテストすればいいのでしょうか？

#### Testing Comments

<!--
The actual `Comment` component does most of the work so there's no need to test all of that functionality again in `CommentsCell`: our `Comment` tests cover that just fine. What things does `CommentsCell` do that make it unique?

* Has a loading message
* Has an error message
* Has a failure message
* When it renders successfully, it outputs as many comments as were returned by the `QUERY` (*what* is rendered we'll leave to the `Comment` tests)
-->

実際の `Comment` コンポーネントがほとんどの作業を行うので、 `CommentsCell` でその機能すべてを改めてテストする必要はありません： `Comment` のテストで十分にカバーできます。 `CommentsCell` が持つ独自の機能は何でしょうか？

* ロードメッセージがある
* エラーメッセージがある
* 失敗メッセージがある
* 描画に成功すると `QUERY` が返したのと同じ数のコメントを表示する（ *何が* 描画されるかは `Comment` のテストに任せる）

<!--
The default `CommentsCell.test.{js,tsx}` actually tests every state for us, albeit at an absolute minimum level—it makes sure no errors are thrown:
-->

デフォルトの `CommentsCell.test.{js,tsx}` は、ごく最小限ではあるものの、実際にすべての状態をテストしてくれます -- エラーがスローされないことを確認します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentsCell/CommentsCell.test.js"
import { render } from '@redwoodjs/testing/web'

import { Loading, Empty, Failure, Success } from './CommentsCell'
import { standard } from './CommentsCell.mock'

describe('CommentsCell', () => {
  it('renders Loading successfully', () => {
    expect(() => {
      render(<Loading />)
    }).not.toThrow()
  })

  it('renders Empty successfully', async () => {
    expect(() => {
      render(<Empty />)
    }).not.toThrow()
  })

  it('renders Failure successfully', async () => {
    expect(() => {
      render(<Failure error={new Error('Oh no')} />)
    }).not.toThrow()
  })

  it('renders Success successfully', async () => {
    expect(() => {
      render(<Success comments={standard().comments} />)
    }).not.toThrow()
  })
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/CommentsCell/CommentsCell.test.tsx"
import { render } from '@redwoodjs/testing/web'

import { Loading, Empty, Failure, Success } from './CommentsCell'
import { standard } from './CommentsCell.mock'

describe('CommentsCell', () => {
  it('renders Loading successfully', () => {
    expect(() => {
      render(<Loading />)
    }).not.toThrow()
  })

  it('renders Empty successfully', async () => {
    expect(() => {
      render(<Empty />)
    }).not.toThrow()
  })

  it('renders Failure successfully', async () => {
    expect(() => {
      render(<Failure error={new Error('Oh no')} />)
    }).not.toThrow()
  })

  it('renders Success successfully', async () => {
    expect(() => {
      render(<Success comments={standard().comments} />)
    }).not.toThrow()
  })
})
```

</TabItem>
</Tabs>

<!--
And that's nothing to scoff at! As you've probably experienced, a React component usually either works 100% or blows up spectacularly. If it works, great! If it fails then the test fails too, which is exactly what we want to happen.
-->

そして、それは決してバカにできるものではありません！皆さんも経験があると思いますが、Reactのコンポーネントは通常、100%動作するか、あるいは見事に吹っ飛ぶかのどちらかです。もし動けば、素晴らしいことです！もし失敗したら、テストも失敗することになり、何か起きていることがわかります。

<!--
But in this case we can do a little more to make sure `CommentsCell` is doing what we expect. Let's update the `Success` test in `CommentsCell.test.{js,ts}` to check that exactly the number of comments we passed in as a prop are rendered. How do we know a comment was rendered? How about if we check that each `comment.body` (the most important part of the comment) is present on the screen:
-->

しかしこの場合、 `CommentsCell` が期待通りに動作していることを確認するために、もう少し工夫できます。 `CommentsCell.test.{js,ts}` の `Success` テストを更新して、props として渡したコメントの数が正確に描画されることを確認しましょう。
コメントがレンダリングされたことを知るにはどうしたらよいでしょうか？
それぞれの `comment.body` （コメントの最も重要な部分）が画面上に存在することを確認するのはどうでしょうか：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentsCell/CommentsCell.test.js"
// highlight-next-line
import { render, screen } from '@redwoodjs/testing/web'

import { Loading, Empty, Failure, Success } from './CommentsCell'
import { standard } from './CommentsCell.mock'

describe('CommentsCell', () => {
  it('renders Loading successfully', () => {
    expect(() => {
      render(<Loading />)
    }).not.toThrow()
  })

  it('renders Empty successfully', async () => {
    expect(() => {
      render(<Empty />)
    }).not.toThrow()
  })

  it('renders Failure successfully', async () => {
    expect(() => {
      render(<Failure error={new Error('Oh no')} />)
    }).not.toThrow()
  })

  it('renders Success successfully', async () => {
    // highlight-start
    const comments = standard().comments
    render(<Success comments={comments} />)

    comments.forEach((comment) => {
      expect(screen.getByText(comment.body)).toBeInTheDocument()
    })
    // highlight-end
  })
})

```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/CommentsCell/CommentsCell.test.tsx"
// highlight-next-line
import { render, screen } from '@redwoodjs/testing/web'

import { Loading, Empty, Failure, Success } from './CommentsCell'
import { standard } from './CommentsCell.mock'

describe('CommentsCell', () => {
  it('renders Loading successfully', () => {
    expect(() => {
      render(<Loading />)
    }).not.toThrow()
  })

  it('renders Empty successfully', async () => {
    expect(() => {
      render(<Empty />)
    }).not.toThrow()
  })

  it('renders Failure successfully', async () => {
    expect(() => {
      render(<Failure error={new Error('Oh no')} />)
    }).not.toThrow()
  })

  it('renders Success successfully', async () => {
    // highlight-start
    const comments = standard().comments
    render(<Success comments={comments} />)

    comments.forEach((comment) => {
      expect(screen.getByText(comment.body)).toBeInTheDocument()
    })
    // highlight-end
  })
})

```

</TabItem>
</Tabs>

<!--
We're looping through each `comment` from the mock, the same mock used by Storybook, so that even if we add more later, we're covered. You may find yourself writing a test and saying "just test that there are two total comments," which will work today, but months from now when you add more comments to the mock to try some different iterations in Storybook, that test will start failing. Avoid hardcoding data like this, especially [magic numbers](https://en.wikipedia.org/wiki/Magic_number_(programming)), into your test when you can derive it from your mocked data!
-->

Storybookで使用しているモックと同じモックからの `comment` をループしているので、後で追加しても大丈夫です。
テストを書いていて "コメントが全部で2つあることをテストしてください" と言うと、今日はうまくいくかもしれませんが、数ヶ月後、Storybookでいろいろなイテレーションを試すためにモックにコメントを追加すると、そのテストは失敗し始めるでしょう。
このようなデータをハードコードするのは避けましょう。特に [マジックナンバー](https://en.wikipedia.org/wiki/Magic_number_(programming)) は、モックデータから導き出せるのであれば、テストに入れるのは避けましょう！

#### Testing Article

<!--
The functionality we added to `Article` says to show the comments for the post if we are *not* showing the summary. We've got a test for both the "full" and "summary" renders already. Generally you want a test to be testing "one thing," like whether the body of the article is present, and another test for whether the comments are displaying. If you find that you're using "and" in your test description (like "renders a blog post and its comments") that's a good sign that it should probably be split into two separate tests.
-->

私たちが `Article` に追加した機能は、要約を表示 *しない* 場合はブログ記事に対するコメントを表示します。
すでに "full" レンダーと "summary" レンダーの両方のテストがあります。
一般的にテストは、ブログ記事の本文が存在するかどうかのような "1つのこと" をテストし、コメントが表示されているかどうかは他のテストでテストしたいものです。もし、テストの記述に "and" を使っているようなら（例えば "ブログ記事とそのコメントを表示する" のように）、それはおそらく2つの別々のテストに分けるべきという良いサインでしょう。

<!--
Let's add two additional tests for our new functionality:
-->

新しい機能のために、2つのテストを追加しましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.test.js"
// highlight-start
import { render, screen, waitFor } from '@redwoodjs/testing'

import { standard } from 'src/components/CommentsCell/CommentsCell.mock'
// highlight-end

import Article from './Article'

const ARTICLE = {
  id: 1,
  title: 'First post',
  body: `Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Street art next level umami squid. Hammock hexagon glossier 8-bit banjo. Neutra la croix mixtape echo park four loko semiotics kitsch forage chambray. Semiotics salvia selfies jianbing hella shaman. Letterpress helvetica vaporware cronut, shaman butcher YOLO poke fixie hoodie gentrify woke heirloom.`,
  createdAt: new Date().toISOString(),
}

describe('Article', () => {
  it('renders a blog post', () => {
    render(<Article article={ARTICLE} />)

    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(screen.getByText(ARTICLE.body)).toBeInTheDocument()
  })

  // highlight-start
  it('renders comments when displaying a full blog post', async () => {
    const comment = standard().comments[0]
    render(<Article article={ARTICLE} />)

    await waitFor(() =>
      expect(screen.getByText(comment.body)).toBeInTheDocument()
    )
  })
  // highlight-end

  it('renders a summary of a blog post', () => {
    render(<Article article={ARTICLE} summary={true} />)

    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(
      screen.getByText(
        'Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Str...'
      )
    ).toBeInTheDocument()
  })

  // highlight-start
  it('does not render comments when displaying a summary', async () => {
    const comment = standard().comments[0]
    render(<Article article={ARTICLE} summary={true} />)

    await waitFor(() =>
      expect(screen.queryByText(comment.body)).not.toBeInTheDocument()
    )
  })
  // highlight-end
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Article/Article.test.tsx"
// highlight-start
import { render, screen, waitFor } from '@redwoodjs/testing'

import { standard } from 'src/components/CommentsCell/CommentsCell.mock'
// highlight-end

import Article from './Article'

const ARTICLE = {
  id: 1,
  title: 'First post',
  body: `Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Street art next level umami squid. Hammock hexagon glossier 8-bit banjo. Neutra la croix mixtape echo park four loko semiotics kitsch forage chambray. Semiotics salvia selfies jianbing hella shaman. Letterpress helvetica vaporware cronut, shaman butcher YOLO poke fixie hoodie gentrify woke heirloom.`,
  createdAt: new Date().toISOString(),
}

describe('Article', () => {
  it('renders a blog post', () => {
    render(<Article article={ARTICLE} />)

    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(screen.getByText(ARTICLE.body)).toBeInTheDocument()
  })

  // highlight-start
  it('renders comments when displaying a full blog post', async () => {
    const comment = standard().comments[0]
    render(<Article article={ARTICLE} />)

    await waitFor(() =>
      expect(screen.getByText(comment.body)).toBeInTheDocument()
    )
  })
  // highlight-end

  it('renders a summary of a blog post', () => {
    render(<Article article={ARTICLE} summary={true} />)

    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(
      screen.getByText(
        'Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Str...'
      )
    ).toBeInTheDocument()
  })

  // highlight-start
  it('does not render comments when displaying a summary', async () => {
    const comment = standard().comments[0]
    render(<Article article={ARTICLE} summary={true} />)

    await waitFor(() =>
      expect(screen.queryByText(comment.body)).not.toBeInTheDocument()
    )
  })
  // highlight-end
})
```

</TabItem>
</Tabs>

<!--
Notice we're importing the mock from a completely different component—nothing wrong with that!
-->

モックを全く別のコンポーネントからインポートしていることに注意してください -- 何も問題ありません！

<!--
We're introducing a new test function here, `waitFor()`, which will wait for things like GraphQL queries to finish running before checking for what's been rendered. Since `Article` renders `CommentsCell` we need to wait for the `Success` component of `CommentsCell` to be rendered.
-->

ここでは新しいテスト関数である `waitFor()` を導入します。この関数は GraphQL クエリの実行が終了するのを待って、描画されたものをチェックします。 `Article` は `CommentsCell` を描画するので、 `CommentsCell` の `Success` コンポーネントが描画されるのを待つ必要があります。

:::info

<!--
The summary version of `Article` does *not* render the `CommentsCell`, but we should still wait. Why? If we did mistakenly start including `CommentsCell`, but didn't wait for the render, we would get a falsely passing test—indeed the text isn't on the page but that's because it's still showing the `Loading` component! If we had waited we would have seen the actual comment body get rendered, and the test would (correctly) fail.
-->

要約バージョンの `Article` は `CommentsCell` を描画し*ません*が、ここでも wait する必要があります。なぜでしょうか？
間違って `CommentsCell` を含めてしてしまい、描画を待たなかった場合、テストは偽の合格判定になります -- 確かにテキストはページ上にありませんが、それは `Loading` コンポーネントがまだ表示されているからです！もし wait していたら、実際のコメント本文が描画され、テストは（正しく）失敗していたでしょう。

:::

<!--
Okay we're finally ready to let users create their comments.
-->

さて、いよいよユーザ自身がコメントする準備が整いました。
