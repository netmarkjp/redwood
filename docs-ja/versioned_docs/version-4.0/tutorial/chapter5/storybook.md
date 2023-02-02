# Introduction to Storybook

<!--
Let's see what this Storybook thing is all about. Run this command to start up the Storybook server (you could stop your dev or test runners and then run this, or start another new terminal instance):
-->

それでは、Storybook がどのようなものかを見ていきましょう。このコマンドを実行して、Storybook サーバを起動します（開発やテストのランナーを停止してからこのコマンドを実行するか、別の新しいターミナルを起動しても構いません）：

```bash
yarn rw storybook
```

<!--
After some compiling you should get a message saying that Storybook has started and it's available at [http://localhost:7910](http://localhost:7910)
-->

コンパイルが終わると、Storybook が起動して [http://localhost:7910](http://localhost:7910) で利用可能になったというメッセージが表示されるはずです。

![image](https://user-images.githubusercontent.com/300/153311732-21a62ee8-5bdf-45b7-b163-35a5ec0ce318.png)

<!--
If you poke around at the file tree on the left you'll see all of the components, cells, layouts and pages we created during the tutorial. Where did they come from? You may recall that every time we generated a new page/cell/component we actually created at least *three* files:
-->

左側のファイルツリーを見ると、チュートリアルで作成したコンポーネント、セル、レイアウト、ページがすべて表示されているのがわかると思います。これらはどこから来たのでしょうか？
新しいページやセル、コンポーネントを作成するたびに、実際には少なくとも3つのファイルが作成されたことを思い出してください：

* `Article.{js,tsx}`
* `Article.stories.{js,tsx}`
* `Article.test.{js,ts}`

:::info

<!--
If you generated a cell then you also got a `.mock.{js,ts}` file (more on those later).
-->

セルを作成した場合は `.mock.{js,ts}` も作成されます（詳細は後述）。

:::

<!--
Those `.stories.{js,tsx}` files are what makes the tree on the left side of the Storybook browser possible! From their [homepage](https://storybook.js.org/), Storybook describes itself as:
-->

この `.stories.{js,tsx}` ファイルがあるからこそ、Storybook ブラウザの左側にあるツリーを実現できるのです！ [Storybookのホームページ](https://storybook.js.org/) によると、Storybook は次のように説明されています：

<!--
*"...an open source tool for developing UI components in isolation for React, Vue, Angular, and more. It makes building stunning UIs organized and efficient."*
-->

*"... React、Vue、AngularなどのUIコンポーネントを分離して開発するためのオープンソースツールです。魅力的なUIの開発を整った形で効率よく実現します。"*

<!--
So, the idea here is that you can build out your components/cells/pages in isolation, get them looking the way you want and displaying the correct data, then plug them into your full application.
-->

つまりここで言いたいのは、コンポーネント、セル、ページを個別に作成し、必要な外観と正しいデータを表示させた後、アプリケーション全体に接続することができるということです。

<!--
When Storybook opened it should have opened **Components > Article > Generated** which is the generated component we created to display a single blog post. If you open `web/src/components/Article/Article.stories.{js,tsx}` you'll see what it takes to explain this component to Storybook, and it isn't much:
-->

Storybook を開くと、**Components > Article > Generated** が表示されているはずです。これは、1つのブログ記事を表示するために作成したコンポーネントです。
`web/src/components/Article/Article.stories.{js,tsx}` を開くと、このコンポーネントを Storybook に説明するのに必要なものがわかりますが、それほど多くはありません：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.stories.js"
import Article from './Article'

export const generated = () => {
  return (
    <Article
      article={{
        id: 1,
        title: 'First Post',
        body: `Neutra tacos hot chicken prism raw denim, put
              a bird on it enamel pin post-ironic vape cred
              DIY. Street art next level umami squid.
              Hammock hexagon glossier 8-bit banjo. Neutra
              la croix mixtape echo park four loko semiotics
              kitsch forage chambray. Semiotics salvia
              selfies jianbing hella shaman. Letterpress
              helvetica vaporware cronut, shaman butcher
              YOLO poke fixie hoodie gentrify woke
              heirloom.`,
        createdAt: '2020-01-01T12:34:45Z'
      }}
    />
  )
}

export default { title: 'Components/Article' }
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Article/Article.stories.tsx"
import Article from './Article'

export const generated = () => {
  return (
    <Article
      article={{
        id: 1,
        title: 'First Post',
        body: `Neutra tacos hot chicken prism raw denim, put
              a bird on it enamel pin post-ironic vape cred
              DIY. Street art next level umami squid.
              Hammock hexagon glossier 8-bit banjo. Neutra
              la croix mixtape echo park four loko semiotics
              kitsch forage chambray. Semiotics salvia
              selfies jianbing hella shaman. Letterpress
              helvetica vaporware cronut, shaman butcher
              YOLO poke fixie hoodie gentrify woke
              heirloom.`,
        createdAt: '2020-01-01T12:34:45Z'
      }}
    />
  )
}

export default { title: 'Components/Article' }
```

</TabItem>
</Tabs>

<!--
You import the component you want to use and then all of the named exports in the file will be a single "story" as displayed in Storybook. In this case the generator named it "generated" which shows as the "Generated" story in the tree view:
-->

使いたいコンポーネントをインポートすると、ファイル内の名前付きエクスポートはすべて、Storybookで表示される1つの "story" になります。この場合、ジェネレータは "generated" という名前を付けており、ツリービューでは "Generated" ストーリーとして表示されます：

```
Components
└── Article
    └── Generated
```

<!--
This makes it easy to create variants of your component and have them all displayed together.
-->

こうするとコンポーネントのバリアントを作って、まとめて表示するのが簡単になります。

:::info Where did that sample blog post data come from?

<!--
In your actual app you'd use this component like so:
-->

実際のアプリではこのコンポーネントは次のように使用します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx
<Article article={article} />
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx
<Article article={article} />
```

</TabItem>
</Tabs>

<!--
Where the `article` in that prop comes from somewhere outside of this component. Here in Storybook there is no "outside" of this component, so we just send the article object into the prop directly.
-->

この props の `article` は、このコンポーネントの外からきたものです。ここ Storybook ではコンポーネントの "外" は存在しないので、articleオブジェクトを直接propsに送信するだけです。

<!--
**But where did the pre-filled article data come from?**
-->

**しかし、入力済みの article はどこからきたのでしょうか？**

<!--
We (the Redwood team) added that to the story in the `redwood-tutorial` repo to show you what a story might look like after you hook up some sample data. Several of the stories need data like this, some inline and some in those `.mock.{js,ts}` files. The rest of the tutorial will be showing you how to do this yourself with new components as you create them.
-->

私たち（Redwoodチーム）は、データを繋ぎこんだらストーリーがどのように見えるかを示すために、このようなサンプルデータを `redwood-tutorial` リポジトリに追加しました。いくつかのストーリーはこのようなデータを必要とし、いくつかはインラインで、いくつかは `.mock.{js,ts}` ファイルに含まれています。チュートリアルの残りの部分では、新しいコンポーネントを作成する際に、これを自分で行う方法を紹介します。

<!--
**Where did the *actual* text in the body come from?**
-->

** *実際の* 本文はどこからきたのでしょうか？**

<!--
[Hipster Ipsum](https://hipsum.co/), a fun alternative to Lorem Ipsum filler text!
-->

[Hipster Ipsum](https://hipsum.co/) ！Lorem Ipsumに代わる面白いやつ！

:::
