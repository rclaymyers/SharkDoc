<script setup lang="ts">
import { ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";

defineProps<{ msg: string }>();

let markdownText = ref("# test\n## test 2\n*italics*\ngallery(testGallery)");

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

  <h1>{{ msg }}</h1>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
