# Intermission

<!--
Let's take a break! If you really went through the whole tutorial so far: congratulations! If you just skipped ahead to this page to try and get a free congratulations: tsk, tsk!
-->

一息つきましょう！本当にここまでのチュートリアルを全部見てくれた方：おめでとうございます ！もし、このページまで読み飛ばして、タダで祝ってもらおうとしたのなら：チッ、チッ！

<!--
That was potentially a lot of new concepts to absorb all at once so don't feel bad if all of it didn't fully sink in. React, GraphQL, Prisma, serverless functions...so many things! Even those of us working on the framework are heading over to Google multiple times per day to figure out how to get these things to work together.
-->

一度に多くの新しいコンセプトを吸収する可能性があったので、すべてを完全に吸収できなくても、悪く思わないでください。React、GraphQL、Prisma、サーバレス関数......本当にたくさんありますね！フレームワークを作っている私たちでさえ、1日に何度もググって、これらをどう連携させるかを考えています。

<!--
As an anonymous Twitter user once mused: "If you enjoy switching between feeling like the smartest person on earth and the dumbest person in history all in the same day, programming may be the career for you!"
-->

ある匿名のTwitterユーザは言いました："地球上で最も賢い人間と歴史上最も愚かな人間の気分を1日のうちで切り替えるのが好きなら、プログラミングはあなたに向いている職業かもしれない！"

## What's Next?

<!--
Starting in Chapter 5 We'll look at Storybook and Jest and build a new feature for the blog: comments. Storybook introduces a new way to build components. We'll also add tests and run them with Jest to make sure things keep working as we expect. We cover authorization as well by giving a special role to comment moderators.
-->

第5章からは Storybook と Jest に注目し、ブログに新しい機能を追加していきます：コメント機能です。
Storybook はコンポーネントを構築するための新しい方法を紹介します。また、テストを追加し、Jest で実行して、期待通りに動作していることを確認します。
コメントのモデレータに特別な役割を与えることで、 authorization （認可）もカバーします。

