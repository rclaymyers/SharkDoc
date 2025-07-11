<script setup lang="ts">
import { ref } from "vue";
import {
  MarkdownDocument,
  MarkdownDocumentCreationRequest,
} from "../../../sharedModels/MarkdownDocument";
import { ApiService } from "../services/apiService";
import { useRouter } from "vue-router";
import { Dialog, InputText, Button } from "primevue";
import { DocumentPlusIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { ToastService } from "../services/toastService";
import { ToastErrorMessages } from "../../../sharedModels/ToastMessages";
import { ConfirmationModalService } from "../services/confirmationModalService";

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
  if (!documentName) {
    ToastService.showError("Error", ToastErrorMessages.DocumentNameRequired);
    return;
  }
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
    ToastService.showSuccess("Success", "New document created!");
  });
};
const deleteDocument = (documentId: number): void => {
  ConfirmationModalService.showDeletionDialog("document", () => {
    ApiService.deleteDocument(documentId)
      .then((_) => {
        return ApiService.fetchAllMarkdownDocuments();
      })
      .then((documents: MarkdownDocument[] | null) => {
        if (!documents) {
          return;
        }
        markdownDocuments.value = documents;
        ToastService.showSuccess("Success", "Document deleted!");
      });
  });
};
</script>

<template>
  <div class="document-list-container">
    <h3 class="subheader">Your Documents</h3>
    <div
      class="document-card-list content-under-subheader"
      data-cy="document-list"
    >
      <div
        @click="openDocument(document.id)"
        class="document-card"
        v-for="document in markdownDocuments"
        :key="document.id"
        :data-cy="'document-card-' + document.id"
      >
        <p>{{ document.title }}</p>
        <TrashIcon
          class="delete-icon"
          @click.stop="deleteDocument(document.id)"
        />
      </div>
      <div
        class="document-card"
        @click="addDocument"
        data-cy="begin-add-document"
      >
        <DocumentPlusIcon class="document-card-icon"></DocumentPlusIcon>
      </div>
    </div>
    <Dialog
      v-model:visible="dialogVisible"
      modal
      dismissable-mask
      :header="'Add Document'"
      class="max-height-20vh"
      data-cy="document-creation-dialog"
    >
      <div class="flex w-full justify-center">
        <InputText
          v-model:model-value="newDocumentName"
          id="name"
          class="flex-auto"
          autocomplete="off"
          @keydown.enter.stop.prevent="saveNewDocument"
          placeholder="Name"
          data-cy="document-name-input"
        ></InputText>
      </div>
      <template #footer>
        <div class="flex w-full justify-center">
          <Button
            data-cy="save-document-button"
            type="button"
            label="Save"
            @click="saveNewDocument"
          ></Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style>
.document-card-list {
  display: flex;
  flex-direction: row;
  width: 100vw;
  max-width: 100vw;
  justify-content: space-around;
  flex-wrap: wrap;
}
.document-card {
  position: relative;
  border-radius: 5px;
  padding: 2rem;
  margin: 2rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--document-page-color);
  color: var(--primary-text-color);

  width: 20rem;
  height: 10rem;
  font-size: 1.5rem;
  cursor: pointer;
  text-align: center;
}
.document-card:hover {
  background-color: var(--highlight-color);
}
.document-card-icon {
  height: 5rem;
  width: 5rem;
  color: var(--accent-color);
}
.document-list-container {
  height: 100%;
  width: 100%;
  background-color: var(--secondary-background-color);
}
</style>
