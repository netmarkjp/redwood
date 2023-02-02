# Role-Based Access Control (RBAC)

<!--
Imagine a few weeks in the future of our blog when every post hits the front page of the New York Times and we're getting hundreds of comments a day. We can't be expected to come up with quality content each day *and* moderate the endless stream of (mostly well-meaning) comments! We're going to need help. Let's hire a comment moderator to remove obvious spam and any comments that don't heap praise on our writing ability. You know, to help make the internet a better place.
-->

数週間後、私たちのブログのすべてのブログ記事がNew York Timesの一面を飾り、一日に何百ものコメントが寄せられるようになることを想像してみてください。毎日質の高いコンテンツを考え出し、 *かつ* 無限に続く（ほとんどが善意の）コメントを管理することは、とてもできません！助けが必要です。コメントモデレータを雇って、明らかなスパムや、私たちの文章力を賞賛しないコメントを削除してもらいましょう。インターネットをより良い場所にするためにね。

<!--
We already have a login system for our blog, but right now it's all-or-nothing: you either get access to create blog posts, or you don't. In this case our comment moderator(s) will need logins so that we know who they are, but we're not going to let them create new blog posts. We need some kind of role that we can give to our two kinds of users so we can distinguish them from one another.
-->

ブログにログインシステムはすでにありますが、今はオール・オア・ナッシングです：ブログ記事を作成するためのアクセス権を得るか、何もないかです。この場合、コメントモデレータは、彼らが誰であるかを知るためにログインが必要ですが、彼らに新しいブログ記事を作成させるつもりはありません。この2種類のユーザを区別するために、何らかのロール（役割）が必要です。

<!--
Enter **role-based access control**, thankfully shortened to the common phrase **RBAC**. Authentication says who the person is, authorization says what they can do. "Access control" is another way to say authorization. Currently the blog has the lowest common denominator of authorization: if they are logged in, they can do everything. Let's add a "less than everything, but more than nothing" level.
-->

**role-based access control** 、ありがたいことに一般的なフレーズである **RBAC** に短縮されています。認証はその人が誰であるかを示し、認可はその人が何ができるかを示します。"Access control" （アクセス制御）は認可を表す別の言い方です。現在、ブログには最小公倍数的な認証があります：ログインしていれば、何でもできます。"全てではないが、何もないよりはマシ" というレベルを追加してみましょう。

### Defining Roles

<!--
We've got a User model so let's add a `roles` property to that:
-->

既存のUserモデルがあるので、それに `roles` プロパティを追加してみましょう：

```javascript title="api/db/schema.prisma"
model User {
  id                  Int @id @default(autoincrement())
  name                String?
  email               String @unique
  hashedPassword      String
  salt                String
  resetToken          String?
  resetTokenExpiresAt DateTime?
  // highlight-next-line
  roles               String
}
```

<!--
Next we'll (try) to migrate the database:
-->

次に、データベースのマイグレーションを（試して）みます：

```bash
yarn rw prisma migrate dev
```

<!--
But that will fail with an error:
-->

しかし、それはエラーで失敗してしまいます：

```
• Step 0 Added the required column `role` to the `User` table without a default value. There are 1 rows in this table, it is not possible to execute this step.
```

<!--
What does this mean? We made `roles` a required field. But, we have a user in the database already (`1 rows in this table`). If we add that column to the database, it would have to be `null` for existing users since we didn't define a default. Let's create a default value so that not only can we apply this migration, but we're sure that any new users being created have some minimal level of permissions and we don't have to add even more code to check whether they have a role at all, let alone what it is.
-->

これは何を意味するのでしょうか？私たちは `roles` を必須フィールドにしました。しかし、データベースにはすでにユーザが存在します（ `1 rows in this table` ：このテーブルには1行のデータがあります）。このカラムをデータベースに追加すると、デフォルトを定義していないので、既存のユーザに対しては `null` にならざるを得ません。デフォルト値を指定して、このマイグレーションを適用できるだけでなく、新しく作成されるユーザがある程度の最小限のパーミッションを持つことを確認し、さらにコードを追加してロールを持っているかどうか、その内容もチェックする必要がないようにしましょう。

<!--
For now let's have two roles, `admin` and `moderator`. `admin` can create/edit/delete blog posts and `moderator` can only remove comments. Of those two `moderator` is the safer default since it's more restrictive:
-->

とりあえず、 `admin` と `moderator` の2つのロールを用意しましょう。 `admin` はブログ記事の作成/編集/削除ができ、`moderator` はコメントの削除のみできます。この2つのうち、より制限の多い `moderator` が安全なデフォルトです：

```javascript title="api/db/schema.prisma"
model User {
  id                  Int @id @default(autoincrement())
  name                String?
  email               String @unique
  hashedPassword      String
  salt                String
  resetToken          String?
  resetTokenExpiresAt DateTime?
  // highlight-next-line
  roles               String @default("moderator")
}
```

<!--
Now the migration should be able to be applied:
-->

これでマイグレーションが適用できるようになるはずです：

```bash
yarn rw prisma migrate dev
```

<!--
And you can name it something like "add roles to user".
-->

そして、 "add roles to user" のような名前を付けることができます。

