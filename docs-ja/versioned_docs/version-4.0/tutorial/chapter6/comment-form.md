# Creating a Comment Form

<!--
Let's generate a component to house our new comment form, build it out and integrate it via Storybook, then add some tests:
-->

新しいコメントフォームを収めるコンポーネントを生成し、それを構築してStorybook経由で統合し、いくつかのテストを追加してみましょう：


```bash
yarn rw g component CommentForm
```

<!--
And startup Storybook again if it isn't still running:
-->
そして、いま起動していない場合は、改めてStorybookを起動してください：

```bash
yarn rw storybook
```

<!--
You'll see that there's a **CommentForm** entry in Storybook now, ready for us to get started.
-->

Storybookに **CommentForm** という項目があり、すぐに始められるようになっているのがわかると思います。

![image](https://user-images.githubusercontent.com/300/153927943-648c62d2-b0c3-40f2-9bad-3aa81170d7c2.png)

### Storybook

<!--
Let's build a simple form to take the user's name and their comment and add some styling to match it to the blog:
-->

ユーザの名前とコメントを受け取る簡単なフォームを作り、ブログとマッチするようにスタイルを追加してみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentForm/CommentForm.js"
import {
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'

const CommentForm = () => {
  return (
    <div>
      <h3 className="font-light text-lg text-gray-600">Leave a Comment</h3>
      <Form className="mt-4 w-full">
        <Label name="name" className="block text-sm text-gray-600 uppercase">
          Name
        </Label>
        <TextField
          name="name"
          className="block w-full p-1 border rounded text-xs "
          validation={{ required: true }}
        />

        <Label
          name="body"
          className="block mt-4 text-sm text-gray-600 uppercase"
        >
          Comment
        </Label>
        <TextAreaField
          name="body"
          className="block w-full p-1 border rounded h-24 text-xs"
          validation={{ required: true }}
        />

        <Submit
          className="block mt-4 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide rounded px-3 py-2 disabled:opacity-50"
        >
          Submit
        </Submit>
      </Form>
    </div>
  )
}

export default CommentForm
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/CommentForm/CommentForm.tsx"
import {
  Form,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'

const CommentForm = () => {
  return (
    <div>
      <h3 className="font-light text-lg text-gray-600">Leave a Comment</h3>
      <Form className="mt-4 w-full">
        <Label name="name" className="block text-sm text-gray-600 uppercase">
          Name
        </Label>
        <TextField
          name="name"
          className="block w-full p-1 border rounded text-xs"
          validation={{ required: true }}
        />

        <Label
          name="body"
          className="block mt-4 text-sm text-gray-600 uppercase"
        >
          Comment
        </Label>
        <TextAreaField
          name="body"
          className="block w-full p-1 border rounded h-24 text-xs"
          validation={{ required: true }}
        />

        <Submit
          className="block mt-4 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide rounded px-3 py-2 disabled:opacity-50"
        >
          Submit
        </Submit>
      </Form>
    </div>
  )
}

export default CommentForm
```

</TabItem>
</Tabs>

![image](https://user-images.githubusercontent.com/300/153928306-5e0979c6-2049-4039-87a2-284a4010283a.png)

<!--
Note that the form and its inputs are set to 100% width. Again, the form shouldn't be dictating anything about its layout that its parent should be responsible for, like how wide the inputs are. Those should be determined by whatever contains it so that it looks good with the rest of the content on the page. So the form will be 100% wide and the parent (whoever that ends up being) will decide how wide it really is on the page.
-->

フォームとその入力フィールドは100%の幅に設定されていることに注意してください。繰り返しますが、フォームのレイアウトについては、入力の幅のように親が責任を負うべきことを指定すべきではありません。

フォームのレイアウトはそのフォームを親が決めるべきで、ページ上の他のコンテンツと揃えて見栄えをよくする必要があります。
ですから、フォームの幅は100%で、ページ上での実際の幅は（親が誰であろうと）親が決めることになります。

<!--
You can even try submitting the form right in Storybook! If you leave "name" or "comment" blank then they should get focus when you try to submit, indicating that they are required. If you fill them both in and click **Submit** nothing happens because we haven't hooked up the submit yet. Let's do that now.
-->

Storybookでフォームを送信してみることもできます！もし、"name" や "comment" を空白のままにした場合、送信しようとすると、それらが必須であることを示すフォーカスが当たるはずです。両方を入力して **Submit** をクリックしても、まだ送信処理を繋ぎ込んでいないので何も起こりません。では、それをやってみましょう。

### Submitting

<!--
Submitting the form should use the `createComment` function we added to our services and GraphQL. We'll need to add a mutation to the form component and an `onSubmit` handler to the form so that the create can be called with the data in the form. And since `createComment` could return an error we'll add the **FormError** component to display it:
-->

フォームを送信するには、サービスとGraphQLに追加した `createComment` 関数を使う必要があります。フォームのデータで create を呼び出せるように、フォームコンポーネントにミューテーションを追加し、 `onSubmit` ハンドラを追加する必要があります。また、`createComment` がエラーを返す可能性があるので、それを表示するために **FormError** コンポーネントを追加します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentForm/CommentForm.js"
import {
  Form,
  // highlight-next-line
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
// highlight-next-line
import { useMutation } from '@redwoodjs/web'

// highlight-start
const CREATE = gql`
  mutation CreateCommentMutation($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      name
      body
      createdAt
    }
  }
`
// highlight-end

const CommentForm = () => {
  // highlight-next-line
  const [createComment, { loading, error }] = useMutation(CREATE)

  // highlight-start
  const onSubmit = (input) => {
    createComment({ variables: { input } })
  }
  // highlight-end

  return (
    <div>
      <h3 className="font-light text-lg text-gray-600">Leave a Comment</h3>
      // highlight-start
      <Form className="mt-4 w-full" onSubmit={onSubmit}>
        <FormError
          error={error}
          titleClassName="font-semibold"
          wrapperClassName="bg-red-100 text-red-900 text-sm p-3 rounded"
        />
        // highlight-end
        <Label
          name="name"
          className="block text-xs font-semibold text-gray-500 uppercase"
        >
          Name
        </Label>
        <TextField
          name="name"
          className="block w-full p-1 border rounded text-sm "
          validation={{ required: true }}
        />

        <Label
          name="body"
          className="block mt-4 text-xs font-semibold text-gray-500 uppercase"
        >
          Comment
        </Label>
        <TextAreaField
          name="body"
          className="block w-full p-1 border rounded h-24 text-sm"
          validation={{ required: true }}
        />

        <Submit
          // highlight-next-line
          disabled={loading}
          className="block mt-4 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide rounded px-3 py-2 disabled:opacity-50"
        >
          Submit
        </Submit>
      </Form>
    </div>
  )
}

export default CommentForm
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/CommentForm/CommentForm.tsx"
import {
  Form,
  // highlight-next-line
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
  // highlight-next-line
  SubmitHandler,
} from '@redwoodjs/forms'
// highlight-next-line
import { useMutation } from '@redwoodjs/web'

// highlight-start
const CREATE = gql`
  mutation CreateCommentMutation($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      name
      body
      createdAt
    }
  }
`
// highlight-end

// highlight-start
interface FormValues {
  name: string
  comment: string
}
// highlight-end

const CommentForm = () => {
  // highlight-next-line
  const [createComment, { loading, error }] = useMutation(CREATE)

  // highlight-start
  const onSubmit: SubmitHandler<FormValues> = (input) => {
    createComment({ variables: { input } })
  }
  // highlight-end

  return (
    <div>
      <h3 className="font-light text-lg text-gray-600">Leave a Comment</h3>
      // highlight-start
      <Form className="mt-4 w-full" onSubmit={onSubmit}>
        <FormError
          error={error}
          titleClassName="font-semibold"
          wrapperClassName="bg-red-100 text-red-900 text-sm p-3 rounded"
        />
        // highlight-end
        <Label
          name="name"
          className="block text-xs font-semibold text-gray-500 uppercase"
        >
          Name
        </Label>
        <TextField
          name="name"
          className="block w-full p-1 border rounded text-sm "
          validation={{ required: true }}
        />

        <Label
          name="body"
          className="block mt-4 text-xs font-semibold text-gray-500 uppercase"
        >
          Comment
        </Label>
        <TextAreaField
          name="body"
          className="block w-full p-1 border rounded h-24 text-sm"
          validation={{ required: true }}
        />

        <Submit
          // highlight-next-line
          disabled={loading}
          className="block mt-4 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide rounded px-3 py-2 disabled:opacity-50"
        >
          Submit
        </Submit>
      </Form>
    </div>
  )
}

export default CommentForm
```

</TabItem>
</Tabs>

<!--
If you try to submit the form you'll get an error in the web console—Storybook will automatically mock GraphQL queries, but not mutations. But, we can mock the request in the story and handle the response manually:
-->

フォームを送信しようとすると、ウェブコンソールにエラーが表示されます -- Storybookは自動的にGraphQLクエリをモックしますが、ミューテーションはモックしません。しかし、ストーリーの中でリクエストをモックし、レスポンスを手動で処理することができます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentForm/CommentForm.stories.js"
import CommentForm from './CommentForm'

export const generated = () => {
  // highlight-start
  mockGraphQLMutation('CreateCommentMutation', (variables, { ctx }) => {
    const id = Math.floor(Math.random() * 1000)
    ctx.delay(1000)

    return {
      createComment: {
        id,
        name: variables.input.name,
        body: variables.input.body,
        createdAt: new Date().toISOString(),
      },
    }
  })
  // highlight-end

  return <CommentForm />
}

export default { title: 'Components/CommentForm' }
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/CommentForm/CommentForm.stories.tsx"
import CommentForm from './CommentForm'

// highlight-start
import type {
  CreateCommentMutation,
  CreateCommentMutationVariables,
} from 'types/graphql'
// highlight-end

export const generated = () => {
  // highlight-start
  mockGraphQLMutation<CreateCommentMutation, CreateCommentMutationVariables>(
    'CreateCommentMutation',
    (variables, { ctx }) => {
      const id = Math.floor(Math.random() * 1000)
      ctx.delay(1000)

      return {
        createComment: {
          id,
          name: variables.input.name,
          body: variables.input.body,
          createdAt: new Date().toISOString(),
        },
      }
    }
  )
  // highlight-end

  return <CommentForm />
}

export default { title: 'Components/CommentForm' }
```

</TabItem>
</Tabs>

:::info

<!--
If you still get an error, try reloading the Storybook tab in the browser.
-->

それでもエラーが発生する場合は、ブラウザでStorybookのタブを再読み込みしてみてください。

:::

<!--
To use `mockGraphQLMutation` you call it with the name of the mutation you want to intercept and then the function that will handle the interception and return a response. The arguments passed to that function give us some flexibility in how we handle the response.
-->

`mockGraphQLMutation` を使用するには、インターセプトしたいミューテーションの名前を指定して呼び出し、インターセプトを処理し応答を返す関数を指定します。その関数に渡される引数によって、レスポンスをどのように処理するかについて柔軟性を持たせることができます。

<!--
In our case we want the `variables` that were passed to the mutation (the `name` and `body`) as well as the context object (abbreviated as `ctx`) so that we can add a delay to simulate a round trip to the server. This will let us test that the **Submit** button is disabled for that one second and you can't submit a second comment while the first one is still being saved.
-->

この場合、ミューテーションに渡された変数（ `name` と `body` ） とコンテキストオブジェクト（略して `ctx` ） が必要で、サーバへのラウンドトリップ（処理の行き来）をシミュレートするために遅延を追加することができます。これにより **Submit** ボタンが1秒間無効になり、最初のコメントの保存が終わるまでは2番目のコメントを投稿できないことをテストすることができます。

<!--
Try out the form now and the error should be gone. Also the **Submit** button should become visually disabled and clicking it during that one second delay does nothing.
-->

今すぐフォームを試してみると、エラーはなくなっているはずです。また **Submit**ボタンが視覚的に無効になり、1秒間の遅延の間にクリックしても何も起こらないはずです。

### Adding the Form to the Blog Post

<!--
Right above the display of existing comments on a blog post is probably where our form should go. So should we add it to the `Article` component along with the `CommentsCell` component? If wherever we display a list of comments we'll also include the form to add a new one, that feels like it may as well just go into the `CommentsCell` component itself. However, this presents a problem:
-->

ブログ記事の既存コメントの真上は、おそらく私たちのフォームが置かれるべき場所です。では、`Article` コンポーネントに `CommentsCell` コンポーネントと一緒に追加するべきなのでしょうか？もしコメントの一覧を表示するところに新しいコメントを追加するフォームも含めるのであれば、`CommentsCell` コンポーネント自体に追加した方が良いように感じます。しかし、これには問題があります：

<!--
If we put the `CommentForm` in the `Success` component of `CommentsCell` then what happens when there are no comments yet? The `Empty` component renders, which doesn't include the form! So it becomes impossible to add the first comment.
-->

もし `CommentsCell` の `Success` コンポーネントに `CommentForm` を配置したら、まだコメントがないときはどうなるでしょうか？フォームが含まれていない `Empty` コンポーネントがレンダリングされます！そのため、最初のコメントを追加することができなくなります。

<!--
We could copy the `CommentForm` to the `Empty` component as well, but as soon as you find yourself duplicating code like this it can be a hint that you need to rethink something about your design.
-->

`CommentForm` を `Empty` コンポーネントにコピーすることもできますが、このようにコードが重複していることは、気づいたらすぐにデザインについて考え直すタイミングであるという兆候です。

<!--
Maybe `CommentsCell` should really only be responsible for retrieving and displaying comments. Having it also accept user input seems outside of its primary concern.
-->

おそらく `CommentsCell` は本当にコメントを取得して表示することだけを責務として担うべきでしょう。ユーザの入力も受け付けるというのは、主要な関心事から外れているように思います。

<!--
So let's use `Article` as the cleaning house for where all these disparate parts are combined—the actual blog post, the form to add a new comment, and the list of comments (and a little margin between them):
-->

そこで、これらすべてのばらばらのパーツが組み合わされる掃除屋として `Article` を使ってみましょう。 -- 実際のブログ記事、新しいコメントを追加するフォーム、コメントのリスト（とそれらの間の小さなマージン）です：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.js"
import { Link, routes } from '@redwoodjs/router'

// highlight-next-line
import CommentForm from 'src/components/CommentForm'
import CommentsCell from 'src/components/CommentsCell'

const truncate = (text, length) => {
  return text.substring(0, length) + '...'
}

const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      {!summary && (
        // highlight-start
        <div className="mt-12">
          <CommentForm />
          // highlight-end
          <div className="mt-12">
            <CommentsCell />
          </div>
        // highlight-next-line
        </div>
      )}
    </article>
  )
}

export default Article
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="web/src/components/Article/Article.tsx"
import { Link, routes } from '@redwoodjs/router'

// highlight-next-line
import CommentForm from 'src/components/CommentForm'
import CommentsCell from 'src/components/CommentsCell'

import type { Post } from 'types/graphql'

const truncate = (text: string, length: number) => {
  return text.substring(0, length) + '...'
}

const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      {!summary && (
        // highlight-start
        <div className="mt-12">
          <CommentForm />
          // highlight-end
          <div className="mt-12">
            <CommentsCell />
          </div>
        // highlight-next-line
        </div>
      )}
    </article>
  )
}

export default Article
```

</TabItem>
</Tabs>

![image](https://user-images.githubusercontent.com/300/153929564-59bcafd6-f3a3-437e-86d9-b92753b7fe9b.png)

<!--
Looks great in Storybook, how about on the real site?
-->

Storybookではいい感じです。実際のサイトではどうでしょうか？

![image](https://user-images.githubusercontent.com/300/153929680-a33e5332-2e02-423e-9ca5-4757ad8dbbb5.png)

<!--
Now comes the ultimate test: creating a comment! LET'S DO IT:
-->

いよいよ、究極のテストです：コメント作成！さあ、やってみましょう：

![image](https://user-images.githubusercontent.com/300/153929833-f2a3e38d-c70e-4f64-ade1-4327a7f47193.png)

<!--
What happened here? Notice towards the end of the error message: `Field "postId" of required type "Int!" was not provided`. When we created our data schema we said that a post belongs to a comment via the `postId` field. And that field is required, so the GraphQL server is rejecting the request because we're not including that field. We're only sending `name` and `body`. Luckily we have access to the ID of the post we're commenting on thanks to the `article` object that's being passed into `Article` itself!
-->

何が起こったのでしょうか？エラーメッセージの最後の方に注目してください： `Field "postId" of required type "Int!" was not provided` （必須型 "Int!" のフィールド "postId" が提供されていません）。データスキーマを作成したときに、ブログ記事は `postId` フィールドを介してコメントに所属すると説明しました。そしてその `postId` フィールドは必須なので、GraphQLサーバはこのフィールドを含んでいないリクエストを拒否しています。私たちは `name` と `body` だけを送信しています。幸い `Article` に渡される `article` オブジェクトのおかげで、コメントしているブログ記事の ID にアクセスすることができます！

:::info Why didn't the Storybook story we wrote earlier expose this problem?

<!--
We manually mocked the GraphQL response in the story, and our mock always returns a correct response, regardless of the input!
-->

ストーリーの中でGraphQLのレスポンスを手動でモックしたので、私たちのモックは入力に関係なく常に正しいレスポンスを返してくれます！

<!--
There's always a tradeoff when creating mock data—it greatly simplifies testing by not having to rely on the entire GraphQL stack, but that means if you want it to be as accurate as the real thing you basically need to *re-write the real thing in your mock*. In this case, leaving out the `postId` was a one-time fix so it's probably not worth going through the work of creating a story/mock/test that simulates what would happen if we left it off.
-->

モックデータを作成する際には、常にトレードオフがあります -- テストをとてもシンプルにするとGraphQLスタック全体に依存する必要がなくなるため、できるだけ現実に即したテストをしようと思ったら *現実に起こることをコードで書き直す* ことになります。この場合 `postId` を省略するのは1回限りの修正なので、省略した場合にどうなるかをシミュレートするストーリー/モック/テストを作成する作業を行う価値はないでしょう。

<!--
But, if `CommentForm` ended up being a component that was re-used throughout your application, or the code itself will go through a lot of churn because other developers will constantly be making changes to it, it might be worth investing the time to make sure the interface (the props passed to it and the expected return) are exactly what you want them to be.
-->

しかし、もし `CommentForm` がアプリケーション全体で再利用されるコンポーネントになった場合、あるいは他の開発者が常に変更を加えるためコード自体が大きく変化する場合、インターフェイス (渡される props と期待される戻り値) が正確にあなたの望むものになるように時間を投資する価値はあるかもしれません。

:::

<!--
First let's pass the post's ID as a prop to `CommentForm`:
-->

まず、ブログ記事の ID を `CommentForm` に props として渡します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.js"
import { Link, routes } from '@redwoodjs/router'
import CommentsCell from 'src/components/CommentsCell'
import CommentForm from 'src/components/CommentForm'

const truncate = (text, length) => {
  return text.substring(0, length) + '...'
}

const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      {!summary && (
        <div className="mt-12">
          // highlight-next-line
          <CommentForm postId={article.id} />
          <div className="mt-12">
            <CommentsCell />
          </div>
        </div>
      )}
    </article>
  )
}

export default Article
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/Article/Article.tsx"
import { Link, routes } from '@redwoodjs/router'
import CommentsCell from 'src/components/CommentsCell'
import CommentForm from 'src/components/CommentForm'

const truncate = (text: string, length: number) => {
  return text.substring(0, length) + '...'
}

const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      {!summary && (
        <div className="mt-12">
          // highlight-next-line
          <CommentForm postId={article.id} />
          <div className="mt-12">
            <CommentsCell />
          </div>
        </div>
      )}
    </article>
  )
}

