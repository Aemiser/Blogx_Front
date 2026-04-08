<template>
  <router-link to="/" class="logo">
    <span class="logo__text">Blogx</span>
  </router-link>
</template>

<style scoped lang="scss">
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  
  &__text {
    font-size: $text-2xl;
    font-weight: $font-weight-bold;
    color: $primary;
    letter-spacing: -0.5px;
  }
}

@media (max-width: $breakpoint-md) {
  .logo {
    &__text {
      font-size: $text-lg;
    }
  }
}
</style>
