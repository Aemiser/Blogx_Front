<template>
  <div class="collections-page">
    <div class="app-container">
      <h1 class="page-title">收藏夹</h1>
      <div class="empty">
        <p>暂无收藏</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.collections-page {
  padding: $space-6 0;
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
