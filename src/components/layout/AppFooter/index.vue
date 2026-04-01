<template>
  <footer class="app-footer">
    <div class="app-footer__content">
      <div class="app-footer__links">
        <a href="#" target="_blank">关于我们</a>
        <a href="#" target="_blank">联系方式</a>
        <a href="#" target="_blank">隐私政策</a>
        <a href="#" target="_blank">使用条款</a>
      </div>
      <p>© 2026 Blogx. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  background: $bg-card;
  border-top: 1px solid $border-light;
  padding: $space-8 0;
  margin-top: auto;
  
  &__content {
    max-width: $container-xl;
    margin: 0 auto;
    padding: 0 $space-6;
    text-align: center;
    color: $text-tertiary;
    font-size: $text-sm;
  }
  
  &__links {
    display: flex;
    justify-content: center;
    gap: $space-4;
    margin-bottom: $space-4;
    
    a {
      color: $text-secondary;
      transition: color $duration-fast;
      
      &:hover {
        color: $primary;
      }
    }
  }
}

[data-theme="dark"] .app-footer {
  background: $dark-bg-secondary;
  border-color: $dark-border;
}
</style>
