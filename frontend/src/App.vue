<script setup lang="ts">
import Header from "./components/Header.vue";
import { DynamicDialog, Toast, useConfirm, useToast } from "primevue";
import { ToastService } from "./services/toastService";
import LoadingModal from "./components/dynamicDialogs/LoadingModal.vue";
import { ConfirmationModalService } from "./services/confirmationModalService";

const toast = useToast();
ToastService.setToastInstance(toast);

const confirm = useConfirm();
ConfirmationModalService.setConfirmInstance(confirm);
</script>

<template>
  <Header></Header>
  <div class="content">
    <RouterView />
  </div>
  <DynamicDialog />
  <ConfirmDialog />
  <Toast />
  <LoadingModal></LoadingModal>
</template>

<style>
.content {
  height: calc(100vh - var(--global-header-height));
}
</style>
