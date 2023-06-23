# Getting Dynamic

<div class="video-container">
  <iframe src="https://www.youtube.com/embed/cb_PseqpoG8?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; modestbranding; showinfo=0; fullscreen"></iframe>
</div>

<!--
These two pages are great and all but where are the actual blog posts in this blog? Let's work on those next.

For the purposes of our tutorial we're going to get our blog posts from a database. Because relational databases are still the workhorses of many complex (and not-so-complex) web applications, we've made SQL access a first-class. For Redwood apps, it all starts with the schema.
-->

この2つのページは素晴らしいのですが、このブログの実際の記事はどこにあるのでしょうか？次はそこを見ていきましょう。

このチュートリアルでは、ブログ記事をデータベースから取得することにします。
リレーショナル・データベースは今でも多くの複雑な（そしてさほど複雑でない）Webアプリケーションの主力であり、SQLアクセスをファーストクラスとして扱えるようにしました。Redwoodのアプリは、すべてはスキーマから始まります。

### Creating the Database Schema

<!--
We need to decide what data we'll need for a blog post. We'll expand on this at some point, but at a minimum we'll want to start with:
-->

ブログ記事に必要なデータを決める必要があります。これについてはいずれ詳しく説明しますが、最低限、以下のようなものから始めたいと思います。

<!--
- `id` the unique identifier for this blog post (all of our database tables will have one of these)
- `title` something click-baity like "Top 10 JavaScript Frameworks Named After Trees—You Won't Believe Number 4!"
- `body` the actual content of the blog post
- `createdAt` a timestamp of when this record was created in the database
-->

- `id` このブログ記事の一意な識別子 （すべてのデータベース・テーブルがこのうちの一つを持つことになります）（訳注：すべてのテーブルがUniqueなID列を持つという意味？）
- `title` "Top 10 JavaScript Frameworks Named After Trees-You Won't Believe Number 4!" のような、クリックしやすいもの
- `body` ブログ記事の実際のコンテンツ
- `createdAt` このレコードがデータベースで作成されたときのタイムスタンプ

