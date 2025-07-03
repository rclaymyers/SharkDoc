<script setup lang="ts">
import { ref } from "vue";
import { Gallery } from "../../../sharedModels/Gallery";
import { UtilitiesService } from "../services/utils";
import type { GalleriaResponsiveOptions } from "primevue";

const props = defineProps<{ gallery: Gallery }>();
const showGalleria = ref<boolean>(false);
const responsiveOptions: GalleriaResponsiveOptions[] = [];
let activeIndex = 1;

const openGalleria = (index: number): void => {
  activeIndex = index;
  showGalleria.value = true;
};
</script>

<template>
  <div class="gallery-image-list">
    <div class="gallery-image" v-for="(imagePath, index) in gallery.imagePaths">
      <img
        :src="UtilitiesService.prependApiDomain(imagePath)"
        class="gallery-item-contents clickable"
        @click="openGalleria(index)"
      />
    </div>
  </div>

  <Galleria
    v-model:visible="showGalleria"
    v-model:active-index="activeIndex"
    :value="props.gallery.imagePaths"
    :responsiveOptions="responsiveOptions"
    :numVisible="9"
    containerStyle="max-width: 50%"
    :circular="true"
    :fullScreen="true"
    :showItemNavigators="true"
  >
    <template #item="slotProps">
      <img
        :src="UtilitiesService.prependApiDomain(slotProps.item)"
        style="width: 100%; display: block"
        class="galleria-image"
      />
    </template>
    <template #thumbnail="slotProps">
      <img
        :src="UtilitiesService.prependApiDomain(slotProps.item)"
        style="display: block"
        class="galleria-thumbnail"
      />
    </template>
  </Galleria>
</template>

<style>
.galleria-thumbnail {
  max-height: 5vh;
  max-width: 5vh;
}
</style>
