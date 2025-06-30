<template>
  <div class="markdown-page">
    <div ref="markdownContainer" v-html="compiledMarkdown"></div>
    <XCircleIcon
      class="delete-page-icon"
      @click="emit('page-deletion-requested', props.pageId)"
    />
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import { computed, onMounted, ref } from "vue";
import type { Gallery } from "../../../sharedModels/Gallery";
import { XCircleIcon } from "@heroicons/vue/24/outline";
import { ApiService } from "../services/apiService";

const props = defineProps<{
  markdownText: string;
  pageId: number;
}>();
const emit = defineEmits<{
  (event: "galleryClicked", value: string): void;
  (event: "page-deletion-requested", value: number): void;
}>();
const galleryRegex = /gallery\(([\w-]+)\)/g;
const markdownContainer = ref<HTMLElement | null>(null);

const compiledMarkdown = computed(() => {
  const processedText = props.markdownText.replace(galleryRegex, (_, name) => {
    return `<a class="gallery-anchor" data-name="${name}">${name}</a>`;
  });
  return marked.parse(processedText);
});

onMounted(() => {
  if (markdownContainer.value) {
    markdownContainer.value.addEventListener("click", handleGalleryClick);
  }
});

const handleGalleryClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.matches(".gallery-anchor")) {
    const name = target.getAttribute("data-name");
    if (name) {
      emit("galleryClicked", name);
    }
    event.preventDefault();
  }
};
</script>

<style>
a.gallery-anchor {
  user-select: none;
}
a.gallery-anchor:hover {
  cursor: pointer;
}
.markdown-page {
  position: relative;
}
.delete-page-icon {
  position: absolute;
  cursor: pointer;
  top: -5px;
  right: 5px;
  width: 20px;
  height: 20px;
}
</style>
