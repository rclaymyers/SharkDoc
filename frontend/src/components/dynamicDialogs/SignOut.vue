<script setup lang="ts">
import { useRouter } from "vue-router";
import { ApiService } from "../../services/apiService";
import { LocalStorageService } from "../../services/localStorageService";
import { inject } from "vue";

const router = useRouter();
const dialogRef: any = inject("dialogRef");

const onConfirm = () => {
  LocalStorageService.clearJwt();
  LocalStorageService.clearUsername();
  dialogRef.value.close();
  router.push("/signin");
};
const onCancel = () => {
  dialogRef.value.close();
};
</script>

<template>
  <div class="flex flex-column align-items-center space-y-4">
    <p class="text-xl">Are you sure you want to sign out?</p>
    <div class="flex justify-evenly w-full">
      <button @click="onConfirm">Yes</button>
      <button @click="onCancel">No</button>
    </div>
  </div>
</template>
