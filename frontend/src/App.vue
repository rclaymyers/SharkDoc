<script setup lang="ts">
import Header from "./components/Header.vue";
import UserLoginRegistration from "./components/UserLoginRegistration.vue";
</script>

<template>
  <Header></Header>
  <div class="content">
    <RouterView />
  </div>
</template>

<style></style>
