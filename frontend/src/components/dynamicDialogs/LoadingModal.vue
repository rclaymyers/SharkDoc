<script setup lang="ts">
import { ProgressSpinner } from "primevue";
import { ref } from "vue";
import {
  LoadingModalService,
  type LoadingModalParams,
} from "../../services/loadingModalService";

const loadingModalShowing = ref<boolean>(false);
const loadingMessage = ref<string>("");

console.log("Loading modal subscribing to events forever");
LoadingModalService.subscribeForever(
  (loadingModalParams: LoadingModalParams) => {
    loadingModalShowing.value = loadingModalParams.showModal;
    loadingMessage.value = loadingModalParams.loadingMessage ?? "";
  }
);
</script>
<template>
  <div class="loading-modal-container" v-if="loadingModalShowing">
    <h3 class="mb-5">{{ loadingMessage }}</h3>
    <ProgressSpinner />
  </div>
</template>

<style>
.loading-modal-container {
  backdrop-filter: blur(15px);
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
