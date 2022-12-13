# Installation & Starting Development

<!--
We'll use yarn ([yarn](https://yarnpkg.com/en/docs/install) is a requirement) to create the basic structure of our app:
-->

[yarn](https://yarnpkg.com/en/docs/install) を使ってアプリの基本構造を作っていきます：


<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```bash
yarn create redwood-app ./redwoodblog
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```bash
yarn create redwood-app --ts ./redwoodblog
```

</TabItem>
</Tabs>

<!--
You'll have a new directory `redwoodblog` containing several directories and files. Change to that directory and we'll start the development server:
-->

いくつかのディレクトリとファイルを含む新しいディレクトリ `redwoodblog` ができるはずです。そのディレクトリに移動して開発サーバを起動します：

```bash
cd redwoodblog
yarn redwood dev
```

<!--
A browser should automatically open to [http://localhost:8910](http://localhost:8910) and you will see the Redwood welcome page:
-->

ブラウザが自動的に[http://localhost:8910](http://localhost:8910)を開き、Redwoodのウェルカムページが表示されるはずです。

![Redwood Welcome Page](https://user-images.githubusercontent.com/300/145314717-431cdb7a-1c45-4aca-9bbc-74df4f05cc3b.png)

:::tip

<!--
Remembering the port number is as easy as counting: 8-9-10!
-->

ポート番号を覚えるのは、数えるのと同じくらい簡単です。8-9-10！

:::

<!--
The splash page gives you links to a ton of good resources, but don't get distracted: we've got a job to do!
-->

スプラッシュページにはたくさんのすばらしいリソースへのリンクがありますが、気を取られてはいけません：私達にはやるべきことがあります！

### First Commit

<!--
Now that we have the skeleton of our Redwood app in place, it's a good idea to save the current state of the app as your first commit...just in case.
-->

さて、Redwood アプリの骨格ができたので、念のため、現在のアプリの状態を最初のコミットとして保存しておくとよいでしょう。

```bash
git init
git add .
git commit -m 'First commit'
```

<!--
[git](https://git-scm.com/) is another of those concepts we assume you know, but you *can* complete the tutorial without it. Well, almost: you won't be able to deploy! At the end we'll be deploying to a provider that requires your codebase to be hosted in either [GitHub](https://github.com) or [GitLab](https://gitlab.com).
-->

[git](https://git-scm.com/)について知っていることを前提にしましたが、これがなくてもチュートリアルを終えることはできます。まあ、ほとんどですが：というのも、デプロイすることができません。チュートリアルの最後に、コードベースが [GitHub](https://github.com) または [GitLab](https://gitlab.com) にホストされていることを前提にしたプロバイダにデプロイすることになります。

<!--
If you're not worried about deployment for now, you can go ahead and complete the tutorial without using `git` at all.
-->

もし今のところデプロイの心配がないのであれば `git` を全く使わずにチュートリアルを進めても構いません。
