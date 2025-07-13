<template>
  <div class="markdown-page">
    <div ref="markdownContainer" v-html="compiledMarkdown"></div>
    <div
      class="delete-page-icon"
      @click="emit('page-deletion-requested', props.pageId)"
      data-cy="delete-page-button"
    >
      <XCircleIcon />
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import { computed, onMounted, ref } from "vue";
import type { Gallery } from "../../../sharedModels/Gallery";
import { XCircleIcon } from "@heroicons/vue/24/outline";
import type { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";

const MISSING_GALLERY_MESSAGE = "Invalid gallery name";

const props = defineProps<{
  markdownDocument: MarkdownDocument;
  pageIndex: number;
  pageId: number;
}>();
const emit = defineEmits<{
  (event: "galleryClicked", value: string): void;
  (event: "page-deletion-requested", value: number): void;
}>();

const galleryRegex = /gallery\(\s*([\w\s-]+?)\s*\)/g;
const markdownContainer = ref<HTMLElement | null>(null);

const compiledMarkdown = computed(() => {
  console.log("Got props:", props);
  if (!props.markdownDocument || !props.pageId) {
    console.log(
      "Markdown display: invalid props:",
      props.markdownDocument,
      props.pageId
    );
  }
  console.log(
    "Markdown document page:",
    props.markdownDocument,
    props.pageId,
    props.markdownDocument.pages[props.pageId]
  );
  const processedText = props.markdownDocument.pages[
    props.pageIndex
  ].content.replace(galleryRegex, (_, name) => {
    const gallery: Gallery | undefined = props.markdownDocument.galleries.find(
      (gallery) => gallery.name === name
    );
    return gallery
      ? `<a class="gallery-anchor" data-name="${name}">${name}</a>`
      : `<p title="${MISSING_GALLERY_MESSAGE}" class="missing-gallery" data-cy="missing-gallery-error">${name}</p>`;
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
p.missing-gallery {
  color: #a44;
  cursor: pointer;
  text-decoration: underline;
}
.markdown-page {
  position: relative;
  word-break: break-word;
  font-size: 1em;
}
.markdown-page > h1 {
  padding: 0.5rem 0;
}
.delete-page-icon {
  position: absolute;
  cursor: pointer;
  top: -5px;
  right: 5px;
  width: 20px;
  height: 20px;
}
table {
  table-layout: fixed;
  border: 1px solid black;
}
th,
td {
  border: 1px solid black;
  padding: 0.25rem 0.75rem;
}
th {
  background-color: #f2f2f2; /* Light gray for even rows */
}
table tr:nth-child(even) {
  background-color: #f2f2f2; /* Light gray for even rows */
}

table tr:nth-child(odd) {
  background-color: #ffffff; /* White for odd rows */
}
</style>
