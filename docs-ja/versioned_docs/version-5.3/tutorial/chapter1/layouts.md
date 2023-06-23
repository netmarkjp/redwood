# Layouts

<!--
One way to solve the duplication of the `<header>` would be to create a `<Header>` component and include it in both `HomePage` and `AboutPage`. That works, but is there a better solution? Ideally there should only be one reference to the `<header>` anywhere in our code.
-->

`<header>` の重複を解決する一つの方法は、 `<Header>` コンポーネントを作成して、それを `HomePage` と `AboutPage` の両方で読み込むことです。それは有効ですが、もっと良い方法はないでしょうか？理想を言えば `<header>` への唯一の参照はコードのどこからでも行えるべきです。

<!--
When you look at these two pages what do they really care about? They have some content they want to display. They really shouldn't have to care what comes before (like a `<header>`) or after (like a `<footer>`). That's where layouts come in: they wrap a page in a component that then renders the page as its child. The layout can contain any content that's outside the page itself. Conceptually, the final rendered document will be structured something like:
-->

この2つのページを見たとき、彼らが本当に気にしていることは何でしょうか？表示したいコンテンツがあるのです。その前（ `<header>` など）や後（ `<footer>` など）を気にする必要は全くないはずです。そこでレイアウトの出番です：レイアウトはページをコンポーネントでラップし、その子としてページをレンダリングします。レイアウトは、ページ自体の外側にある任意のコンテンツを含むことができます。概念的には、最終的にレンダリングされるドキュメントは次のような構造になっています：

<img src="https://user-images.githubusercontent.com/300/70486228-dc874500-1aa5-11ea-81d2-eab69eb96ec0.png" alt="Layouts structure diagram" width="300"/>

<!--
Let's create a layout to hold that `<header>`:
-->

`<header>` を保持するためのレイアウトを作りましょう：

```bash
yarn redwood g layout blog
```

:::tip

<!--
From now on we'll use the shorter `g` alias instead of `generate`
-->

ここからは `generate` の代わりに、より短いエイリアスである `g` を使います。

:::

<!--
That created `web/src/layouts/BlogLayout/BlogLayout.{js,tsx}` and associated test and stories files. We're calling this the "blog" layout because we may have other layouts at some point in the future (an "admin" layout, perhaps?).
-->

`web/src/layouts/BlogLayout/BlogLayout.{js,tsx}` と、関連するテストファイルやストーリーファイルが作成されました。これを "blog" レイアウトと呼んでいるのは、将来的に他のレイアウト（"admin" レイアウトとか？）を用意するかもしれないからです。

<!--
Cut the `<header>` from both `HomePage` and `AboutPage` and paste it in the layout instead. Let's take out the duplicated `<main>` tag as well:
-->

`HomePage` と `AboutPage` の両方から `<header>` を切り取って、代わりにレイアウトに貼り付けます。重複している `<main>` タグも取り除いてしまいましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/layouts/BlogLayout/BlogLayout.js"
// highlight-next-line
import { Link, routes } from '@redwoodjs/router'

const BlogLayout = ({ children }) => {
  return (
    // highlight-start
    <>
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
      <main>{children}</main>
    </>
    // highlight-end
  )
}

export default BlogLayout
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/layouts/BlogLayout/BlogLayout.tsx"
// highlight-next-line
import { Link, routes } from '@redwoodjs/router'

type BlogLayoutProps = {
  children?: React.ReactNode
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
  return (
    // highlight-start
    <>
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
      <main>{children}</main>
    </>
    // highlight-end
  )
}

export default BlogLayout
```

</TabItem>
</Tabs>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/AboutPage/AboutPage.js"
import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const AboutPage = () => {
  return (
    <>
      <MetaTags title="About" description="About page" />

      <p>
        This site was created to demonstrate my mastery of Redwood: Look on my
        works, ye mighty, and despair!
      </p>
      <Link to={routes.home()}>Return home</Link>
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

      <p>
        This site was created to demonstrate my mastery of Redwood: Look on my
        works, ye mighty, and despair!
      </p>
      <Link to={routes.home()}>Return home</Link>
    </>
  )
}

export default AboutPage
```

