<script setup lang="ts">
import Header from "./components/Header.vue";
import { DynamicDialog, Toast, useToast } from "primevue";
import { ToastService } from "./services/toastService";
import LoadingModal from "./components/dynamicDialogs/LoadingModal.vue";

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
  <LoadingModal></LoadingModal>
</template>

<style>
.content {
  height: calc(100vh - var(--global-header-height));
}
</style>
