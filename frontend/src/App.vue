<script setup lang="ts">
import Header from "./components/Header.vue";
</script>

<template>
  <Header></Header>
  <div class="content">
    <RouterView />
  </div>
</template>

<style>
.content {
  padding: 2rem;
}
</style>
