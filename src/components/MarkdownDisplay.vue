<template>
  <div v-html="compiledMarkdown"></div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import { computed } from "vue";

const props = defineProps<{ markdownText: string }>();

const compiledMarkdown = computed(() => marked.parse(props.markdownText));
</script>
