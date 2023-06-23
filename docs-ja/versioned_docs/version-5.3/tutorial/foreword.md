# RedwoodJS: The Tutorial

<!--
Welcome to Redwood! If you haven't yet, check out the [Redwood README](https://github.com/redwoodjs/redwood/blob/main/README.md) to get a little background on why we created Redwood and the problems it's meant to solve. Redwood brings several existing technologies together for the first time into what we think is the future of database-backed single page applications.
-->

Redwood へようこそ！まだの方は、[Redwood README](https://github.com/redwoodjs/redwood/blob/main/README.md) をチェックして、私たちが Redwood を作った理由と解決したい問題を少し知っておいてください。Redwood は、いくつかの既存の技術を初めて統合し、私たちが考えるデータベースバックエンドなシングルページアプリケーションの未来像を実現します。

:::info Sign up for tutorial reminders

<!--
There's a new JavaScript framework coming out every week, we know it can be hard to keep up. If you'd like some non-spammy emails reminding you to go through the tutorial, give us your email below:
-->

毎週新しいJavaScriptフレームワークが発表されるので、追いつくのが大変だと思います。もし、チュートリアルを進めることを促すスパムでないメールが必要な場合は、以下からメールアドレスを教えてください：

<MailchimpForm />

:::

<!--
In this tutorial we're going to build a blog engine. In reality a blog is probably not the ideal candidate for a Redwood app: blog articles can be stored in a CMS and statically generated to HTML files and served as flat files from a CDN (the classic [Jamstack](https://jamstack.org/) use case). But as most developers are familiar with a blog, and it uses all of the features we want to demonstrate, we decided to build one anyway.
-->

このチュートリアルでは、ブログエンジンを構築します。
実のところ、ブログはRedwoodアプリの理想的な候補ではありません：ブログ記事はCMSに静的に保存され、静的に出力されたHTMLがCDNからフラットファイルとして配信されます（古典的な[Jamstack](https://jamstack.org/)のユースケースです）。しかし、ほとんどの開発者はブログに慣れており、ブログエンジンは私たちがデモンストレーションしたい機能をすべて使用しているので、とにかくブログエンジンを構築することにしました。

<!--
If you went through an earlier version of this tutorial you may remember it being split into parts 1 and 2. That was an artifact of the fact that most features demonstrated in part 2 didn't exist in the framework when part 1 was written. Once they were added we created part 2 to contain just those new features. Now that everything is integrated and working well we've moved each section into logically grouped chapters.
-->

このチュートリアルの以前のバージョンをご覧になった方は、パート1とパート2に分かれていたことを覚えているかもしれません。これは、パート1で書かれた時点では、パート2でデモンストレーションされるほとんどの機能がフレームワークに存在しなかったためです。それらが追加された後、私たちはそれらの新しい機能だけを含むパート2を書きました。今はすべてが統合され、うまく機能するようになったので、各セクションを論理的にグループ化した章に移動しました。

## Callouts

<!--
You'll find some callouts throughout the text to draw your attention:
-->

本文中には、注意喚起のための吹き出しがいくつかあります：

:::tip

<!--
They might look like this...
-->

こんな感じ...

:::

:::caution

<!--
or sometimes like this...
-->

または、時にはこんな感じの...

:::

:::danger

<!--
or maybe even like this!
-->
もしくは、こんな感じかも！

:::

<!--
It's usually something that goes into more detail about a specific point, refers you to further reading, or calls out something important you should know. Here comes one now:
-->

それは通常、特定のポイントについてより詳しく説明したり、さらなる読み物を紹介したり、あなたが知っておくべき重要なことを注意喚起するものです。今、ここにひとつあります：

:::info

<!--
This tutorial assumes you are using version 5.0.0 or greater of RedwoodJS.
-->

このチュートリアルは、RedwoodJSのバージョン5.0.0以降を使用することを前提としています。

:::

<!--
Let's get started!
-->

さあ、始めましょう！

export const MailchimpForm = () => (
  <>
    <div id="mc_embed_signup">
      <form
        action="https://thedavidprice.us19.list-manage.com/subscribe/post?u=0c27354a06a7fdf4d83ce07fc&amp;id=a94da1950a"
        method="post"
        name="mc-embedded-subscribe-form"
        target="_blank"
      >
        <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
          <input
            type="text"
            name="b_0c27354a06a7fdf4d83ce07fc_a94da1950a"
            tabIndex="-1"
            defaultValue=""
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justify: 'center' }}>
          <input
            type="email"
            defaultValue=""
            placeholder="Email Address"
            required={true}
            name="EMAIL"
            style={{  width: '100%', padding: '0.75rem', border: '1px solid #cccccc', borderRadius: '0.25rem', fontSize: '100%' }}
          />
          <input
            type="submit"
            value="Subscribe"
            name="subscribe"
            style={{ cursor: 'pointer', marginLeft: '0.5rem', padding: '0.8rem 2rem', fontSize: '100%', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#4cb3d4', border: 'none', borderRadius: '0.25rem' }}
          />
        </div>
      </form>
    </div>
  </>
)

