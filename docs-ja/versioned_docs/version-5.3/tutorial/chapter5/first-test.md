# Our First Test

<!--
So if Storybook is the first phase of creating/updating a component, phase two must be confirming the functionality with a test. Let's add a test for our new summary feature.
-->

つまり Storybook がコンポーネントを作成/更新する最初のフェーズだとすれば、フェーズ2は機能するかをテストで確認する必要があります。
それでは、新機能である要約のテストを追加してみましょう。

<!--
If you've never done any kind of testing before this may be a little hard to follow. We've got a great document [all about testing](../../testing.md) (including some philosophy, for those so inclined) if you want a good overview of testing in general. We even build a super-simple test runner from scratch in plain JavaScript to take some of the mystery out of how this all works!
-->

もしあなたが今まで何らかのテストをしたことがないのであれば、これは少し難しいかもしれません。一般的なテストの概要を知りたい場合は [all about testing](../../testing.md) という素晴らしいドキュメントがあります（哲学も含まれているので、興味のある方はご覧ください）。私たちは、これがどのように動作するかの謎を解くために、プレーンなJavaScriptでイチから超シンプルなテストランナーを構築しています！

<!--
If you still have the test process running from the previous page then then you can just press `a` to run **a**ll tests. If you stopped your test process, you can start it again with:
-->

前のページのテストプロセスをまだ実行している場合は、 `a` を押すだけで全て（ **a**ll）のテストを実行することができます。テストプロセスを停止した場合は、次のようにして再び開始することができます：

```bash
yarn rw test
```

<!--
Can you guess what broke in this test?
-->

このテストで何が壊れたかわかりますか？

