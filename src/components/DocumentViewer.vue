<script setup lang="ts">
import { ref, type Ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";
import type { MarkdownDocument } from "../models/MarkdownDocument";
import { LocalStorageService } from "../services/localStorageService";

const allMarkdownDocuments = LocalStorageService.loadAllDocuments();
const activeMarkdownDocument: Ref<MarkdownDocument> = ref<MarkdownDocument>(
  allMarkdownDocuments?.length
    ? allMarkdownDocuments[0]
    : {
        id: "12345",
        pages: ["gallery(testGallery)\ntest"],
        title: "Untitled",
      }
);
const updateMarkdownText = (payload: { pageNumber: number; text: string }) => {
  activeMarkdownDocument.value.pages.splice(
    payload.pageNumber,
    1,
    payload.text
  );
};

const showEditor = ref(false);
const toggleEditor = () => {
  showEditor.value = !showEditor.value;
};

const galleryShowing = ref(false);
const showGallery = (galleryName: string) => {
  console.log("Toggle gallery called with:", galleryName);
  galleryShowing.value = true;
};
const hideGallery = () => (galleryShowing.value = false);
</script>

<template>
  <button @click="toggleEditor">Show Editor</button>
  <button @click="hideGallery" v-if="galleryShowing">Hide Gallery</button>
  <div class="panes">
    <div class="pane" v-if="showEditor">
      <MarkdownEditor
        :markdown-document="activeMarkdownDocument"
        :page-number="0"
        @update:markdownText="updateMarkdownText"
      ></MarkdownEditor>
    </div>
    <div class="pane no-border" v-if="!showEditor">
      <MarkdownDisplay
        :markdown-text="activeMarkdownDocument.pages[0]"
        @galleryClicked="showGallery"
      ></MarkdownDisplay>
    </div>
    <div class="pane" v-if="galleryShowing">
      <ImageGallery></ImageGallery>
    </div>
  </div>
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