export default Article
```

</TabItem>
</Tabs>

<!--
And then we'll append that ID to the `input` object that's being passed to `createComment` in the `CommentForm`:
-->

そして、その ID を `CommentForm` の `createComment` に渡される `input` オブジェクトに追加します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentForm/CommentForm.js"
// highlight-next-line
const CommentForm = ({ postId }) => {
  const [createComment, { loading, error }] = useMutation(CREATE)

  const onSubmit = (input) => {
    // highlight-next-line
    createComment({ variables: { input: { postId, ...input } } })
  }

  return (
    //...
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/CommentForm/CommentForm.tsx"
// highlight-start
interface Props {
  postId: number
}
// highlight-end

// highlight-next-line
const CommentForm = ({ postId }: Props) => {
  const [createComment, { loading, error }] = useMutation(CREATE)

  const onSubmit: SubmitHandler<FormValues> = (input) => {
    // highlight-next-line
    createComment({ variables: { input: { postId, ...input } } })
  }

  return (
    //...
  )
}
```

</TabItem>
</Tabs>

<!--
Now fill out the comment form and submit! And...nothing happened! Believe it or not that's actually an improvement in the situation—no more error! What if we reload the page?
-->

では、コメントフォームに必要事項を記入して送信してください そうすると...何も起こりませんでした！信じられないかもしれませんが、実はこれは状況が改善されたのです -- もうこれでエラーはありません! ページを再読み込みしてみるとどうでしょう？

