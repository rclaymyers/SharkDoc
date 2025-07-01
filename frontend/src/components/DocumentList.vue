<script setup lang="ts">
import { ref } from "vue";
import {
  MarkdownDocument,
  MarkdownDocumentCreationRequest,
} from "../../../sharedModels/MarkdownDocument";
import { ApiService } from "../services/apiService";
import { useRouter } from "vue-router";
import { Dialog, InputText, Button } from "primevue";
import { TrashIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const markdownDocuments = ref<MarkdownDocument[]>([]);
const dialogVisible = ref<boolean>(false);
const newDocumentName = ref<string>("");

ApiService.fetchAllMarkdownDocuments().then(
  (documents: MarkdownDocument[] | null) => {
    if (documents) {
      markdownDocuments.value = documents;
    }
  }
);

const openDocument = (markdownDocumentId: number): void => {
  console.log("openDocument called with id:", markdownDocumentId);
  router.push(`document/${markdownDocumentId}`);
};
const addDocument = (): void => {
  dialogVisible.value = true;
  newDocumentName.value = "";
};
const saveNewDocument = (): void => {
  const documentName = newDocumentName.value;
  console.log("Save new document called with name:", documentName);
  newDocumentName.value = "";
  dialogVisible.value = false;
  ApiService.saveDocument(
    new MarkdownDocumentCreationRequest(documentName)
  ).then((result: MarkdownDocument | null) => {
    if (!result) {
      console.warn(
        "Received invalid document after attempting to create document:",
        result
      );
      return;
    }
    markdownDocuments.value = [...markdownDocuments.value, result];
  });
};
const deleteDocument = (documentId: number): void => {
  ApiService.deleteDocument(documentId)
    .then((_) => {
      return ApiService.fetchAllMarkdownDocuments();
    })
    .then((documents: MarkdownDocument[] | null) => {
      if (documents) markdownDocuments.value = documents;
    });
};
</script>

<template>
  <h2>Your Documents</h2>
  <div class="markdownDocumentsList">
    <div class="document" v-for="document in markdownDocuments">
      <div class="flex align-items-center relative w-sm">
        <p @click="openDocument(document.id)">{{ document.title }}</p>
        <TrashIcon class="delete-icon" @click="deleteDocument(document.id)" />
      </div>
    </div>
    <button @click="addDocument">Add Document</button>
  </div>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    dismissable-mask
    :header="'Add Document'"
    :style="{ maxWidth: '70vw' }"
  >
    <label for="name">Name</label>
    <InputText
      v-model:model-value="newDocumentName"
      id="name"
      class="flex-auto"
      autocomplete="off"
      @keydown.enter.stop.prevent="saveNewDocument"
    ></InputText>
    <Button type="button" label="Save" @click="saveNewDocument"></Button>
  </Dialog>
</template>

<style></style>
