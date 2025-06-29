<template>
  <div ref="markdownContainer" v-html="compiledMarkdown"></div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import { computed, onMounted, ref } from "vue";
import type { Gallery } from "../../../sharedModels/Gallery";

const props = defineProps<{ markdownText: string }>();
const emit = defineEmits<{ (event: "galleryClicked", value: string): void }>();
const galleryRegex = /gallery\(([\w-]+)\)/g;
const markdownContainer = ref<HTMLElement | null>(null);

const compiledMarkdown = computed(() => {
  const processedText = props.markdownText.replace(galleryRegex, (_, name) => {
    return `<a class="gallery-anchor" data-name="${name}">${name}</a>`;
  });
  return marked.parse(processedText);
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

onMounted(() => {
  if (markdownContainer.value) {
    markdownContainer.value.addEventListener("click", handleGalleryClick);
  }
});
</script>

<style>
a.gallery-anchor {
  user-select: none;
}
a.gallery-anchor:hover {
  cursor: pointer;
}
</style>
