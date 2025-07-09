<script setup lang="ts">
import { defineProps, nextTick, ref } from "vue";
import type { Gallery } from "../../../sharedModels/Gallery";
import type { GalleriaResponsiveOptions } from "primevue";
import { UtilitiesService } from "../services/utils";

const props = defineProps<{ initialActiveIndex: number; gallery: Gallery }>();
const emit = defineEmits<{ (event: "gallery-closed"): void }>();

const activeIndex = ref<number>(props.initialActiveIndex);
const showGalleria = ref<boolean>(true);
const responsiveOptions: GalleriaResponsiveOptions[] = [];

const onVisibilityChanged = async (newValue: boolean) => {
  // Need to wait until the Galleria has been
  // unmounted before emitting this event, or Galleria
  // will throw an error.
  await nextTick();
  if (!newValue) {
    emit("gallery-closed");
  }
};
</script>

<template>
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
    @update:visible="onVisibilityChanged"
  >
    <template #item="slotProps">
      <img
        :src="UtilitiesService.prependApiDomain(slotProps.item)"
        style="width: 100%; display: block"
        class="galleria-image"
        data-cy="prime-galleria-image"
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
