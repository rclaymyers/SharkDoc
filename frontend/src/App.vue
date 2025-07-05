<script setup lang="ts">
import Header from "./components/Header.vue";
import { DynamicDialog, Toast, useToast } from "primevue";
import { ToastService } from "./services/toastService";

const toast = useToast();
ToastService.setToastInstance(toast);
</script>

<template>
  <Header></Header>
  <div class="content">
    <RouterView />
  </div>
  <DynamicDialog />
  <Toast />
</template>

<style>
.content {
  height: calc(100vh - var(--global-header-height));
}
</style>
