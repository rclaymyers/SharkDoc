<script setup lang="ts">
import { ref, toRaw } from "vue";
import {
  GalleryCreationRequest,
  type Gallery,
} from "../../../sharedModels/Gallery";
import { TrashIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import { LocalStorageService } from "../services/localStorageService";
import { ApiService } from "../services/apiService";
import { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";

const props = defineProps<{ markdownDocument: MarkdownDocument }>();
const emit = defineEmits<{
  (event: "gallery-updated", payload: Gallery): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const galleryAddFormShowing = ref<boolean>(false);
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
  const galleryId = gallerySelectedForEdit.value?.id;
  if (!galleryId) {
    console.warn(
      "Selected gallery is not valid:",
      gallerySelectedForEdit.value
    );
    return;
  }
  ApiService.uploadImageFile(file, galleryId).then((res) => {
    if (!res) {
      console.warn(
        "Gallery editor tried to upload image, but response is invalid:",
        res
      );
      return;
    }
    ApiService.fetchGallery(galleryId).then((result) => {
      if (result) emit("gallery-updated", result);
    });
  });
};

const newGalleryName = ref<string>("");
const addGallery = () => {
  galleryAddFormShowing.value = true;
};
const saveGallery = () => {
  const galleryName = newGalleryName.value;
  console.log("Saving gallery with name:", galleryName);
  newGalleryName.value = "";
  galleryAddFormShowing.value = false;
  ApiService.saveGallery(
    new GalleryCreationRequest(galleryName, props.markdownDocument.id)
  ).then((response: Gallery | null) => {
    console.log("Got new gallery from API:", response);
    if (response) {
      props.markdownDocument.galleries = [
        ...props.markdownDocument.galleries,
        response,
      ];
    }
  });
};
</script>

<template>
  <div class="popup-form-container">
    <div
      class="popup-form-panel"
      v-if="!gallerySelectedForEdit && !galleryAddFormShowing"
    >
      <p class="gallery-title">Add/Edit Gallery</p>
      <div class="gallery-selection">
        <div
          class="gallery-item"
          v-for="gallery in markdownDocument?.galleries"
          @click="openGalleryDetails(gallery)"
        >
          <p>{{ gallery.name }}</p>
          <p>edit</p>
        </div>
      </div>
      <button @click="addGallery">Add gallery</button>
    </div>
    <div class="popup-form-panel" v-if="galleryAddFormShowing">
      <input v-model="newGalleryName" />
      <button @click="saveGallery">Save</button>
    </div>
    <div class="popup-form-panel" v-if="gallerySelectedForEdit">
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
