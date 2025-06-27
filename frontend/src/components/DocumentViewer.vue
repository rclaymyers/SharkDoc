<script setup lang="ts">
import { ref, type Ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";
import type { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";
import GalleryEditor from "./GalleryEditor.vue";
import { useRoute } from "vue-router";
import { ApiService } from "../services/apiService";

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
  activeMarkdownDocument.value.pages[payload.pageNumber].content = payload.text;
};

const showEditor = ref(false);
const toggleEditor = () => {
  showEditor.value = !showEditor.value;
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
    <button @click="hideGallery" v-if="galleryShowing">Hide Gallery</button>
    <button @click="showGalleryPrompt">Add/Edit Gallery</button>
    <div class="panes">
      <div class="pane" v-if="showEditor">
        <MarkdownEditor
          :markdown-document="activeMarkdownDocument"
          :page-number="0"
          @update:markdownText="updateMarkdownText"
        />
      </div>
      <div
        class="pane no-border"
        v-if="!showEditor && activeMarkdownDocument.pages.length > 0"
      >
        <MarkdownDisplay
          :markdown-text="activeMarkdownDocument.pages[0]"
          @galleryClicked="showGallery"
        />
      </div>
      <div class="pane" v-if="galleryShowing">
        <ImageGallery />
      </div>
    </div>
    <GalleryEditor v-if="galleryAddEditPromptShowing" />
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
