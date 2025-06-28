<script setup lang="ts">
import { ref, type Ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";
import type { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";
import GalleryEditor from "./GalleryEditor.vue";
import { useRoute } from "vue-router";
import { ApiService } from "../services/apiService";
import { UtilitiesService } from "../services/utils";

const route = useRoute();
const documentId = Number(route.params.id);

const activeMarkdownDocument: Ref<MarkdownDocument | null> =
  ref<MarkdownDocument | null>(null);

ApiService.fetchMarkdownDocument(documentId).then(
  (document: MarkdownDocument | null) => {
    if (!document) {
      console.warn("Got invalid document from API for id:", documentId, null);
      return;
    }
    console.log("Got document:", document);
    activeMarkdownDocument.value = document;
  }
);

const updateMarkdownText = (payload: { pageNumber: number; text: string }) => {
  if (!activeMarkdownDocument.value?.pages) {
    console.warn(
      "updateMarkdownText() was called, but the active document is invalid"
    );
    return;
  }
  console.log("Update markdown text called with payload:", payload);
  activeMarkdownDocument.value.pages[payload.pageNumber].content = payload.text;
};

const debouncedUpdateFn = UtilitiesService.buildDebouncedFn(
  (payload: { pageNumber: number; text: string }) => {
    if (!activeMarkdownDocument.value) {
      return;
    }
    console.log("Updating page");
    ApiService.updatePageAndFetchUpdatedDocument(
      activeMarkdownDocument.value.pages[payload.pageNumber],
      activeMarkdownDocument.value.id
    ).then((document) => {
      console.log("Got updated document:", document);
      if (document) {
        activeMarkdownDocument.value = document;
      }
    });
  },
  500
);

const onMarkdownTextChanged = (payload: {
  pageNumber: number;
  text: string;
}) => {
  updateMarkdownText(payload);
  debouncedUpdateFn(payload);
};

const showEditor = ref(false);
const toggleEditor = () => {
  showEditor.value = !showEditor.value;
};

const addPage = () => {
  if (!activeMarkdownDocument.value?.id) {
    return;
  }
  ApiService.createPageAndFetchUpdatedDocument(
    activeMarkdownDocument.value?.id
  ).then((updatedDocument) => {
    if (updatedDocument) {
      activeMarkdownDocument.value = updatedDocument;
    }
  });
};

const galleryAddEditPromptShowing = ref(false);
const showGalleryPrompt = () => {
  galleryAddEditPromptShowing.value = true;
};

const galleryShowing = ref(false);
const showGallery = (galleryName: string) => {
  galleryShowing.value = true;
};
const hideGallery = () => (galleryShowing.value = false);
</script>

<template>
  <template v-if="activeMarkdownDocument">
    <button @click="toggleEditor">Show Editor</button>
    <button @click="addPage">Add Page</button>
    <button @click="hideGallery" v-if="galleryShowing">Hide Gallery</button>
    <button @click="showGalleryPrompt">Galleries</button>
    <div class="panes" v-for="(page, index) in activeMarkdownDocument.pages">
      <div class="pane" v-if="showEditor">
        <MarkdownEditor
          :markdown-document="activeMarkdownDocument"
          :page-number="index"
          @update:markdownText="onMarkdownTextChanged"
        />
      </div>
      <div class="pane">
        <MarkdownDisplay
          :markdown-text="page.content"
          @galleryClicked="showGallery"
        />
      </div>
      <div class="pane" v-if="galleryShowing">
        <ImageGallery />
      </div>
    </div>
    <GalleryEditor
      v-if="galleryAddEditPromptShowing"
      :markdown-document="activeMarkdownDocument"
    />
  </template>
</template>

<style>
.panes {
  display: flex;
}
.pane {
  flex-grow: 1;
  border: 1px solid gray;
  margin: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
}
.pane.no-border {
  border: none;
}
</style>
