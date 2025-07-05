<script setup lang="ts">
import { Dialog, InputText, Button } from "primevue";
import { ref } from "vue";
import { ApiService } from "../services/apiService";
import {
  UserSignInResponse,
  type ApiResponse,
} from "../../../sharedModels/ApiConstants";
import { useRouter } from "vue-router";
import { LocalStorageService } from "../services/localStorageService";
import { ToastService } from "../services/toastService";

const router = useRouter();

const dialogShowing = ref(false);
const username = ref<string>("");
const password = ref<string>("");

dialogShowing.value = true;

const attemptRegistration = () => {
  ApiService.registerUser(username.value, password.value).then(
    (response: ApiResponse | null) => {
      if (!response) {
        return;
      }
      ToastService.showSuccess(
        "Success",
        "Registration sucessful! You may now sign in.",
        6000
      );
    }
  );
};
const attemptSignIn = () => {
  ApiService.signInUser(username.value, password.value).then(
    (signInResponse: UserSignInResponse | null) => {
      if (!signInResponse?.token || !signInResponse?.username) {
        //todo show registration error
        return;
      }
      console.log("Got token:", signInResponse.token);
      LocalStorageService.setJwt(signInResponse.token);
      LocalStorageService.setUsername(signInResponse.username);
      router.push("/");
    }
  );
};
</script>

<template>
  <Dialog
    v-model:visible="dialogShowing"
    class="max-height-20vh"
    header="Sign In"
    :dismissable-mask="false"
    :closable="false"
  >
    <div class="flex flex-col space-y-4">
      <InputText
        v-model:model-value="username"
        placeholder="Username"
        type="username"
      ></InputText>
      <InputText
        v-model:model-value="password"
        placeholder="Password"
        type="password"
      ></InputText>
    </div>
    <template #footer>
      <div class="flex flex-column w-full space-y-4">
        <Button @click="attemptSignIn">Sign In</Button>
        <Button @click="attemptRegistration">Register</Button>
      </div>
    </template>
  </Dialog>
</template>

<style></style>
