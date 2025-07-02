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

const router = useRouter();

const dialogShowing = ref(false);
const username = ref<string>("");
const password = ref<string>("");

dialogShowing.value = true;

const attemptRegistration = () => {
  ApiService.registerUser(username.value, password.value).then(
    (response: ApiResponse | null) => {
      if (!response) {
        //todo show registration error
        return;
      }
      //todo prompt for sign in
    }
  );
};
const attemptSignIn = () => {
  ApiService.signInUser(username.value, password.value).then(
    (signInResponse: UserSignInResponse | null) => {
      if (!signInResponse?.token) {
        //todo show registration error
        return;
      }
      console.log("Got token:", signInResponse.token);
      LocalStorageService.setJwt(signInResponse.token);
      router.push("/");
    }
  );
};
</script>

<template>
  <Dialog v-model:visible="dialogShowing">
    <div class="flex flex-col">
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
      <Button @click="attemptSignIn">Sign In</Button>
      <Button @click="attemptRegistration">Register</Button>
    </div>
  </Dialog>
</template>

<style></style>
