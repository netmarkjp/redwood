# Deployment

<!--
The whole reason we started building Redwood was to make full-stack web apps easier to build and deploy on the Jamstack. While technically we already deployed in the previous section, it doesn't actually work yet. Let's fix that.
-->

Redwoodを作り始めたのは、Jamstack上でフルスタックのWebアプリを簡単に構築してデプロイできるようにするためでした。技術的には前のセクションですでにデプロイしていますが、実際にはまだ動作していません。それを修正しましょう。

### Git

<!--
Remember at the start of the tutorial when we said that you didn't *really* need to use git if you didn't want to? Well, if you want to follow along with this deploy, you'll need to start using it now. Sorry! Commit your changes and push up to GitHub, GitLab or Bitbucket if you want to continue to follow along. Need a git primer? The most concise one we've seen is to simply create a new repo on GitHub. You'll be shown the list of commands necessary to get your local code committed and pushed up:
-->

チュートリアルの冒頭で、git を使いたくなければ *本当に* 使わなくてもいいと言ったのを覚えていますか？しかし、このデプロイについて行きたいのであれば、今すぐ使い始めなければなりません。すみません！チュートリアルを続けたい場合は、変更をコミットして GitHub や GitLab、Bitbucket にプッシュしてください。gitの入門書が必要ですか？私たちが知る中で最も簡単な方法は、GitHub で新しいリポジトリを作成することです。ローカルコードをコミットしてプッシュするために必要なコマンドのリストが表示されます：

