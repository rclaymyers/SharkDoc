<script setup lang="ts">
import { ref } from "vue";
import {
  MarkdownDocument,
  MarkdownDocumentCreationRequest,
} from "../../../sharedModels/MarkdownDocument";
import { ApiService } from "../services/apiService";
import { useRouter } from "vue-router";

const router = useRouter();

const markdownDocuments = ref<MarkdownDocument[]>([]);
const showingDocumentAddForm = ref<boolean>(false);
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
  showingDocumentAddForm.value = true;
};
const saveNewDocument = (): void => {
  const documentName = newDocumentName.value;
  console.log("Save new document called with name:", documentName);
  newDocumentName.value = "";
  showingDocumentAddForm.value = false;
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
</script>

<template>
  <h2>Your Documents</h2>
  <div class="markdownDocumentsList">
    <div class="document" v-for="document in markdownDocuments">
      <p @click="openDocument(document.id)">{{ document.title }}</p>
    </div>
    <button @click="addDocument">Add Document</button>
  </div>
  <div class="popup-form-container" v-if="showingDocumentAddForm">
    <div class="popup-form-panel">
      <input v-model="newDocumentName" />
      <button @click="saveNewDocument">Save Document</button>
    </div>
  </div>
</template>

<style></style>