![image](https://user-images.githubusercontent.com/300/153312402-dd7f08bc-e23d-4acc-8202-cdfc9798a911.png)

<!--
The test was looking for the full text of the blog post, but remember that in `ArticlesCell` we had `Article` only display the *summary* of the post. This test is looking for the full text match, which is no longer present on the page.
-->

このテストではブログ記事の全文を要求しましたが、`ArticlesCell` では `Article` にブログ記事の *要約* だけを表示させたことを思い出してください。このテストでは、もはやページ上に存在しないフルテキストと一致することを要求しています。

<!--
Let's update the test so that it checks for the expected behavior instead. There are entire books written on the best way to test, so no matter what we decide on testing in this code there will be someone out there to tell us we're doing it wrong. As just one example, the simplest test would be to just copy what's output and use that for the text in the test:
-->

このテストを更新して、期待される振る舞いをチェックするようにしましょう。テストの最良の方法について書かれた本がたくさんあるので、このコードで何をテストするにせよ、私たちが間違ったやり方をしていれば誰かが教えてくれることでしょう。一例として、最も単純なテストは、出力されたものをコピーしてそのテキストをテストに使うことです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/ArticlesCell.test.js"
test('Success renders successfully', async () => {
  const articles = standard().articles
  render(<Success articles={articles} />)

  // highlight-start
  expect(screen.getByText(articles[0].title)).toBeInTheDocument()
  expect(
    screen.getByText(
      'Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Str...'
    )
  ).toBeInTheDocument()
  // highlight-end
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/ArticlesCell.test.tsx"
test('Success renders successfully', async () => {
  const articles = standard().articles
  render(<Success articles={articles} />)

  // highlight-start
  expect(screen.getByText(articles[0].title)).toBeInTheDocument()
  expect(
    screen.getByText(
      'Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Str...'
    )
  ).toBeInTheDocument()
  // highlight-end
})
```

</TabItem>
</Tabs>

<!--
But the truncation length could change later, so how do we encapsulate that in our test? Or should we? The number of characters to truncate to is hardcoded in the `Article` component, which this component shouldn't really care about: it should be up to the page that's presenting the article to determine much or how little to show (based on space concerns, design constraints, etc.) don't you think? Even if we refactored the `truncate()` function into a shared place and imported it into both `Article` and this test, the test will still be knowing too much about `Article`—why should it have detailed knowledge of the internals of `Article` and that it's making use of this `truncate()` function at all? It shouldn't! One theory of testing says that the thing you're testing should be a black box: you can't see inside of it, all you can test is what data comes out when you send certain data in.
-->

切り詰める文字数は後で変更することができるのですが、どのようにテストにカプセル化するのでしょうか？あるいはそうすべきでしょうか？切り詰める文字数は `Article` コンポーネントにハードコードされており、このコンポーネントが本当に気にする必要はありません：ブログ記事を表示するページが（スペースの問題やデザインの制約などに基づいて）表示する文字数を決定するべきだと思いませんか？たとえ `truncate()` 関数を共有の場所にリファクタリングして `Article` とこのテストの両方にインポートしたとしても、テストは `Article` についてあまりにも多くのことを知っていることになります -- なぜテストは `Article` の内部とこの `truncate()` 関数を使うことについて詳細な知識を持たなければならないのでしょうか？そんなことはないはずです！テスト理論の1つにテスト対象はブラックボックスであるべきというものがあります：テスト対象の内部を見ることはできず、あなたがテストできるのは、あるデータを入力したときに出力されたデータだけです。

<!--
Let's compromise—by virtue of the fact that this functionality has a prop called "summary" we can guess that it's doing *something* to shorten the text. So what if we test three things that we can make reasonable assumptions about right now:

1. The full body of the post body *is not* present
2. But, at least the first couple of words of the post *are* present
3. The text that is shown ends in "..."
-->

妥協してみましょう -- この機能が "summary" という props を持つことから、テキストを短くするために *何か* をしているのだと推測できます。そこで、今すぐに合理的に推測できる3つのことをテストしてみるのはどうでしょう：

1. ブログ記事の本文の全文が *存在しない*
2. しかし、少なくともブログ記事の最初の数単語は存在する
3. 表示されるテキストが "..." で終わっている

<!--
This gives us a buffer if we decide to truncate to something like 25 words, or even if we go up to a couple of hundred. What it *doesn't* encompass, however, is the case where the body of the blog post is shorter than the truncate limit. In that case the full text *would* be present, and we should probably update the `truncate()` function to not add the `...` in that case. We'll leave adding that functionality and test case up to you to add in your free time. ;)
-->

これにより、たとえば25ワードに切り捨てる場合、あるいは数百ワードに切り上げる場合のバッファが確保できます。しかし、これはブログ記事の本文が切り詰めの制限より短い場合を含み *ません* 。その場合は全文が表示されるので、 `...` を追加しないように `truncate()` 関数を更新すべきかもしれません。この機能追加とテストケースは、自由時間に追加してくださいね ;）

### Adding the Test

<!--
Okay, let's do this:
-->

よし、やってみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/ArticlesCell.test.js"
// highlight-next-line
import { render, screen, within } from '@redwoodjs/testing'

import { Loading, Empty, Failure, Success } from './ArticlesCell'
import { standard } from './ArticlesCell.mock'

describe('ArticlesCell', () => {
  test('Loading renders successfully', () => {
    expect(() => {
      render(<Loading />)
    }).not.toThrow()
  })

  test('Empty renders successfully', async () => {
    expect(() => {
      render(<Empty />)
    }).not.toThrow()
  })

  test('Failure renders successfully', async () => {
    expect(() => {
      render(<Failure error={new Error('Oh no')} />)
    }).not.toThrow()
  })

  test('Success renders successfully', async () => {
    const articles = standard().articles
    render(<Success articles={articles} />)

    // highlight-start
    articles.forEach((article) => {
      const truncatedBody = article.body.substring(0, 10)
      const matchedBody = screen.getByText(truncatedBody, { exact: false })
      const ellipsis = within(matchedBody).getByText('...', { exact: false })

      expect(screen.getByText(article.title)).toBeInTheDocument()
      expect(screen.queryByText(article.body)).not.toBeInTheDocument()
      expect(matchedBody).toBeInTheDocument()
      expect(ellipsis).toBeInTheDocument()
    })
    // highlight-end
  })
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/ArticlesCell.test.tsx"
// highlight-next-line
import { render, screen, within } from '@redwoodjs/testing'

import { Loading, Empty, Failure, Success } from './ArticlesCell'
import { standard } from './ArticlesCell.mock'

describe('ArticlesCell', () => {
  test('Loading renders successfully', () => {
    expect(() => {
      render(<Loading />)
    }).not.toThrow()
  })

  test('Empty renders successfully', async () => {
    expect(() => {
      render(<Empty />)
    }).not.toThrow()
  })

  test('Failure renders successfully', async () => {
    expect(() => {
      render(<Failure error={new Error('Oh no')} />)
    }).not.toThrow()
  })

  test('Success renders successfully', async () => {
    const articles = standard().articles
    render(<Success articles={articles} />)

    // highlight-start
    articles.forEach((article) => {
      const truncatedBody = article.body.substring(0, 10)
      const matchedBody = screen.getByText(truncatedBody, { exact: false })
      const ellipsis = within(matchedBody).getByText('...', { exact: false })

      expect(screen.getByText(article.title)).toBeInTheDocument()
      expect(screen.queryByText(article.body)).not.toBeInTheDocument()
      expect(matchedBody).toBeInTheDocument()
      expect(ellipsis).toBeInTheDocument()
    })
    // highlight-end
  })
})
```

</TabItem>
</Tabs>

<!--
This loops through each article in our `standard()` mock and for each one:
-->

これは `standard()` モック内の各ブログ記事をループし、それぞれのブログ記事に対してテストを行います：

```javascript
const truncatedBody = article.body.substring(0, 10)
```

<!--
Create a variable `truncatedBody` containing the first 10 characters of the post body.
-->

ブログ記事本文の最初の10文字を格納した変数 `truncatedBody` を作成します。

```javascript
const matchedBody = screen.getByText(truncatedBody, { exact: false })
```

<!--
Search through the rendered HTML on the screen and find the HTML element that contains the truncated body (note the `{ exact: false }` here, as normally the exact text, and only that text, would need to be present, but in this case there's probably more than just the 10 characters).
-->

画面上のレンダリングされたHTMLを検索して、切り捨てられた本文を含むHTML要素を見つけます（ここで `{ exact: false }` に注意してください。通常は正確なテキストとそのテキストだけが存在する必要がありますが、この場合はおそらく10文字だけではありません）。

```javascript
const ellipsis = within(matchedBody).getByText('...', { exact: false })
```

<!--
Within the HTML element that was found in the previous line, find `...`, again without an exact match.
-->

前の行で見つかったHTML要素の中で、 `...` を探します。これも完全一致ではありません。

```javascript
expect(screen.getByText(article.title)).toBeInTheDocument()
```

<!--
Find the title of the article in the page.
-->
ページ内のブログ記事タイトルを検索します。

```javascript
expect(screen.queryByText(article.body)).not.toBeInTheDocument()
```
<!--
When trying to find the *full* text of the body, it should *not* be present.
-->

ブログ記事本文の *全文* を探しても、存在 *しない* はずです。

```javascript
expect(matchedBody).toBeInTheDocument()
```
<!--
Assert that the truncated text is .
-->
切り詰められたテキストが存在することを確認します。

```javascript
expect(ellipsis).toBeInTheDocument()
```
<!--
Assert that the ellipsis is present.
-->
省略部分（ `...` ）があることを確認します。

:::info What's the difference between `getByText()` and `queryByText()`?

<!--
`getByText()` will throw an error if the text isn't found in the document, whereas `queryByText()` will  return `null` and let you continue with your testing (and is one way to test that some text is *not* present on the page). You can read more about these in the [DOM Testing Library Queries](https://testing-library.com/docs/dom-testing-library/api-queries) docs.
-->

`getByText()` はテキストがドキュメント内に見つからなかった場合にエラーをスローしますが、 `queryByText()` は `null` を返しテストを続行することができます（そして、これはあるテキストがページ上に存在 *しない* ことをテストする一つの方法です）。これらについては、[DOM Testing Library Queries](https://testing-library.com/docs/dom-testing-library/api-queries) のドキュメントで詳しく説明されています。

:::

<!--
As soon as you saved that test file the test should have run and passed! Press `a` to run the whole suite if you want to make sure nothing else broke. Remember to press `o` to go back to only testing changes again. (There's nothing wrong with running the full test suite each time, but it will take longer than only testing the things that have changed since the last time you committed your code.)
-->

テストファイルを保存するとすぐに、テストが実行され合格しているはずです！

他に何も壊れていないことを確認したい場合は、`a` を押してスイート全体を実行してください。 `o` を押すと、再び変更点のみのテスト（ **o**nly）に戻ります（毎回テストスイートを全部実行するのは悪いことではありませんが、前回コードをコミットしたときから変更された点だけをテストするよりも時間がかかります）。

<!--
To double check that we're testing what we think we're testing, open up `ArticlesCell.js` and remove the `summary={true}` prop (or set it to `false`) and the test should fail: now the full body of the post *is* on the page and the expectation in our test `expect(screen.queryByText(article.body)).not.toBeInTheDocument()` fails because the full body *is* in the document! Make sure to put the `summary={true}` back before we continue.
-->

テストしている内容が正しいか確認するために、 `ArticlesCell.js` を開いて `summary={true}` propsを削除（または `false` に）すると、テストは失敗するはずです：ブログ記事本文の全文がページに *表示され* 、テストの `expect(screen.queryByText(article.body)).not.toBeInTheDocument()` が失敗するはずです。なぜならブログ記事本文の全文がdocumentに存在 *する* からです。続ける前に `summary={true}` に戻すのをお忘れなく。

### What's the Deal with Mocks?

<!--
Did you wonder where the articles were coming from in our test? Was it the development database? Nope: that data came from a **Mock**. That's the `ArticlesCell.mock.js` file that lives next to your component, test and stories files. Mocks are used when you want to define the data that would normally be returned by GraphQL in your Storybook stories or tests. In cells, a GraphQL call goes out (the query defined by the variable `QUERY` at the top of the file) and returned to the `Success` component. We don't want to have to run the api-side server and have real data in the database just for Storybook or our tests, so Redwood intercepts those GraphQL calls and returns the data from the mock instead.
-->

私たちのテストでは、記事がどこから来るのか不思議に思いませんでしたか？開発用データベースでしょうか？いいえ：そのデータは **モック** から来ているのです。これは `ArticlesCell.mock.js` というファイルで、コンポーネント、テスト、ストーリーのファイルの隣にあります。モックは、Storybook のストーリーやテストにおいて、GraphQLによって通常返されるデータを定義したい場合に使用します。セルではGraphQLの呼び出し（ファイルの先頭の変数 `QUERY` で定義されたクエリ）が行われ `Success` コンポーネントに返します。Storybook やテストのためだけに、APIサイドのサーバを動かしてデータベースに実データが必要になるのは困るので、RedwoodはそれらのGraphQLコールをインターセプトして、代わりにモックからデータを返します。

:::info If the server is being mocked, how do we test the api-side code?

<!--
We'll get to that next when we create a new feature for our blog from scratch!
-->

次にブログに新しい機能をイチから実装するときに説明します！

:::

<!--
The names you give your mocks are then available in your tests and stories files. Just import the one you want to use (`standard` is imported for you in generated test files) and you can use the spread syntax to pass it through to your **Success** component.
-->

モックにつけた名前は、テストやストーリーのファイルで使うことができます。
使いたいものをインポートするだけで（生成されたテストファイルでは `standard` がインポートされます）、スプレッド構文を使用して **Success** コンポーネントに渡すことができます。

<!--
Let's say our mock looks like this:
-->

モックがこんな感じだとします：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript
export const standard = () => ({
  articles: [
    {
      id: 1,
      title: 'First Post',
      body: `Neutra tacos hot chicken prism raw denim...`,
      createdAt: '2020-01-01T12:34:56Z',
    },
    {
      id: 2,
      title: 'Second Post',
      body: `Master cleanse gentrify irony put a bird on it...`,
      createdAt: '2020-01-01T12:34:56Z',
    },
  ],
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```javascript
export const standard = () => ({
  articles: [
    {
      id: 1,
      title: 'First Post',
      body: `Neutra tacos hot chicken prism raw denim...`,
      createdAt: '2020-01-01T12:34:56Z',
    },
    {
      id: 2,
      title: 'Second Post',
      body: `Master cleanse gentrify irony put a bird on it...`,
      createdAt: '2020-01-01T12:34:56Z',
    },
  ],
})
```

</TabItem>
</Tabs>

<!--
The first key in the object that's returned is named `articles`. That's also the name of the prop that's expected to be sent into **Success** in the cell:
-->

返されたオブジェクトの最初のキーは `articles` という名前です。これは、セルの **Success** に渡されるであろう props の名前でもあります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx
// highlight-next-line
export const Success = ({ articles }) => {
  return (
    { articles.map((article) => <Article article={article} />) }
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx
// highlight-next-line
export const Success = ({ articles }: CellSuccessProps<ArticlesQuery>) => {
  return (
    { articles.map((article) => <Article article={article} />) }
  )
}
```

</TabItem>
</Tabs>

<!--
So we can just spread the result of `standard()` in a story or test when using the **Success** component and everything works out:
-->

つまり、ストーリーやテストで **Success** コンポーネントを使う際に、 `standard()` の結果をスプレッド構文で展開すればすべてがうまくいくのです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title=web/src/components/ArticlesCell/ArticlesCell.stories.js
import { Success } from './ArticlesCell'
import { standard } from './ArticlesCell.mock'

export const success = () => {
  // highlight-next-line
  return Success ? <Success {...standard()} /> : null
}

export default { title: 'Cells/ArticlesCell' }
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title=web/src/components/ArticlesCell/ArticlesCell.stories.tsx
import { Success } from './ArticlesCell'
import { standard } from './ArticlesCell.mock'

export const success = () => {
  // highlight-next-line
  return Success ? <Success {...standard()} /> : null
}

export default { title: 'Cells/ArticlesCell' }
```

</TabItem>
</Tabs>

<!--
Some folks find this syntax a little *too* succinct and would rather see the `<Success>` component being invoked the same way it is in their actual code. If that sounds like you, skip the spread syntax and just call the `articles` property on `standard()` the old fashioned way:
-->

この構文が少し簡潔 *過ぎる* と感じる人もいて、であれば実際のコードと同じように `<Success>` コンポーネントが呼び出されるのを見たいと思うでしょう。もしそのような方がいれば、スプレッド構文を使わずに `standard()` の `articles` プロパティを古い方法で呼び出してみてください：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title=web/src/components/ArticlesCell/ArticlesCell.stories.js
import { Success } from './ArticlesCell'
import { standard } from './ArticlesCell.mock'

export const success = () => {
  // highlight-next-line
  return Success ? <Success articles={standard().articles} /> : null
}

export default { title: 'Cells/ArticlesCell' }
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title=web/src/components/ArticlesCell/ArticlesCell.stories.tsx
import { Success } from './ArticlesCell'
import { standard } from './ArticlesCell.mock'

export const success = () => {
  // highlight-next-line
  return Success ? <Success articles={standard().articles} /> : null
}

export default { title: 'Cells/ArticlesCell' }
```

</TabItem>
</Tabs>

<!--
You can have as many mocks as you want, just import the names of the ones you need and send them in as props to your components.
-->

モックは好きなだけ用意できます。必要なモックの名前をインポートして、コンポーネントのpropsとして送信するだけです。

### Testing Article

<!--
Our test suite is passing again but it's a trick! We never added a test for the actual `summary` functionality that we added to the `Article` component. We tested that `ArticlesCell` renders (that eventually render an `Article`) include a summary, but what it means to render a summary is knowledge that only `Article` contains.
-->

テストスイートは再びパス（成功）していますが、トリックがあります！私たちは `Article` コンポーネントに追加した実際の `summary` （要約）機能のためのテストを追加していませんでした。私たちは `ArticlesCell` のレンダー（最終的に `Article` を描画する）が要約を含むことをテストしましたが、要約を描画することは `Article` だけが持っている知識です。

<!--
When you get into the flow of building your app it can be very easy to overlook testing functionality like this. Wasn't it Winston Churchill who said "a thorough test suite requires eternal vigilance"? Techniques like [Test Driven Development](https://en.wikipedia.org/wiki/Test-driven_development) (TDD) were established to help combat this tendency: when you want to write a new feature, write the test first, watch it fail, then write the code to make the test pass so that you know every line of real code you write is backed by a test. What we're doing is affectionately known as [Development Driven Testing](https://medium.com/table-xi/development-driven-testing-673d3959dac2). You'll probably settle somewhere in the middle but one maxim is always true: some tests are better than no tests.
-->

アプリを作るとき、このような機能をテストするのを忘れがちです。
Winston Churchill は "a thorough test suite requires eternal vigilance"（徹底的なテストスイートを成すには永遠の警戒が必要だ）と言ったのではないでしょうか？[Test Driven Development](https://en.wikipedia.org/wiki/Test-driven_development) （TDD：テスト駆動開発） のようなテクニックは、この傾向に対抗するために確立されました：新しい機能を書くとき、まずテストを書き、それが失敗するのを確認します。そして、テストに合格するようにコードを書きます。そうすれば、あなたが書く実際のコードのすべての行が、テストによって裏付けられていることがわかります。私たちがやっていることは、親しみを込めて [Development Driven Testing](https://medium.com/table-xi/development-driven-testing-673d3959dac2) と呼ばれています。あなたはおそらく、この間のどこかに落ち着くと思いますが、ある格言は常に真実です：テストはないよりあったほうがいい。

<!--
The summary functionality in `Article` is pretty simple, but there are a couple of different ways we could test it:

* Export the `truncate()` function and test it directly
* Test the final rendered state of the component
-->

`Article` 要約機能はとてもシンプルですが、テストするにはいくつかの方法があります：

* `truncate()` 関数をエクスポートして、直接テストする
* 最終的なレンダリングされた状態のコンポーネントをテストする

<!--
In this case `truncate()` "belongs to" `Article` and the outside world really shouldn't need to worry about it or know that it exists. If we came to a point in development where another component needed to truncate text then that would be a perfect time to move this function to a shared location and import it into both components that need it. `truncate()` could then have its own dedicated test. But for now let's keep our separation of concerns and test the one thing that's "public" about this component—the result of the render.
-->

`truncate()` が `Article` に "属する"（belongs to） 場合は、外部がこの関数について心配したり、その存在を知る必要はありません。
もし開発の途中で別のコンポーネントがテキストの切り詰めを必要とするようになったら、その時が、この関数を共有の場所に移動して、それを必要とする両方のコンポーネントにインポートする絶好の機会になるでしょう。そうすれば `truncate()` は専用のテストを持つことができます。しかし今は、関心事の分離を維持し、このコンポーネントについて "公開" されているもの -- レンダリング結果 -- をテストしましょう。

<!--
In this case let's just test that the output matches an exact string. Since the knowledge of how long to make the summary is contained in `Article` itself, at this point it feels okay to have the test tightly coupled to the render result of this particular component. (`ArticlesCell` itself didn't know about how long to truncate, just that *something* was shortening the text.) You could spin yourself in circles trying to refactor the code to make it absolutely bulletproof to code changes breaking the tests, but will you ever actually need that level of flexibility? It's always a trade-off!
-->

この場合、出力が厳密に文字列一致することをテストしましょう。要約の長さに関する知識は `Article` 自身に含まれているので、この時点では、この特定のコンポーネントのレンダリング結果に密結合なテストであっても問題ないでしょう（ `ArticlesCell` 自身は切り詰める長さを知らないので、単に *何か* がテキストを短くしているだけです）。コードを変更してもテストが壊れないよう完璧にリファクタリングし続けることもできますが、実際にそのレベルの柔軟性が必要でしょうか？それは常にトレードオフなのです！

<!--
We'll move the sample article data in the test to a constant and then use it in both the existing test (which tests that not passing the `summary` prop at all results in the full body being rendered) and our new test that checks for the summary version being rendered:
-->

テストにあるサンプルのブログ記事のデータを定数に移動して、既存のテスト（ `summary` props を全く渡さないことで全文が描画されることをテストする) と、要約が描画されるバージョンをチェックする新しいテストの両方でそれを使用することにします：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.test.js"
import { render, screen } from '@redwoodjs/testing'

import Article from './Article'

// highlight-start
const ARTICLE = {
  id: 1,
  title: 'First post',
  body: `Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Street art next level umami squid. Hammock hexagon glossier 8-bit banjo. Neutra la croix mixtape echo park four loko semiotics kitsch forage chambray. Semiotics salvia selfies jianbing hella shaman. Letterpress helvetica vaporware cronut, shaman butcher YOLO poke fixie hoodie gentrify woke heirloom.`,
  createdAt: new Date().toISOString(),
}
// highlight-end

describe('Article', () => {
  it('renders a blog post', () => {
    // highlight-next-line
    render(<Article article={ARTICLE} />)

    // highlight-start
    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(screen.getByText(ARTICLE.body)).toBeInTheDocument()
    // highlight-end
  })

  // highlight-start
  it('renders a summary of a blog post', () => {
    render(<Article article={ARTICLE} summary={true} />)

    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(
      screen.getByText(
        'Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Str...'
      )
    ).toBeInTheDocument()
  })
  // highlight-end
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/Article/Article.test.tsx"
import { render, screen } from '@redwoodjs/testing'

import Article from './Article'

// highlight-start
const ARTICLE = {
  id: 1,
  title: 'First post',
  body: `Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Street art next level umami squid. Hammock hexagon glossier 8-bit banjo. Neutra la croix mixtape echo park four loko semiotics kitsch forage chambray. Semiotics salvia selfies jianbing hella shaman. Letterpress helvetica vaporware cronut, shaman butcher YOLO poke fixie hoodie gentrify woke heirloom.`,
  createdAt: new Date().toISOString(),
}
// highlight-end

describe('Article', () => {
  it('renders a blog post', () => {
    // highlight-next-line
    render(<Article article={ARTICLE} />)

    // highlight-start
    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(screen.getByText(ARTICLE.body)).toBeInTheDocument()
    // highlight-end
  })

  // highlight-start
  it('renders a summary of a blog post', () => {
    render(<Article article={ARTICLE} summary={true} />)

    expect(screen.getByText(ARTICLE.title)).toBeInTheDocument()
    expect(
      screen.getByText(
        'Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin post-ironic vape cred DIY. Str...'
      )
    ).toBeInTheDocument()
  })
  // highlight-end
})
```

</TabItem>
</Tabs>

<!--
Saving that change should run the tests and we'll see that our suite is still happy!
-->

この変更を保存するとテストが実行され、ウチらが今もhappyだとわかります！

### One Last Thing

<!--
Remember we set the `summary` prop to default to `false` if it doesn't exist, which is tested by the first test case (passing no `summary` prop at all). However, we don't have a test that checks what happens if `false` is set explicitly. Feel free to add that now if you want [100% Code Coverage](https://www.functionize.com/blog/the-myth-of-100-code-coverage)!
-->

`summary` propsが存在しない場合はデフォルトで `false` になるように設定したことを思い出してください。これは最初のテストケース（ `summary` props を全く渡さない）でテストしました。しかし `false` を明示的に設定した場合にどうなるかをチェックするテストはありません。[100% Code Coverage](https://www.functionize.com/blog/the-myth-of-100-code-coverage) （カバレッジ100%）を望むなら、今すぐ自由に追加してください！
