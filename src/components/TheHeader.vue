<template>
  <div class="app-header">
    <h1 class="title">
      <span class="en">Simple image editor</span>
      <span class="ja">- トリミング・回転・リサイズ -</span>
    </h1>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@700&display=swap&text=Simple image editor');

.app-header {
  > .title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-weight: 700;
  }
  > .title > .en {
    margin-right: 0.5em;
    font-family: 'Quicksand', sans-serif;
    font-size: 2rem;
  }
  > .title > .ja {
    font-size: 1.5rem;
  }
}
</style>