![image](https://user-images.githubusercontent.com/300/153930645-c5233fb5-ad7f-4a03-8707-3cd6164bb277.png)

<!--
Yay! It would have been nicer if that comment appeared as soon as we submitted the comment, so maybe that's a half-yay? Also, the text boxes stayed filled with our name/messages (before we reloaded the page) which isn't ideal. But, we can fix both of those. One involves telling the GraphQL client (Apollo) that we created a new record and, if it would be so kind, to try the query again that gets the comments for this page, and we'll fix the other by just removing the form from the page completely when a new comment is submitted.
-->

やったー！コメントを送信すると同時に表示されればもっと良かったので、5合目って感じでしょうか？しかし、テキストボックスに私たちの名前とメッセージが入力されたまま（ページを再読み込みする前の状態）なのは、理想的ではありません。でも、どちらも修正できます。一つはGraphQLクライアント（Apollo）に新しいレコードを作成したことを伝え、できれば、このページのコメントを取得するクエリをもう一度試してもらうことです。もう一つは、新しいコメントが送信されたときに、ページからフォームを完全に削除します。

### GraphQL Query Caching

<!--
Much has been written about the [complexities](https://medium.com/swlh/how-i-met-apollo-cache-ee804e6485e9) of [Apollo](https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980) [caching](https://levelup.gitconnected.com/basics-of-caching-data-in-graphql-7ce9489dac15), but for the sake of brevity (and sanity) we're going to do the easiest thing that works, and that's tell Apollo to just re-run the query that shows comments in the cell, known as "refetching."
-->

[Apollo](https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980) の [caching](https://levelup.gitconnected.com/basics-of-caching-data-in-graphql-7ce9489dac15) における [complexities](https://medium.com/swlh/how-i-met-apollo-cache-ee804e6485e9) （複雑さ）についてはたくさん書かれていますが、簡潔にするために（そして健全にするために）、最も簡単に機能することを行うつもりで、それはセルにおいてApolloにクエリを再実行してコメントを表示することを伝えます。これは "refetching" として知られています。

<!--
Along with the variables you pass to a mutation function (`createComment` in our case) there's an option named `refetchQueries` where you pass an array of queries that should be re-run because, presumably, the data you just mutated is reflected in the result of those queries. In our case there's a single query, the `QUERY` export of `CommentsCell`. We'll import that at the top of `CommentForm` (and rename so it's clear what it is to the rest of our code) and then pass it along to the `refetchQueries` option:
-->

ミューテーション関数（ここでは `createComment` ）に渡す変数と一緒に、 `refetchQueries` というオプションがあります。
これは再実行する必要があるクエリの配列で、これはおそらく、いま変更したデータがクエリ結果に反映されるからです。
この例ではひとつのクエリ、`CommentsCell` でエクスポートした `QUERY` があります。
これを `CommentForm` の先頭でインポートし（そして名前を変更し、他のコードから見てもそれが何であるかがわかるようにします）、 `refetchQueries` オプションに渡します：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentForm/CommentForm.js"
import {
  Form,
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'

// highlight-next-line
import { QUERY as CommentsQuery } from 'src/components/CommentsCell'

// ...

const CommentForm = ({ postId }) => {
  // highlight-start
  const [createComment, { loading, error }] = useMutation(CREATE, {
    refetchQueries: [{ query: CommentsQuery }],
  })
  // highlight-end

  //...
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/CommentForm/CommentForm.tsx"
import {
  Form,
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'

// highlight-next-line
import { QUERY as CommentsQuery } from 'src/components/CommentsCell'

// ...

const CommentForm = ({ postId }: Props) => {
  // highlight-start
  const [createComment, { loading, error }] = useMutation(CREATE, {
    refetchQueries: [{ query: CommentsQuery }],
  })
  // highlight-end

  //...
}
```

</TabItem>
</Tabs>

<!--
Now when we create a comment it appears right away! It might be hard to tell because it's at the bottom of the comments list (which is a fine position if you want to read comments in chronological order, oldest to newest). Let's pop up a little notification that the comment was successful to let the user know their contribution was successful in case they don't realize it was added to the end of the page.
-->

これで、コメントを作成すると、すぐに表示されるようになりました！作成したコメントはコメントリストの一番下にあるので、わかりにくいかもしれません（コメントを古いものから新しいものへと時系列に読みたい場合は、この位置が適しています）。ページの最後に追加されたことに気づかないユーザのために、コメントが成功したことを知らせる小さな通知をポップアップしてみましょう。

<!--
We'll make use of good old fashioned React state to keep track of whether a comment has been posted in the form yet or not. If so, let's remove the comment form completely and show a "Thanks for your comment" message. Redwood includes [react-hot-toast](https://react-hot-toast.com/) for showing popup notifications, so let's use that to thank the user for their comment. We'll remove the form with just a couple of CSS classes:
-->

古き良きReactのstateを利用して、コメントがフォームに投稿されたかどうかを追跡してみます。投稿されたら、コメントフォームを完全に削除して、 "Thanks for your comment" というメッセージを表示させましょう。Redwoodにはポップアップ通知を表示するための [react-hot-toast](https://react-hot-toast.com/) が含まれているので、それを使ってユーザのコメントにお礼を言いましょう。CSSのクラスをいくつか指定するだけで、フォームを削除することができます：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentForm/CommentForm.js"
// highlight-next-line
import { useState } from 'react'

import {
  Form,
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'
// highlight-next-line
import { toast } from '@redwoodjs/web/toast'

import { QUERY as CommentsQuery } from 'src/components/CommentsCell'

const CREATE = gql`
  mutation CreateCommentMutation($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      name
      body
      createdAt
    }
  }
`

const CommentForm = ({ postId }) => {
  // highlight-next-line
  const [hasPosted, setHasPosted] = useState(false)
  const [createComment, { loading, error }] = useMutation(CREATE, {
    // highlight-start
    onCompleted: () => {
      setHasPosted(true)
      toast.success('Thank you for your comment!')
    },
    // highlight-end
    refetchQueries: [{ query: CommentsQuery }],
  })

  const onSubmit = (input) => {
    createComment({ variables: { input: { postId, ...input } } })
  }

  return (
    // highlight-next-line
    <div className={hasPosted ? 'hidden' : ''}>
      <h3 className="font-light text-lg text-gray-600">Leave a Comment</h3>
      <Form className="mt-4 w-full" onSubmit={onSubmit}>
        <FormError
          error={error}
          titleClassName="font-semibold"
          wrapperClassName="bg-red-100 text-red-900 text-sm p-3 rounded"
        />
        <Label
          name="name"
          className="block text-xs font-semibold text-gray-500 uppercase"
        >
          Name
        </Label>
        <TextField
          name="name"
          className="block w-full p-1 border rounded text-sm "
          validation={{ required: true }}
        />

        <Label
          name="body"
          className="block mt-4 text-xs font-semibold text-gray-500 uppercase"
        >
          Comment
        </Label>
        <TextAreaField
          name="body"
          className="block w-full p-1 border rounded h-24 text-sm"
          validation={{ required: true }}
        />

        <Submit
          disabled={loading}
          className="block mt-4 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide rounded px-3 py-2 disabled:opacity-50"
        >
          Submit
        </Submit>
      </Form>
    </div>
  )
}

export default CommentForm
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/CommentForm/CommentForm.tsx"
// highlight-next-line
import { useState } from 'react'

import {
  Form,
  FormError,
  Label,
  TextField,
  TextAreaField,
  Submit,
} from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'
// highlight-next-line
import { toast } from '@redwoodjs/web/toast'

import { QUERY as CommentsQuery } from 'src/components/CommentsCell'

const CREATE = gql`
  mutation CreateCommentMutation($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      name
      body
      createdAt
    }
  }
`

interface FormValues {
  name: string
  email: string
  message: string
}

interface Props {
  postId: number
}

const CommentForm = ({ postId }: Props) => {
  // highlight-next-line
  const [hasPosted, setHasPosted] = useState(false)
  const [createComment, { loading, error }] = useMutation(CREATE, {
    // highlight-start
    onCompleted: () => {
      setHasPosted(true)
      toast.success('Thank you for your comment!')
    },
    // highlight-end
    refetchQueries: [{ query: CommentsQuery }],
  })

  const onSubmit: SubmitHandler<FormValues> = (input) => {
    createComment({ variables: { input: { postId, ...input } } })
  }

  return (
    // highlight-next-line
    <div className={hasPosted ? 'hidden' : ''}>
      <h3 className="font-light text-lg text-gray-600">Leave a Comment</h3>
      <Form className="mt-4 w-full" onSubmit={onSubmit}>
        <FormError
          error={error}
          titleClassName="font-semibold"
          wrapperClassName="bg-red-100 text-red-900 text-sm p-3 rounded"
        />
        <Label
          name="name"
          className="block text-xs font-semibold text-gray-500 uppercase"
        >
          Name
        </Label>
        <TextField
          name="name"
          className="block w-full p-1 border rounded text-sm "
          validation={{ required: true }}
        />

        <Label
          name="body"
          className="block mt-4 text-xs font-semibold text-gray-500 uppercase"
        >
          Comment
        </Label>
        <TextAreaField
          name="body"
          className="block w-full p-1 border rounded h-24 text-sm"
          validation={{ required: true }}
        />

        <Submit
          disabled={loading}
          className="block mt-4 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide rounded px-3 py-2 disabled:opacity-50"
        >
          Submit
        </Submit>
      </Form>
    </div>
  )
}

export default CommentForm
```

</TabItem>
</Tabs>

![image](https://user-images.githubusercontent.com/300/153932278-6e504b6b-9e8e-400e-98fb-8bfeefbe3812.png)

<!--
We used `hidden` to just hide the form and "Leave a comment" title completely from the page, but keeps the component itself mounted. But where's our "Thank you for your comment" notification? We still need to add the `Toaster` component (from react-hot-toast) somewhere in our app so that the message can actually be displayed. We could just add it here, in `CommentForm`, but what if we want other code to be able to post notifications, even when `CommentForm` isn't mounted? Where's the one place we put UI elements that should be visible everywhere? The `BlogLayout`!
-->

フォームと "Leave a comment" のタイトルを完全に隠すために `hidden` を使いましたが、コンポーネント自体はマウントしたままです。しかし "Thank you for your comment" の通知はどこにあるのでしょうか？メッセージを表示するためには、（react-hot-toastの） `Toaster` コンポーネントをアプリ内のどこかに追加する必要があります。`CommentForm` に追加することはできますが、しかし `CommentForm` がマウントされていないときでも他のコードで通知したい場合はどうしたらよいでしょうか？どこにでも表示されるべき UI 要素をどこに置けばいいのでしょうか？それは `BlogLayout` です！

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/layouts/BlogLayout/BlogLayout.js"
import { Link, routes } from '@redwoodjs/router'
// highlight-next-line
import { Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'

const BlogLayout = ({ children }) => {
  const { logOut, isAuthenticated, currentUser } = useAuth()

  return (
    <>
      // highlight-next-line
      <Toaster />
      <header className="relative flex justify-between items-center py-4 px-8 bg-blue-700 text-white">
        <h1 className="text-5xl font-semibold tracking-tight">
          <Link
            className="text-blue-400 hover:text-blue-100 transition duration-100"
            to={routes.home()}
          >
            Redwood Blog
          </Link>
        </h1>
        <nav>
          <ul className="relative flex items-center font-light">
            <li>
              <Link
                className="py-2 px-4 hover:bg-blue-600 transition duration-100 rounded"
                to={routes.about()}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className="py-2 px-4 hover:bg-blue-600 transition duration-100 rounded"
                to={routes.contact()}
              >
                Contact
              </Link>
            </li>
            <li>
              {isAuthenticated ? (
                <div>
                  <button type="button" onClick={logOut} className="py-2 px-4">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to={routes.login()} className="py-2 px-4">
                  Login
                </Link>
              )}
            </li>
          </ul>
          {isAuthenticated && (
            <div className="absolute bottom-1 right-0 mr-12 text-xs text-blue-300">
              {currentUser.email}
            </div>
          )}
        </nav>
      </header>
      <main className="max-w-4xl mx-auto p-12 bg-white shadow rounded-b">
        {children}
      </main>
    </>
  )
}

export default BlogLayout
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/layouts/BlogLayout/BlogLayout.tsx"
import { Link, routes } from '@redwoodjs/router'
// highlight-next-line
import { Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'

type BlogLayoutProps = {
  children?: React.ReactNode
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
  const { logOut, isAuthenticated, currentUser } = useAuth()

  return (
    <>
      // highlight-next-line
      <Toaster />
      <header className="relative flex justify-between items-center py-4 px-8 bg-blue-700 text-white">
        <h1 className="text-5xl font-semibold tracking-tight">
          <Link
            className="text-blue-400 hover:text-blue-100 transition duration-100"
            to={routes.home()}
          >
            Redwood Blog
          </Link>
        </h1>
        <nav>
          <ul className="relative flex items-center font-light">
            <li>
              <Link
                className="py-2 px-4 hover:bg-blue-600 transition duration-100 rounded"
                to={routes.about()}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className="py-2 px-4 hover:bg-blue-600 transition duration-100 rounded"
                to={routes.contact()}
              >
                Contact
              </Link>
            </li>
            <li>
              {isAuthenticated ? (
                <div>
                  <button type="button" onClick={logOut} className="py-2 px-4">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to={routes.login()} className="py-2 px-4">
                  Login
                </Link>
              )}
            </li>
          </ul>
          {isAuthenticated && (
            <div className="absolute bottom-1 right-0 mr-12 text-xs text-blue-300">
              {currentUser.email}
            </div>
          )}
        </nav>
      </header>
      <main className="max-w-4xl mx-auto p-12 bg-white shadow rounded-b">
        {children}
      </main>
    </>
  )
}

export default BlogLayout
```

</TabItem>
</Tabs>

<!--
Now add a comment:
-->

ここでコメントを追加します：

![image](https://user-images.githubusercontent.com/300/153933162-079ac322-acde-4ea0-b43e-58b53fb85d98.png)

### Almost Done?

<!--
So it looks like we're just about done here! Try going back to the homepage and go to another blog post. Let's bask in the glory of our amazing coding abilities and—OH NO:
-->

ということで、ここまでで一応終了のようです！トップページに戻って、別のブログ記事を見てみてください。
私たちの素晴らしいコーディング能力の栄誉に酔いしれましょう、そして -- OH-NO：

![image](https://user-images.githubusercontent.com/300/153933665-83158870-8422-4da9-9809-7d3b51444a14.png)

<!--
All posts have the same comments! **WHAT HAVE WE DONE??**
-->

全てのブログ記事に同じコメントがついています！ **私たちは何をしたのでしょう？？**

<!--
Remember our foreshadowing callout a few pages back, wondering if our `comments()` service which only returns *all* comments could come back to bite us? It finally has: when we get the comments for a post we're not actually getting them for only that post. We're ignoring the `postId` completely and just returning *all* comments in the database! Turns out the old axiom is true: computers only do exactly what you tell them to do.
-->

数ページ前の、 `comments()` サービスは *すべての* コメントを返すだけだが、という伏線を覚えていますか？
それがついに回収されました：あるブログ記事のコメントを取得したとき、実はその投稿だけのコメントを取得しているわけではありません。つまり、 `postId` を完全に無視して、データベースにある *すべての* コメントを返しているのです！古来からの原則が正しいと証明されました：コンピュータは指示したとおりにしか動かないのです。

<!--
Let's fix it!
-->

直しましょう！

### Returning Only Some Comments

<!--
We'll need to make both frontend and backend changes to get only some comments to show. Let's start with the backend and do a little test-driven development to make this change.
-->

一部のコメントだけを表示させるためには、フロントエンドとバックエンドの両方を変更する必要があります。バックエンドから始めて、この変更を行うために少しテスト駆動開発をしてみましょう。

#### Introducing the Redwood Console

<!--
It would be nice if we could try out sending some arguments to our Prisma calls and be sure that we can request a single post's comments without having to write the whole stack into the app (component/cell, GraphQL, service) just to see if it works.
-->

Prismaの呼び出しにいくつかの引数を送信して、1つのブログ記事のコメントを要求できることを確認できれば、それが動作するかどうかを確認するためにアプリにすべてのスタック（コンポーネント/セル、GraphQL、サービス）を記述する必要はありません。

<!--
That's where the Redwood Console comes in! In a new terminal instance, try this:
-->

そこで、Redwood Consoleの登場です！新しいターミナルインスタンスで、次のようにしてみてください：

```bash
yarn rw console
```

<!--
You'll see a standard Node console but with most of Redwood's internals already imported and ready to go! Most importantly, that includes the database. Try it out:
-->

標準的な Node コンソールが表示されますが、Redwood の内部のほとんどがすでにインポートされており、すぐに使えるようになっています！最も重要なのは、データベースがすぐに使えることです。試してみてください：

```bash
> db.comment.findMany()
[
  {
    id: 1,
    name: 'Rob',
    body: 'The first real comment!',
    postId: 1,
    createdAt: 2020-12-08T23:45:10.641Z
  },
  {
    id: 2,
    name: 'Tom',
    body: 'Here is another comment',
    postId: 1,
    createdAt: 2020-12-08T23:46:10.641Z
  }
]
```

<!--
(Output will be slightly different, of course, depending on what comments you already have in your database.)
-->

（もちろん、すでにデータベースにあるコメントの内容によって、出力は若干異なります）

<!--
Let's try the syntax that will allow us to only get comments for a given `postId`:
-->

与えられた `postId` のコメントのみを取得する構文を試してみましょう：

```bash
> db.comment.findMany({ where: { postId: 1 }})
[
  {
    id: 1,
    name: 'Rob',
    body: 'The first real comment!',
    postId: 1,
    createdAt: 2020-12-08T23:45:10.641Z
  },
  {
    id: 2,
    name: 'Tom',
    body: 'Here is another comment',
    postId: 1,
    createdAt: 2020-12-08T23:46:10.641Z
  }
]
```

<!--
Well it worked, but the list is exactly the same. That's because we've only added comments for a single post! Let's create a comment for a second post and make sure that only those comments for a specific `postId` are returned.
-->

さて、うまくいきましたが、リストはまったく同じです。それは、1つのブログ記事に対してしかコメントを追加していないからです！2番目のブログ記事に対するコメントを作成し、特定の `postId` に対するコメントのみが返されるようにしましょう。

<!--
We'll need the `id` of another post. Make sure you have at least two (create one through the admin if you need to). We can get a list of all the existing posts and copy the `id`:
-->

別のブログ記事の `id` が必要です。ブログ記事が少なくとも2つあることを確認してください（必要であれば、管理画面から作成してください）。既存の全ブログ記事のリストを取得して、`id`をコピーすればよいです：

```bash
> db.post.findMany({ select: { id: true } })
[ { id: 1 }, { id: 2 }, { id: 3 } ]
```

<!--
Okay, now let's create a comment for that second post via the console:
-->

よし。ではその2つ目の投稿に対して、コンソールからコメントを作成してみましょう：

```bash
> db.comment.create({ data: { name: 'Peter', body: 'I also like leaving comments', postId: 2 } })
{
  id: 3,
  name: 'Peter',
  body: 'I also like leaving comments',
  postId: 2,
  createdAt: 2020-12-08T23:47:10.641Z
}
```

<!--
Now we'll try our comment query again, once with each `postId`:
-->

ここで、コメントクエリをもう一度、それぞれの `postId` を使って試してみましょう：

```bash
> db.comment.findMany({ where: { postId: 1 }})
[
  {
    id: 1,
    name: 'Rob',
    body: 'The first real comment!',
    postId: 1,
    createdAt: 2020-12-08T23:45:10.641Z
  },
  {
    id: 2,
    name: 'Tom',
    body: 'Here is another comment',
    postId: 1,
    createdAt: 2020-12-08T23:46:10.641Z
  }
]

> db.comment.findMany({ where: { postId: 2 }})
[
  {
    id: 3,
    name: 'Peter',
    body: 'I also like leaving comments',
    postId: 2,
    createdAt: 2020-12-08T23:45:10.641Z
  },

```

<!--
Great! Now that we've tested out the syntax let's use that in the service. You can exit the console by pressing Ctrl-C twice or typing `.exit`
-->

素晴らしい！さて、構文のテストが終わったので、サービスで使ってみましょう。Ctrl-Cを2回押すか、`.exit`と入力するとコンソールを終了することができます。

:::info Where's the `await`?

<!--
Calls to `db` return a Promise, which you would normally need to add an `await` to in order to get the results right away. Having to add `await` every time is pretty annoying though, so the Redwood console does it for you—Redwood `await`s so you don't have to!
-->

`db` を呼び出すと Promise が返されます。通常、結果をすぐに取得するためには `await` する必要があります。しかし、毎回 `await` を書くのはかなり面倒なので、Redwood コンソールがそれをやってくれます -- Redwoodが `await` してくれるので、、あなたがする必要はありません！

:::

#### Updating the Service

<!--
Try running the test suite (or if it's already running take a peek at that terminal window) and make sure all of our tests still pass. The "lowest level" of the api-side is the services, so let's start there.
-->

テストスイートを実行してみて（あるいは、すでに実行されている場合はターミナルウィンドウを覗いてみて）、すべてのテストがいまだに合格していることを確認してください。APIサイドの "lowest level" （最下層）はサービスなので、そこから始めましょう。

:::tip

<!--
One way to think about your codebase is a "top to bottom" view where the top is what's "closest" to the user and what they interact with (React components) and the bottom is the "farthest" thing from them, in the case of a web application that would usually be a database or other data store (behind a third party API, perhaps). One level above the database are the services, which directly communicate to the database:
-->

コードベースについて考える一つの方法は、 "top to bottom" （上から下へ）という見方です。一番上はユーザに "最も近く" ユーザが操作するもの（Reactコンポーネント）、一番下はユーザから "最も遠い" もの、ウェブアプリケーションの場合、通常はデータベースやその他のデータストア（おそらくサードパーティAPIの後ろ）だと考えられます。データベースの1つ上の階層はサービスで、これはデータベースと直接通信します。

```
   Browser
      |
    React    ─┐
      |       │
   Graph QL   ├─ Redwood
      |       │
   Services  ─┘
      |
   Database
```

<!--
There are no hard and fast rules here, but generally the farther down you put your business logic (the code that deals with moving and manipulating data) the easier it will be to build and maintain your application. Redwood encourages you to put your business logic in services since they're "closest" to the data and behind the GraphQL interface.
-->

ここに厳密なルールはありませんが、一般的にビジネスロジック（データの移動や操作を行うコード）を下に置くほど、アプリケーションの構築と保守が容易になります。Redwoodでは、ビジネスロジックをサービスに置くことを推奨しています。サービスに置くことで、データに "最も近く" 、GraphQLインターフェースの背後にあるためです。

:::

<!--
Open up the **comments** service test and let's update it to pass the `postId` argument to the `comments()` function like we tested out in the console:
-->

**comments** サービスのテストを開き、コンソールでテストしたように `comments()` 関数に `postId` 引数を渡すよう更新してみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="api/src/services/comments/comments.test.js"
scenario('returns all comments', async (scenario) => {
  // highlight-next-line
  const result = await comments({ postId: scenario.comment.jane.postId })
  expect(result.length).toEqual(Object.keys(scenario.comment).length)
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="api/src/services/comments/comments.test.ts"
scenario('returns all comments', async (scenario: StandardScenario) => {
  // highlight-next-line
  const result = await comments({ postId: scenario.comment.jane.postId })
  expect(result.length).toEqual(Object.keys(scenario.comment).length)
})
```

</TabItem>
</Tabs>

<!--
When the test suite runs everything will still pass. Javascript won't care if you're passing an argument all of a sudden (although if you were using Typescript you will actually get an error at this point!). In TDD you generally want to get your test to fail before adding code to the thing you're testing which will then cause the test to pass. What's something in this test that will be different once we're only returning *some* comments? How about the number of comments expected to be returned?
-->

テストスイートが実行されても、すべて合格します。Javascriptは、あなたが突然引数を渡しても気にしません（Typescriptを使用していた場合は、この時点で実際にエラーが発生します！）。TDDでは一般的に、コードを書く前にテストが失敗するように仕向けてから、テストに合格するようなコードをテスト対象に追加します。*いくつか* のコメントだけを返すようになったら、このテストでは何が変わるでしょうか? 返されるコメントの数はどうでしょうか？

<!--
Let's take a look at the scenario we're using (remember, it's `standard()` by default):
-->

今回使用するシナリオを見てみましょう（デフォルトでは `standard()` であることを思い出してください）。

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="api/src/services/comments/comments.scenarios.js"
export const standard = defineScenario({
  comment: {
    jane: {
      data: {
        name: 'Jane Doe',
        body: 'I like trees',
        post: {
          create: {
            title: 'Redwood Leaves',
            body: 'The quick brown fox jumped over the lazy dog.',
          },
        },
      },
    },
    john: {
      data: {
        name: 'John Doe',
        body: 'Hug a tree today',
        post: {
          create: {
            title: 'Root Systems',
            body: 'The five boxing wizards jump quickly.',
          },
        },
      },
    },
  },
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```javascript title="api/src/services/comments/comments.scenarios.ts"
export const standard = defineScenario({
  comment: {
    jane: {
      data: {
        name: 'Jane Doe',
        body: 'I like trees',
        post: {
          create: {
            title: 'Redwood Leaves',
            body: 'The quick brown fox jumped over the lazy dog.',
          },
        },
      },
    },
    john: {
      data: {
        name: 'John Doe',
        body: 'Hug a tree today',
        post: {
          create: {
            title: 'Root Systems',
            body: 'The five boxing wizards jump quickly.',
          },
        },
      },
    },
  },
})
```

</TabItem>
</Tabs>

<!--
Each scenario here is associated with its own post, so rather than counting all the comments in the database (like the test does now) let's only count the number of comments attached to the single post we're getting comments for (we're passing the postId into the `comments()` call now). Let's see what it looks like in test form:
-->

ここでは各シナリオがそれぞれのブログ記事に関連付けられているので、データベース内のすべてのコメントをカウントするのではなく（今のテストがそうであるように）、コメントを取得している単一のブログ記事に付けられたコメントの数だけをカウントしましょう（今は `comments()` の呼び出しに postId を渡しています）。テストフォームでどのように見えるか見てみましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="api/src/services/comments/comments.test.js"
import { comments, createComment } from './comments'
// highlight-next-line
import { db } from 'src/lib/db'

describe('comments', () => {
  scenario('returns all comments', async (scenario) => {
    const result = await comments({ postId: scenario.comment.jane.postId })
    // highlight-start
    const post = await db.post.findUnique({
      where: { id: scenario.comment.jane.postId },
      include: { comments: true },
    })
    expect(result.length).toEqual(post.comments.length)
    // highlight-end
  })

  // ...
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="api/src/services/comments/comments.test.ts"
import { comments, createComment } from './comments'
// highlight-next-line
import { db } from 'src/lib/db'

import type { StandardScenario } from './comments.scenarios'

describe('comments', () => {
  scenario('returns all comments', async (scenario) => {
    const result = await comments({ postId: scenario.comment.jane.postId })
    // highlight-start
    const post = await db.post.findUnique({
      where: { id: scenario.comment.jane.postId },
      include: { comments: true },
    })
    expect(result.length).toEqual(post.comments.length)
    // highlight-end
  })

  // ...
})
```

</TabItem>
</Tabs>

<!--
So we're first getting the result from the services, all the comments for a given `postId`. Then we pull the *actual* post from the database and include its comments. Then we expect that the number of comments returned from the service is the same as the number of comments actually attached to the post in the database. Now the test fails and you can see why in the output:
-->

つまり、まずサービスから、与えられた `postId` に対するすべてのコメントを取得します。次に、データベースから *実際の* ブログ記事とコメントを取得します。そして、サービスから返されたコメントの数が、データベースで実際にブログ記事につけられたコメントの数と同じであることを期待します。いまのところこのテストは失敗し、理由が出力されます：

```bash
 FAIL   api  api/src/services/comments/comments.test.js
  • comments › returns all comments

    expect(received).toEqual(expected) // deep equality

    Expected: 1
    Received: 2
```

<!--
So we expected to receive 1 (from `post.comments.length`), but we actually got 2 (from `result.length`).
-->

（ `post.comments.length`から）1を受け取ることを期待しましたが、実際には（ `result.length` から）2を受け取りました。

<!--
Before we get it passing again, let's also change the name of the test to reflect what it's actually testing:
-->

再びテストする前に、実際にテストしている内容を反映させるために、テストの名前も変更しましょう：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="api/src/services/comments/comments.test.js"
// highlight-start
scenario(
  'returns all comments for a single post from the database',
  // highlight-end
  async (scenario) => {
    const result = await comments({ postId: scenario.comment.jane.postId })
    const post = await db.post.findUnique({
      where: { id: scenario.comment.jane.postId },
      include: { comments: true },
    })
    expect(result.length).toEqual(post.comments.length)
  }
)
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```javascript title="api/src/services/comments/comments.test.ts"
// highlight-start
scenario(
  'returns all comments for a single post from the database',
  // highlight-end
  async (scenario: StandardScenario) => {
    const result = await comments({ postId: scenario.comment.jane.postId })
    const post = await db.post.findUnique({
      where: { id: scenario.comment.jane.postId },
      include: { comments: true },
    })
    expect(result.length).toEqual(post.comments.length)
  }
)
```

</TabItem>
</Tabs>

<!--
Okay, open up the actual `comments.js` service and we'll update it to accept the `postId` argument and use it as an option to `findMany()` (be sure to update the `comments()` function [with an "s"] and not the unused `comment()` function):
-->

では、実際の `comments.js` サービスを開いて、引数として `postId` を受け取り、それを `findMany()` のオプションとして使うように更新します（使っていないほうの `comment()` 関数ではなく、必ず [s] が付いた `comments()` 関数を更新してください）：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```javascript title="api/src/services/comments/comments.js"
export const comments = ({ postId }) => {
  return db.comment.findMany({ where: { postId } })
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="api/src/services/comments/comments.ts"
export const comments = ({
  postId,
}: Required<Pick<Prisma.CommentWhereInput, 'postId'>>) => {
  return db.comment.findMany({ where: { postId } })
}
```

</TabItem>
</Tabs>

<!--
Save that and the test should pass again!
-->

これを保存すれば、テストは再び合格するはずです！

#### Updating GraphQL

<!--
Next we need to let GraphQL know that it should expect a `postId` to be passed for the `comments` query, and it's required (we don't currently have any view that allows you see all comments everywhere so we can ask that it always be present). Open up the `comments.sdl.{js,ts}` file:
-->

次に、 `comments` クエリに渡す `postId` が必須であることを GraphQL に知らせる必要があります（現在、すべてのコメントをどこでも見ることができるビューはないので、必須にすることができます）。 `comments.sdl.{js,ts}` ファイルを開いてください：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```graphql title="api/src/graphql/comments.sdl.js"
type Query {
  // highlight-next-line
  comments(postId: Int!): [Comment!]! @skipAuth
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```graphql title="api/src/graphql/comments.sdl.ts"
type Query {
  // highlight-next-line
  comments(postId: Int!): [Comment!]! @skipAuth
}
```

</TabItem>
</Tabs>

<!--
Now if you try refreshing the real site in dev mode you'll see an error where the comments should be displayed:
-->

ここで、開発者モードで実際のサイトを更新してみると、コメントが表示されるはずの場所にエラーが表示されます：

![image](https://user-images.githubusercontent.com/300/198095941-bbd07ede-2006-422a-8635-ea8fe57dd403.png)

<!--
For security reasons we don't show the internal error message here, but if you check the terminal window where `yarn rw dev` is running you'll see the real message:
-->

セキュリティ上の理由から、ここでは内部エラーメッセージを表示しませんが、 `yarn rw dev` を実行しているターミナルウィンドウをチェックすると、本当のメッセージを見ることができます：

```text
Field "comments" argument "postId" of type "Int!" is required, but it was not provided.
```

<!--
And yep, it's complaining about `postId` not being present—exactly what we want!
-->

そう、`postId` が存在しないことに文句を言っているのです -- まさに我々が望んでいることです！

<!--
That completes the backend updates, now we just need to tell `CommentsCell` to pass through the `postId` to the GraphQL query it makes.
-->

これでバックエンドの更新は完了です。あとは作成する GraphQL クエリに `postId` を渡すよう `CommentsCell` に指示するだけです。

#### Updating the Cell

<!--
First we'll need to get the `postId` to the cell itself. Remember when we added a `postId` prop to the `CommentForm` component so it knew which post to attach the new comment to? Let's do the same for `CommentsCell`.
-->

まず、セル自体に `postId` を取得する必要があります。`CommentForm` コンポーネントに `postId` props を追加して、新しいコメントをどのブログ記事につけるのか、わかるようにしたことを思い出してください。同じことを `CommentsCell` でもしてみましょう。

<!--
Open up `Article`:
-->

`Article` を開いてください：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/Article/Article.js"
const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      {!summary && (
        <div className="mt-12">
          <CommentForm postId={article.id} />
          <div className="mt-12">
            // highlight-next-line
            <CommentsCell postId={article.id} />
          </div>
        </div>
      )}
    </article>
  )
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/Article/Article.tsx"
const Article = ({ article, summary = false }) => {
  return (
    <article>
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.article({ id: article.id })}>{article.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(article.body, 100) : article.body}
      </div>
      {!summary && (
        <div className="mt-12">
          <CommentForm postId={article.id} />
          <div className="mt-12">
            // highlight-next-line
            <CommentsCell postId={article.id} />
          </div>
        </div>
      )}
    </article>
  )
}
```

</TabItem>
</Tabs>

<!--
And finally, we need to take that `postId` and pass it on to the `QUERY` in the cell:
-->

そして最後に、その `postId` をセル内の `QUERY` に渡す必要があります：

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```graphql title="web/src/components/CommentsCell/CommentsCell.js"
export const QUERY = gql`
  // highlight-start
  query CommentsQuery($postId: Int!) {
    comments(postId: $postId) {
    // highlight-end
      id
      name
      body
      createdAt
    }
  }
`
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```graphql title="web/src/components/CommentsCell/CommentsCell.tsx"
export const QUERY = gql`
  // highlight-start
  query CommentsQuery($postId: Int!) {
    comments(postId: $postId) {
    // highlight-end
      id
      name
      body
      createdAt
    }
  }
`
```

</TabItem>
</Tabs>

<!--
Where does this magical `$postId` come from? Redwood is nice enough to automatically provide it to you since you passed it in as a prop when you called the component!
-->

この魔法のような `$postId` はどこから来るのでしょうか？コンポーネントを呼び出したときに props として渡したので、Redwoodは自動的にこれを提供してくれるのです！

<!--
Try going to a couple of different blog posts and you should see only comments associated to the proper posts (including the one we created in the console). You can add a comment to each blog post individually and they'll stick to their proper owners:
-->

いくつかの異なるブログ記事にアクセスしてみると、適切なブログ記事（コンソールで作成したものを含め）に関連するコメントだけが表示されるはずです。それぞれのブログ記事にそれぞれコメントを追加すれば、適切なブログ記事につくようになります：

![image](https://user-images.githubusercontent.com/300/100954162-de24f680-34c8-11eb-817b-0a7ad802f28b.png)

<!--
However, you may have noticed that now when you post a comment it no longer appears right away! ARGH! Okay, turns out there's one more thing we need to do. Remember when we told the comment creation logic to `refetchQueries`? We need to include any variables that were present the first time so that it can refetch the proper ones.
-->

しかし、コメントを投稿してもすぐには表示されなくなったことにお気づきでしょうか！残念です！さて、もう一つやらなければならないことがあります。コメント作成ロジックに `refetchQueries` を指定したのを覚えていますか？適切なものを再取得するために、最初に存在した変数を含める必要があります。

#### Updating the Form Refetch

<!--
Okay this is the last fix, promise!
-->

よし。これが最後の修正です。約束します！

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="web/src/components/CommentForm/CommentForm.js"
const [createComment, { loading, error }] = useMutation(CREATE, {
  onCompleted: () => {
    setHasPosted(true)
    toast.success('Thank you for your comment!')
  },
  // highlight-next-line
  refetchQueries: [{ query: CommentsQuery, variables: { postId } }],
})
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```jsx title="web/src/components/CommentForm/CommentForm.tsx"
const [createComment, { loading, error }] = useMutation(CREATE, {
  onCompleted: () => {
    setHasPosted(true)
    toast.success('Thank you for your comment!')
  },
  // highlight-next-line
  refetchQueries: [{ query: CommentsQuery, variables: { postId } }],
})
```

</TabItem>
</Tabs>

<!--
There we go, comment engine complete! Our blog is totally perfect and there's absolutely nothing we could do to make it better.
-->

さあ、コメントエンジンの完成です！私たちのブログは完全に完璧で、より良くするためにできることは全く何もありません。

<!--
Or is there?
-->

それとも、何かあります？