<!--
If you've been through the tutorial so far, you can pick up where you left off and continue from here with Chapter 5. However, going forward we assume a complete test suite and several Storybook components, which we didn't get a chance to build in the first half. To get to the same starting point as the beginning of Chapter 5 you can start from this [example repo](https://github.com/redwoodjs/redwood-tutorial) (which we highly recommend) that picks up at the end of chapter 4, but already has additional styling, a starting test suite, and several Storybook components already built for you.
-->

ここまでのチュートリアルを終えた方は、第5章に進むことができます。
ただし、この先では、前半で構築できなかった完全なテストスイートといくつかの Storybook コンポーネントを扱う予定です。
第5章の最初と同じスタート地点に立つには、この [example repo（サンプルリポジトリ）](https://github.com/redwoodjs/redwood-tutorial) から始めることができます（強くお勧めします）。このリポジトリは第4章の終わりから始まっていますが、すでに追加のスタイル、最初のテストスイート、いくつかの Storybook コンポーネントがあらかじめ構築されています。

### Using Your Current Codebase

<!--
If you want to use the same CSS classes we use in the following examples you'll need to add Tailwind to your repo:
-->

以下の例で使用しているのと同じCSSクラスを使用したい場合は、あなたのリポジトリに Tailwind を追加しなければなりません：

```bash
yarn rw setup ui tailwindcss
```

<!--
However, none of the screenshots that follow will come anywhere close to what you're seeing in your browser (except for those isolated components you build in Storybook) so you may want to just start with the [example repo](https://github.com/redwoodjs/redwood-tutorial). You'll also be missing out on a good starting test suite that we've added!
-->

しかし、この後に続くスクリーンショットは、あなたがブラウザで見ているものに近いものではありません（Storybook で構築した、独立したしたコンポーネントを除く）ので、[example repo](https://github.com/redwoodjs/redwood-tutorial) から始めるとよいかもしれません。また、私たちが追加した良いテストスイートも見逃すことになりますよ！

<!--
If you're *still* set on continuing with your own repo, and you deployed to a service like Netlify, you would have changed the database provider in `schema.prisma` to `postgresql`. If that's the case then make sure your local development environment has changed over as well. Check out the [Local Postgres Setup](../local-postgres-setup.md) for assistance. If you stick with the [example repo](https://github.com/redwoodjs/redwood-tutorial) instead, you can go ahead with good ol' SQLite (what we were using locally to build everything in the first half).
-->

もし、 *まだ* 自分のリポジトリで続けるつもりで、Netlify のようなサービスにデプロイしたのなら、 `schema.prisma` のデータベースプロバイダを `postgresql` に変更したことでしょう。
もしそうなら、ローカルの開発環境も同様に変更されていることを確認してください。 [Local Postgres Setup](../local-postgres-setup.md) を参照してください。
もし、代わりに [example repo](https://github.com/redwoodjs/redwood-tutorial) を使うなら、古き良き SQLite （前半のビルドで使っていたもの）を使うことができます。

<!--
Once you're ready, start up the dev server:
-->

準備ができたら開発サーバを起動しましょう：

```bash
yarn rw dev
```

### Using the Example Repo (Recommended)

<!--
If you haven't been through the first tutorial, or maybe you went through it on an older version of Redwood (anything pre-0.41) you can clone [this repo](https://github.com/redwoodjs/redwood-tutorial) which contains everything built so far and also adds a little styling so it isn't quite so...tough to look at. The example repo includes [TailwindCSS](https://tailwindcss.com) to style things up and adds a `<div>` or two to give us some additional hooks to hang styling on.
-->

最初のチュートリアルをまだ見ていない人、あるいはRedwoodの古いバージョン（0.41以前）で見た人は、[this repo（このリポジトリ）](https://github.com/redwoodjs/redwood-tutorial)をクローンすると、これまでに作ったものをすべて含み、さらに少しスタイルを追加して、見られるものにしてあります。サンプルのリポジトリにはスタイルアップのための [TailwindCSS](https://tailwindcss.com) が含まれており、スタイルアップのためのフックを追加するために `<div>` が1つ2つ追加されています。

```bash
git clone https://github.com/redwoodjs/redwood-tutorial
cd redwood-tutorial
yarn install
yarn rw prisma migrate dev
yarn rw g secret
```

<!--
That'll check out the repo, install all the dependencies, create your local database (SQLite) and fill it with a few blog posts. After that last command (`yarn rw g secret`) you'll need to copy the string that's output and add it to a file `.env` in the root of your project:
-->

これはリポジトリをチェックアウトし、すべての依存関係をインストールし、ローカルデータベース（SQLite）を作成し、いくつかのブログ投稿でそれを埋めることになります。最後のコマンド（ `yarn rw g secret` ）の後、出力された文字列をコピーして、プロジェクトのルートにあるファイル `.env` に追加する必要があります：

```bash title=".env"
SESSION_SECRET=JV2kA48ZU4FnLHwqaydy9beJ99qy4VgWXPkvsaw3xE2LGyuSur2dVq2PsPkPfygr
```
<!--
This is the encryption key for the secure cookies used in [dbAuth](/docs/tutorial/chapter4/authentication#session-secret).
-->

これは [dbAuth](/docs/tutorial/chapter4/authentication#session-secret) で使用するセキュアクッキーの暗号化キーです。

<!--
Now just run `yarn rw dev` to start your development server. Your browser should open to a fresh new blog app:
-->

そうしたら `yarn rw dev` して開発サーバを起動します。ブラウザで新しいブログアプリが開かれるはずです：

![image](https://user-images.githubusercontent.com/300/101423176-54e93780-38ad-11eb-9230-ba8557764eb4.png)

<!--
Take a bathroom break and grab a fresh beverage, then let's get on with it!
-->

トイレ休憩して、飲み物をとってきて、さあ始めましょう！
