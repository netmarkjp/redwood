# A Second Page and a Link

<!--
Let's create an "About" page for our blog so everyone knows about the geniuses behind this achievement. We'll create another page using `redwood`:
-->

このブログの "About" ページを作って、この偉業の背後にいる天才たちについてみんなに知ってもらいましょう。ここでは、`redwood`を使用して別のページを作成します：

```bash
yarn redwood generate page about
```

<!--
Notice that we didn't specify a route path this time. If you leave it off the `redwood generate page` command, Redwood will create a `Route` and give it a path that is the same as the page name you specified, prepended with a slash. In this case it will be `/about`.
-->

今回ルートパスを指定していないことに注意してください。もし `redwood generate page` コマンドでこれを指定しなかった場合、Redwood は `Route` を作成し、指定したページ名の前にスラッシュを付けたパスを与えます。この場合は `/about` となります。

:::info Code-splitting each page

<!--
As you add more pages to your app, you may start to worry that more and more code has to be downloaded by the client on any initial page load. Fear not! Redwood will automatically code-split on each Page, which means that initial page loads can be blazingly fast, and you can create as many Pages as you want without having to worry about impacting overall webpack bundle size. If, however, you do want specific Pages to be included in the main bundle, you can [override the default behavior](../../router.md#not-code-splitting).
-->

アプリにページを追加していくと、最初のページロード時にクライアントがダウンロードしなければならないコードが増えていくことが心配になるかもしれません。しかし、心配はいりません！Redwoodは各ページで自動的にコードを分割するので、最初のページロードは非常に速く、webpackバンドル全体のサイズへの影響を心配することなく、好きなだけページを作成することができます。もし特定のページをメインバンドルに含めたい場合は、 [デフォルトの動作を上書き](../../router.md#not-code-splitting) できます。

:::

<!--
[http://localhost:8910/about](http://localhost:8910/about) should show our new page:
-->

[http://localhost:8910/about](http://localhost:8910/about) で新しいページが表示されるはずです：

![About page](https://user-images.githubusercontent.com/300/145647906-56b02a6c-b92c-40c6-9d37-860584ffaa6b.png)

<!--
But no one's going to find it by manually changing the URL so let's add a link from our homepage to the About page and vice versa. We'll start by creating a simple header and nav bar at the same time on the HomePage:
-->

しかし、手動でURLを変更しても誰も見つけてくれないので、ホームページとAboutページの双方向でリンクを張ってみましょう。まずHomePageに簡単なヘッダとナビゲーションバーをいっぺんに作成します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/HomePage/HomePage.js"
import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />

      // highlight-start
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>Home</main>
      // highlight-end
    </>
  )
}

export default HomePage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/pages/HomePage/HomePage.tsx"
import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />

      // highlight-start
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>Home</main>
      // highlight-end
    </>
  )
}

export default HomePage
```

</TabItem>
</Tabs>

<!--
Let's point out a few things here:
-->

ここでいくつか指摘しておきます：

<!--
- Redwood loves [Function Components](https://www.robinwieruch.de/react-function-component). We'll make extensive use of [React Hooks](https://reactjs.org/docs/hooks-intro.html) as we go and these are only enabled in function components. You're free to use class components, but we recommend avoiding them unless you need their special capabilities.
- Redwood's `<Link>` tag, in its most basic usage, takes a single `to` attribute. That `to` attribute calls a [_named route function_](../../router.md#link-and-named-route-functions) in order to generate the correct URL. The function has the same name as the `name` attribute on the `<Route>`:

  `<Route path="/about" page={AboutPage} name="about" />`

  If you don't like the name or path that `redwood generate` created for your route, feel free to change it in `Routes.{js,tsx}`! Named routes are awesome because if you ever change the path associated with a route (like going from `/about` to `/about-us`), you need only change it in `Routes.{js,tsx}` and every link using a named route function (`routes.about()`) will still point to the correct place! You can also pass a string to the `to` prop (`to="/about"`), but now if your path ever changed you would need to find and replace every instance of `/about` to `/about-us`.
-->

- Redwoodは [Function Components](https://www.robinwieruch.de/react-function-component) が大好き。 [React Hooks](https://reactjs.org/docs/hooks-intro.html)を多用していくが、これは関数コンポーネントでのみ有効。クラスコンポーネントを使うのは自由だが、特別な機能が必要でない限りは避けることを推奨する
- Redwood の `<Link>` タグは、最も基本的な使い方として、1つの `to` 属性を取る。この `to` 属性は正しいURLを生成するために [_named route function_](../../router.md#link-and-named-route-functions) を呼び出す。この関数は `<Route>` の `name` 属性と同じ名前を持つ：

  `<Route path="/about" page={AboutPage} name="about" />`

  もし `redwood generate` が作成したルート名やパスが気に入らない場合は、 `Routes.{js,tsx}` で自由に変更してください！名前付きルート（named route）は素晴らしいものです。ルートに関連するパスを変更した場合（例えば `/about` から `/about-us` に変更）、 `Routes.{js,tsx}` で変更するだけで、名前付きルート関数（ `routes.about()` ）を使用しているすべてのリンクは正しい場所を指すようになります！また `to` 属性に文字列を渡すこともできますが（ `to="/about"` ）、もしパスが変更された場合は、すべての `/about` インスタンスを見つけて `/about-us` に書き換えなければなりません。

### Back Home

<!--
Once we get to the About page we don't have any way to get back so let's add a link there as well:
-->

Aboutページに遷移したら戻れなくなっているので、ここにもリンクを追加しておきましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/AboutPage/AboutPage.js"
import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const AboutPage = () => {
  return (
    <>
      <MetaTags title="About" description="About page" />

      // highlight-start
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <p>
          This site was created to demonstrate my mastery of Redwood: Look on my
          works, ye mighty, and despair!
        </p>
        <Link to={routes.home()}>Return home</Link>
      </main>
      // highlight-end
    </>
  )
}

export default AboutPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/pages/AboutPage/AboutPage.tsx"
import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const AboutPage = () => {
  return (
    <>
      <MetaTags title="About" description="About page" />

      // highlight-start
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <p>
          This site was created to demonstrate my mastery of Redwood: Look on my
          works, ye mighty, and despair!
        </p>
        <Link to={routes.home()}>Return home</Link>
      </main>
      // highlight-end
    </>
  )
}

export default AboutPage
```

</TabItem>
</Tabs>

<!--
Great! Try that out in the browser and verify you can get back and forth.
-->

素晴らしい！ブラウザで試して、行き来できることを確認してください。

![image](https://user-images.githubusercontent.com/300/145899850-2906c2e3-4ec1-4f8a-9c95-e43b0f7da73f.png)

<!--
As a world-class developer you probably saw that copy-and-pasted `<header>` and gasped in disgust. We feel you. That's why Redwood has a little something called _Layouts_.
-->

世界レベルの開発者であれば、コピー＆ペーストされた `<header>` を見て、ウッてなったことでしょう。わかります。そのため、Redwoodには _Layouts_ というちょっとしたナニカがあります。
