<script setup lang="ts">
import { ref } from "vue";
import { Gallery } from "../../../sharedModels/Gallery";
import { UtilitiesService } from "../services/utils";

const props = defineProps<{ gallery: Gallery }>();
const toggler = ref(false);
</script>

<template>
  <div class="gallery-image-list">
    <div class="gallery-image" v-for="imagePath in gallery.imagePaths">
      <img
        :src="UtilitiesService.prependApiDomain(imagePath)"
        class="gallery-item-contents"
      />
    </div>
  </div>
</template>
