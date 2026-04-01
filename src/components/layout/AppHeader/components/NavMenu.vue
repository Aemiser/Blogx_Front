<template>
  <nav class="nav-menu">
    <router-link to="/" class="nav-menu__item" exact-active-class="active">
      首页
    </router-link>
  </nav>
</template>

<style scoped lang="scss">
.nav-menu {
  display: flex;
  align-items: center;
  gap: $space-2;
  
  &__item {
    padding: $space-2 $space-3;
    color: $text-secondary;
    font-size: $text-base;
    border-radius: $radius-md;
    transition: all $duration-fast;
    
    &:hover {
      color: $text-primary;
      background: $bg-hover;
    }
    
    &.active {
      color: $primary;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .nav-menu {
    display: none;
  }
}
</style>
