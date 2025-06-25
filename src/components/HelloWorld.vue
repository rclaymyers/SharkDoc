<script setup lang="ts">
import { ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";

const markdownText = ref("# test\n## test 2\n*italics*\ngallery(testGallery)");
const updateMarkdownText = (newValue: string) => {
  markdownText.value = newValue;
};

const showEditor = ref(false);
const toggleEditor = () => {
  showEditor.value = !showEditor.value;
};
</script>

<template>
  <MarkdownDisplay :markdown-text="markdownText"></MarkdownDisplay>
  <button @click="toggleEditor">Show Editor</button>
  <MarkdownEditor
    :markdown-text="markdownText"
    @update:markdownText="updateMarkdownText"
    v-if="showEditor"
  ></MarkdownEditor>
  <ImageGallery></ImageGallery>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
