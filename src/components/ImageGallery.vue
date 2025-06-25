<script setup>
import { ref } from "vue";
import FsLightbox from "fslightbox-vue";

const toggler = ref(false);
</script>

<template>
  <button @click="toggler = !toggler">Open the lightbox.</button>
  <FsLightbox
    :toggler="toggler"
    :sources="[
      'https://i.imgur.com/fsyrScY.jpg',
      'https://www.youtube.com/watch?v=3nQNiWdeH2Q',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ]"
  />
</template>
