# Our First Page

<!--
Let's give our users something to look at besides the (awesome) Redwood welcome page (thanks [@alicelovescake](https://github.com/alicelovescake)!). We'll use the `redwood` command line tool to create a page for us:
-->

ユーザに、（素晴らしい）Redwoodのウェルカムページ（ありがとう [@alicelovescake](https://github.com/alicelovescake)！）以外に見るべきものを提供しましょう。ここでは、`redwood` コマンドラインツールを使って、ページを作成します：

```bash
yarn redwood generate page home /
```

<!--
The command above does four things:
-->

上記のコマンドは4つのことをします：

<!--
- Creates `web/src/pages/HomePage/HomePage.{js,tsx}`. Redwood takes the name you specified as the first argument after `page` and [PascalCases](https://techterms.com/definition/pascalcase) it, then appends "Page" to construct your new page component. So "home" becomes "HomePage".
- Creates a test file to go along with this new page component at `web/src/pages/HomePage/HomePage.test.{js,tsx}` with a single, passing test. You _do_ write tests for your components, _don't you??_
- Creates a Storybook file for this component at `web/src/pages/HomePage/HomePage.stories.{js,tsx}`. Storybook is a wonderful tool for efficiently developing and organizing UI components. (If you want to take a peek ahead, we learn about Storybook in [chapter 5 of the tutorial](../chapter5/storybook.md)).
- Adds a `<Route>` in `web/src/Routes.{js,tsx}` that maps the path `/` to the new _HomePage_ page.
-->

- `web/src/pages/HomePage/HomePage.{js,tsx}` を作成する。Redwood は `page` の後の最初の引数として指定された名前を受け取り、[PascalCases](https://techterms.com/definition/pascalcase) で "Page" を追加して、新しいページコンポーネントを構築する。つまり "home" は "HomePage" になる
- `web/src/pages/HomePage/HomePage.test.{js,tsx}` に、この新しいページコンポーネントに付随するテストファイルを作成し、1つの成功するテストを記述する。コンポーネントのテストを _書きますよね？_
- このコンポーネントのStorybookファイルを `web/src/pages/HomePage/HomePage.stories.{js,tsx}` に作成する。StorybookはUIコンポーネントを効率的に開発し、整理するための素晴らしいツール（もし、この先を覗いてみたいなら、Storybookについては[チュートリアルのChapter 5](../chapter5/storybook.md)で学びます）
- `web/src/Routes.{js,tsx}` に `<Route>` を追加し、パス `/` を新しい _HomePage_ ページにマップする


:::info Automatic import of pages in the Routes file

<!--
If you look in Routes you'll notice that we're referencing a component, `HomePage`, that isn't imported anywhere. Redwood automatically imports all pages in the Routes file since we're going to need to reference them all anyway. It saves a potentially huge `import` declaration from cluttering up the routes file.
-->

Routesを見ると、インポートされていない `HomePage` コンポーネントを参照していることに気がつくと思います。RedwoodはRoutesファイル内のすべてのページを自動的にインポートします。これにより、巨大な `import` 宣言がルーティングファイルに散らかるのを防ぐことができます。

:::

<!--
In case you didn't notice, this page is already live (your browser automatically reloaded):
-->

気づいていないかもしれませんが、このページは既に公開されています（ブラウザは自動的に再読み込みされます）：

![Default HomePage render](https://user-images.githubusercontent.com/300/148600239-6a147031-74bb-43e8-b4ef-776b4e2a2cc5.png)

<!--
It's not pretty, but it's a start! Open the page in your editor, change some text and save. Your browser should reload with your new text.
-->

きれいではありませんが、これでスタートです！ページをエディタで開き、テキストを変更して保存します。ブラウザが再読み込みされ新しいテキストが表示されるはずです。

### Routing

<!--
Open up `web/src/Routes.{js,tsx}` and take a look at the route that was created:
-->

`web/src/Routes.{js,tsx}` を開いて、作成されたルートを見てみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/Routes.js"
import { Router, Route } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router>
      // highlight-next-line
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/Routes.tsx"
import { Router, Route } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router>
      // highlight-next-line
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
```

</TabItem>
</Tabs>

<!--
As long as you have a route with path `/`, you'll never see the initial Redwood splash screen again.

When no route can be found that matches the requested URL, Redwood will render the `NotFoundPage`.

Try changing the route to something like:
-->

パス `/` を持つルートがある限り、Redwood の初期スプラッシュスクリーンを再び見ることはありません。

リクエストされたURLにマッチするルートが見つからない場合、Redwoodは `NotFoundPage` を表示します。

ルートを次のように変更してみてください：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx
<Route path="/hello" page={HomePage} name="home" />
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx
<Route path="/hello" page={HomePage} name="home" />
```

</TabItem>
</Tabs>

<!--
The splash screen is available again at [http://localhost:8910/](http://localhost:8910/), giving you a list of all the available URLs in your app.
-->

[http://localhost:8910/](http://localhost:8910/) ではスプラッシュスクリーンが再び表示され、アプリで利用可能なURLの一覧が表示されます。

![Redwood Splash Screen](https://user-images.githubusercontent.com/17789536/160120107-1157af8e-4cbd-4ec8-b3aa-8adb28ea6eaf.png)

<!--
Go to `/hello` and you should see the homepage again.

Change the route path back to `/` before continuing!
-->

`hello` に移動すると、再びホームページが表示されるはずです。

チュートリアルを続ける前に、ルートパスを `/` に戻してください！

### Simple Styles

<!--
Previous versions of this tutorial had you build everything without any styling, so we could really focus on the code, but let's face it: an unstyled site is pretty ugly. Let's add a really simple stylesheet that will just make things a *little* easier on the eyes as we build out the site. Paste the following into `web/src/index.css`:
-->

このチュートリアルの以前のバージョンでは、コードに集中するためにスタイリングせずにすべてを構築していましたが、正直に言うと、、、スタイルのないサイトはかなりカッコ悪いです。そこで本当に簡単なスタイルシートを追加して、サイトを構築する際に目に優しくしてあげましょう。次のコードを `web/src/index.css` に貼り付けてください：


```css title="web/src/index.css"
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
ul {
  list-style-type: none;
  margin: 1rem 0;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 1rem 0 0 ;
}
h1 > a {
  text-decoration: none;
  color: black;
}
button, input, label, textarea {
  display: block;
  outline: none;
}
label {
  margin-top: 1rem;
}
.error {
  color: red;
}
input.error, textarea.error {
  border: 1px solid red;
}
.form-error {
  color: red;
  background-color: lavenderblush;
  padding: 1rem;
  display: inline-block;
}
.form-error ul {
  list-style-type: disc;
  margin: 1rem;
  padding: 1rem;
}
.form-error li {
  display: list-item;
}
.flex-between {
  display: flex;
  justify-content: space-between;
}
.flex-between button {
  display: inline;
}
```

<!--
These styles will switch to whatever your OS's system font is, put a little margin between things, and just generally clean things up. Feel free to tweak it to your liking (or ignore these styles completely and stick with the browser default) but keep in mind that the following screenshots are made against this base stylesheet so your experience may vary.
-->

これらのスタイルは、あなたのOSのシステムフォントに切り替えたり、文字の間に少し余白を入れたり、全体的にすっきりさせるものです。
お好みに合わせて自由に調整してください（またはこれらのスタイルを完全に無視して、ブラウザーのデフォルトにこだわることもできます）。ただし覚えておいていただきたいのですが、以下のスクリーンショットはこの基本スタイルシートに対して作成されているので、あなたの体験とは異なるかもしれません。

![Default homepage with custom styles](https://user-images.githubusercontent.com/300/148600516-f8e048aa-451f-46f0-9749-078d63fe7b07.png)

<!--
Looking better already!
-->

すでに良くなっているみたいですね！