</TabItem>
</Tabs>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/HomePage/HomePage.js"
import { MetaTags } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />
      Home
    </>
  )
}

export default HomePage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/pages/HomePage/HomePage.tsx"
import { MetaTags } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />
      Home
    </>
  )
}

export default HomePage
```

</TabItem>
</Tabs>

<!--
In `BlogLayout.{js,tsx}`, `children` is where the magic will happen. Any page content given to the layout will be rendered here. And now the pages are back to focusing on the content they care about (we can remove the import for `Link` and `routes` from `HomePage` since those are in the Layout instead).
-->

`BlogLayout.{js,tsx}` では、`children` がマジックが起こる場所です。レイアウトに与えられたすべてのページコンテンツは、ここでレンダリングされます。これで、ページは関心のあるコンテンツに集中できるようになります（レイアウトが肩代わりしてくれるので `HomePage` から `Link` と `routes` のインポートを削除することができます）。

<!--
To actually render our layout we'll need to make a change to our routes files. We'll wrap `HomePage` and `AboutPage` with the `BlogLayout`, using a `<Set>`. Unlike pages, we do actually need an `import` statement for layouts:
-->

レイアウトを実際にレンダリングするには、Routesファイルを変更しなければなりません。 `<Set>` を使って `HomePage` と `AboutPage` を `BlogLayout` でラップします。ページとは異なり、レイアウトでは実際に `import` ステートメントが必要です：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/Routes.js"
// highlight-start
import { Router, Route, Set } from '@redwoodjs/router'
import BlogLayout from 'src/layouts/BlogLayout'
// highlight-end

const Routes = () => {
  return (
    <Router>
      // highlight-start
      <Set wrap={BlogLayout}>
        <Route path="/about" page={AboutPage} name="about" />
        <Route path="/" page={HomePage} name="home" />
      </Set>
      // highlight-end
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/Routes.tsx"
// highlight-start
import { Router, Route, Set } from '@redwoodjs/router'
import BlogLayout from 'src/layouts/BlogLayout'
// highlight-end

const Routes = () => {
  return (
    <Router>
      // highlight-start
      <Set wrap={BlogLayout}>
        <Route path="/about" page={AboutPage} name="about" />
        <Route path="/" page={HomePage} name="home" />
      </Set>
      // highlight-end
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
```

</TabItem>
</Tabs>

:::info The `src` alias

<!--
Notice that the import statement uses `src/layouts/BlogLayout` and not `../src/layouts/BlogLayout` or `./src/layouts/BlogLayout`. Being able to use just `src` is a convenience feature provided by Redwood: `src` is an alias to the `src` path in the current workspace. So if you're working in `web` then `src` points to `web/src` and in `api` it points to `api/src`.
-->

import文では `src/layouts/BlogLayout` を使用しており、 `../src/layouts/BlogLayout` や `./src/layouts/BlogLayout` ではないことに注意してください。
`src` だけで使えるのは、Redwood が提供する便利機能です： `src` は現在のワークスペースにある `src` パスのエイリアスです。つまり `web` で作業している場合は、 `src` は `web/src` を指し、 `api` では `api/src` を指します。

:::

<!--
Back to the browser (you may need to manually refresh) and you should see...nothing different. But that's good, it means our layout is working!
-->

ブラウザに戻ると（手動でリロードする必要があるかもしれません）、...何も変わっていないはずです。しかし、これは良いことです。レイアウトが機能しているということです！

:::info Why are things named the way they are?

<!--
You may have noticed some duplication in Redwood's file names. Pages live in a directory called `/pages` and also contain `Page` in their name. Same with Layouts. What's the deal?

When you have dozens of files open in your editor it's easy to get lost, especially when you have several files with names that are similar or even the same (they happen to be in different directories). Imagine a dozen files named `index.{js,ts}` and then trying to find the one you're looking for in your open tabs! We've found that the extra duplication in the names of files is worth the productivity benefit when scanning for a specific open file.

