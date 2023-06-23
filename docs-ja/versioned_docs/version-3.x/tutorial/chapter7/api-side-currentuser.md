# Accessing currentUser in the API side

<!--
As our blog has evolved into a multi-million dollar enterprise, we find ourselves so busy counting our money that we no longer have the time to write actual blog posts! Let's hire some authors to write them for us.
-->

私たちのブログが数百万ドル規模の企業に発展したため、私たちはお金を数えるのに忙しく、実際のブログ記事を書く時間がもはやないことに気づきました！ブログ記事を書いてもらうためにライターを雇うことにしましょう。

<!--
What do we need to change to allow multiple users to create posts? Well, for one, we'll need to start associating a blog post to the author that wrote it so we can give them credit. We'll also want to display the name of the author when reading an article. Finally, we'll want to limit the list of blog posts that an author has access to edit to only their own: Alice shouldn't be able to make changes to Bob's articles.
-->

複数のユーザが記事を作成できるようにするには、何を変更する必要があるのでしょうか？まず、ブログ記事を、それを書いた著者に関連付け、その人の名前を表示できるようにします。また、ブログ記事を読む画面に著者の名前を表示するようにします。最後に、著者が編集できるブログ記事のリストを自分のものだけに制限したいと思います：アリスはボブの記事に変更を加えることができないようにします。

## Associating a Post to a User

<!--
Let's introduce a relationship between a `Post` and a `User`, AKA a foreign key. This is considered a one-to-many relationship (one `User` has many `Post`s), similar to the relationship we created earlier between a `Post` and its associated `Comment`s. Here's what our new schema will look like:
-->

ここでは、 `Post` と `User` の間のリレーションシップ（外部キー）を紹介します。これは一対多のリレーション（一人の `User` が多くの `Post` を持つ）で、先ほど作成した `Post` とそれに関連する `Comment` のリレーションと同じようなものと考えてください。新しいスキーマはこのようになります：

```
┌─────────────────────┐       ┌───────────┐
│        User         │       │  Post     │
├─────────────────────┤       ├───────────┤
│ id                  │───┐   │ id        │
│ name                │   │   │ title     │
│ email               │   │   │ body      │
│ hashedPassword      │   └──<│ userId    │
│ ...                 │       │ createdAt │
└─────────────────────┘       └───────────┘
```

<!--
Making data changes like this will start becoming second nature soon:

1. Add the new relationship the `schema.prisma` file
2. Migrate the database
3. Generate/update SDLs and Services
-->

このようなデータの変更は、すぐに自然にできるようになります：

1. 新しいリレーションシップを `schema.prisma` ファイルに追加
2. データベースをマイグレーション
3. SDLとサービスを生成/更新

### Add the New Relationship to the Schema

<!--
First we'll add the new `userId` field to `Post` and the relation to `User`:
-->

まず、新しいフィールド `userId` を `Post` に追加し、リレーションを `User` に追加します：

```javascript title=api/db/schema.prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  comments  Comment[]
  // highlight-start
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  // highlight-end
  createdAt DateTime @default(now())
}

model User {
  id                  Int @id @default(autoincrement())
  name                String?
  email               String @unique
  hashedPassword      String
  salt                String
  resetToken          String?
  resetTokenExpiresAt DateTime?
  roles               String @default("moderator")
  // highlight-next-line
  posts               Post[]
}
```

### Migrate the Database

<!--
Next, migrate the database to apply the changes (when given the option, name the migration something like "add userId to post"):
-->

次に、変更を適用するためにデータベースをマイグレーションします（オプションがある場合は、マイグレーションに "add userId to post" のような名前を付けてください）：

```
yarn rw prisma migrate dev
```

Whoops!

<img width="584" alt="image" src="https://user-images.githubusercontent.com/300/192899337-9cc1167b-e6da-42d4-83dc-d2a6c0cd1179.png" />

<!--
Similar to what happened when we added `roles` to `User`, We made `userId` a required field, but we already have several posts in our development database. Since we don't have a default value for `userId` defined, it's impossible to add this column to the database.
-->

`User` に `roles` を追加したときと同じように、 `userId` を必須フィールドにしましたが、開発用データベースにはすでにいくつかのブログ記事があります。`userId` のデフォルト値が定義されていないため、このカラムをデータベースに追加できません。

:::caution Why don't we just set `@default(1)` in the schema?

<!--
This would get us past this problem, but could cause hard-to-track-down bugs in the future: if you ever forget to assign a `post` to a `user`, rather than fail it'll happily just set `userId` to `1`, which may or may not even exist some day! It's best to take the extra time to do things The Right Way and avoid the quick hacks to get past an annoyance like this. Your future self will thank you!
-->

これはこの問題を解決してくれますが、将来的に追跡が困難なバグを引き起こす可能性があります：もし `post` を `user` に割り当てるのを忘れた場合、失敗するどころか喜んで `userId` を `1` に設定してしまうでしょう！このような問題を解決するためには、時間をかけて正しい方法で行い、手っ取り早いハックは避けたほうがよいでしょう。未来のあなたは、今のあなたに感謝することでしょう！

:::

<!--
Since we're in development, let's just blow away the database and start over:
-->

開発中なので、データベースは吹っ飛ばしてやり直しましょう：

```
yarn rw prisma migrate reset
```

:::info Database Seeds

