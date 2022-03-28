# Simple image editor

### 目次

- アプリケーションの概要
- URL
- 機能一覧
- 利用技術一覧
- ローカル動作環境・動作方法

## アプリケーションの概要

トリミング・回転・リサイズができる画像編集アプリケーションです。

## URL

https://shoco55.github.io/simple-image-editor/

## 機能一覧

- 画像アップロード機能  
  ローカルから画像を選択します。サーバーには保存しません。
- 画像編集機能
  - トリミング
  - 回転（90° ずつ）
  - リサイズ（オリジナルサイズからの縮小のみ、拡大は不可）
- 画像ダウンロード機能  
  編集後の画像をローカルにダウンロードします。

## 利用技術一覧

- Vue.js 3.2
- TypeScript
- Element Plus（Vue 3 UI Framework）
- Vite
- GitHub Pages

## ローカル動作環境・動作方法

- node 16.13.1
- yarn 1.22.10

1. yarn install
2. yarn dev
