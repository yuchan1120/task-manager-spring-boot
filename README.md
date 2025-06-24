# task-manager-spring-boot

## 📝 概要

**task-manager-spring-boot** は、Spring Boot（バックエンド）、React（フロントエンド）、MySQL（データベース）、RabbitMQ（メッセージキュー）を使用して構築されたフルスタックのToDo管理アプリケーションです。

---

## ✨ 主な機能

- タスクの作成・編集・削除
- タスクの完了状態の切り替え
- タスク一覧のフィルタリング（すべて／未完了／完了）
- RabbitMQ動作テスト
- フロントエンドとバックエンドの完全分離構成

---

## 🧩 システム構成図

```plaintext
+------------------+       HTTP        +---------------------+       JDBC        +------------------+
|  React Frontend  | <---------------> |  Spring Boot API    | <---------------> |     MySQL        |
+------------------+                   +---------------------+                   +------------------+
                                              |
                                              | AMQP
                                              v
                                      +---------------------+
                                      |     RabbitMQ        |
                                      +---------------------+
```

---

## 🚀 セットアップ手順
以下のコマンドでdocckerを立ち上げてhttp://localhost:3000/ にアクセスしてください。
```bash
docker compose up --build
```

---

## 🐰 RabbitMQ動作テスト
以下のコマンドでAPIにPOSTリクエストを送信します。
```shell
Invoke-RestMethod -Uri http://localhost:8080/api/test ` 
                  -Method Post ` 
                  -Body '"これはRabbitMQへのテストメッセージです"' ` 
                  -ContentType "application/json" 
```
### 📥 メッセージが送信されたことを確認する方法 

#### ✅ 1. RabbitMQの管理画面で確認 

URL: http://localhost:15672 

- ログイン: guest / guest 
- 「Queues」タブで todoQueue を選択 
  - メッセージ数（Ready, Unacked） 
   コンシューマー数 
  - メッセージの流量グラフ 

 

#### ✅ 2. Spring Bootのログで確認 

TodoReceiver がメッセージを受信すると、以下のようなログが出力されます： 
```bash
rabbitTemplate.convertAndSend("todoQueue", message); 
```

```