<!--
We use [Prisma](https://www.prisma.io/) to talk to the database. Prisma has another library called [Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) that lets us update the database's schema in a predictable way and snapshot each of those changes. Each change is called a _migration_ and Migrate will create one when we make changes to our schema.
-->

データベースとの通信には[Prisma](https://www.prisma.io/)を使用します。Prismaには[Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)という別のライブラリがあり、予測可能な方法でデータベースのスキーマを更新し、それぞれの変更のスナップショットを作成できるようになっています。それぞれの変更は _migration_ （マイグレーション）と呼ばれ、スキーマを変更するとMigrateはマイグレーションを作成します。

<!--
First let's define the data structure for a post in the database. Open up `api/db/schema.prisma` and add the definition of our Post table (remove any "sample" models that are present in the file, like the `UserExample` model). Once you're done, the entire schema file should look like:
-->

まず、データベースでブログ記事のデータ構造を定義しましょう。 `api/db/schema.prisma` ファイルを開いて、 Post テーブルの定義を追加します（ `UserExample` モデルのような、ファイル内にもともとある "sample" モデルはすべて削除してください）。これが終わったら、スキーマファイル全体は次のようになります：

```javascript title="api/db/schema.prisma"
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = "native"
}

// highlight-start
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}
// highlight-end
```

<!--
This says that we want a table called `Post` and it should have:

- An `id` column of type `Int` lets Prisma know this is the column it should use as the `@id` (for it to create relationships to other tables) and that the `@default` value should be Prisma's special `autoincrement()` method letting it know that the DB should set it automatically when new records are created
- A `title` field that will contain a `String`
- A `body` field that will contain a `String`
- A `createdAt` field that will be a `DateTime` and will `@default` to `now()` when we create a new record (so we don't have to set the time manually in our app, the database will do it for us)
-->

これは `Post` という名前のテーブルが必要であり、そのテーブルには以下のものが含まれている必要があるという意味です：

- `Int` 型の `id` フィールドは、Prisma が `@id` として使用するカラムであることを表します （他のテーブルとのリレーションを作成するため）。また `@default` 値は Prisma の特別な `autoincrement()` メソッドで、新しいレコードを作成するときに DB が自動的にこれを設定する必要があることを表します
- `String` 型の `title` フィールド
- `String` 型の `body` フィールド
- `createdAt` フィールドは `DateTime` 型で、新しいレコードを作成するときに `@default` で `now()` を設定します （したがって、アプリ内で手動で時間を設定する必要はありません。データベースが代わりに設定します）

:::info Integer vs. String IDs

<!--
For the tutorial we're keeping things simple and using an integer for our ID column. Some apps may want to use a CUID or a UUID, which Prisma supports. In that case you would use `String` for the datatype instead of `Int` and use `cuid()` or `uuid()` instead of `autoincrement()`:
-->

このチュートリアルでは、なにごともシンプルにするために、IDカラムに整数を使用しています。アプリによっては、Prismaがサポートしている CUID や UUID を使用したい場合もあるでしょう。 その場合は、データ型に `Int` の代わりに `String` を使用し、 `autoincrement()` の代わりに `cuid()` または `uuid()` を使用することになります：

`id String @id @default(cuid())`

<!--
Integers make for nicer URLs like https://redwoodblog.com/posts/123 instead of https://redwoodblog.com/posts/eebb026c-b661-42fe-93bf-f1a373421a13.

Take a look at the [official Prisma documentation](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-model#defining-an-id-field) for more on ID fields.
-->

IDカラムに整数を使用すると、URLは https://redwoodblog.com/posts/eebb026c-b661-42fe-93bf-f1a373421a13 みたいなのではなく、 https://redwoodblog.com/posts/123 のようないい感じになります。

IDフィールドについて詳しくは[official Prisma documentation](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-model#defining-an-id-field)を参照してください。

:::

### Migrations

<!--
Now we'll want to snapshot the schema changes as a migration:
-->

それではスキーマの変更をマイグレーションとして切り取ってみましょう：

```bash
yarn rw prisma migrate dev
```

:::tip

<!--
From now on we'll use the shorter `rw` alias instead of the full `redwood` argument.
-->

ここからは `redwood` の代わりに、より短いエイリアスである `rw` を使います。

:::

<!--
You'll be prompted to give this migration a name. Something that describes what it does is ideal, so how about "create post" (without the quotes, of course). This is for your own benefit—neither Redwood nor Prisma care about the migration's name, it's just a reference when looking through old migrations and trying to find when you created or modified something specific.
-->

このマイグレーションに名前を付けるためのプロンプトが表示されます
何をするものかを説明するものが理想的なので、"create post"（もちろん引用符はつけません）はどうでしょう。これは純粋にあなた自身のためのものです。RedwoodもPrismaもマイグレーションの名前を気にしません。古いマイグレーションを見て、特定のものを作成または変更したときに参照するだけです。

<!--
After the command completes you'll see a new subdirectory created under `api/db/migrations` that has a timestamp and the name you gave the migration. It will contain a single file named `migration.sql` that contains the SQL necessary to bring the database structure up-to-date with whatever `schema.prisma` looked like at the time the migration was created. So, you always have a single `schema.prisma` file that describes what the database structure should look like right *now* and the migrations trace the history of the changes that took place to get to the current state. It's kind of like version control for your database structure, which can be pretty handy.
-->

コマンドが完了すると、`api/db/migrations` の下に、タイムスタンプとあなたが付けたマイグレーション名を持つ新しいサブディレクトリが作成されます。その中には `migration.sql` という名前のファイルが一つ入っています。このファイルには、データベースの構造を `schema.prisma` が作成された時点のものに更新するためのSQLが含まれています。つまり、常に1つの `schema.prisma` ファイルがあり、そこには *今* どのようなデータベース構造にすべきかが記述されています。マイグレーションは現在の状態になるまでに行われた変更の履歴を追跡します。これは、データベース構造のバージョン管理みたいなもので、かなり便利です。

<!--
In addition to creating the migration file, the above command will also execute the SQL against the database, which "applies" the migration. The final result is a new database table called `Post` with the fields we defined above.
-->

マイグレーションファイルの作成に加えて、上記のコマンドはデータベースに対してSQLを実行し、マイグレーションを "適用" します。最終結果は、ここで定義したフィールドを持つ `Post` という名前の新しいデータベーステーブルです。

### Prisma Studio

<!--
A database is a pretty abstract thing: where's the data? What's it look like? How can I access it without creating a UI in my web app? Prisma provides a tool called [Studio](https://www.prisma.io/studio) which provides a nice web app view into your database:
-->

データベースというのは、かなり抽象的なものです：データはどこにあるのでしょうか？
どのように見えるのでしょうか？WebアプリでUIを作成せずに、データベースにアクセスするにはどうしたらよいでしょうか？Prismaは[Studio](https://www.prisma.io/studio)というツールを提供しており、ナイスなWebアプリからデータベースにアクセスすることができます：

![image](https://user-images.githubusercontent.com/300/145903848-2615027c-dea1-4aff-bc11-02f03ba68de0.png)

<!--
(Ours won't have any data there yet.) To open Prisma Studio, run the command:
-->

（まだデータは何もないけど）Prisma Studioを開くには、コマンドを実行します：

```bash
yarn rw prisma studio
```

<!--
A new browser should open to [http://localhost:5555](http://localhost:5555) and now you can view and manipulate data in the database directly!
-->

新しいブラウザで [http://localhost:5555](http://localhost:5555) が開くはずで、これでデータベースのデータを直接見たり、操作したりすることができるようになりました！

![image](https://user-images.githubusercontent.com/300/148606893-8d899ce7-4996-4f5e-a7f5-7c8c8483860c.png)

<!--
Click on "Post" and you'll see an empty database table. Let's have our app start putting some posts in there!
-->

"Post" をクリックすると、空のデータベーステーブルが表示されます。さっそくこのアプリでブログ記事を投稿してみましょう！

### Creating a Post Editor

<!--
We haven't decided on the look and feel of our site yet, but wouldn't it be amazing if we could play around with posts without having to build a bunch of pages that we'll probably throw away once the design team gets back to us? As you can imagine, we wouldn't have thrown around this scenario unless Redwood had a solution!
-->

サイトのデザインはまだ決めていませんが、デザインチームから連絡が来たら捨ててしまうようなページをたくさん作らなくても、ブログ記事で遊べたら素晴らしいことだと思いませんか？ご想像のとおり、Redwoodに解決策がなければ、このようなシナリオを考えることはなかったでしょう！

<!--
Let's generate everything we need to perform all the CRUD (Create, Retrieve, Update, Delete) actions on posts so we can not only verify that we've got the right fields in the database, but that it will let us get some sample posts in there so we can start laying out our pages and see real content. Redwood has a *generator* for just this occasion:
-->

ブログ記事のCRUD (Create、Retrieve、Update、Delete) 操作を実行するために必要なすべてを生成して、データベースに正しいフィールドがあることを確認するだけでなく、いくつかのサンプル記事を使ってページのレイアウトを始め、実際のコンテンツを見られるようにしましょう。Redwoodには、このような場合のための *generator* があります：

```bash
yarn rw g scaffold post
```

<!--
Let's point the browser to [http://localhost:8910/posts](http://localhost:8910/posts) and see what we have:
-->

ブラウザで [http://localhost:8910/posts](http://localhost:8910/posts) を開いて、何があるか見てみましょう：

<img src="https://user-images.githubusercontent.com/300/73027952-53c03080-3de9-11ea-8f5b-d62a3676bbef.png" />

<!--
Well that's barely more than we got when we generated a page. What happens if we click that "New Post" button?
-->

これは、ページを生成したときより、かろうじて多いですね。 "New Post" ボタンをクリックするとどうなるのでしょうか？

<img src="https://user-images.githubusercontent.com/300/73028004-72262c00-3de9-11ea-8924-66d1cc1fceb6.png" />

<!--
Okay, now we're getting somewhere. Fill in the title and body and click "Save".
-->

よし、これで一段落です。titleとbodyを書いて "Save" をクリックしてください。

<img src="https://user-images.githubusercontent.com/300/73028757-08a71d00-3deb-11ea-8813-046c8479b439.png" />

<!--
Did we just create a post in the database? And then show that post here on this page? Yup! Try creating another:
-->

データベースにブログ記事を作成しただけでしょうか？このページでそのブログ記事を表示したのでしょうか？そしたら！もうひと記事作ってみましょう：

<img src="https://user-images.githubusercontent.com/300/73028839-312f1700-3deb-11ea-8e83-0012a3cf689d.png" />

<!--
But what if we click "Edit" on one of those posts?
-->

"Edit" をクリックするとどうなりますか？

<img src="https://user-images.githubusercontent.com/300/73031307-9802ff00-3df0-11ea-9dc1-ea9af8f21890.png" />

<!--
Okay but what if we click "Delete"?
-->

"Delete" だと？

<img src="https://user-images.githubusercontent.com/300/73031339-aea95600-3df0-11ea-9d58-475d9ef43988.png" />

<!--
So, Redwood just created all the pages, components and services necessary to perform all CRUD actions on our posts table. No need to even open Prisma Studio or login through a terminal window and write SQL from scratch. Redwood calls these _scaffolds_.
-->

つまり、Redwoodはpostsテーブルに対するすべてのCRUDアクションを実行するために必要なすべてのページ、コンポーネント、サービスを作成しただけなのです。Prisma Studioを開いたり、ターミナルからログインしてSQLを一から書く必要はありません。Redwoodはこれらを _scaffolds_ と呼んでいます。

:::caution

<!--
If you head back to VSCode at some point and get a notice in one of the generated Post cells about `Cannot query "posts" on type "Query"` don't worry: we've seen this from time to time on some systems. There are two easy fixes:

1. Run `yarn rw g types` in a terminal
2. Reload the GraphQL engine in VSCode: open the Command Palette (Cmd+Shift+P for Mac, Ctrl+Shift+P for Windows) and find "VSCode GraphQL: Manual Restart"
-->

もし、VSCodeに戻ったときに、生成されたPostのセル（ `web/src/components/Post/PostCell/PostCell.tsx` ）に `Cannot query "posts" on type "Query"` というメッセージが表示されたとしても、心配しないでください：これは、いくつかのシステムで時々見受けられます。2つの簡単な修正方法があります：

1. ターミナルで `yarn rw g types` を実行する
2. VSCodeのGraphQLエンジンをリロードする：コマンドパレットを開き（MacはCmd+Shift+P、WindowsはCtrl+Shift+P）、 "VSCode GraphQL: Manual Restart" を見つける

:::

<!--
Here's what happened when we ran that `yarn rw g scaffold post` command:

- Created several _pages_ in `web/src/pages/Post`:
  - `EditPostPage` for editing a post
  - `NewPostPage` for creating a new post
  - `PostPage` for showing the detail of a post
  - `PostsPage` for listing all the posts
- Created a _layout_ file in `web/src/layouts/ScaffoldLayout/ScaffoldLayout.{js,tsx}` that serves as a container for pages with common elements like page heading and "New Posts" button
- Created routes wrapped in the `Set` component with the layout as `PostsLayout` for those pages in `web/src/Routes.{js,tsx}`
- Created three _cells_ in `web/src/components/Post`:
  - `EditPostCell` gets the post to edit in the database
  - `PostCell` gets the post to display
  - `PostsCell` gets all the posts
- Created four _components_, also in `web/src/components/Post`:
  - `NewPost` displays the form for creating a new post
  - `Post` displays a single post
  - `PostForm` the actual form used by both the New and Edit components
  - `Posts` displays the table of all posts
- Added an _SDL_ file to define several GraphQL queries and mutations in `api/src/graphql/posts.sdl.{js,ts}`
- Added a _services_ file in `api/src/services/posts/posts.{js,ts}` that makes the Prisma client calls to get data in and out of the database
-->

以下が `yarn rw g scaffold post` コマンドを実行したら起きることです：

- `web/src/pages/Post` にいくつかのページを作成する：
  - `EditPostPage` ブログ記事を編集する
  - `NewPostPage` 新しいブログ記事を作成する
  - `PostPage` ブログ記事を表示する
  - `PostsPage` すべてのブログ記事を一覧表示する
- `web/src/layouts/ScaffoldLayout/ScaffoldLayout.{js,tsx}` にレイアウトファイルを作成する。これらはページの見出しや "New Posts" ボタンなどの共通要素を持つページのコンテナとして機能する
- `web/src/Routes.{js,tsx}` に、これらのページのレイアウトを `PostsLayout` として、`Set` コンポーネントでラップしたルートを作成する
- `web/src/components/Post` に、3つのセルを作成する
  - `EditPostCell` データベースで編集するブログ記事を取得する
  - `PostCell` 表示するブログ記事を取得する
  - `PostsCell` すべてのブログ記事を取得する
- `web/src/components/Post` に、4つのコンポーネントを作成する
  - `NewPost` 新しいブログ記事を作成するためのフォームを表示する
  - `Post` 一つのブログ記事を表示する
  - `PostForm` NewとEditのコンポーネントで使用される実際のフォーム
  - `Posts` すべてのブログ記事の一覧表を表示する
-  `api/src/graphql/posts.sdl.{js,ts}` にGraphQL のクエリとミューテーションを定義する _SDL_ ファイルを追加する
- `api/src/services/posts/posts.{js,ts}` にデータベースからデータを取得するためのPrismaクライアントコールを行うサービスファイルを追加する

<!--
Pages and components/cells are nicely contained in `Post` directories to keep them organized while the layout is at the top level since there's only one of them.
-->

ページとコンポーネント/セルは、`Post` ディレクトリにうまく収められ、整理されています。一方、レイアウトは1つしかないので、トップレベルにあります。

<!--
Whew! That may seem like a lot of stuff but we wanted to follow best-practices and separate out common functionality into individual components, just like you'd do in a real app. Sure we could have crammed all of this functionality into a single component, but we wanted these scaffolds to set an example of good development habits: we have to practice what we preach!
-->

ふぅ〜。このように、たくさんのものがあるように見えますが、私たちはベストプラクティスに従って、実際のアプリで行うように、共通の機能を個々のコンポーネントに分離したいと思いました。もちろん、これらの機能をすべて1つのコンポーネントに詰め込むこともできますが、私たちは、これらの scaffold を、良い開発習慣の手本となるようにしたかったのです：私たちは、自分が説いたことを実践しなければならないのです！

:::info Generator Naming Conventions

<!--
You'll notice that some of the generated parts have plural names and some have singular. This convention is borrowed from Ruby on Rails which uses a more "human" naming convention: if you're dealing with multiple of something (like the list of all posts) it will be plural. If you're only dealing with a single something (like creating a new post) it will be singular. It sounds natural when speaking, too: "show me a list of all the posts" and "I'm going to create a new post."
-->

生成されたパーツの中には複数形の名前と単数形の名前があることにお気づきでしょう。これは、より「人間的」な命名規則を使っているRuby on Railsから借用したものです：複数のものを扱う場合 (たとえば全ブログ記事のリスト) は複数形になります。複数のものを扱う場合は複数形、単一のものだけを扱う場合 (たとえば新規ブログ記事の作成) は単数形になります。話すときも自然に聞こえます： "show me a list of all the posts" と "I'm going to create a new post." のように。

<!--
As far as the generators are concerned:

- Services filenames are always plural.
- The methods in the services will be singular or plural depending on if they are expected to return multiple posts or a single post (`posts` vs. `createPost`).
- SDL filenames are plural.
- Pages that come with the scaffolds are plural or singular depending on whether they deal with many or one post. When using the `page` generator it will stick with whatever name you give on the command line.
- Layouts use the name you give them on the command line.
- Components and cells, like pages, will be plural or singular depending on context when created by the scaffold generator, otherwise they'll use the given name on the command line.
- Route names for scaffolded pages are singular or plural, the same as the pages they're routing to, otherwise they are identical to the name of the page you generated.
-->

ジェネレータに関する限り：

- サービスのファイル名は常に複数形
- サービスのメソッドは、複数のブログ記事を返すのか単一のブログ記事を返すのか ( `posts` と `createPost` の違い) によって複数形か単数形か
- SDL のファイル名は複数形
- scaffolds に付属するページは、複数のブログ記事を扱うか、1つのブログ記事を扱うかによって複数形か単数形になる。 `page` ジェネレータを使用する場合、コマンドラインで指定された名前を使用する
- レイアウトはコマンドラインで指定された名前を使用する
- コンポーネントとセルは、ページと同様に、scaffoldジェネレータで作成されるときは文脈に応じて複数形か単数形になり、それ以外はコマンドラインで与えられた名前が使われる
- scaffoldで作成されたページのルート名は、ルーティング先のページと同じように単数形または複数形になる

<!--
Also note that it's the model name part that's singular or plural, not the whole word. So it's `PostsCell` and `PostsPage`, not `PostCells` or `PostPages`.
-->

また、単数形か複数形かはモデル名の部分であって、単語全体ではないことに注意してください。つまり、 `PostsCell` や `PostsPage` であって、`PostCells` や `PostPages` ではありません。

<!--
You don't have to follow this convention once you start creating your own parts but we recommend doing so. The Ruby on Rails community has come to love this nomenclature even though many people complained when first exposed to it!
-->

自分で部品を作り始めたら、この規則に従う必要はありませんが、従うことをお勧めします。Ruby on Railsコミュニティはこの命名規則を気に入っていますが、最初にこの命名法に触れたとき、多くの人が不満を漏らしたものです！

:::

### Creating a Blog Homepage

<!--
We could start replacing these pages one by one as we settle on a look and feel for our blog, but do we need to? The public facing site won't let viewers create, edit or delete posts, so there's no reason to re-create the wheel or update these pages with a look and feel that matches the public facing site. Why don't we keep these as our admin pages and create new ones for the public facing site.
-->

ブログのルック＆フィールが決まったら、これらのページを一つずつ置き換えていくこともできますが、その必要があるでしょうか？公開Webサイトでは、閲覧者がブログ記事を作成、編集、削除することはできないので、車輪を再発明したり、これらのページを公開Webサイトにマッチした外観に更新する必要はありません。これらのページを管理用ページとして残し、公開Webサイト用に新しいページを作成してはどうでしょうか。

<!--
Let's think about what the general public can do and that will inform what pages we need to build:

1. View a list of posts (without links to edit/delete)
2. View a single post
-->

一般の人が何をできるか考えれば、どんなページを作ればいいかが見えてきます：

1. ブログ記事の一覧を見る（編集・削除のリンクはなし）
2. 一つのブログ記事を見る

<!--
Starting with #1, we already have a `HomePage` which would be a logical place to view the list of posts, so let's just add the posts to the existing page. We need to get the content from the database and we don't want the user to just see a blank screen in the meantime (depending on network conditions, server location, etc), so we'll want to show some kind of loading message or animation. And if there's an error retrieving the data we should handle that as well. And what about when we open source this blog engine and someone puts it live without any content in the database? It'd be nice if there was some kind of blank slate message until their first post is created.
-->

1から始めると、ブログ記事のリストを表示するための論理的な場所である `HomePage` がすでにあるので、このページに追加しましょう。データベースからコンテンツを取得する必要がありますが、その間、ユーザに空白の画面だけを見せたくないので（ネットワークの状態、サーバの場所などによります）、何らかの読み込みメッセージやアニメーションを表示することにします。そしてデータを取得する際にエラーが発生した場合にも対処する必要があります。また、このブログエンジンをオープンソース化し、誰かがデータベースに何もない状態で公開した場合はどうでしょうか？最初のブログ記事が作成されるまでは、白紙の状態であることを示すメッセージが表示されるとよいでしょう。

<!--
Oh boy, our first page with data and we already have to worry about loading states, errors, and blank slates...or do we?
-->

さて、最初のページでは、データの読み込み状態や、エラー、白紙の状態について心配する必要があります...よね？
