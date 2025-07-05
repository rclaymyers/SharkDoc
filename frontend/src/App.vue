<script setup lang="ts">
import Header from "./components/Header.vue";
import { DynamicDialog } from "primevue";
</script>

<template>
  <Header></Header>
  <div class="content">
    <RouterView />
  </div>
  <DynamicDialog />
</template>

<style>
.content {
  height: calc(100vh - var(--global-header-height));
}
</style>