![image](https://user-images.githubusercontent.com/300/152596271-7921c9dc-fe83-4827-b7e4-2740e826fb42.png)

<!--
But instead of just `git add README.md` use `git add .` since you've got an entire codebase ready to go.
-->

ただし `git add README.md` ではなく `git add .` すれば、コードベース全体が使えるようになります。

### The Database

<!--
We'll need a database somewhere on the internet to store our data. We've been using SQLite locally, but the kind of deployment we're going to do doesn't have a persistent disk store that we can put SQLite's file-based database on. So, for this part of this tutorial, we will use Postgres. (Prisma currently supports SQLite, Postgres, MySQL and SQL Server.) Don't worry if you aren't familiar with Postgres, Prisma will do all the heavy lifting. We just need to get a database available to the outside world so it can be accessed by our app.
-->

データを保存するために、インターネット上のどこかにデータベースが必要です。これまでローカルで SQLite を使ってきましたが、これから行うデプロイメントでは、SQLite のファイルベースのデータベースを置くことができる永続的なディスクストアはありません。そこで、このチュートリアルのこの部分については、Postgresを使用することにします（Prismaは現在、SQLite、Postgres、MySQL、SQL Serverをサポートしています）。Postgresに慣れていなくても心配ありません。Prismaが重い仕事をすべてやってくれます。私たちは、アプリからアクセスできるように、外部からデータベースを利用できるようにするだけです。

:::danger

<!--
Prisma only supports one database provider at a time, and since we can't use SQLite in production and *must* switch to Postgres or MySQL, that means we need to use the same database on our local development system after making this change. See our [Local Postgres Setup](../../local-postgres-setup.md) guide to get you started.
-->

Prismaは一度に1つのデータベースプロバイダしかサポートしておらず、実稼働環境ではSQLiteを使用できずPostgresまたはMySQLに切り替え *なければならない* ため、この変更を行った後はローカルの開発環境でも同じようにデータベースを変更する必要があります。 [ローカル Postgres セットアップ](../../local-postgres-setup.md) ガイドを参照し、開始してください。

:::

<!--
There are several hosting providers where you can quickly start up a Postgres instance:
-->

Postgresのインスタンスをすぐに立ち上げることができるホスティングプロバイダがいくつかあります：

- [Railway](https://railway.app/)
- [Heroku](https://www.heroku.com/postgres)
- [Digital Ocean](https://www.digitalocean.com/products/managed-databases)
- [AWS](https://aws.amazon.com/rds/postgresql/)

<!--
We're going to go with Railway for now because it's a) free and b) ridiculously easy to get started, by far the easiest we've found. You don't even need to create a login! The only limitation is that if you *don't* create an account, your database will be removed after one day. If you think you can finish everything you need to do in the next 24 hours, go for it! Otherwise just create an account first and it'll stick around.
-->

ここでは Railway を使います。それは a) 無料で、 b) 超簡単に始められるからで、私達が知る限り一番簡単です。ログインすら不要です！唯一の制限は、アカウントを作成 *しない* 場合、データベースは1日後に削除されることです。もし、24時間以内にやるべきことをすべて終わらせられると思うのであれば、ぜひやってみてください！そうでなければ、まずアカウントを作成してください。

<!--
Head over to Railway and click **Start a New Project**:
-->
Railwayのサイトに移動して **Start a New Project** をクリックします：

![image](https://user-images.githubusercontent.com/300/152593861-3063732c-b459-4ee9-86ee-e00b28c003fb.png)

<!--
And then Provision PostgreSQL:
-->

そして PostgreSQL をプロビジョニングします：

![image](https://user-images.githubusercontent.com/300/152593907-1f8b599e-b4fb-4930-a841-866505e3b79d.png)

<!--
And believe it or not, we're done! Now we just need the connection URL. Click on **PostgreSQL** at the left, and then the **Connect** tab. Copy the **Postgres Connection URL**, the one that starts with `postgresql://`:
-->

信じられないかもしれませんが、これで終わりです！接続URLを知りたいので、左側の **PostgreSQL** をクリックし、次に **Connect** タブをクリックします。 `postgresql://` で始まる **Postgres Connection URL** をコピーします：

![image](https://user-images.githubusercontent.com/300/107562577-da7eb180-6b94-11eb-8731-e86a1c7127af.png)

### Change Database Provider

<!--
We need to let Prisma know that we intend to use Postgres instead of SQLite from now on. Update the `provider` entry in `schema.prisma`:
-->

私達は Prisma に、これからは SQLite のかわりに Postgres を使うことを伝えないとなりません。 `schema.prisma` の `provider` を更新します：

```javascript
provider = "postgresql"
```

### Recreate Migrations

<!--
We will need to re-create our database migrations in a Postgres-compatible format. First, we need to tell Prisma where our new database lives so that it can access it from our dev environment. Open up `.env` and uncomment the `DATABASE_URL` var and update it to be the URL you copied from Railway, and save.
-->

データベースの migration を Postgres互換に再作成しなければなりません。まず Prisma に新しいデータベースの接続先を伝えて、開発環境から接続できるようにします。 `.env` ファイルを開いて `DATABASE_URL` 変数のコメントアウトを解除し、 Railway からコピーした接続URLを貼り付けて、ファイルを保存します。

:::info

<!--
Note that `.env` is not checked into git by default, and should not be checked in under any circumstances! This file will be used to contain any secrets that your codebase needs (like database URLs and API keys) that should never been seen publicly. If you were to check this file in your repo, and your repo was public, anyone on the internet can see your secret stuff!
-->

`.env` はデフォルトで git にチェックインされず、どんな状況でもチェックインすべきではありません！このファイルは（データベースの接続URLや、APIキーのような）公開してはいけない機密情報を含みがちです。もしあなたがこのファイルをリポジトリにチェックインし、リポジトリがpublicになると、インターネット上で誰もがあなたの機密情報を知ることができてしまいます！

<!--
The `.env.defaults` file is meant for other environment variables (like non-sensitive config options for libraries, log levels, etc.) that are safe to be seen by the public and is meant to be checked into your repo and shared with other devs.
-->

`.env.defaults` ファイルは、一般の人が見ても安全なその他の環境変数（ライブラリやログレベルなどの非センシティブな設定オプションなど）のためのもので、リポジトリにチェックインして他の開発者と共有することを意図しています。

:::

<!--
Next, delete the `api/db/migrations` folder completely.
-->

次に `api/db/migrations` ディレクトリを完全に削除します。

<!--
Finally, run:
-->

最後に、実行します：

```bash
yarn rw prisma migrate dev
```

<!--
All of the changes we made will be consolidated into a single, new migration file and applied to the Railway database instance. You can name this one something like "initial schema".
-->

私たちが行ったすべての変更は、1つの新しいマイグレーションファイルに統合され、Railwayデータベースインスタンスに適用されます。このファイルには、 "initial schema" （初期スキーマ） のような名前を付けることができます。

<!--
That's it for the database setup! Now to let Netlify know about it.
-->

これでデータベースのセットアップは完了です！あとは Netlify に知らせるだけです。

### Netlify

<!--
So the database is settled, but we need to actually put our code on the internet somewhere. That's where Netlify comes in.
-->

というわけで、データベースは決まったのですが、実際にコードをインターネットのどこかに置いておく必要があります。そこで Netlify です。

<!--
Before we setup Netlify we'll need to setup our code with a setup command. Setup!
-->

Netlify をセットアップする前に、 setup コマンドでコードをセットアップする必要があります。セットアップ！

```bash
yarn rw setup deploy netlify
```

<!--
This adds a `netlify.toml` config file in the root of the project that is good to go as-is, but you can tweak it as your app grows (check out the comments at the top of the file for links to resources about customizing). Make sure you commit and push up these code changes to your repo.
-->

これはプロジェクトのルートに `netlify.toml` という設定ファイルを追加するもので、そのままでも良いですが、アプリの成長に合わせて微調整することができます（ファイル上部のコメントにある、カスタマイズに関するリソースへのリンクを見てみてください）。これらのコードの変更をコミットして、自分のリポジトリにプッシュするのをお忘れなく。

<!--
And with that, we're ready to setup Netlify itself.
-->

これで、 Netlify 自体のセットアップが完了しました。

:::caution
<!--
While you may be tempted to use the [Netlify CLI](https://cli.netlify.com) commands to [build](https://cli.netlify.com/commands/build) and [deploy](https://cli.netlify.com/commands/deploy) your project directly from you local project directory, doing so **will lead to errors when deploying and/or when running functions**. I.e. errors in the function needed for the GraphQL server, but also other serverless functions.
-->

[Netlify CLI](https://cli.netlify.com) コマンドを使って、ローカルのプロジェクトディレクトリから直接プロジェクトを [build](https://cli.netlify.com/commands/build) と [deploy](https://cli.netlify.com/commands/deploy) したくなるかもしれませんが、そうすると **デプロイ時や関数実行時のエラーにつながります** 。例えば GraphQL サーバに必要な関数においても、他のサーバレス関数でもエラーが発生します。

<!--
The main reason for this is that these Netlify CLI commands simply build and deploy -- they build your project locally and then push the dist folder. That means that when building a RedwoodJS project, the [Prisma client is generated with binaries matching the operating system at build time](https://cli.netlify.com/commands/link) -- and not the [OS compatible](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options) with running functions on Netlify. Your Prisma client engine may be `darwin` for OSX or `windows` for Windows, but it needs to be `debian-openssl-1.1.x` or `rhel-openssl-1.1.x`. If the client is incompatible, your functions will fail.
-->

その主な理由は、これらの Netlify CLI コマンドは単にビルドとデプロイを行うだけだからです -- ローカルでプロジェクトをビルドし、distフォルダをプッシュします。
どういうことかというと、RedwoodJSのプロジェクトをビルドする際、[Prismaクライアントはビルド時のOSにマッチしたバイナリで生成される](https://cli.netlify.com/commands/link) のです -- それはNetlify上で関数を動作させるための [OS互換性](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options) があるわけではないのです。Prismaクライアントのエンジンは、OSXなら `darwin` 、Windowsなら `windows` になりますが、 `debian-openssl-1.1.x` または `rhel-openssl-1.1.x` でなければならないのです。クライアントが非互換の場合、関数実行は失敗します。

<!--
Therefore, **please follow the instructions below** to sync your GitHub (or other compatible source control service) repository with Netlify and allow their build and deploy system to manage deployments.
-->
そのため、**以下の手順で** GitHub（または互換性のあるソースコード管理サービス）のリポジトリを Netlify と同期し、CI/CDでデプロイを管理できるようにしてください。
:::

#### Signup

<!--
[Create a Netlify account](https://app.netlify.com/signup) if you don't have one already. Once you've signed up and verified your email done just click the **New site from Git** button at the upper right:
-->

もしまだであれば [Create a Netlify account](https://app.netlify.com/signup) で Netlify のアカウントを作成してください。サインアップとメールアドレス検証が完了したら、右上の **New site from Git** ボタンをクリックしてください：

![Netlify New Site picker](https://user-images.githubusercontent.com/300/73697486-85f84a80-4693-11ea-922f-0f134a3e9031.png)

<!--
Now just authorize Netlify to connect to your git hosting provider and find your repo. When the deploy settings come up you can leave everything as the defaults and click **Deploy site**.
-->

Netlify があなたの git ホスティングプロバイダに接続し、あなたのリポジトリを見つけることを承認してください。デプロイ設定が表示されたら、すべてデフォルトのまま、 **Deploy site** をクリックします。

<!--
Netlify will start building your app and it will eventually say the deployment failed. Why? We haven't told it where to find our database yet!
-->

Netlify がアプリのビルドを開始し、最終的にデプロイに失敗します。なぜでしょうか？まだデータベースがどこにあるか教えていないからです！

#### Environment Variables

<!--
Go back to the main site page and then to **Site settings** at the top, and then **Build & Deploy** > **Environment**. Click **Edit Variables** and this is where we'll paste the database connection URI we got from Railway (note the **Key** is "DATABASE_URL"). After pasting the value, append `?connection_limit=1` to the end. The URI will have the following format: `postgresql://<user>:<pass>@<url>/<db>?connection_limit=1`.
Go back to the main site page and then to **Site settings** at the top, and then **Environment variables**. Click **Add a Variable** and this is where we'll paste the database connection URI we got from Railway (note the **Key** is "DATABASE_URL"). After pasting the value, append `?connection_limit=1` to the end. The URI will have the following format: `postgresql://<user>:<pass>@<url>/<db>?connection_limit=1`. The default values for Scopes and Values can be left as is. Click **Create variable** to proceed.
-->

メインサイトページに戻り、上部の **Site settings** から **Environment Variables** に進みます。
**Add a Variable** をクリックし、ここに Railway から取得したデータベース接続URIを貼り付けます（ **Key** は "DATABASE_URL" です）。
値を貼り付けたら、末尾に `?connection_limit=1` を追加してください。
URIはこのような形式になります： `postgresql://<user>:<pass>@<url>/<db>?connection_limit=1`
ScopesとValuesはデフォルト値のままでOKです。
**Create variable** をクリックして次に進みます。

:::tip

<!--
This connection limit setting is [recommended by Prisma](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#recommended-connection-pool-size-1) when working with relational databases in a Serverless context.
-->

この接続数制限設定は、サーバレス環境でリレーショナルデータベースを利用する際に [Prismaが推奨している](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#recommended-connection-pool-size-1) ものです。

:::

<!--
We'll need to add one more environment variable, `SESSION_SECRET` which contains a big long string that's used to encrypt the session cookies for dbAuth. This was included in development when you installed dbAuth, but now we need to tell Netlify about it. If you look in your `.env` file you'll see it at the bottom, but we want to create a unique one for every environment we deploy to (each developer should have a unique one as well). We've got a CLI command to create a new one:
-->

もう一つ環境変数を追加する必要があります。 `SESSION_SECRET` は、dbAuth のセッションクッキーを暗号化するための大きな長い文字列です。これは dbAuth をインストールしたときに開発環境に含まれていたものですが、今度は Netlify にそれを伝える必要があります。 `.env` ファイルを見ると、一番下にありますが、デプロイ先の環境ごとに一意のものを作りたいです（開発者もそれぞれ一が意の値を持つ必要があります）。新しいものを作成するためのCLIコマンドがありましたね：

```bash
yarn rw g secret
```

<!--
Copy that over to Netlify along with `DATABASE_URL`:
-->

それを `DATABASE_URL` と一緒に Netlify にコピーします：

![Adding ENV var](https://user-images.githubusercontent.com/2931245/204148740-f8aaa276-e9b1-4ffc-a842-7602a1e0111a.png)

<!--
Make sure to click the **Save** button.
-->

**Save** ボタンをクリックするのを忘れずに。

#### IT'S ALIVE

<!--
Now go over to the **Deploys** tab in the top nav and open the **Trigger deploy** dropdown on the right, then finally choose **Deploy site**:
-->

ではトップナビから **Deploys** に移動し、右側の **Trigger deploy** ドロップダウンを開き、最後に **Deploy site** を選択します：

![Trigger deploy](https://user-images.githubusercontent.com/300/83187760-835aae80-a0e3-11ea-9733-ff54969bba1f.png)

<!--
With a little luck (and SCIENCE) it will complete successfully! You can click the **Preview** button at the top of the deploy log page, or go back and click the URL of your Netlify site towards the top:
-->

運が良ければ（科学的には）成功します！
デプロイログページの上部にある **Preview** ボタンをクリックするか、戻って上部にあるあなたの Netlify サイトのURLをクリックできます。

![Netlify URL](https://user-images.githubusercontent.com/300/83187909-bef57880-a0e3-11ea-97dc-e557248acd3a.png)

:::info

<!--
If you view a deploy via the **Preview** button notice that the URL contains a hash of the latest commit. Netlify will create one of these for every push to `main` but it will only ever show this exact commit, so if you deploy again and refresh you won't see any changes. The real URL for your site (the one you get from your site's homepage in Netlify) will always show the latest successful deploy. See [Branch Deploys](#branch-deploys) below for more info.
-->

**Preview** ボタンでデプロイを表示すると、URLの中に最新のコミットハッシュが含まれていることにがわかります。
Netlify は `main` にプッシュするたびにこれらを作成しますが、この正確なコミットしか示さないので、もう一度デプロイして更新しても、何も変化がないでしょう。
あなたのサイトの実際のURL（Netlify　のサイトのホームページから得られるもの）は、常に最新の成功したデプロイを表示します。
詳しくは下の [Branch Deploys](#branch-deploys) を見てください。

:::

<!--
Did it work? If you see "Empty" under the About and Contact links then it did! Yay! You're seeing "Empty" because you don't have any posts in your brand new production database so head to `/admin/posts` and create a couple, then go back to the homepage to see them.
-->

うまくいきましたか？もし About と Concact リンクの下に "Empty" と表示されていれば、うまくいきました！やったー！ "Empty" と表示されているのは、新しいデータベース内に何もブログ記事がないからなので、 `/admin/posts` に移動していくつかブログ記事を作成し、ホームページに戻って表示されるか見てみましょう。

<!--
If the deploy failed, check the log output in Netlify and see if you can make sense of the error. If the deploy was successful but the site doesn't come up, try opening the web inspector and look for errors. Are you sure you pasted the entire Postgres connection string correctly? If you're really, really stuck head over to the [Redwood Community](https://community.redwoodjs.com) and ask for help.
-->

デプロイに失敗した場合、Netlify のログ出力をチェックして、エラーの意味がわかるか確認してください。デプロイは成功したが、サイトが立ち上がらない場合、Webインスペクタを開いて、エラーを探してみてください。Postgresの接続URLをすべて正しく貼り付けましたか？もし、本当に、本当に困っているのなら、[Redwood Community](https://community.redwoodjs.com) に行って、助けを求めてみてください。

#### Custom Subdomain

<!--
You can customize the subdomain that your site is published at (who wants to go to `agitated-mongoose-849e99.netlify.app`??) by going to **Site Settings > Domain Management > Domains > Custom Domains**. Open up the **Options** menu and select **Edit site name**. Your site should be available at your custom subdomain (`redwood-tutorial.netlify.app` is much nicer) almost immediately.
-->

**Site Settings > Domain Management > Domains > Custom Domains** からサイトが公開されるサブドメインをカスタマイズできます（誰が `agitated-mongoose-849e99.netlify.app` を見に行きたがるでしょうか？）。 **Options** メニューを開き、 **Edit site name** を選択します。あなたのサイトはすぐに新しいサブドメイン（ `redwood-tutorial.netlify.app` はもっと素敵です）で利用できるようになるはずです。

![image](https://user-images.githubusercontent.com/300/154521450-ee64c77c-e658-4045-9dd6-119858b6739e.png)

<!--
Note that your subdomain needs to be unique across all of Netlify, so `blog.netlify.app` is probably already taken! You can also connect a completely custom domain: click the **Add custom domain** button.
-->

サブドメインは Netlify 全体でユニークでなければならないので、`blog.netlify.app` 恐らくすでに使われていことに注意してください！完全なカスタムドメインを接続することもできます： **Add custom domain** ボタンをクリックしてください。

#### Branch Deploys

<!--
Another neat feature of Netlify is _Branch Deploys_. When you create a branch and push it up to your repo, Netlify will build that branch at a unique URL so that you can test your changes, leaving the main site alone. Once your branch is merged to `main` then a deploy at your main site will run and your changes will show to the world. To enable Branch Deploys go to **Site settings** > **Build & deploy** > **Continuous Deployment** and under the **Branches** section click **Edit settings** and change **Branch deploys** to "All". You can also enable _Deploy previews_ which will create them for any pull requests against your repo.
-->

Netlify のもう一つの素晴らしい機能は _Branch Deploys_ です。ブランチを作成し、それをリポジトリにプッシュすると、Netlify はそのブランチをユニークな URL でビルドし、メインサイトはそのままで変更をテストできるようにします。
あなたのブランチが `main` にマージされると、メインサイトへのデプロイが実行され、あなたの変更が世界に公開されるのです。
Branch Deploys を有効にするには、**Site settings** > **Build & deploy** > **Continuous Deployment** に行き、**Branches** セクションで **Edit settings** をクリックして **Branch deploys** を "All" に変更します。また、_Deploy previews_ を有効にすると、あなたのリポジトリに対するプルリクエストに対してプレビューを作成することができます。

![Netlify settings screenshot](https://user-images.githubusercontent.com/7134153/182321177-2d845d77-36f4-4146-9fb9-55ae83a30983.png)

:::tip

<!--
You also have the ability to "lock" the `main` branch so that deploys do not automatically occur on every push—you need to manually tell Netlify to deploy the latest, either by going to the site or using the [Netlify CLI](https://cli.netlify.com/).
-->

また `main` ブランチを "lock" することで、プッシュのたびに自動的にデプロイされないようにすることもできます -- この場合はNetlifyのサイトか [Netlify CLI](https://cli.netlify.com/) から、手動で最新版をデプロイしなければなりません。

:::

### Database Concerns

#### Connections

<!--
In this tutorial, your serverless functions will be connecting directly to the Postgres database. Because Postgres has a limited number of concurrent connections it will accept, this does not scale—imagine a flood of traffic to your site which causes a 100x increase in the number of serverless function calls. Netlify (and behind the scenes, AWS) will happily spin up 100+ serverless Lambda instances to handle the traffic. The problem is that each one will open its own connection to your database, potentially exhausting the number of available connections. The proper solution is to put a connection pooling service in front of Postgres and connect to that from your lambda functions. To learn how to do that, see the [Connection Pooling](../../connection-pooling.md) guide.
-->

このチュートリアルでは、サーバレス関数はPostgresデータベースに直接接続します。Postgres は同時に受け付ける接続数に制限があるため、これはスケールしません -- あなたのサイトにトラフィックが殺到して、サーバレス関数の呼び出しが100倍になった場合を想像してみてください。Netlifyは（裏ではAWSは）100以上のサーバレスLambdaインスタンスをスピンアップして、トラフィックを処理します。問題は、それぞれが個別にデータベースに接続し、利用可能な接続の数を使い果たす可能性があることです。適切な解決策は、Postgresの前にコネクションプーリングサービスを置き、Lambdaからそれに接続することです。その方法については、[Connection Pooling](../../connection-pooling.md) ガイドを参照してください。

#### Security

<!--
Your database will need to be open to the world because you never know what IP address a serverless function will have when it runs. You could potentially get the CIDR block for ALL IP addresses that your hosting provider has and only allow connections from that list, but those ranges usually change over time and keeping them in sync is not trivial. As long as you keep your DB username/password secure you should be safe, but we understand this is not the ideal solution.
-->

サーバレス関数が実行されるとき、どのようなIPアドレスを持っているか分からないので、データベースは世界に公開する必要があります。ホスティングプロバイダが持っているすべてのIPアドレスのCIDRブロックを取得し、そのリストからの接続のみを許可することはではしますが、これらは通常時間の経過と共に変化するので、それらを同期し続けるのは手間のかかることです。DBのユーザ名とパスワードを安全に保つ限りは安全ですが、これが理想的な解決策でないことは理解しています。

<!--
As this form of full-stack Jamstack gains more prominence we're counting on database providers to provide more robust, secure solutions that address these issues. Our team is working closely with several of them and will hopefully have good news to share in the near future!
-->

このようなフルスタックJamstackが注目されるようになり、データベースプロバイダがこれらの問題を解決する、より堅牢で安全なソリューションを提供することが期待されます。私たちのチームは、いくつかのプロバイダと密接に協力しており、近い将来、良い知らせをお届けできると思います！

##### The Signup Problem

<!--
Speaking of security, you may have noticed a glaring security hole in our build: anyone can come along and sign up for a new account and start creating blog posts! That's not ideal. A quick and easy solution would be to remove the `signup` route after you've created your own account: now there's no signup page accessible and a normal human will give up. But what about devious hackers?
-->

セキュリティといえば、私たちのビルドに顕著なセキュリティホールがあることにお気づきかもしれません：誰でも新しいアカウントにサインアップして、ブログの記事を作成することができるのです！これは理想的ではありません。手っ取り早く簡単な解決策は、自分のアカウントを作成した後に `signup` ルートを削除することです：そうすれば、サインアップページに誰もアクセスできなくなり、普通の人なら諦めるでしょう。しかし、邪悪なハッカーはどうでしょうか？

<!--
dbAuth provides an API for signup and login that the client knows how to call, but if someone were crafty enough they could make their own API calls to that same endpoint and still create a new user even without the signup page! Ahhhh! We finally made it through this long (but fun!) tutorial, can't we just take a break and put our feet up? Unfortunately, the war against bad actors never really ends.
-->

dbAuth は、クライアントが呼び出し方を知っているサインアップとログインの API を提供しますが、もし誰かが十分に狡猾であれば、同じエンドポイントに独自の API 呼び出しを行い、サインアップページがなくても新しいユーザを作成することができます！ああああああああ！この長い（でも楽しい！）チュートリアルをようやく終えたので、ちょっと一休みして足を上げませんか？残念なことに、悪者との戦いは決して終わりません。

<!--
To close this hole, check out `api/src/functions/auth.js`, this is where the configuration for dbAuth lives. Take a gander at the `signupOptions` object, specifically the `handler()` function. This defines what to do with the user data that's submitted on the signup form. If you simply have this function return `false`, instead of creating a user, we will have effectively shut the door on the API signup hack.
-->

この穴を塞ぐには、`api/src/functions/auth.js` をチェックしてください。ここに dbAuth の設定があります。 `signupOptions` オブジェクト、特に `handler()` 関数をよく見てください。これはサインアップフォームで送信されたユーザデータをどのように扱うかを定義します。もしこの関数がユーザを作成する代わりに `false` を返すようにすれば、APIサインアップハックのドアを効果的に閉じられます。

<!--
Commit your changes and push your repo, and Netlify will re-deploy your site. Take that you hacking [snollygosters](https://www.merriam-webster.com/dictionary/snollygoster)!
-->

変更をコミットしてリポジトリにプッシュすると、Netlify がサイトを再デプロイしてくれます。ハッキングしている [snollygosters](https://www.merriam-webster.com/dictionary/snollygoster) のみなさん、お疲れさまでした！

![100% accurate portrayal of hacking](https://user-images.githubusercontent.com/300/152592915-609747f9-3d68-4d72-8cd8-e120ef83b640.gif)