If you're using the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) plugin this also helps disambiguate when browsing through your component stack:
-->

Redwoodのファイル名の中に重複があることにお気づきかもしれません。ページは `/pages` というディレクトリにあり、その名前には `Page` が含まれています。レイアウトも同じです。どうしたことでしょう？

エディタで何十ものファイルを開いていると、すぐ迷子になります。似たような、あるいは（たまたま違うディレクトリにある）同じ名前のファイルがいくつかある場合は特に。`index.{js,ts}` という名前のファイルが何十個もあって、開いているタブの中から探すのを想像してみてください！ファイル名の中の重複は、開いている特定のファイルを探すときの生産性向上に寄与することがわかりました。

[React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) プラグインを使用している場合、コンポーネントスタックをブラウズする際に曖昧さをなくすのにも役立ちます：

<img src="https://user-images.githubusercontent.com/300/145901282-e4b6ec92-8cee-42d0-97ea-1ffe99328e53.png" width="400"/>

:::

### Back Home Again

<!--
A couple more `<Link>`s: let's have the title/logo link back to the homepage, and we'll add a nav link to Home as well:
-->

さらに `<Links>` を：タイトルとロゴはホームに戻るようリンクし、ホームへのナビリンクも追加します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/layouts/BlogLayout/BlogLayout.js"
import { Link, routes } from '@redwoodjs/router'

const BlogLayout = ({ children }) => {
  return (
    <>
      <header>
        // highlight-start
        <h1>
          <Link to={routes.home()}>Redwood Blog</Link>
        </h1>
        // highlight-end
        <nav>
          <ul>
            // highlight-start
            <li>
              <Link to={routes.home()}>Home</Link>
            </li>
            // highlight-end
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}

export default BlogLayout
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/layouts/BlogLayout/BlogLayout.tsx"
import { Link, routes } from '@redwoodjs/router'

type BlogLayoutProps = {
  children?: React.ReactNode
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
  return (
    <>
      <header>
        // highlight-start
        <h1>
          <Link to={routes.home()}>Redwood Blog</Link>
        </h1>
        // highlight-end
        <nav>
          <ul>
            // highlight-start
            <li>
              <Link to={routes.home()}>Home</Link>
            </li>
            // highlight-end
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}

export default BlogLayout
```

</TabItem>
</Tabs>

<!--
And then we can remove the extra "Return to Home" link (and Link/routes import) that we had on the About page:
-->

そうしたら、Aboutページにあった余計な "Return to Home" リンク（と、Linkとroutesのimport）を削除できます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/pages/AboutPage/AboutPage.js"
import { MetaTags } from '@redwoodjs/web'

const AboutPage = () => {
  return (
    <>
      <MetaTags title="About" description="About page" />

      <p>
        This site was created to demonstrate my mastery of Redwood: Look on my
        works, ye mighty, and despair!
      </p>
    </>
  )
}

export default AboutPage
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/pages/AboutPage/AboutPage.tsx"
import { MetaTags } from '@redwoodjs/web'

const AboutPage = () => {
  return (
    <>
      <MetaTags title="About" description="About page" />

      <p>
        This site was created to demonstrate my mastery of Redwood: Look on my
        works, ye mighty, and despair!
      </p>
    </>
  )
}

export default AboutPage
```

</TabItem>
</Tabs>

![image](https://user-images.githubusercontent.com/300/145901020-1c33bb74-78f9-415e-a8c8-c8873bd6630f.png)

<!--
Now we're getting somewhere! We removed all of that duplication and our header content (logo and navigation) are all in one place.

Everything we've done so far has been on the web side, which is all in the browser. Let's start getting the backend involved and see what all the hoopla is about GraphQL, Prisma and databases.
-->

進捗しました！重複していた部分をすべて削除し、ヘッダコンテンツ（ロゴとナビゲーション）を一カ所にまとめました。

ここまでの作業はすべてWebサイド、つまりブラウザ上でのことです。それでは、バックエンドに着手して、GraphQL、Prisma、データベースをやっていきましょう。
