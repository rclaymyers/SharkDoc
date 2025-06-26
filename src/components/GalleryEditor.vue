<script setup lang="ts">
import type { Gallery } from "../models/Gallery";

const galleries: Gallery[] = [
  { id: "0", name: "gallery 1", imagePaths: [] },
  { id: "1", name: "gallery 2", imagePaths: [] },
  { id: "2", name: "gallery 3", imagePaths: [] },
];

const gallerySelectedForEdit: Gallery | null = null;

const openGalleryDetails = (gallery: Gallery) => {
  console.log("Open gallery details called with:", gallery);
};
</script>

<template>
  <div class="gallery-edit-popup-container">
    <div class="gallery-list">
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
    <div class="gallery-edit">
      <div class="gallery-name-editor-prompt">
        <p>{{}}</p>
      </div>
      <div class="gallery-image-editor"></div>
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
.gallery-list {
  background-color: #eee;
  color: #333;
  min-width: 50vw;
  min-height: 70vh;
  border-radius: 5px;
  padding: 10px;
}
.gallery-item {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  cursor: pointer;
  user-select: none;
}
</style>
