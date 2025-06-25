<script setup lang="ts">
import { ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";

const markdownText = ref(
  "# test\n## test 2\n*italics*\n\ngallery(testGallery)"
);
const updateMarkdownText = (newValue: string) => {
  markdownText.value = newValue;
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
        :markdown-text="markdownText"
        @update:markdownText="updateMarkdownText"
      ></MarkdownEditor>
    </div>
    <div class="pane no-border">
      <MarkdownDisplay
        :markdown-text="markdownText"
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