<!--
If you started the second half the tutorial from the [Redwood Tutorial repo](https://github.com/redwoodjs/redwood-tutorial) you'll get an error after resetting the database—Prisma attempts to seed the database with a user and some posts to get you started, but the posts in that seed do not have the new required `userId` field! Open up `scripts/seed.js` and edit each post to add `userId: 1` to each:
-->

[Redwood Tutorial repo](https://github.com/redwoodjs/redwood-tutorial) から後半のチュートリアルを開始した場合、データベースをリセットした後にエラーが発生します -- Prismaがデータベースにユーザとブログ記事をシードしようとしましたが、シードのブログ記事には新しい必須フィールドである `userId` がありません！
`scripts/seed.js` を開き、各ブログ記事をに `userId: 1` を追加してください：

```javascript title=scripts/seed.js
{
  id: 1,
  name: 'John Doe',
  title: 'Welcome to the blog!',
  body:
    "I'm baby single- origin coffee kickstarter lo - fi paleo skateboard.Tumblr hashtag austin whatever DIY plaid knausgaard fanny pack messenger bag blog next level woke.Ethical bitters fixie freegan,helvetica pitchfork 90's tbh chillwave mustache godard subway tile ramps art party. Hammock sustainable twee yr bushwick disrupt unicorn, before they sold out direct trade chicharrones etsy polaroid hoodie. Gentrify offal hoodie fingerstache.",
  // highlight-next-line
  userId: 1,
},
```

<!--
Now run `yarn rw prisma migrate reset` and and...you'll get a different error. But that's okay, read on...
-->

ここで `yarn rw prisma migrate reset` を実行すると...違うエラーが表示されます。でも大丈夫です、続きを読んでください...

:::

<!--
We've got an error here because running a database `reset` doesn't also apply pending migrations. So we're trying to set a `userId` where one doesn't exist in the database (it does exist in Prisma generated client libs though, so it thinks that there *should* be one, even if it doesn't exist in the database yet).
-->

データベースの `reset` を実行しても、保留中のマイグレーションが適用されないので、ここでエラーが発生しました。
つまり、データベースに存在しない `userId` を設定しようとしています（Prisma が生成したクライアントライブラリには存在するので、データベースにまだ存在しなくても、存在 *するはず* だと考えているのです）。

<!--
It may feel like we're stuck, but note that the database did reset successfully, it's just the seed that failed. So now let's migrate the database to add the new `userId` to `Post`, and then re-run the seed to populate the database, naming it something like "add userId to post":
-->

行き詰まったように感じるかもしれませんが、データベースは正常にリセットされ、シードが失敗しただけであることに注意してください。
そこで、新しい `userId` を `Post` に追加するためにデータベースにマイグレーションを実行し、データベースにデータを投入するためにシードを再実行し、 "add userId to post" のような名前をつけます：

```
yarn rw prisma migrate dev
```

<!--
And then the seed:
-->

そしてシードを実行します：

```
yarn rw prisma db seed
```

:::info

<!--
If you didn't start your codebase from the [Redwood Tutorial repo](https://github.com/redwoodjs/redwood-tutorial) then you'll now have no users or posts in the database. Go ahead and create a user by going to [http://localhost:8910/signup](http://localhost:8910/signup) but don't create any posts yet! Change the user's role to be "admin", either by using the console introduced in the [previous page](/docs/canary/tutorial/chapter7/rbac#changing-roles-on-a-user) or by [opening Prisma Studio](/docs/canary/tutorial/chapter2/getting-dynamic#prisma-studio) and changing it directly in the database.
-->

[Redwood Tutorial repo](https://github.com/redwoodjs/redwood-tutorial) からコードベースを立ち上げなかった場合、データベースにはユーザもブログ記事も1つもありません。
[http://localhost:8910/signup](http://localhost:8910/signup) にアクセスしてユーザを作成します。ただし、まだブログ記事は作成しないでください！
ユーザのロールを "admin" に変更します。[previous page](/docs/canary/tutorial/chapter7/rbac#changing-roles-on-a-user) で紹介したコンソールを使用するか、 [Prisma Studio](/docs/canary/tutorial/chapter2/getting-dynamic#prisma-studio) を開いて直接データベースで変更することができます。

:::

### Add Fields to the SDL and Service

<!--
Let's think about where we want to show our new relationship. For now, probably just on the homepage and article page: we'll display the author of the post next to the title. That means we'll want to access the user from the post in a GraphQL query something like this:
-->

新しいリレーションシップをどこに表示するか考えてみましょう。今のところ、ホームページとブログ記事ページだけでしょう：では、ブログ記事の著者をタイトルの横に表示しましょう。
つまり、次のようなGraphQLクエリで、ブログ記事からユーザにアクセスしたいのです：

```graphql
post {
  id
  title
  body
  createdAt
  user {
    name
  }
}
```

<!--
To enable this we'll need to make two modifications on the api side:

1. Add the `user` field to the `posts` SDL
2. Add a **relation resolver** for the `user` in the `posts` service
-->

これを可能にするためには、APIサイドで2つの修正を行う必要があります：

1. `posts` SDL に `user` フィールドを追加
2. `posts` サービスの `user` に **relation resolver** を追加

#### Add User to Posts SDL

```javascript title=api/src/graphql/posts.sdl.js
  type Post {
    id: Int!
    title: String!
    body: String!
    createdAt: DateTime!
    // highlight-next-line
    user: User!
  }
```

:::info What about the mutations?

<!--
We did *not* add `user` or `userId` to the `CreatePostInput` or `UpdatePostInput` types. Although we want to set a user on each newly created post, we don't want just anyone to do that via a GraphQL call! You could easily create or edit a post and assign it to someone else by just modifying the GraphQL payload. We'll save assigning the user to just the service, so it can't be manipulated by the outside world.
-->

`CreatePostInput` や `UpdatePostInput` 型に `user` や `userId` を追加することはして *いません* 。新しく作成されたブログ記事にユーザを設定したいのですが、GraphQL 呼び出しによって誰でもそれを実行できるようにしたくはないのです！GraphQLペイロードを変更するだけで、簡単にブログ記事を作成または編集して、他の誰かに割り当てることができます。ユーザの割り当てをサービスだけに保存して、外部からは操作できないようにします。

:::

<!--
Here we're using `User!` with an exclamation point because we know that every `Post` will have an associated user to it—this field will never be `null`.
-->

ここでは感嘆符付きの `User!` を使っていますが、これはすべての `Post` がそれに関連するユーザを持つことが分かっているからです -- このフィールドは決して `null` にはなりません。

#### Add User Relation Resolver

<!--
This one is a little tricker: we need to add a "lookup" in the `posts` service, so that it knows how to get the associated user. When we generated the `comments` SDL and service we got this **relation resolver** created for us. We could re-run the service generator for `Post` but that could blow away changes we made to this file. Our only option would be to include the `--force` flag since the file already exists, which will write over everything. In this case we'll just add the resolver manually:
-->

これは少しトリッキーです： `posts` サービスに "lookup" を追加して、関連するユーザを取得する方法を知る必要があります。`comments` SDL とサービスを生成したときに、この **relation resolver** が作成されました。`Post` サービス用のサービスジェネレータを再実行することもできますが、 このファイルに加えた変更が吹っ飛ぶ可能性があります。唯一の選択肢は、ファイルがすでに存在しているので、 `--force` フラグを含めることです。これで全て上書きされます。この場合、手動でリゾルバを追加することになります：

```javascript title=api/src/services/posts/posts.js
import { db } from 'src/lib/db'

export const posts = () => {
  return db.post.findMany()
}

export const post = ({ id }) => {
  return db.post.findUnique({
    where: { id },
  })
}

export const createPost = ({ input }) => {
  return db.post.create({
    data: input,
  })
}

export const updatePost = ({ id, input }) => {
  return db.post.update({
    data: input,
    where: { id },
  })
}

export const deletePost = ({ id }) => {
  return db.post.delete({
    where: { id },
  })
}

// highlight-start
export const Post = {
  user: (_obj, { root }) =>
    db.post.findFirst({ where: { id: root.id } }).user(),
}
// highlight-end
```

<!--
This can be non-intuitive so let's step through it. First, declare a variable with the same name as the model this service is for: `Post` for the `posts` service. Now, set that to an object containing keys that are the same as the fields that are going to be looked up, in this case `user`. When GraphQL invokes this function it passes a couple of arguments, one of which is `root` which is the object that was resolved to start with, in this case the `post` in our GraphQL query:
-->

これは直感的でない場合があるので、順を追って説明します。まず、このサービスが対象とするモデルと同じ名前の変数を宣言します： `posts` サービスでは `Post` です。そうしたら、この変数には、検索対象となるフィールドと同じキーを持つオブジェクトを設定します。この場合は `user` です。GraphQLがこの関数を呼び出すとき、いくつかの引数を渡します。そのうちのひとつが `root` で、これは最初に解決されたオブジェクト、この場合はGraphQLクエリの `post` に渡されます：

```graphql
post {   <- root
  id
  title
  body
  createdAt
  user {
    name
  }
}
```

<!--
That post will already be retrieved from the database, and so we know its `id`. `root` is that object, so can simply call `.id` on it to get that property. Now we know everything we need to to make a `findFirst()` query in Prisma, giving it the `id` of the record we already found, but returning the `user` associated to that record, rather than the `post` itself.
-->

ブログ記事はすでにデータベースから取得されているので、その `id` はわかっています。
`root` はそのオブジェクトなので、単純に `.id` を呼び出してそのプロパティを取得できます。
これで、Prismaで `findFirst()` クエリを作成するために必要なことが全てわかりました。すでに見つけたレコードの `id` を指定して、 `post` 自体ではなく、そのレコードに関連する `user` を返します。

<!--
We could also write this resolver as follows:
-->

リゾルバは次のようにも書くことができます：

```javascript
export const Post = {
  user: (_obj, { root }) =>
    db.user.findFirst({ where: { id: root.userId } }),
}
```

<!--
Note that if you keep the relation resolver above, but also included a `user` property in the post(s) returned from `posts` and `post`, this field resolver will still be invoked and whatever is returned will override any `user` property that exists already. Why? That's just how GraphQL works—resolvers, if they are present for a named field, will always be invoked and their return value used, even if the `root` already contains that data.
-->

上記のリレーションリゾルバを使いながら `posts` と `post` から返されるブログ記事に `user` プロパティを含める場合、このフィールドリゾルバは依然として呼び出され、返されるものはすでに存在する `user` プロパティをオーバーライドすることに注意しましょう。なぜでしょうか？それは、GraphQLがどのように動作するかということです -- リゾルバが存在する場合、たとえ `root` にすでにそのデータが含まれていても、常にリゾルバが呼び出され、その戻り値が使用されます。

:::info Prisma and the N+1 Problem

<!--
If you have any experience with database design and retrieval you may have noticed this method presents a less than ideal solution: for every post that's found, you need to perform an *additional* query just to get the user data associated with that `post`, also known as the [N+1 problem](https://medium.com/the-marcy-lab-school/what-is-the-n-1-problem-in-graphql-dd4921cb3c1a). This is just due to the nature of GraphQL queries: each resolver function really only knows about its own parent object, nothing about potential children.
-->

もしあなたがデータベースの設計や検索の経験があるなら、この方法が理想的な解決策ではないことにお気づきかもしれません：ブログ記事が見つかるたびに、その `post` に関連するユーザデータを取得するために *追加* のクエリを実行する必要があり、これは [N+1 problem](https://medium.com/the-marcy-lab-school/what-is-the-n-1-problem-in-graphql-dd4921cb3c1a) とも呼ばれます。これはGraphQLクエリの性質によるものです：各リゾルバ関数は自分の親オブジェクトについてだけ知っていて、潜在的な子オブジェクトについては何も知らないのです。

<!--
There have been several attempts to work around this issue. A simple one that includes no extra dependencies is to remove this field resolver and simply include `user` data along with any `post` you retrieve from the database:
-->

この問題を回避するために、いくつかの試みがなされてきました。余分な依存関係がないシンプルなものは、このフィールドリゾルバを削除して、データベースから取得した `post` と一緒に `user` データを含めるだけです：

```javascript
export const post = ({ id }) => {
  return db.post.findUnique({
    where: { id },
    include: {
      user: true
    }
  })
}
```

<!--
This may or may not work for you: you are incurring the overhead of always returning user data, even if that data wasn't requested in the GraphQL query. In addition, this breaks further nesting of queries: what if you wanted to return the user for this post, and a list of all the other posts IDs that they created?
-->

これはあなたの役に立つかもしれないし、役に立たないかもしれません：GraphQLクエリで要求されていなくても常にユーザデータを返すというオーバーヘッドが発生します。
さらに、これはクエリのネスティングを壊すことになります：このブログ記事のユーザと、そのユーザが作成した他のすべてのブログ記事IDのリストを返したいとしたらどうでしょうか？

```graphql
post {
  id
  title
  body
  createdAt
  user {
    name
    posts {
      id
    }
  }
}
```

<!--
This query would now fail because you only have `post.user` available, not `post.user.posts`.
-->

このクエリは失敗します。 `post.user` しか利用できず、`post.user.posts` は利用できないためです。

<!--
The Redwood team is actively looking into more elegant solutions to the N+1 problem, so stay tuned!
-->

Redwoodチームは、N+1問題に対するよりエレガントな解決策を積極的に検討していますので、ご期待ください！

:::

## Displaying the Author

<!--
In order to get the author info we'll need to update our Cell queries to pull the user's name.
-->

著者情報を取得するためには、セルのクエリを更新して、ユーザ名を取得しなければなりません。

<!--
There are two places where we publicly present a post:

1. The homepage
2. A single article page
-->

ブログ記事を公開する場は2つあります：

1. ホームページ
2. ブログ記事の個別ページ

<!--
Let's update their respective Cells to include the name of the user that created the post:
-->

それぞれのセルを更新して、ブログ記事を作成したユーザの名前を含めるようにしましょう：

```jsx title=web/src/components/ArticlesCell/ArticlesCell.js
export const QUERY = gql`
  query ArticlesQuery {
    articles: posts {
      id
      title
      body
      createdAt
      // highlight-start
      user {
        name
      }
      // highlight-end
    }
  }
`
```

```jsx title=web/src/components/ArticleCell/ArticleCell.js
export const QUERY = gql`
  query ArticleQuery($id: Int!) {
    article: post(id: $id) {
      id
      title
      body
      createdAt
      // highlight-start
      user {
        name
      }
      // highlight-end
    }
  }
`
```

<!--
And then update the display component that shows an Article:
-->

そして、Articleを表示する表示コンポーネントを更新します：

```jsx title=web/src/components/Article/Article.js
import { Link, routes } from '@redwoodjs/router'

const Article = ({ article }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
          // highlight-start
          <span className="ml-2 text-gray-400 font-normal">
            by {article.user.name}
          </span>
          // highlight-end
        </h2>
      </header>

      <div className="mt-2 text-gray-900 font-light">{article.body}</div>
    </article>
  )
}

export default Article
```

<!--
Depending on whether you started from the Redwood Tutorial repo or not, you may not have any posts to actually display. Let's add some! However, before we can do that with our posts admin/scaffold, we'll need to actually associate a user to the post they created. Remember that we don't allow setting the `userId` via GraphQL, which is what the scaffolds use when creating/editing records. But that's okay, we want this to only happen in the service anyway, which is where we're heading now.
-->

Redwood Tutorialのリポジトリから始めたかどうかによって、実際に表示するブログ記事がない場合があります。では、ブログ記事を追加してみましょう！しかし、ブログ記事管理画面あるいはscaffoldでそれを行う前に、実際にユーザをそのユーザが作成したブログ記事に関連付ける必要があります。GraphQL経由で `userId` を設定することはできません。これはscaffoldがレコードを作成/編集するときに使用するものです。しかし大丈夫です。これはいずれにせよ、サービスの中だけで行われるようにしたいのです。

## Accessing `currentUser` on the API side

<!--
There's a magical variable named `context` that's available within any of your service functions. It contains the context in which the service function is being called. One property available on this context is the user that's logged in (*if* someone is logged in). It's the same `currentUser` that is available on the web side:
-->

サービス関数の中では `context` という不思議な変数が使えます。この変数には、サービス関数が呼び出されているときのコンテキストが格納されています。このコンテキストで使用できるプロパティのひとつは、ログインしているユーザです（誰かがログインしている *のであれば* ）。これは、Webサイドで利用可能な `currentUser` と同じです：

```javascript title=api/src/service/posts/posts.js
export const createPost = ({ input }) => {
  return db.post.create({
    // highlight-next-line
    data: { ...input, userId: context.currentUser.id }
  })
}
```

<!--
So `context.currentUser` will always be around if you need access to the user that made this request. We'll take their user `id` and appened it the rest of the incoming data from the scaffold form when creating a new post. Let's try it out!
-->

そのため、このリクエストを行ったユーザにアクセスする必要がある場合は、常に `context.currentUser` が存在することになります。このユーザの `id` を取得し、新しいブログ記事を作成するときに scaffold フォームから入力される残りのデータを適用します。やってみましょう！

<!--
You should be able to create a post via the admin now:
-->

これでブログ記事管理画面からブログ記事を作成できるはずです：

<img width="937" alt="image" src="https://user-images.githubusercontent.com/300/193152401-d98b488e-dd71-475a-a78c-6cd5233e5bee.png" />

<!--
And going back to the hompage should actually start showing posts and their authors!
-->

そしてホームページに戻ると、実際にブログ記事とその著者が表示されるようになるはずです！

<img width="937" alt="image" src="https://user-images.githubusercontent.com/300/193152524-2715e49d-a1c3-43a1-b968-84a4f8ae3846.png" />

## Only Show a User Their Posts in Admin

<!--
Right now any admin that visits `/admin/posts` can still see all posts, not only their own. Let's change that.
-->

今のところ `/admin/posts` にアクセスした管理者は、自分のブログ記事だけでなく、すべてのブログ記事を見ることができます。これを変更しましょう。

<!--
Since we know we have access to `context.currentUser` we can sprinkle it throughout our posts service to limit what's returned to only those posts that the currently logged in user owns:
-->

このように `context.currentUser` にアクセスできることがわかったので、これをpostsサービス全体に散りばめ、現在ログインしているユーザが所有しているブログ記事だけに返すものを限定することができます：

```javascript title=api/src/services/posts/posts.js
import { db } from 'src/lib/db'

export const posts = () => {
  // highlight-next-line
  return db.post.findMany({ where: { userId: context.currentUser.id } })
}

export const post = ({ id }) => {
  // highlight-start
  return db.post.findFirst({
    where: { id, userId: context.currentUser.id },
  })
  // highlight-end
}

export const createPost = ({ input }) => {
  return db.post.create({
    data: { ...input, userId: context.currentUser.id },
  })
}

export const updatePost = ({ id, input }) => {
  return db.post.update({
    data: input,
    where: { id },
  })
}

export const deletePost = ({ id }) => {
  return db.post.delete({
    where: { id },
  })
}

export const Post = {
  user: (_obj, { root }) =>
    db.post.findFirst({ where: { id: root.id } }).user(),
}
```

:::info Prisma's `findUnique()` vs. `findFirst()`

<!--
Note that we switched from `findUnique()` to `findFirst()` here. Prisma's `findUnique()` requires that any attributes in the `where` clause have unique indexes, which `id` does, but `userId` does not. So we need to switch to the `findFirst()` function which allows you to put whatever you want in the `where`, which may return more than one record, but Prisma will only return the first of that set. In this case we know there'll always only be one, because we're selecting by `id` *in addition* to `userId`.
-->

ここで `findUnique()` から `findFirst()` に変更したことに注意してください。Prisma の `findUnique()` は、 `where` 節に含まれるすべての属性がユニークインデックスを持つことが前提で、 `id` はこの前提を満たしていますが、 `userId` は満たしていません。そのため `findFirst()` 関数に変更する必要があります。この関数では、 `where` に好きなものを入れて、複数のレコードを返すことができますが、Prisma はそのセットの最初のものだけを返します。この場合、 `userId` *に加えて* `id` で選択しているので、常に1つしかないことが分かっています。

:::

<!--
These changes make sure that a user can only see a list of their own posts, or the detail for a single post that they own.
-->

この変更により、ユーザは自分のブログ記事の一覧、または自分が書いたブログ記事の詳細のみを見ることができるようになります。

<!--
What about `updatePost` and `deletePost`? They aren't limited to just the `currentUser`, which would let anyone update or delete a post if they made a manual GraphQL call! That's not good. We'll deal with those [a little later](#update-and-delete).
-->

`updatePost` と `deletePost` についてはどうでしょうか？
これらは `currentUser` だけには制限されていないので、手動で GraphQL を呼び出せば誰でもブログ記事を更新したり削除したりできることになります！それはまずいですね。それらは [少し後で](#update-and-delete) 対処することにしましょう。

<!--
But there's a problem with the updates we just made: doesn't the homepage also use the `posts` service to display all the articles for the homepage? This code update would limit the homepage to only showing a logged in user's own posts and no one else! And what happens if someone who is *not* logged in goes to the homepage? ERROR.
-->

しかし、先程のアップデートで問題が発生しました：ホームページは `posts` サービスを使用して、ホームページのすべてのブログ記事を表示するのではないでしょうか？このコードの更新によって、ホームページはログインしているユーザのブログ記事だけを表示するように制限され、他のユーザのブログ記事は表示されなくなります！そして、もしログインしていない人がホームページにアクセスしたらどうなるのでしょうか？ ERROR

<!--
How can we return one list of posts in the admin, and a different list of posts for the homepage?
-->

ブログ記事管理画面ではあるブログ記事のリストを返し、ホームページでは別のブログ記事のリストを返すにはどうしたらよいでしょうか？

## An AdminPosts Service

<!--
We could go down the road of adding variables in the GraphQL queries, along with checks in the existing `posts` service, that return a different list of posts whether you're on the homepage or in the admin. But this complexity adds a lot of surface area to test and some fragility if someone goes in there in the future—they have to be very careful not to add a new condition or negate an existing one and accidentally expose your admin functionality to exploits.
-->

GraphQL クエリに変数を追加して、既存の `posts` サービスでチェックし、ホームページとブログ記事管理画面のどちらにいるかで異なるブログ記事のリストを返すようにすることもできます。
しかし、この複雑さは、テストしなければならない多くの観点を追加し、将来誰かがそこに入ってきたときに壊れやすくなります -- 新しい条件を追加したり、既存の条件を無効にしたりして、誤ってブログ記事管理機能を悪用されないようにすごく注意しなければなりません。

<!--
What if we created *new* GraphQL queries for the admin views of posts? They would have automatic security checks thanks to `@requireAdmin`, no custom code required. These new queries will be used in the admin posts pages, and the original, simple `posts` service will be used for the homepage and article detail page.
-->

もしブログ記事管理画面用に *新しい* GraphQL クエリを作成したらどうでしょうか？
これらは `@requireAdmin` のおかげで自動的にセキュリティチェックが行われ、カスタムコードは必要ありません。
これらの新しいクエリはブログ記事管理画面で使われ、元々のシンプルな `posts` サービスはホームページとブログ記事詳細ページで使用されるでしょう。

<!--
There are several steps we'll need to complete:

1. Create a new `adminPosts` SDL that defines the types
2. Create a new `adminPosts` service
3. Update the posts admin GraphQL queries to pull from `adminPosts` instead of `posts`
-->

いくつかのステップを経て、完成させる必要があります：

1. 型を定義した `adminPosts` SDL を新規作成
2. 新しい `adminPosts` サービスを作成
3. ブログ記事管理画面の GraphQL クエリを更新し、`posts` ではなく `adminPosts` から取得

### Create the `adminPosts` SDL

<!--
Let's keep the existing `posts.sdl.js` and make that the "public" interface. Duplicate that SDL, naming it `adminPosts.sdl.js`, and modify it like so:
-->

既存の `posts.sdl.js` を残し、それを "public" インターフェースとします。その SDL を複製し、名前を `adminPosts.sdl.js` とし、以下のように修正します：

```javascript title=api/src/graphql/adminPosts.sdl.js
export const schema = gql`
  type Query {
    adminPosts: [Post!]! @requireAuth(roles: ["admin"])
    adminPost(id: Int!): Post @requireAuth(roles: ["admin"])
  }

  input CreatePostInput {
    title: String!
    body: String!
  }

  input UpdatePostInput {
    title: String
    body: String
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post! @requireAuth(roles: ["admin"])
    updatePost(id: Int!, input: UpdatePostInput!): Post! @requireAuth(roles: ["admin"])
    deletePost(id: Int!): Post! @requireAuth(roles: ["admin"])
  }
`
```

```javascript title=api/src/graphql/posts.sdl.js
export const schema = gql`
  type Post {
    id: Int!
    title: String!
    body: String!
    createdAt: DateTime!
    user: User!
  }

  type Query {
    posts: [Post!]! @skipAuth
    post(id: Int!): Post @skipAuth
  }
`
```

<!--
So we keep a single type of `Post` since the data contained within it is the same, and either SDL file will return this same data type. We can remove the mutations from the `posts` SDL since the general public will not need to access those. We move create, update and delete mutations to the new `adminPosts` SDL, and rename the two queries from `posts` to `adminPosts` and `post` to `adminPost`. In case you didn't know: every query/mutation must have a unique name across your entire application!
-->

そのため、`Post` という単一の型を維持します。なぜなら、その中に含まれるデータは同じであり、どちらの SDL ファイルもこの同じデータ型を返すからです。
一般ユーザはミューテーションにアクセスする必要がないため、`posts` SDL からミューテーションを削除することができます。
ミューテーションの作成、更新、削除を新しい `adminPosts` SDL に移動し、2つのクエリの名前を `posts` から `adminPosts` に、`post` から `adminPost` に変えました。
ご存知でない方のために説明しますと ：すべてのクエリ/ミューテーションは、アプリケーション全体で一意な名前でなければなりません！

<!--
In `adminPosts` we've updated the queries to use `@requireAuth` instead of `@skipAuth`. Now that we have dedicated queries for our admin pages, we can lock them down to only allow access when authenticated.
-->

`adminPosts` では、クエリを更新して `@skipAuth` ではなく `@requireAuth` を使用するようにしました。これでブログ記事管理画面専用のクエリができたので、認証されたときだけアクセスを許可するように鍵をかけることができます。

### Create the `adminPosts` Service

<!--
Next let's create an `adminPosts` service. We'll need to move our create/update/delete mutations to it, as the name of the SDL needs to match the name of the service:
-->

次に `adminPosts` サービスを作成します。SDL の名前をサービスの名前と一致させる必要があるので、作成/更新/削除のミューテーションをそこに移動させる必要があります：

```javascript title=api/src/services/adminPosts/adminPosts.js
import { db } from 'src/lib/db'

export const adminPosts = () => {
  return db.post.findMany({ where: { userId: context.currentUser.id } })
}

export const adminPost = ({ id }) => {
  return db.post.findFirst({
    where: { id, userId: context.currentUser.id },
  })
}

export const createPost = ({ input }) => {
  return db.post.create({
    data: { ...input, userId: context.currentUser.id },
  })
}

export const updatePost = ({ id, input }) => {
  return db.post.update({
    data: input,
    where: { id },
  })
}

export const deletePost = ({ id }) => {
  return db.post.delete({
    where: { id },
  })
}
```

<!--
(Again, don't forget the change from `findUnique()` to `findFirst()`.) And update `posts` to remove some of the functions that live in `adminPosts` now:
-->

（繰り返しますが、 `findUnique()` から `findFirst()` への変更も忘れないでください。）そして、 `posts` を更新して、現在 `adminPosts` にある関数のいくつかを削除します：

```javascript title=api/src/services/posts/posts.js
import { db } from 'src/lib/db'

export const posts = () => {
  return db.post.findMany()
}

export const post = ({ id }) => {
  return db.post.findUnique({ where: { id } })
}

export const Post = {
  user: (_obj, { root }) =>
    db.post.findFirst({ where: { id: root.id } }).user(),
}
```

<!--
We've removed the `userId` lookup in the `posts` service so we're back to returning every post (for `posts`) or a single post (regardless of who owns it, in `post`).
-->

`posts` サービスの `userId` 検索を削除したので、すべてのブログ記事（ `posts` ） または単一のブログ記事（ `post` では誰が所有しているかに関係なく）を返すようになりました。

<!--
Note that we kept the relation resolver here `Post.user`, and there's none in `adminPosts`: since the queries and mutations from both SDLs still return a `Post`, we'll want to keep that relation resolver with the service that matches that original SDL by name: `graphql/posts.sdl.js` => `services/posts/posts.js`.
-->

リレーションリゾルバは `Post.user` にあり、 `adminPosts` にはないことに注意しましょう：どちらの SDL もクエリとミューテーションは `Post` を返すので、リレーションリゾルバは元の SDL と名前が一致するサービスに残しておくことになるでしょう： `graphql/posts.sdl.js` => `services/posts/posts.js`

### Update the GraphQL Queries

<!--
Finally, we'll need to update several of the scaffold components to use the new `adminPosts` and `adminPost` queries (we'll limit the code snippets below to just the changes to save some room, this page is getting long enough!):
-->

最後に、新しい `adminPosts` と `adminPost` クエリを使用するために、いくつかの scaffold コンポーネントを更新する必要があります（スペースを節約するために、以下のコードスニペットは変更点だけです。このページも十分長くなってきました！）。

```javascript title=web/src/components/Post/EditPostCell/EditPostCell.js
export const QUERY = gql`
  query FindPostById($id: Int!) {
    // highlight-next-line
    post: adminPost(id: $id) {
      id
      title
      body
      createdAt
    }
  }
`
```

```jsx title=web/src/components/Post/PostCell/PostCell.js
export const QUERY = gql`
  query FindPostById($id: Int!) {
    // highlight-next-line
    post: adminPost(id: $id) {
      id
      title
      body
      createdAt
    }
  }
`
```

```jsx title=web/src/components/Post/PostsCell/PostsCell.js
export const QUERY = gql`
  query POSTS {
    // highlight-next-line
    posts: adminPosts {
      id
      title
      body
      createdAt
    }
  }
`
```

<!--
If we didn't use the `posts: adminPosts` syntax, we would need to rename the argument coming into the `Success` component below to `adminPosts`. This syntax renames the result of the query to `posts` and then nothing else below needs to change!
-->

もし、 `posts: adminPosts` という構文を使わなかった場合は、以下の `Success` コンポーネントに来る引数を `adminPosts` にリネームする必要があるでしょう。この構文では、クエリの結果を `posts` にリネームします！

<!--
We don't need to make any changes to the "public" views (like `ArticleCell` and `ArticlesCell`) since those will continue to use the original `posts` and `post` queries, and their respective resolvers.
-->

"public" ビュー（ `ArticleCell` や `ArticlesCell` など）は何も変更しなくてよいです。元々の `posts` と `post` クエリ、およびそれぞれのリゾルバを引き続き使います。

## Update and Delete

<!--
Okay, let's take care of `updatePost` and `deletePost` now. Why couldn't we just do this?
-->

よし。 `updatePost` と `deletePost` をに目を向けましょう。なぜこうすることができなかったのでしょうか？

```javascript
export const updatePost = ({ id, input }) => {
  return db.post.update({
    data: input,
    // highlight-next-line
    where: { id, userId: context.currentUser.id },
  })
}
```

<!--
Because like `findUnique()`, Prisma only wants to update records based on fields with unique indexes, in this case that's just `id`. So we need to keep this to just an `id`. But how do we verify that the user is only updating/deleting a record that they own?
-->

なぜなら、 `findUnique()` と同様に、Prisma はユニークインデックスを持つフィールドに基づいてレコードを更新したいのであって、この場合は `id` だけです。そのため、ここは `id` だけにしておく必要があります。しかし、ユーザが自分が所有するレコードだけを更新/削除していることをどのように確認すればよいでしょうか？

<!--
We could select the record first, make sure the user owns it, and only then let the `update()` commence:
-->

まずレコードを select して、ユーザがそのレコードを所有していることを確認し、それから `update()` をすることができます：

```javascript
// highlight-next-line
import { ForbiddenError } from '@redwoodjs/graphql-server'

// highlight-start
export const updatePost = async ({ id, input }) => {
  if (await adminPost({ id })) {
    return true
  } else {
    throw new ForbiddenError("You don't have access to this post")
  }
  // highlight-end

  return db.post.update({
    data: input,
    where: { id },
  })
}
```

<!--
We're using the `adminPost()` service function, rather than making another call to the database (note that we had to async/await it to make sure we have the post before continuing). Composing services like this is something Redwood was designed to encourage: services' functions act as resolvers for GraphQL, but they're also just plain JS functions and can be called wherever you need. And the reasons why you'd want to do this are clearly demonstrated here: `adminPost()` already limits the found record to be only one owned by the logged in user, so that logic is already encapsulated here, and we can be sure that any time an admin wants to do something with a single post, it runs through this code and uses the same logic every time.
-->

データベースへの別の呼び出しを行うのではなく、`adminPost()`サービス関数を使用しています（続ける前にポストがあることを確認するために async/await しなければならなかったことに注意してください）。このようなサービスの組み合わせは、Redwoodでは奨励するように設計されています：サービスの関数はGraphQLのリゾルバとして機能しますが、単なるJSの関数でもあり、必要な場所で呼び出すことができます。そして、なぜこのようなことをしたいのか、その理由がここで明確に示されています：`adminPost()` はすでに、見つかったレコードをログインしているユーザが所有するものだけに制限しているので、そのロジックはすでにここにカプセル化されており、管理者が単一のブログ記事で何かをしたいときはいつでも、このコードを実行し、毎回同じロジックを使用することを確認することができます。

<!--
This works, but we'll need to do the same thing in `deletePost`. Let's extract that check for the post existence into a function:
-->

これは動作しますが、同じことを `deletePost` で行う必要があります。ブログ記事が存在するかどうかのチェックを関数に抜き出してみましょう：

```javascript
// highlight-start
const verifyOwnership = async (id) {
  if (await adminPost({ id })) {
    return true
  } else {
    throw new ForbiddenError("You don't have access to this post")
  }
}
// highlight-end

export const updatePost = async ({ id, input }) => {
  // highlight-next-line
  await verifyOwnership(id)

  return db.post.update({
    data: input,
    where: { id },
  })
}
```
<!--
Simple! Our final `adminPosts` service ends up looking like:
-->

簡単ですね！最終的な `adminPosts` サービスは次のようになります：

```javascript
import { ForbiddenError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

const validateOwnership = async ({ id }) => {
  if (await adminPost({ id })) {
    return true
  } else {
    throw new ForbiddenError("You don't have access to this post")
  }
}

export const adminPosts = () => {
  return db.post.findMany({ where: { userId: context.currentUser.id } })
}

export const adminPost = ({ id }) => {
  return db.post.findFirst({
    where: { id, userId: context.currentUser.id },
  })
}

export const createPost = ({ input }) => {
  return db.post.create({
    data: { ...input, userId: context.currentUser.id },
  })
}

export const updatePost = async ({ id, input }) => {
  await validateOwnership({ id })

  return db.post.update({
    data: input,
    where: { id },
  })
}

export const deletePost = async ({ id }) => {
  await validateOwnership({ id })

  return db.post.delete({
    where: { id },
  })
}

```

## Wrapping Up

<!--
Whew! Let's try several different scenarios (this is the kind of thing that the QA team lives for), making sure everything is working as expected:

* A logged out user *should* see all posts on the homepage
* A logged out user *should* be able to see the detail for a single post
* A logged out user *should not* be able to go to /admin/posts
* A logged out user *should not* see moderation controls next to comments
* A logged in admin user *should* see all articles on the homepage (not just their own)
* A logged in admin user *should* be able to go to /admin/posts
* A logged in admin user *should* be able to create a new post
* A logged in admin user *should not* be able to see anyone else's posts in /admin/posts
* A logged in admin user *should not* see moderation controls next to comments (unless you modified that behavior at the end of the last page)
* A logged in moderator user *should* see moderation controls next to comments
* A logged in moderator user *should not* be able to access /admin/posts
-->

ふぅ〜！いくつかの異なるシナリオを試し、すべてが期待通りに動作していることを確認しましょう（このようなことのためにQAチームは生きているのです）：

* ログアウトしたユーザは、ホームページのすべてのブログ記事を見ることができるはず
* ログアウトしたユーザは、1つのブログ記事の詳細を見ることができるはず
* ログアウトしたユーザは、/admin/postsに行くことができ *ない* はず
* ログアウトしたユーザは、コメントの横にあるモデレーションコントロールを見ることができ *ない* はず
* ログインした管理者ユーザは、ホームページのすべての記事を見ることができるはず（自分の記事だけではなく）
* ログインした管理者ユーザは、/admin/postsに行くことができるはず
* ログインした管理者ユーザは、新しいブログ記事を作成することができるはず
* ログインした管理者ユーザは、/admin/posts にある他の人のブログ記事を見ることができ *ない* はず
* ログインした管理者ユーザは、コメントの横にあるモデレーションコントロールを見ることができ *ない* はず（最後のページでその動作を変更した場合を除く）
* ログインしたモデレータユーザは、コメントの横にモデレーションコントロールが表示されるはず
* ログインしたモデレータユーザは /admin/posts にアクセスでき *ない* べき

<!--
In fact, you could write some new tests to make sure this functionality doesn't mistakenly change in the future. The quickest would probably be to create `adminPosts.scenarios.js` and `adminPosts.test.js` files to go with the new service and verify that you are only returned the posts owned by a given user. You can [mock currentUser](/docs/testing#mockcurrentuser-on-the-api-side) to simulate someone being logged in or not, with different roles. You could add tests for the Cells we modified above, but the data they get is dependent on what's returned from the service, so as long as you have the service itself covered you should be okay. The 100% coverage folks would argue otherwise, but while they're still busy writing tests we're out cruising in our new yacht thanks to all the revenue from our newly launched (with *reasonable* test coverage) features!
-->

実際のところ、この機能が将来誤って変更されないようにするために、新しいテストを書くことができます。一番手っ取り早いのは、新しいサービスに対応するために `adminPosts.scenarios.js` と `adminPosts.test.js` を作成し、指定したユーザが所有するブログ記事のみを返すことを確認することでしょうか。[currentUserのモック](/docs/testing#mockcurrentuser-on-the-api-side) を使って、誰かがログインしているかどうか、異なるロールでシミュレートすることができます。上で修正したセルのテストを追加することもできますが、これらのテストが取得するデータはサービスから返されるものに依存しているので、サービス自体をカバーしていれば問題ありません。100%カバレッジの人たちはそうではないと主張するでしょうが、彼らがまだテストを書くのに忙しい間、私たちは新しく立ち上げた（*妥当な* テストカバレッジの）機能による収益のおかげで、新しいヨットでクルージングに出かけているのです!

<!--
Did it work? Great! Did something go wrong? Can someone see too much, or too little? Double check that all of your GraphQL queries are updated and you've saved changes in all the opened files.
-->

うまくいきましたか？素晴らしい！何か問題があったのでしょうか？誰かが見過ぎたり、見落としたりしませんか？GraphQLクエリがすべて更新され、開いているすべてのファイルに変更が保存されていることを再確認してください。
