# Prerequisites

<div class="video-container">
  <iframe src="https://www.youtube.com/embed/HJOzmp8oCIQ?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; modestbranding; showinfo=0; fullscreen"></iframe>
</div>

<!--
Redwood is composed of several popular libraries to make full-stack web development easier. Unfortunately, we can't teach all of those technologies from scratch during this tutorial, so we're going to assume you are already familiar with a few core concepts:
-->

RedwoodはフルスタックのWeb開発を容易にするために、いくつかの人気ライブラリを組み合わせています。残念ながら、このチュートリアルでそれらの技術すべてをイチから教えることはできないので、いくつかのコアコンセプトはすでに馴染んでいることを前提に話を進めます：

- [React](https://react.dev/)
- [GraphQL](https://graphql.org/)
- [Prisma](https://prisma.io/)
- [Jamstack Deployment](https://jamstack.org/)

<!--
**Don't panic!** You can work through this tutorial without knowing much of anything about these technologies. You may find yourself getting lost in terminology that we don't stop and take the time to explain, but that's okay: just know that the nitty-gritty details of how those technologies work is out there and there will be plenty of time to learn them. As you learn more about them you'll start to see the lines between what Redwood provides on top of the stock implementations of these projects.
-->

**慌てないで！**

このチュートリアルは、これらの技術についてあまり知らなくても大丈夫です。あなたがこのチュートリアルで説明する用語に迷っても特に詳しく説明はしませんが、大丈夫です：これらの技術がどのように機能するかという核心的な詳細はそこにあり、それらを学ぶ時間は十分にあるということを知っておいてください。それらの技術について学んでいくと、Redwoodがこれらのプロジェクトの標準的な実装の上に提供するものとの境界線が見えてくるでしょう。

<!--
You could definitely learn them all at once, but it will be harder to determine where one ends and another begins, which makes it more difficult to find help once you're past the tutorial and want to dive deeper into one technology or another. Our advice? Make it through the tutorial and then start building something on your own! When you find that what you learned in the tutorial doesn't exactly apply to a feature you're trying to build, Google for where you're stuck ("prisma select only some fields") and you'll be an expert in no time. And don't forget our [Discourse](https://community.redwoodjs.com/) and [Discord](https://discord.gg/jjSYEQd) where you can get help from the creators of the framework, as well as tons of helpful community members.
-->

一度にすべてを学ぶこともできますが、どこが一区切りなのか判断するのが難しく、チュートリアルを終えて、ある技術や他の技術にdeep diveするときに助けを求めるのが難しくなってしまいます。私たちからのアドバイスですか？チュートリアルを終えてたら、自分で何かを作り始めてください！チュートリアルで学んだことが、作ろうとしている機能にピッタリ当てはまらないことがわかったら、困っているところをググってみると（"prisma select only some fields"）、すぐにエキスパートになれます。そして忘れないでほしいのですが、私たちの [Discourse](https://community.redwoodjs.com/) と [Discord](https://discord.gg/jjSYEQd) で、フレームワークの作成者や多くのコミュニティメンバーから助けを得ることができます。

### Redwood Versions

<!--
You will want to be on at least version 5.0.0 to complete the tutorial. If this is your first time using Redwood then no worries: the latest version will be installed automatically when you create your app skeleton!
-->

このチュートリアルを完了するには、少なくともバージョン5.0.0である必要があります。もしこれが初めてのRedwoodでもご心配なく：アプリのスケルトンを作成する際に、最新版が自動的にインストールされます。

<!--
If you have an existing site created with a prior version, you'll need to upgrade and (most likely) apply code modifications. Follow this two step process:
-->

以前のバージョンで作成された既存のサイトをお持ちの場合は、アップグレードと（ほとんどの場合）コードの修正が必要です。以下の2つのステップを踏んでください：

<!--
1. For _each_ version included in your upgrade, follow the "Code Modifications" section or "Upgrade Guide" of the specific version's Release Notes:
   - [Redwood Releases](https://github.com/redwoodjs/redwood/releases)
2. Then upgrade to the latest version. Run the command:
   - `yarn redwood upgrade`
-->

1. アップグレードに含まれる _それぞれの_ バージョンの、 "Code Modifications" セクションかそのバージョンのリリースノートの "Upgrade Guide" に従う：
   - [Redwood Releases](https://github.com/redwoodjs/redwood/releases)
2. その後、最新版にアップグレードする。以下のコマンドを実行する：
   - `yarn redwood upgrade`

### Node.js and Yarn Versions

<!--
During installation, RedwoodJS checks if your system meets version requirements for Node and Yarn:
-->

RedwoodJSはインストール時にNodeとYarnのバージョンを確認します：

- node: "=18.x"
- yarn: ">=1.15"

<!--
If you're using a version of Node or Yarn that's **less** than what's required, _the installation bootstrap will result in an ERROR_. To check, please run the following from your terminal command line:
-->

お使いの環境がバージョン要件よりも**低い**場合、 _初期化は失敗するでしょう_ 。バージョンを確認するにはターミナルで以下のコマンドを実行してください：

```bash
node --version
yarn --version
```

<!--
Please do upgrade accordingly. Then proceed to the Redwood installation when you're ready!
-->

バージョン要件に従ってアップグレードしてください。そして準備ができたら Redwood をインストールしてください！

:::info Installing Node and Yarn

<!--
There are many ways to install and manage both Node.js and Yarn. If you're installing for the first time, we recommend the following:
-->

Node.jsとYarnをインストールし、管理する方法はたくさんあります。初めてインストールする場合は、以下をお勧めします：

**1. Yarn**
<!--
We recommend following the [instructions via Yarnpkg.com](https://yarnpkg.com/getting-started/install).
-->

 [instructions via Yarnpkg.com](https://yarnpkg.com/getting-started/install) に従うことをお勧めします。

**2. Node.js**

<!--
Using the recommended [LTS version from Nodejs.org](https://nodejs.org/en/) is preferred, as the latest Current version isn't supported.
-->

[LTS version from Nodejs.org](https://nodejs.org/en/) を使うのがお勧めです。最新の Current バージョンはサポートされていません。

<!--
- `nvm` is a great tool for managing multiple versions of Node on one system. It takes a bit more effort to set up and learn, however. Follow the [nvm installation instructions](https://github.com/nvm-sh/nvm#installing-and-updating). (Windows users should go to [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)). For **Mac** users with Homebrew installed, you can alternatively use it to [install `nvm`](https://formulae.brew.sh/formula/nvm).

**Windows:** Recommended Development Setup
-->

- `nvm` は1つのシステムで複数バージョンのNodeを管理するための素晴らしいツールです。しかしセットアップと学習にはもう少しの努力が必要です。 [nvm installation instructions](https://github.com/nvm-sh/nvm#installing-and-updating)に従ってください。 （Windowsユーザは [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) を参照）。 **Mac** ユーザはHomebrewを使うこともできます [install `nvm`](https://formulae.brew.sh/formula/nvm)。

**Windows:** お勧めの開発セットアップ

<!--
- JavaScript development on Windows has specific requirements in addition to Yarn and npm. Follow our simple setup guide:
-->

- WindowsでのJavaScript開発にはYarnとnpmに加えて特定の要件があります。以下のセットアップガイドに従ってください：

  [Recommended Windows Development Setup](../../how-to/windows-development-setup.md)

:::
