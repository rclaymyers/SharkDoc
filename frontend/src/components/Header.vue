<script setup lang="ts">
import { useDialog } from "primevue";
import {
  LocalStorageKeys,
  LocalStorageService,
} from "../services/localStorageService";
import { ref } from "vue";
import { AuthService } from "../services/authService";

const dialog = useDialog();
const firstInitial = ref<string>("");

const onSignOutClicked = () => {
  AuthService.beginSignOutFlow(dialog);
};

const updateFirstInitial = (newValue: string | null) => {
  firstInitial.value = newValue?.length
    ? newValue.charAt(0).toLocaleUpperCase()
    : "";
};

updateFirstInitial(LocalStorageService.getUsername());
LocalStorageService.subscribeToKeyChange(
  LocalStorageKeys.Username,
  updateFirstInitial
);
</script>

<template>
  <div class="global-header background-secondary-accent">
    <router-link to="/">
      <div class="flex align-center">
        <img src="/sharkdownLogoInverted.png" alt="" class="logo" />
        <p class="background-secondary-accent">Sharkdown</p>
      </div>
    </router-link>
    <p class="clickable" @click="onSignOutClicked">{{ firstInitial }}</p>
  </div>
</template>

<style>
.global-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  padding: 0 var(--header-padding-and-margins);
  height: var(--global-header-height);
}
.logo {
  width: auto;
  height: var(--global-header-height);
  object-fit: contain;
  margin-right: 1rem;
}
</style>
