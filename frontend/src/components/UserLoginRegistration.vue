<script setup lang="ts">
import { Dialog, InputText, Button } from "primevue";
import { ref } from "vue";
import { ApiService } from "../services/apiService";
import {
  UserSignInResponse,
  type ApiResponse,
} from "../../../sharedModels/ApiConstants";
import { ToastSuccessMessages } from "../../../sharedModels/ToastMessages";
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
        ToastSuccessMessages.RegistrationSuccessful,
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
    data-cy="login-dialog"
    v-model:visible="dialogShowing"
    class="max-height-20vh"
    header="Sign In"
    :dismissable-mask="false"
    :closable="false"
  >
    <div class="flex flex-col space-y-4">
      <InputText
        data-cy="login-username"
        v-model:model-value="username"
        placeholder="Username"
        type="username"
        @keydown.enter="attemptSignIn"
      ></InputText>
      <InputText
        data-cy="login-password"
        v-model:model-value="password"
        placeholder="Password"
        type="password"
        @keydown.enter="attemptSignIn"
      ></InputText>
    </div>
    <template #footer>
      <div class="flex flex-column w-full space-y-4">
        <Button data-cy="sign-in-button" @click="attemptSignIn">Sign In</Button>
        <Button data-cy="register-button" @click="attemptRegistration"
          >Register</Button
        >
      </div>
    </template>
  </Dialog>
</template>

<style></style>