<!--
If we log in and try to go the posts admin page at [http://localhost:8910/admin/posts](http://localhost:8910/admin/posts) everything works the same as it used to: we're not actually checking for the existence of any roles yet so that makes sense. In reality we'd only want users with the `admin` role to have access to the admin pages, but our existing user just became a `moderator` because of our default role. This is a great opportunity to actually setup a role check and see if we lose access to the admin!
-->

ログインして [http://localhost:8910/admin/posts](http://localhost:8910/admin/posts) のブログ記事管理画面に移動してみると、すべて以前と同じように動作しています：まだロールの存在を確認していないので、これは理にかなっています。実際には `admin` ロールを持つユーザだけが管理画面にアクセスできるようにしたいのですが、既存のユーザはデフォルトのロールのために `moderator` になっています。この機会に、実際にロールチェックをセットアップして、管理画面へのアクセスを失うかどうか確認してみましょう！

<!--
Before we do that, we'll need to make sure that the web side has access to the roles on `currentUser`. Take a look at `api/src/lib/auth.js`. Remember when we had to add `email` to the list of fields being included? We need to add `roles` as well:
-->

その前に、Webサイドが `currentUser` のロールにアクセスできることを確認する必要があります。 `api/src/lib/auth.js` を見てみましょう。含まれるフィールドのリストに `email` を追加しなければならなかったのを覚えていますか？同様に `roles` も追加する必要があります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="api/src/lib/auth.js"
export const getCurrentUser = async (session) => {
  return await db.user.findUnique({
    where: { id: session.id },
    // highlight-next-line
    select: { id: true, email: true, roles: true },
  })
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```javascript title="api/src/lib/auth.ts"
export const getCurrentUser = async (session) => {
  return await db.user.findUnique({
    where: { id: session.id },
    // highlight-next-line
    select: { id: true, email: true, roles: true },
  })
}
```

</TabItem>
</Tabs>

<ShowForTs>

### Fixing the hasRole function

<!--
At this point, you might notice an error in your `api/src/lib/auth.ts` file, in the `hasRole` function. TypeScript is trying to help you here, by highlighting that roles can never be an array of strings:
-->

この時点で、 `api/src/lib/auth.ts` ファイルの `hasRole` 関数にエラーがあることに気がつくかもしれません。TypeScriptはここで、ロールは決して文字列の配列にはなり得ないことを強調し、あなたを助けようとしているのです：

```ts title="api/src/lib/auth.ts"
export const hasRole = (roles: AllowedRoles): boolean => {

  // ...

    } else if (Array.isArray(currentUserRoles)) {
      // 👇 TypeScript will now be telling you 'some' doesn't exist on type never:
      // highlight-next-line
      return currentUserRoles?.some((allowedRole) => roles === allowedRole)
    }
  }
 ```

<!--
This is because we now know that the type of `currentUser.roles` is a `string` based on the type being returned from Prisma. So you can safely remove the block of code where it's checking if roles is an array:
-->

これは、Prismaから返された型から、 `currentUser.roles` の型が `string` であることがわかったからです。したがって、rolesが配列であるかどうかをチェックしているコードのブロックを安全に削除することができます：

```diff title="api/src/lib/auth.ts"
export const hasRole = (roles: AllowedRoles): boolean => {
  if (!isAuthenticated()) {
    return false
  }

  const currentUserRoles = context.currentUser?.roles

  if (typeof roles === 'string') {
    if (typeof currentUserRoles === 'string') {
      // roles to check is a string, currentUser.roles is a string
      return currentUserRoles === roles
-    } else if (Array.isArray(currentUserRoles)) {
-      // roles to check is a string, currentUser.roles is an array
-      return currentUserRoles?.some((allowedRole) => roles === allowedRole)
    }
  }

  if (Array.isArray(roles)) {
    if (Array.isArray(currentUserRoles)) {
      // roles to check is an array, currentUser.roles is an array
      return currentUserRoles?.some((allowedRole) =>
        roles.includes(allowedRole)
      )
    } else if (typeof currentUserRoles === 'string') {
      // roles to check is an array, currentUser.roles is a string
      return roles.some((allowedRole) => currentUserRoles === allowedRole)
    }
  }

  // roles not found
  return false
}
```

</ShowForTs>

### Restricting Access via Routes

<!--
The easiest way to prevent access to an entire URL is via the Router. The `<Private>` component takes a prop `roles` in which you can give a list of only those role(s) that should have access:
-->

URL全体へのアクセスを防ぐ最も簡単な方法は、ルータを使用することです。 `<Private>` コンポーネントは `roles` という props を受け取り、その中にアクセスを許可するロールのリストを指定することができます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/Routes.js"
// highlight-next-line
<Private unauthenticated="home" roles="admin">
  <Set wrap={ScaffoldLayout} title="Posts" titleTo="posts" buttonLabel="New Post" buttonTo="newPost">
    <Route path="/admin/posts/new" page={PostNewPostPage} name="newPost" />
    <Route path="/admin/posts/{id:Int}/edit" page={PostEditPostPage} name="editPost" />
    <Route path="/admin/posts/{id:Int}" page={PostPostPage} name="post" />
    <Route path="/admin/posts" page={PostPostsPage} name="posts" />
  </Set>
</Private>
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/Routes.tsx"
// highlight-next-line
<Private unauthenticated="home" roles="admin">
  <Set wrap={ScaffoldLayout} title="Posts" titleTo="posts" buttonLabel="New Post" buttonTo="newPost">
    <Route path="/admin/posts/new" page={PostNewPostPage} name="newPost" />
    <Route path="/admin/posts/{id:Int}/edit" page={PostEditPostPage} name="editPost" />
    <Route path="/admin/posts/{id:Int}" page={PostPostPage} name="post" />
    <Route path="/admin/posts" page={PostPostsPage} name="posts" />
  </Set>
</Private>
```

</TabItem>
</Tabs>

<!--
Now if you browse to [http://localhost:8910/admin/posts](http://localhost:8910/admin/posts) you should get redirected to the homepage. So far so good.
-->

これで [http://localhost:8910/admin/posts](http://localhost:8910/admin/posts) をブラウズすると、ホームページにリダイレクトされるはずです。ここまでは順調です。

### Changing Roles on a User

<!--
Let's use the Redwood console again to quickly update our admin user to actually have the `admin` role:
-->

Redwood コンソールを使って、admin ユーザが実際に `admin` ロールを持つようにさっと更新してみましょう：

```bash
yarn rw c
```

:::tip

<!--
You can use the `c` shortcut instead of `console`
-->

`console` の代わりに `c` ショートカットを使うことができます。

:::

<!--
Now we can update our user with a single command:
-->

これで、1つのコマンドでユーザを更新できるようになりました：

```bash
> db.user.update({ where: { id: 1 } , data: { roles: 'admin' } })
```

<!--
Which should return the new content of the user:
-->

これはユーザの新しいコンテンツを返すべきです：

```bash
{
  id: 1,
  name: null,
  email: 'admin@admin.com',
  hashedPassword: 'a12f3975a3722953fd8e326dd108d5645ad9563042fe9f154419361eeeb775d8',
  salt: '9abf4665293211adce1c99de412b219e',
  resetToken: null,
  resetTokenExpiresAt: null,
  roles: 'admin'
}
```

:::caution

<!--
If you re-used the same console session from the previous section, you'll need to quit it and start it again for it to know about the new Prisma data structure. If you still can't get the update to work, maybe your user doesn't have an `id` of `1`! Run `db.user.findMany()` first and then get the `id` of the user you want to update.
-->

前のセクションで使用したコンソールセッションを再利用する場合、新しいPrismaデータ構造を知るために、一旦終了して再度起動する必要があります。それでも更新がうまくいかない場合は、ユーザの `id` が `1` でないのかもしれません！まず `db.user.findMany()` を実行し、更新したいユーザの `id` を取得してください。

:::

<!--
Now head back to [http://localhost:8910/admin/posts](http://localhost:8910/admin/posts) and we should have access again. As the British say: brilliant!
-->

さて [http://localhost:8910/admin/posts](http://localhost:8910/admin/posts) に戻れば、再びアクセスできるようになるはずです。英国人が言うように：brilliant!

### Add a Moderator

<!--
Let's create a new user that will represent the comment moderator. Since this is in development you can just make up an email address, but if you needed to do this in a real system that verified email addresses you could use **The Plus Trick** to create a new, unique email address that is actually the same as your original email address!
-->

コメントモデレータを代表する新しいユーザを作成しましょう。これは開発中のものなので、メールアドレスを作成するだけでも構いませんが、メールアドレスを検証する実際のシステムでこれを行う必要がある場合は、 **The Plus Trick** を使用して、実際には元のメールアドレスと同じである、新しい固有のメールアドレスを作成することができます！

:::tip The Plus Trick

<!--
The Plus Trick is a very handy feature of the email standard known as a "boxname", the idea being that you may have other incoming boxes besides one just named "Inbox" and by adding `+something` to your email address you can specify which box the mail should be sorted into. They don't appear to be in common use these days, but they are ridiculously helpful for us developers when we're constantly needing new email addresses for testing: it gives us an infinite number of *valid* email addresses—they all come to your regular inbox!
-->

The Plus Trickは、 "boxname" として知られる電子メール規格の非常に便利な機能です。このアイデアは、"Inbox" （受信箱）という名前だけの受信箱以外に、他の受信箱があるかもしれないので、自分の電子メールアドレスに `+something` を追加することによって、メールをどの箱に振り分けるべきかを指定することができるというものです。

最近はあまり使われていないようですが、私たち開発者がテストのために常に新しいメールアドレスを必要としているときには、とんでもなく便利なものです：無限に *有効な* メールアドレスが手に入ります -- これらはすべて通常の受信箱に送られます！

<!--
Just append +something to your email address before the @:

* `jane.doe+testing@example.com` will go to `jane.doe@example.com`
* `dom+20210909@example.com` will go to `dom@example.com`
-->

メールアドレスの@の前に+somethingを付けるだけです：

* `jane.doe+testing@example.com` は `jane.doe@example.com` に配信される
* `dom+20210909@example.com` は `dom@example.com` に配信される

<!--
Note that not all providers support this plus-based syntax, but the major ones (Gmail, Yahoo, Microsoft, Apple) do. If you find that you're not receiving emails at your own domain, you may want to create a free account at one of these providers just to use for testing.
-->

注意してほしいのはすべてのプロバイダがこのプラスベースの構文をサポートしているわけではないことですが、主要なプロバイダ（Gmail、Yahoo、Microsoft、Apple）はサポートしています。もし、自分のドメインでメールが受信できない場合は、これらのプロバイダで無料のアカウントを作成し、テストに使用するとよいでしょう。

:::

<!--
In our case we're not sending emails anywhere, and don't require them to be verified, so you can just use a made-up email for now. `moderator@moderator.com` has a nice ring to it.
-->

私たちの場合、メールはどこにも送らないし、検証も必要ないので、とりあえず作り物のメールを使えばいいんです。 `moderator@moderator.com` はいい感じです。

:::info

<!--
If you disabled the new user signup as suggested at the end of the first part of the tutorial then you'll have a slightly harder time creating a new user (the Signup page is still enabled in the example repo for convenience). You could create one with the Redwood console, but you'll need to be clever—remember that we don't store the original password, just the hashed result when combined with a salt. Here's the commands to enter at the console for creating a new user (replace 'password' with your password of choice):
-->

チュートリアルの最初の部分の最後に提案したように新しいユーザのサインアップを無効にした場合、新しいユーザを作成するのが少し難しくなります（サインアップページは便宜上、サンプルリポジトリではまだ有効になっています）。Redwoodコンソールでユーザを作成することもできますが、次のような工夫が必要です -- 元のパスワードは保存せず、ソルトと組み合わせたハッシュ化された結果を保存することを忘れないでください。以下は、新しいユーザを作成するためにコンソールで入力するコマンドです（'password'はお好みのパスワードに置き換えてください）。

```javascript
const CryptoJS = require('crypto-js')
const salt = CryptoJS.lib.WordArray.random(128 / 8).toString()
const hashedPassword = CryptoJS.PBKDF2('password', salt, { keySize: 256 / 32 }).toString()
db.user.create({ data: { email: 'moderator@moderator.com', hashedPassword, salt } })
```

:::

<!--
Now if you log out as the admin and log in as the moderator you should *not* have access to the posts admin.
-->

管理者としてログアウトし、モデレータとしてログインした場合、ブログ記事管理画面へのアクセスはできないようにする必要があります。


### Restrict Access in a Component

<!--
Locking down a whole page is easy enough via the Router, but what about individual functionality within a page or component?
-->

ページ全体をロックするのはルータで簡単にできますが、ページやコンポーネント内の個々の機能をロックするのはどうでしょうか？

<!--
Redwood provides a `hasRole()` function you can get from the `useAuth()` hook (you may recall us using that to get `currentUser` and display their email address in Part 1) which returns `true` or `false` depending on whether the logged in user has the given role. Let's try it out by adding a `Delete` button when a moderator is viewing a blog post's comments:
-->

Redwood は `useAuth()` フックから取得できる `hasRole()` 関数を提供しています（パート 1 で `currentUser` を取得してメールアドレスを表示するのに使ったことを思い出してください）。この関数は、ログインしたユーザが与えられたロールを持っているかどうかに応じて `true` または `false` を返します。モデレータがブログ記事のコメントを閲覧しているときに `Delete` ボタンを追加してみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Comment/Comment.js"
// highlight-next-line
import { useAuth } from 'src/auth'

const formattedDate = (datetime) => {
  const parsedDate = new Date(datetime)
  const month = parsedDate.toLocaleString('default', { month: 'long' })
  return `${parsedDate.getDate()} ${month} ${parsedDate.getFullYear()}`
}

const Comment = ({ comment }) => {
  // highlight-start
  const { hasRole } = useAuth()
  const moderate = () => {
    if (confirm('Are you sure?')) {
      // TODO: delete comment
    }
  }
  // highlight-end

  return (
    // highlight-next-line
    <div className="bg-gray-200 p-8 rounded-lg relative">
      <header className="flex justify-between">
        <h2 className="font-semibold text-gray-700">{comment.name}</h2>
        <time className="text-xs text-gray-500" dateTime={comment.createdAt}>
          {formattedDate(comment.createdAt)}
        </time>
      </header>
      <p className="text-sm mt-2">{comment.body}</p>
      // highlight-start
      {hasRole('moderator') && (
        <button
          type="button"
          onClick={moderate}
          className="absolute bottom-2 right-2 bg-red-500 text-xs rounded text-white px-2 py-1"
        >
          Delete
        </button>
      )}
      // highlight-end
    </div>
  )
}

export default Comment
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Comment/Comment.tsx"
// highlight-next-line
import { useAuth } from 'src/auth'

const formattedDate = (datetime: ConstructorParameters<typeof Date>[0]) => {
  const parsedDate = new Date(datetime)
  const month = parsedDate.toLocaleString('default', { month: 'long' })
  return `${parsedDate.getDate()} ${month} ${parsedDate.getFullYear()}`
}

interface Props {
  comment: {
    name: string
    createdAt: string
    body: string
  }
}

const Comment = ({ comment }: Props) => {
  // highlight-start
  const { hasRole } = useAuth()
  const moderate = () => {
    if (confirm('Are you sure?')) {
      // TODO: delete comment
    }
  }
  // highlight-end

  return (
    // highlight-next-line
    <div className="bg-gray-200 p-8 rounded-lg relative">
      <header className="flex justify-between">
        <h2 className="font-semibold text-gray-700">{comment.name}</h2>
        <time className="text-xs text-gray-500" dateTime={comment.createdAt}>
          {formattedDate(comment.createdAt)}
        </time>
      </header>
      <p className="text-sm mt-2">{comment.body}</p>
      // highlight-start
      {hasRole('moderator') && (
        <button
          type="button"
          onClick={moderate}
          className="absolute bottom-2 right-2 bg-red-500 text-xs rounded text-white px-2 py-1"
        >
          Delete
        </button>
      )}
      // highlight-end
    </div>
  )
}

export default Comment
```

</TabItem>
</Tabs>

![image](https://user-images.githubusercontent.com/300/101229168-c75edb00-3653-11eb-85f0-6eb61af7d4e6.png)

<!--
So if the user has the "moderator" role, render the delete button. If you log out and back in as the admin, or if you log out completely, you'll see the delete button go away. When logged out (that is, `currentUser === null`) `hasRole()` will always return `false`.
-->

そのため、ユーザが "moderator" ロールの場合は、削除ボタンを描画します。ログアウトして管理者としてログインし直すか、完全にログアウトすると、削除ボタンは消えます。ログアウトしているとき（つまり `currentUser === null` ）は、 `hasRole()` は常に `false` を返します。

<!--
What should we put in place of the `// TODO` note we left ourselves? A GraphQL mutation that deletes a comment, of course. Thanks to our forward-thinking earlier we already have a `deleteComment()` service function and GraphQL mutation ready to go.
-->

私たちが残した `//TODO` というメモの代わりに何を書くべきでしょうか？もちろん、コメントを削除するためのGraphQLミューテーションです。先ほどの先見の明のおかげで、すでに `deleteComment()` サービス関数と GraphQL ミューテーションが用意されています。

<!--
And due to the nice encapsulation of our **Comment** component we can make all the required web-site changes in this one component:
-->

また、**Comment**コンポーネントがうまくカプセル化されているため、必要なWebサイトの変更をこのコンポーネント1つで行うことができるのです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Comment/Comment.js"
// highlight-next-line
import { useMutation } from '@redwoodjs/web'

import { useAuth } from 'src/auth'

// highlight-next-line
import { QUERY as CommentsQuery } from 'src/components/CommentsCell'

// highlight-start
const DELETE = gql`
  mutation DeleteCommentMutation($id: Int!) {
    deleteComment(id: $id) {
      postId
    }
  }
`
// highlight-end

const formattedDate = (datetime) => {
  const parsedDate = new Date(datetime)
  const month = parsedDate.toLocaleString('default', { month: 'long' })
  return `${parsedDate.getDate()} ${month} ${parsedDate.getFullYear()}`
}

const Comment = ({ comment }) => {
  const { hasRole } = useAuth()
  // highlight-start
  const [deleteComment] = useMutation(DELETE, {
    refetchQueries: [
      {
        query: CommentsQuery,
        variables: { postId: comment.postId },
      },
    ],
  })
  // highlight-end

  const moderate = () => {
    if (confirm('Are you sure?')) {
      // highlight-start
      deleteComment({
        variables: { id: comment.id },
      })
      // highlight-end
    }
  }

  return (
    <div className="bg-gray-200 p-8 rounded-lg relative">
      <header className="flex justify-between">
        <h2 className="font-semibold text-gray-700">{comment.name}</h2>
        <time className="text-xs text-gray-500" dateTime={comment.createdAt}>
          {formattedDate(comment.createdAt)}
        </time>
      </header>
      <p className="text-sm mt-2">{comment.body}</p>
      {hasRole('moderator') && (
        <button
          type="button"
          onClick={moderate}
          className="absolute bottom-2 right-2 bg-red-500 text-xs rounded text-white px-2 py-1"
        >
          Delete
        </button>
      )}
    </div>
  )
}

export default Comment
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Comment/Comment.tsx"
// highlight-next-line
import { useMutation } from '@redwoodjs/web'

import { useAuth } from 'src/auth'

// highlight-next-line
import { QUERY as CommentsQuery } from 'src/components/CommentsCell'

// highlight-next-line
import type { Comment as IComment } from 'types/graphql'

// highlight-start
const DELETE = gql`
  mutation DeleteCommentMutation($id: Int!) {
    deleteComment(id: $id) {
      postId
    }
  }
`
// highlight-end

const formattedDate = (datetime: ConstructorParameters<typeof Date>[0]) => {
  const parsedDate = new Date(datetime)
  const month = parsedDate.toLocaleString('default', { month: 'long' })
  return `${parsedDate.getDate()} ${month} ${parsedDate.getFullYear()}`
}

interface Props {
  // highlight-next-line
  comment: Pick<IComment, 'postId' | 'id' | 'name' | 'createdAt' | 'body'>
}

const Comment = ({ comment }: Props) => {
  const { hasRole } = useAuth()
  // highlight-start
  const [deleteComment] = useMutation(DELETE, {
    refetchQueries: [
      {
        query: CommentsQuery,
        variables: { postId: comment.postId },
      },
    ],
  })
  // highlight-end

  const moderate = () => {
    if (confirm('Are you sure?')) {
      // highlight-start
      deleteComment({
        variables: { id: comment.id },
      })
      // highlight-end
    }
  }

  return (
    <div className="bg-gray-200 p-8 rounded-lg relative">
      <header className="flex justify-between">
        <h2 className="font-semibold text-gray-700">{comment.name}</h2>
        <time className="text-xs text-gray-500" dateTime={comment.createdAt}>
          {formattedDate(comment.createdAt)}
        </time>
      </header>
      <p className="text-sm mt-2">{comment.body}</p>
      {hasRole('moderator') && (
        <button
          type="button"
          onClick={moderate}
          className="absolute bottom-2 right-2 bg-red-500 text-xs rounded text-white px-2 py-1"
        >
          Delete
        </button>
      )}
    </div>
  )
}

export default Comment
```

</TabItem>
</Tabs>

<!--
We'll also need to update the `CommentsQuery` we're importing from `CommentsCell` to include the `postId` field, since we are relying on it to perform the `refetchQuery` after a successful deletion:
-->

また、 `CommentsCell` からインポートしている `CommentsQuery` に `postId` フィールドを含めるように更新する必要があります。なぜなら、削除に成功した後に `refetchQuery` を実行するために、このフィールドに依存しているからです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentsCell/CommentsCell.js"
import Comment from 'src/components/Comment'

export const QUERY = gql`
  query CommentsQuery($postId: Int!) {
    comments(postId: $postId) {
      id
      name
      body
      // highlight-next-line
      postId
      createdAt
    }
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/CommentsCell/CommentsCell.tsx"
import Comment from 'src/components/Comment'

export const QUERY = gql`
  query CommentsQuery($postId: Int!) {
    comments(postId: $postId) {
      id
      name
      body
      // highlight-next-line
      postId
      createdAt
    }
  }
`
```

</TabItem>
</Tabs>

<!--
Click **Delete** (as a moderator) and the comment should be removed!
-->

（モデレータとして） **Delete** をクリックすると、コメントが削除されるはずです！

<!--
Ideally we'd have both versions of this component (with and without the "Delete" button) present in Storybook so we can iterate on the design. But there's no such thing as "logging in" in Storybook and our code depends on being logged in so we can check our roles...how will that work?
-->

理想的なのは、このコンポーネントの両方のバージョン（ "Delete" ボタンがあるものとないもの）がStorybookに存在し、デザインを反復することができるようにすることです。
しかし、Storybookには "logging in" というものがなく、私たちのコードはログインすることでロールを確認できることに依存しています...どうしたらよいでしょうか？

### Mocking currentUser for Storybook

<!--
Similar to how we can mock GraphQL calls in Storybook, we can mock user authentication and authorization functionality in a story.
-->

StorybookでGraphQLの呼び出しをモックするのと同様に、ストーリー内でユーザ認証と認可の機能をモックすることができます。

<!--
In `Comment.stories.{js,tsx}` let's add a second story for the moderator view of the component (and rename the existing one for clarity):
-->

`Comment.stories.{js,tsx}` に、コンポーネントのモデレータビュー用の2つ目のストーリーを追加しましょう（わかりやすいように、既存のストーリーの名前も変更します）：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Comment/Comment.stories.js"
import Comment from './Comment'

// highlight-next-line
export const defaultView = () => {
  return (
    <Comment
      comment={{
        id: 1,
        name: 'Rob Cameron',
        body: 'This is the first comment!',
        createdAt: '2020-01-01T12:34:56Z',
        // highlight-next-line
        postId: 1
      }}
    />
  )
}

// highlight-start
export const moderatorView = () => {
  return (
    <Comment
      comment={{
        id: 1,
        name: 'Rob Cameron',
        body: 'This is the first comment!',
        createdAt: '2020-01-01T12:34:56Z',
        postId: 1,
      }}
    />
  )
}
// highlight-end

export default { title: 'Components/Comment' }
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Comment/Comment.stories.ts"
import Comment from './Comment'

// highlight-next-line
export const defaultView = () => {
  return (
    <Comment
      comment={{
        id: 1,
        name: 'Rob Cameron',
        body: 'This is the first comment!',
        createdAt: '2020-01-01T12:34:56Z',
        // highlight-next-line
        postId: 1,
      }}
    />
  )
}

// highlight-start
export const moderatorView = () => {
  return (
    <Comment
      comment={{
        id: 1,
        name: 'Rob Cameron',
        body: 'This is the first comment!',
        createdAt: '2020-01-01T12:34:56Z',
        postId: 1,
      }}
    />
  )
}
// highlight-end

export default { title: 'Components/Comment' }
```

</TabItem>
</Tabs>

<!--
The **moderatorView** story needs to have a user available that has the moderator role. We can do that with the `mockCurrentUser` function:
-->

**moderatorView** ストーリーは、モデレータのロールを持つユーザを利用できるようにする必要があります。これは `mockCurrentUser` 関数で行うことができます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Comment/Comment.stories.js"
export const moderatorView = () => {
  // highlight-start
  mockCurrentUser({
    id: 1,
    email: 'moderator@moderator.com',
    roles: 'moderator',
  })
  // highlight-end

  return (
    <Comment
      comment={{
        id: 1,
        name: 'Rob Cameron',
        body: 'This is the first comment!',
        createdAt: '2020-01-01T12:34:56Z',
        postId: 1,
      }}
    />
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Comment/Comment.stories.tsx"
export const moderatorView = () => {
  // highlight-start
  mockCurrentUser({
    id: 1,
    email: 'moderator@moderator.com',
    roles: 'moderator',
  })
  // highlight-end

  return (
    <Comment
      comment={{
        id: 1,
        name: 'Rob Cameron',
        body: 'This is the first comment!',
        createdAt: '2020-01-01T12:34:56Z',
        postId: 1,
      }}
    />
  )
}
```

</TabItem>
</Tabs>

:::info Where did `mockCurrentUser()` come from?

<!--
Similar to `mockGraphQLQuery()` and `mockGraphQLMutation()`, `mockCurrentUser()` is a global available in Storybook automatically, no need to import.
-->

`mockGraphQLQuery()` や `mockGraphQLMutation()` と同様に、 `mockCurrentUser()` は Storybook で自動的に利用できるグローバルなもので、インポートする必要はありません。

:::

<!--
`mockCurrentUser()` accepts an object and you can put whatever you want in there (it should be similar to what you return in `getCurrentUser()` in `api/src/lib/auth.{js,ts}`). But since we want `hasRole()` to work properly then the object must have a `roles` key that is a string or an array of strings.
-->

`mockCurrentUser()` はオブジェクトを受け取るので、そこに好きなものを入れることができます（ `api/src/lib/auth.{js,ts}` の `getCurrentUser()` で返すものと同じであるべきです）。しかし、 `hasRole()` を正しく動作させたいので、オブジェクトには文字列または文字列の配列である `roles` キーを指定する必要があります。

<!--
Check out **Comment** in Storybook and you should see two stories for Comment, one with a "Delete" button and one without!
-->

Storybookの **Comment** をチェックすると、Commentに2つのストーリーが表示されます。1つは "Delete" ボタンがあり、もう1つはありません

![image](https://user-images.githubusercontent.com/300/153970232-0224a6ab-fb86-4438-ae75-2e74e32aabc1.png)

### Mocking currentUser for Jest

<!--
We can use the same `mockCurrentUser()` function in our Jest tests as well. Let's check that the word "Delete" is present in the component's output when the user is a moderator, and that it's not present if the user has any other role (or no role):
-->

同じ `mockCurrentUser()` 関数を Jest テストでも使うことができます。ユーザがモデレータの場合、コンポーネントの出力に "Delete" という単語が表示され、ユーザが他のロールの場合（またはロールがない場合）には表示されないことを確認しましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Comment/Comment.test.js"
// highlight-next-line
import { render, screen, waitFor } from '@redwoodjs/testing'

import Comment from './Comment'

// highlight-start
const COMMENT = {
  name: 'John Doe',
  body: 'This is my comment',
  createdAt: '2020-01-02T12:34:56Z',
}
// highlight-end

describe('Comment', () => {
  it('renders successfully', () => {
    // highlight-next-line
    render(<Comment comment={COMMENT} />)

    // highlight-start
    expect(screen.getByText(COMMENT.name)).toBeInTheDocument()
    expect(screen.getByText(COMMENT.body)).toBeInTheDocument()
    // highlight-end
    const dateExpect = screen.getByText('2 January 2020')
    expect(dateExpect).toBeInTheDocument()
    expect(dateExpect.nodeName).toEqual('TIME')
    // highlight-next-line
    expect(dateExpect).toHaveAttribute('datetime', COMMENT.createdAt)
  })

  // highlight-start
  it('does not render a delete button if user is logged out', async () => {
    render(<Comment comment={COMMENT} />)

    await waitFor(() =>
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    )
  })

  it('renders a delete button if the user is a moderator', async () => {
    mockCurrentUser({
      id: 1,
      email: 'moderator@moderator.com',
      roles: 'moderator',
    })
    render(<Comment comment={COMMENT} />)

    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument())
  })
  // highlight-end
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Comment/Comment.test.tsx"
// highlight-next-line
import { render, screen, waitFor } from '@redwoodjs/testing'

import Comment from './Comment'

// highlight-start
const COMMENT = {
  id: 1,
  name: 'John Doe',
  body: 'This is my comment',
  createdAt: '2020-01-02T12:34:56Z',
  postId: 1,
}
// highlight-end

describe('Comment', () => {
  it('renders successfully', () => {
    // highlight-next-line
    render(<Comment comment={COMMENT} />)

    // highlight-start
    expect(screen.getByText(COMMENT.name)).toBeInTheDocument()
    expect(screen.getByText(COMMENT.body)).toBeInTheDocument()
    // highlight-end
    const dateExpect = screen.getByText('2 January 2020')
    expect(dateExpect).toBeInTheDocument()
    expect(dateExpect.nodeName).toEqual('TIME')
    // highlight-next-line
    expect(dateExpect).toHaveAttribute('datetime', COMMENT.createdAt)
  })

  // highlight-start
  it('does not render a delete button if user is logged out', async () => {
    render(<Comment comment={COMMENT} />)

    await waitFor(() =>
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    )
  })

  it('renders a delete button if the user is a moderator', async () => {
    mockCurrentUser({
      id: 1,
      email: 'moderator@moderator.com',
      roles: 'moderator',
    })

    render(<Comment comment={COMMENT} />)

    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument())
  })
  // highlight-end
})
```

</TabItem>
</Tabs>

<!--
We moved the default `comment` object to a constant `COMMENT` and then used that in all tests. We also needed to add `waitFor()` since the `hasRole()` check in the Comment itself actually executes some GraphQL calls behind the scenes to figure out who the user is. The test suite makes mocked GraphQL calls, but they're still asynchronous and need to be waited for. If you don't wait, then `currentUser` will be `null` when the test starts, and Jest will be happy with that result. But we won't—we need to wait for the actual value from the GraphQL call.
-->

デフォルトの `comment` オブジェクトを `COMMENT` 定数に移動し、すべてのテストでそれを使用するようにしました。また、コメント自体の `hasRole()` チェックでは、ユーザが誰であるかを把握するために、裏でいくつかの GraphQL 呼び出しを実行しているので、 `waitFor()` も追加する必要がありました。テストスイートはモック化されたGraphQLコールを行いますが、それでも非同期なので待つ必要があります。もし待機しないのであれば、テスト開始時に `currentUser` は `null` となり、Jest はその結果に満足することでしょう。しかし、私たちはそうしません -- GraphQL 呼び出しからの実際の値を待つ必要があります。

:::caution Seeing errors in your test suite?

<!--
We added fields to the database and sometimes the test runner doesn't realize this. You may need to restart it to get the test database migrated to match what's in `schema.prisma`. Press `q` or `Ctrl-C` in your test runner if it's still running, then:
-->

データベースにフィールドを追加したのですが、テストランナーがこれに気づかないことがあります。`schema.prisma` と一致するようにテストデータベースをマイグレーションするために、テストランナーを再起動する必要があるかもしれません。テストランナーがまだ動作している場合は、`q` または `Ctrl-C` を押してください：

```bash
yarn rw test
```

<!--
The suite should automatically run the tests for `Comment` and `CommentCell` at the very least, and maybe a few more if you haven't committed your code to git in a while.
-->

このスイートでは、少なくとも `Comment` と `CommentCell` のテストが自動的に実行されます。そして、しばらくコードをgitにコミットしていない場合は、さらにいくつかのテストが実行されるかもしれません。

:::

:::info

<!--
This isn't the most robust test that's ever been written: what if the sample text of the comment itself had the word "Delete" in it? Whoops! But you get the idea—find some meaningful difference in each possible render state of a component and write a test that verifies its presence (or lack of presence).
-->

これは、今までで最も堅牢なテストではありません：もし、コメントのサンプルテキスト自体に "Delete" という単語があったらどうでしょう？なんてこった！しかし、次のような考え方は理解できます -- コンポーネントの描画状態に意味のある違いを見つけ、その存在（または存在しないこと）を検証するテストを書くのです。

<!--
Think of each conditional in your component as another branch you need to have a test for. In the worst case, each conditional adds 2<sup>n</sup> possible render states. If you have three conditionals that's 2<sup>3</sup> (eight) possible combinations of output and to be safe you'll want to test them all. When you get yourself into this scenario it's a good sign that it's time to refactor and simplify your component. Maybe into subcomponents where each is responsible for just one of those conditional outputs? You'll still need the same number of total tests, but each component and its test is now operating in isolation and making sure it does one thing, and does it well. This has benefits for your mental model of the codebase as well.
-->

コンポーネントの各条件を、テストが必要な別の分岐として考えてください。最悪の場合、各条件が 2<sup>n</sup> の可能な描画状態を追加します。3つの条件分岐がある場合は、2<sup>3</sup> （8）個の可能な出力の組み合わせになり、安全のためにすべてテストする必要があります。このようなシナリオに陥ったときは、コンポーネントをリファクタリングして単純化する時期であることを示すわかりやすい兆候です。サブコンポーネントに分割して、それぞれが条件出力のひとつだけを担当するようにするとか？それでもまだ同じ数のテストが必要ですが、各コンポーネントとそのテストは分離して動作し、ひとつのことを確実に、そしてうまく行うことができるようになります。これは、コードベースのメンタルモデルにとっても利点があります。

<!--
It's like finally organizing that junk drawer in the kitchen—you still have the same number of things when you're done, but each thing is in its own space and therefore easier to remember where it lives and makes it easier to find next time.
-->

キッチンのガラクタの引き出しをやっと整理したようなものです -- でも、それぞれのものが自分のスペースに収まっているので、どこに何があるのか思い出しやすく、次回も見つけやすいのです。

:::

<!--
You may see the following message output during the test run:
-->

テスト実行中に以下のようなメッセージ出力が表示されることがあります：

```bash
console.error
  Missing field 'postId' while writing result {
    "id": 1,
    "name": "Rob Cameron",
    "body": "First comment",
    "createdAt": "2020-01-02T12:34:56Z"
  }
```

<!--
If you take a look at `CommentsCell.mock.{js,ts}` you'll see the mock data there used during the test. We're requesting `postId` in the `QUERY` in `CommentsCell` now, but this mock doesn't return it! We can fix that by simply adding that field to both mocks:
-->

`CommentsCell.mock.{js,ts}` を見てみると、テスト中に使用されたモックデータがあることが分かります。現在、`CommentsCell` の `QUERY` で `postId` を要求していますが、このモックはそれを返しません！この問題は、両方のモックにそのフィールドを追加することで解決できます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="web/src/components/CommentsCell/CommentsCell.mock.js"
export const standard = () => ({
  comments: [
    {
      id: 1,
      name: 'Rob Cameron',
      body: 'First comment',
      // highlight-next-line
      postId: 1,
      createdAt: '2020-01-02T12:34:56Z',
    },
    {
      id: 2,
      name: 'David Price',
      body: 'Second comment',
      // highlight-next-line
      postId: 2,
      createdAt: '2020-02-03T23:00:00Z',
    },
  ],
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```javascript title="web/src/components/CommentsCell/CommentsCell.mock.ts"
export const standard = () => ({
  comments: [
    {
      id: 1,
      name: 'Rob Cameron',
      body: 'First comment',
      // highlight-next-line
      postId: 1,
      createdAt: '2020-01-02T12:34:56Z',
    },
    {
      id: 2,
      name: 'David Price',
      body: 'Second comment',
      // highlight-next-line
      postId: 2,
      createdAt: '2020-02-03T23:00:00Z',
    },
  ],
})
```

</TabItem>
</Tabs>

<!--
We don't do anything with the actual post data in our tests, so there's no need to mock out the entire post, just a `postId` will suffice.
-->

テストでは実際のブログ記事データには何もしないので、ブログ記事全体をモックアウトする必要はなく、 `postId` だけで十分です。

### Roles on the API Side

<!--
Remember: never trust the client! We need to lock down the backend to be sure that someone can't discover our `deleteComment` GraphQL resource and start deleing comments willy nilly.
-->

覚えておいてください：クライアントを信用してはいけません！バックエンドをロックして、誰かが `deleteComment` GraphQL リソースを発見できないようして、勝手にコメントを削除し始めないようにしなければなりません。

<!--
Recall in Part 1 of the tutorial we used a [directive](../../directives.md) `@requireAuth` to be sure that someone was logged in before allowing them to access a given GraphQL query or mutation. It turns out that `@requireAuth` can take an optional `roles` argument:
-->

チュートリアルのパート1では、 `@requireAuth` の [directive](../../directives.md) を使って、与えられたGraphQLクエリやミューテーションにアクセスする前にログインしていることを確認したことを思い出してください。これは `@requireAuth` がオプションの `roles` 引数を取ることができることがわかったからです：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```graphql title="api/src/graphql/comments.sdl.js"
export const schema = gql`
  type Comment {
    id: Int!
    name: String!
    body: String!
    post: Post!
    postId: Int!
    createdAt: DateTime!
  }

  type Query {
    comments(postId: Int!): [Comment!]! @skipAuth
  }

  input CreateCommentInput {
    name: String!
    body: String!
    postId: Int!
  }

  input UpdateCommentInput {
    name: String
    body: String
    postId: Int
  }

  type Mutation {
    createComment(input: CreateCommentInput!): Comment! @skipAuth
    // highlight-next-line
    deleteComment(id: Int!): Comment! @requireAuth(roles: "moderator")
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```graphql title="api/src/graphql/comments.sdl.ts"
export const schema = gql`
  type Comment {
    id: Int!
    name: String!
    body: String!
    post: Post!
    postId: Int!
    createdAt: DateTime!
  }

  type Query {
    comments(postId: Int!): [Comment!]! @skipAuth
  }

  input CreateCommentInput {
    name: String!
    body: String!
    postId: Int!
  }

  input UpdateCommentInput {
    name: String
    body: String
    postId: Int
  }

  type Mutation {
    createComment(input: CreateCommentInput!): Comment! @skipAuth
    // highlight-next-line
    deleteComment(id: Int!): Comment! @requireAuth(roles: "moderator")
  }
`
```

</TabItem>
</Tabs>

<!--
Now a raw GraphQL query to the `deleteComment` mutation will result in an error if the user isn't logged in as a moderator.
-->

現在、 `deleteComment` ミューテーションに対する生のGraphQLクエリは、ユーザがモデレータとしてログインしていない場合、エラーになります。

<!--
This check only prevents access to `deleteComment` via GraphQL. What if you're calling one service from another? If we wanted the same protection within the service itself, we could call `requireAuth` directly:
-->

このチェックは、GraphQL経由の `deleteComment` へのアクセスを防ぐだけです。あるサービスを別のサービスから呼び出している場合はどうでしょうか？もし、サービス自体で同じように保護したいのであれば、 `requireAuth` を直接呼び出すことができます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="api/src/services/comments/comments.js"
// highlight-next-line
import { requireAuth } from 'src/lib/auth'
import { db } from 'src/lib/db'

// ...

export const deleteComment = ({ id }) => {
  // highlight-next-line
  requireAuth({ roles: 'moderator' })
  return db.comment.delete({
    where: { id },
  })
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="api/src/services/comments/comments.ts"
// highlight-next-line
import { requireAuth } from 'src/lib/auth'
import { db } from 'src/lib/db'

// ...

export const deleteComment = ({ id }) => {
  // highlight-next-line
  requireAuth({ roles: 'moderator' })
  return db.comment.delete({
    where: { id },
  })
}
```

</TabItem>
</Tabs>

<!--
We'll need a test to go along with that functionality. How do we test `requireAuth()`? The api side also has a `mockCurrentUser()` function which behaves the same as the one on the web side:
-->

その機能に合わせてテストが必要になります。 `requireAuth()` をどのようにテストするのでしょうか？APIサイドにも `mockCurrentUser()` 関数があり、Webサイドと同じ動作をします：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="api/src/services/comments/comments.test.js"
// highlight-next-line
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

// highlight-next-line
import { comments, createComment, deleteComment } from './comments'

describe('comments', () => {
  scenario(
    'returns all comments for a single post from the database',
    async (scenario) => {
      const result = await comments({ postId: scenario.comment.jane.postId })
      const post = await db.post.findUnique({
        where: { id: scenario.comment.jane.postId },
        include: { comments: true },
      })
      expect(result.length).toEqual(post.comments.length)
    }
  )

  scenario('postOnly', 'creates a new comment', async (scenario) => {
    const comment = await createComment({
      input: {
        name: 'Billy Bob',
        body: 'What is your favorite tree bark?',
        postId: scenario.post.bark.id,
      },
    })

    expect(comment.name).toEqual('Billy Bob')
    expect(comment.body).toEqual('What is your favorite tree bark?')
    expect(comment.postId).toEqual(scenario.post.bark.id)
    expect(comment.createdAt).not.toEqual(null)
  })

  // highlight-start
  scenario('allows a moderator to delete a comment', async (scenario) => {
    mockCurrentUser({ roles: ['moderator'] })

    const comment = await deleteComment({
      id: scenario.comment.jane.id,
    })
    expect(comment.id).toEqual(scenario.comment.jane.id)

    const result = await comments({ postId: scenario.comment.jane.id })
    expect(result.length).toEqual(0)
  })

  scenario(
    'does not allow a non-moderator to delete a comment',
    async (scenario) => {
      mockCurrentUser({ roles: 'user' })

      expect(() =>
        deleteComment({
          id: scenario.comment.jane.id,
        })
      ).toThrow(ForbiddenError)
    }
  )

  scenario(
    'does not allow a logged out user to delete a comment',
    async (scenario) => {
      mockCurrentUser(null)

      expect(() =>
        deleteComment({
          id: scenario.comment.jane.id,
        })
      ).toThrow(AuthenticationError)
    }
  )
  // highlight-end
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="api/src/services/comments/comments.test.ts"
// highlight-next-line
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

// highlight-next-line
import { comments, createComment, deleteComment } from './comments'

import type { PostOnlyScenario, StandardScenario } from './comments.scenarios'

describe('comments', () => {
  scenario(
    'returns all comments for a single post from the database',
    async (scenario) => {
      const result = await comments({ postId: scenario.comment.jane.postId })
      const post = await db.post.findUnique({
        where: { id: scenario.comment.jane.postId },
        include: { comments: true },
      })
      expect(result.length).toEqual(post.comments.length)
    }
  )

  scenario(
    'postOnly',
    'creates a new comment',
    async (scenario: PostOnlyScenario) => {
      const comment = await createComment({
        input: {
          name: 'Billy Bob',
          body: 'What is your favorite tree bark?',
          postId: scenario.post.bark.id,
        },
      })

      expect(comment.name).toEqual('Billy Bob')
      expect(comment.body).toEqual('What is your favorite tree bark?')
      expect(comment.postId).toEqual(scenario.post.bark.id)
      expect(comment.createdAt).not.toEqual(null)
    }
  )

  // highlight-start
  scenario(
    'allows a moderator to delete a comment',
    async (scenario: StandardScenario) => {
      mockCurrentUser({
        roles: 'moderator',
        id: 1,
        email: 'moderator@moderator.com',
      })

      const comment = await deleteComment({
        id: scenario.comment.jane.id,
      })
      expect(comment.id).toEqual(scenario.comment.jane.id)

      const result = await comments({ postId: scenario.comment.jane.id })
      expect(result.length).toEqual(0)
    }
  )

  scenario(
    'does not allow a non-moderator to delete a comment',
    async (scenario: StandardScenario) => {
      mockCurrentUser({ roles: 'user', id: 1, email: 'user@user.com' })

      expect(() =>
        deleteComment({
          id: scenario.comment.jane.id,
        })
      ).toThrow(ForbiddenError)
    }
  )

  scenario(
    'does not allow a logged out user to delete a comment',
    async (scenario: StandardScenario) => {
      mockCurrentUser(null)

      expect(() =>
        deleteComment({
          id: scenario.comment.jane.id,
        })
      ).toThrow(AuthenticationError)
    }
  )
  // highlight-end
})
```

</TabItem>
</Tabs>

<!--
Our first scenario checks that we get the deleted comment back from a call to `deleteComment()`. The second expectation makes sure that the comment was actually removed from the database: trying to find a comment with that `id` now returns an empty array. If this was the only test we had it could lull us into a false sense of security—what if the user had a different role, or wasn't logged in at all?
-->

最初のシナリオは、削除されたコメントが `deleteComment()` の呼び出しによって返されることをチェックします。2番目のシナリオは、コメントが実際にデータベースから削除されたことを確認します：その `id` を持つコメントを探すと、空の配列が返されます。もしこれが唯一のテストであったなら、私たちは間違った安心感に陥る可能性があります -- もしユーザが別のロールを持っていたり、まったくログインしていなかったりしたらどうでしょうか？

<!--
We aren't testing those cases here, so we add two more tests: one for if the user has a role other than "moderator" and one if the user isn't logged in at all. These two cases also raise different errors, so it's nice to see that codified here.
-->

ここではこれらのケースをテストしてないので、さらに2つのテストを追加します：ひとつはユーザが "moderator" 以外のロールを持つ場合、もうひとつはユーザがまったくログインしていない場合です。この2つのケースはまた異なるエラーを発生させるので、ここでそれを体系化しておくのはいいことです。

### Last Word on Roles

<!--
Having a role like "admin" implies that they can do everything...shouldn't they be able to delete comments as well? Right you are! There are two things we can do here:

1. Add "admin" to the list of roles in the `hasRole()` checks in components, `@requireAuth` directive, and `requireAuth()` check in services
2. Don't make any changes in the code, just give the user in the database additional roles—so admins will also have the "moderator" role in addition to "admin"
-->

"admin" （管理者）というロールは、何でもできることを意味しているのでは...コメントを削除することもできるのでは？その通り！ここでできることは2つあります：

1. "admin" を、コンポーネントの `hasRole()` チェック、 `@requireAuth` ディレクティブ、サービスの `requireAuth()` チェックに追加
2. コードは変更せず、データベース内のユーザに追加のロールを与える -- 管理者は "admin" に加えて "moderator" ロールも持つようになる

<!--
By virtue of the name "admin" it really feels like someone should only have that one single role and be able to do everything. So in this case it might feel better to add "admin" to `hasRole()` and `requireAuth()`.
-->

"admin" という名前から、誰かがその単一のロールだけを持ち、すべてを行えるようにする必要があるように感じられます。ですから、この場合は `hasRole()` と `requireAuth()` に "admin" を追加したほうがいいかもしれません。

<!--
But, if you wanted to be more fine-grained with your roles then maybe the "admin" role should really be called "author". That way it makes it clear they only author posts, and if you want someone to be able to do both actions you can explicitly give them the "moderator" role in addition to "author."
-->

しかし、もしあなたがもっと細かく役割を決めたいのであれば、 "admin" ロールを "author" と呼ぶべきかもしれません。そうすることで、管理者はブログ記事を作成するだけであることが明確になります。もし誰かが両方のアクションを行えるようにしたい場合は、 "author" に加えて "moderator" ロールを明示的に与えればよいでしょう。

<!--
Managing roles can be a tricky thing to get right. Spend a little time up front thinking about how they'll interact and how much duplication you're willing to accept in your role-based function calls on the site. If you see yourself constantly adding multiple roles to `hasRole()` and `requireAuth()` that may be an indication that it's time to add a single, new role that includes those abilities and remove that duplication in your code.
-->

ロールの管理は、正しく行うのが難しい場合があります。ロールがどのように相互作用するか、また、サイト上のロールベースの関数呼び出しでどの程度の重複を許容するかについて、前もって少し時間をかけて考えてみてください。もし、 `hasRole()` や `requireAuth()` に複数のロールを追加しているようであれば、それらの機能を含む単一の新しいロールを追加して、コード内の重複を排除する時期であることを示している可能性があります。
