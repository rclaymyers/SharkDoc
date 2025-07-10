<script setup lang="ts">
import { Dialog, InputText, Button } from "primevue";
import { ref } from "vue";
import { ApiService } from "../services/apiService";
import {
  UserSignInResponse,
  type ApiResponse,
} from "../../../sharedModels/ApiConstants";
import {
  ToastErrorMessages,
  ToastSuccessMessages,
} from "../../../sharedModels/ToastMessages";
import { useRouter } from "vue-router";
import { LocalStorageService } from "../services/localStorageService";
import { ToastService } from "../services/toastService";

const LoginRegistrationModeEnum = {
  LOGIN: 0,
  REGISTRATION: 1,
} as const;

const router = useRouter();

const formState = ref<number>(LoginRegistrationModeEnum.LOGIN);
const dialogShowing = ref(false);
const username = ref<string>("");
const password = ref<string>("");
const passwordConfirmation = ref<string>("");

dialogShowing.value = true;

const attemptRegistration = () => {
  if (!username.value || !password.value) {
    ToastService.showError(
      "Error",
      ToastErrorMessages.UsernamePasswordRequired
    );
    return;
  }
  if (
    !passwordConfirmation.value ||
    password.value !== passwordConfirmation.value
  ) {
    ToastService.showError(
      "Error",
      ToastErrorMessages.PasswordConfirmationMismatch
    );
    return;
  }
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
      formState.value = LoginRegistrationModeEnum.LOGIN;
      username.value = "";
      password.value = "";
      passwordConfirmation.value = "";
    }
  );
};
const attemptSignIn = () => {
  if (!username.value || !password.value) {
    ToastService.showError(
      "Error",
      ToastErrorMessages.UsernamePasswordRequired
    );
    return;
  }
  ApiService.signInUser(username.value, password.value).then(
    (signInResponse: UserSignInResponse | null) => {
      if (!signInResponse?.token || !signInResponse?.username) {
        //error toast will be shown by API service
        return;
      }
      console.log("Got token:", signInResponse.token);
      LocalStorageService.setJwt(signInResponse.token);
      LocalStorageService.setUsername(signInResponse.username);
      router.push("/");
    }
  );
};
const onFormEnter = () => {
  if (formState.value === LoginRegistrationModeEnum.LOGIN) {
    attemptSignIn();
  } else {
    attemptRegistration();
  }
};
</script>

<template>
  <Dialog
    data-cy="login-dialog"
    v-model:visible="dialogShowing"
    :header="
      formState === LoginRegistrationModeEnum.LOGIN ? 'Sign In' : 'Register'
    "
    :dismissable-mask="false"
    :closable="false"
  >
    <div class="flex flex-col space-y-4">
      <InputText
        data-cy="login-username"
        v-model:model-value="username"
        placeholder="Username"
        type="username"
        @keydown.enter="onFormEnter"
      ></InputText>
      <InputText
        data-cy="login-password"
        v-model:model-value="password"
        placeholder="Password"
        type="password"
        @keydown.enter="onFormEnter"
      ></InputText>
      <InputText
        v-if="formState === LoginRegistrationModeEnum.REGISTRATION"
        v-model:model-value="passwordConfirmation"
        placeholder="Confirm password"
        type="password"
        @keydown.enter="onFormEnter"
        data-cy="password-confirmation"
      ></InputText>
    </div>
    <template #footer>
      <div class="flex flex-column w-full space-y-4">
        <template v-if="formState === LoginRegistrationModeEnum.LOGIN">
          <Button data-cy="sign-in-button" @click="attemptSignIn"
            >Sign In</Button
          >
          <div
            class="flex justify-center clickable"
            @click="formState = LoginRegistrationModeEnum.REGISTRATION"
          >
            <p
              class="color-accent-color-light"
              data-cy="enter-registration-mode"
            >
              Need an account? Click here to register
            </p>
          </div>
        </template>
        <template v-if="formState === LoginRegistrationModeEnum.REGISTRATION">
          <Button data-cy="register-button" @click="attemptRegistration"
            >Register</Button
          >
          <div
            class="flex justify-center clickable"
            @click="formState = LoginRegistrationModeEnum.LOGIN"
          >
            <p class="color-accent-color-light">Return to sign in</p>
          </div>
        </template>
      </div>
    </template>
  </Dialog>
</template>

<style></style>
