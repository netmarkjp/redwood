# Introduction to Testing

<!--
Let's run the test suite to make sure everything is working as expected (you can keep the dev server running and start this in a new terminal window):
-->

テストスイートを実行して、すべてが期待通りに動作していることを確認しましょう（開発サーバを起動したまま、新しいターミナルウィンドウでこれを開始することができます）：

```bash
yarn rw test
```

<!--
The `test` command starts a persistent process which watches for file changes and automatically runs any tests associated with the changed file(s) (changing a component *or* its tests will trigger a test run).
-->

`test` コマンドは永続的なプロセスを起動します。このプロセスはファイルの変更を監視し、変更されたファイルに関連するテストを自動的に実行します（コンポーネント *または* そのテストが変更されたらテスト実行がトリガーされます）。

<!--
Since we just started the suite, and we haven't changed any files yet, it may not actually run any tests at all. Hit `a` to tell it run **a**ll tests and we should get something like this:
-->

スイートを開始したばかりで、まだ何もファイルを変更していないので、実際には何もテストが実行されないかもしれません。
`a` を押して全ての（ **a**ll ）テストを実行するように指示すると、次のようになるはずです：

![tests_running](https://user-images.githubusercontent.com/46945607/165376937-89ed9254-0d8e-4945-a0d9-17178764a4b0.png)

<!--
If you cloned the example repo during the intermission and followed along with the Storybook tutorial in this chapter, the test run should finish and you will see something like this:
-->

Intermission の時に example リポジトリをクローンし、この章のStorybookチュートリアルに沿って進めていれば、テスト実行が終了し、次のような表示になるはずです：

![suite_finished](https://user-images.githubusercontent.com/46945607/165378519-2859dd0d-d46a-448f-a62e-0b8f91c55a87.png)

:::info

<!--
If you decided to keep your codebase from the first part of the tutorial, then you'll get the following error after running
-->

もし、チュートリアルの最初の部分のコードベースをそのまま使用することにした場合、次のようなエラーが発生します。

```bash
yarn rw test

Error: Get config: Schema Parsing P1012

error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
  -->  schema.prisma:3
   |
 2 |   provider = "postgresql"
 3 |   url      = env("DATABASE_URL")
   |

Validation Error Count: 1

error Command failed with exit code 1.
```

<!--
To clear the error and to proceed with running the test suite, head over to your `.env` file and add the following line:
-->

このエラーを解消してテストスイートを実行するためには、 `.env` ファイルに以下を追記してください：

```bash
TEST_DATABASE_URL=<the same url as DATABASE_URL>
```

:::

<!--
Note that the summary on the bottom indicates that there was 1 test that failed. If you feel curious, you can scroll up in your terminal and see more details on the test that failed. We'll also take a look at that failed test shortly.
-->

出力下部のサマリーには、失敗したテストが1つあることが示されていることに注意してください。もし興味があれば、ターミナルを上にスクロールして、失敗したテストの詳細を見ることができます。
その失敗したテストもさっと見てみましょう。

<!--
If you continued with your own repo from chapters 1-4, you may see some other failures here or none at all: we made a lot of changes to the pages, components and cells we generated, but didn't update the tests to reflect the changes we made. (Another reason to start with the [example repo](../intermission.md#using-the-example-repo-recommended)!)
-->

1章から4章まで育てた自分のリポジトリでここまで続けた方は、ここで他の失敗が起きるかもしれませんし、全く起きないかもしれません：私たちは、生成したページ、コンポーネント、セルに多くの変更を加えましたが、加えた変更を反映させるためにテストを更新しませんでした（これが [example repo](../intermission.md#using-the-example-repo-recommended) から始めるべきもうひとつり理由です！）。

<!--
To switch back to the default mode where test are **o**nly run for changed files, press `o` now (or quit and restart `yarn rw test`).
-->

変更されたファイルに対してのみテストが実行されるデフォルトのモードに戻るには、今すぐ `o` （ **o**nly ）を押してください（または、一度終了して `yarn rw test` を再実行してください）。

<!--
What we want to aim for is all green in that left column and no failed tests. In fact best practices tell us you should not even commit any code to your repo unless the test suite passes locally. Not everyone adheres to this policy quite as strictly as others...*&lt;cough, cough&gt;*
-->

私たちが目指すのは、左の列がすべて緑で、テストに失敗がないことです。実際、ベストプラクティスでは、ローカルでテストスイートをパスしない限り、コードをリポジトリにコミットすべきではありません。しかし、誰もがこのポリシーを厳守しているわけではありません... *&lt;ゲホッゲホッ&gt;*

<!--
We've got an excellent document on [Testing](../../testing.md) which you should definitely read if you're brand new to testing, especially the [Terminology](../../testing.md#terminology) and [Redwood and Testing](../../testing.md#redwood-and-testing) sections. For now though, proceed to the next section and we'll go over our approach to getting that last failed test passing.
-->

テストに不慣れなあなたには [Testing](../../testing.md) という素晴らしいドキュメントがあります。特に [Terminology](../../testing.md#terminology) と [Redwood and Testing](../../testing.md#redwood-and-testing) のセクションは絶対に読んでおくべきです。とりあえず、次のセクションに進んで、最後に失敗したテストを合格させるための私たちのアプローチについて説明します。
