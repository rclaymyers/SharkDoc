<script setup lang="ts">
import { ref, toRaw } from "vue";
import type { Gallery } from "../../../sharedModels/Gallery";
import { TrashIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import { LocalStorageService } from "../services/localStorageService";
import { ApiService } from "../services/apiService";

const fileInput = ref<HTMLInputElement | null>(null);

const galleries: Gallery[] = [
  {
    id: "0",
    name: "gallery 1",
    imagePaths: [
      "testImage1.jpg",
      "testImage2.jpg",
      "testImage3.jpg",
      "testImage4.jpg",
      "testImage5.jpg",
    ],
  },
  { id: "1", name: "gallery 2", imagePaths: [] },
  { id: "2", name: "gallery 3", imagePaths: [] },
];

const gallerySelectedForEdit = ref<Gallery | null>();

const openGalleryDetails = (gallery: Gallery) => {
  gallerySelectedForEdit.value = gallery;
};

const removeGalleryImage = (imagePathToRemove: string) => {
  if (!gallerySelectedForEdit.value) {
    console.warn(
      "An image deletion was requested, but no gallery is being edited."
    );
    return;
  }
  gallerySelectedForEdit.value.imagePaths =
    gallerySelectedForEdit.value.imagePaths.filter(
      (imagePath) => imagePath !== imagePathToRemove
    );
  LocalStorageService.saveGallery(gallerySelectedForEdit.value);
};

const addImage = () => {
  fileInput?.value?.click();
};
const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target?.files?.[0];
  if (!file) {
    console.warn("File input event was invalid");
    return;
  }
  //todo upload image to server and replace imagepath with hosted value
  ApiService.uploadImageFile(
    file,
    gallerySelectedForEdit.value?.id ?? null
  ).then((res) => {
    if (res) {
      //todo env var for API url
      gallerySelectedForEdit.value?.imagePaths.push(
        `http://localhost:3000${res}`
      );
    }
  });
};
</script>

<template>
  <div class="gallery-edit-popup-container">
    <div class="gallery-edit-panel" v-if="!gallerySelectedForEdit">
      <p class="gallery-title">Add/Edit Gallery</p>
      <div class="gallery-selection">
        <div
          class="gallery-item"
          v-for="gallery in galleries"
          @click="openGalleryDetails(gallery)"
        >
          <p>{{ gallery.name }}</p>
          <p>edit</p>
        </div>
      </div>
    </div>
    <div class="gallery-edit-panel" v-if="gallerySelectedForEdit">
      <div class="gallery-name-editor-prompt">
        <p>{{ gallerySelectedForEdit.name }}</p>
      </div>
      <div class="gallery-image-list">
        <div
          class="deletable-gallery-image"
          v-for="imagePath in gallerySelectedForEdit.imagePaths"
        >
          <img :src="imagePath" alt="" class="gallery-item-contents" />
          <TrashIcon
            class="delete-icon"
            @click="removeGalleryImage(imagePath)"
          />
        </div>
        <div class="deletable-gallery-image clickable" @click="addImage">
          <div class="gallery-item-contents">Click to add image</div>
          <input
            type="file"
            ref="fileInput"
            @change="onFileSelected"
            accept="image/*"
            style="display: none"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.gallery-edit-popup-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
.gallery-edit-panel {
  background-color: #eee;
  color: #333;
  min-width: 50vw;
  min-height: 70vh;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 5px;
  padding: 10px;
  overflow: scroll;
}
.gallery-item {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  cursor: pointer;
  user-select: none;
}
.gallery-item-contents {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}
div.gallery-item-contents {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.gallery-image-list {
  position: relative;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 10px;
}
.deletable-gallery-image {
  position: relative;
  height: 30vh;
  width: 30vh;
}
.delete-icon {
  width: 3vh;
  height: 3vh;
  color: red;
  position: absolute;
  top: 0.5vw;
  right: 0.5vh;
  z-index: 2;
  cursor: pointer;
}
</style>
