<script setup lang="ts">
import { onMounted, ref, toRaw } from "vue";
import {
  GalleryCreationRequest,
  type Gallery,
} from "../../../sharedModels/Gallery";
import { TrashIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import { LocalStorageService } from "../services/localStorageService";
import { ApiService } from "../services/apiService";
import { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";
import { UtilitiesService } from "../services/utils";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { InputText, Button } from "primevue";

const FormStateEnum = {
  GALLERY_LIST: 0,
  ADD_GALLERY: 1,
  EDIT_GALLERY: 2,
};

const props = defineProps<{
  markdownDocument: MarkdownDocument;
  allowImageModification: boolean;
}>();
const emit = defineEmits<{
  (event: "gallery-updated", payload: Gallery): void;
  (event: "gallery-deleted"): void;
  (event: "gallery-close-requested"): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const dialogVisible = ref<boolean>(true);

let formState = ref<number>(FormStateEnum.GALLERY_LIST);

const gallerySelectedForEdit = ref<Gallery | null>(null);

const openGalleryDetails = (gallery: Gallery) => {
  console.log("open gallery details called:", gallery);
  gallerySelectedForEdit.value = gallery;
  newGalleryName.value = gallery.name;
  formState.value = FormStateEnum.EDIT_GALLERY;
};

const removeGalleryImage = (imagePathToRemove: string) => {
  const gallery = gallerySelectedForEdit.value;
  if (!gallery) {
    console.warn(
      "An image deletion was requested, but no gallery is being edited."
    );
    return;
  }
  gallery.imagePaths = gallery.imagePaths.filter(
    (imagePath: string) => imagePath !== imagePathToRemove
  );
  ApiService.deleteImage(imagePathToRemove).then((_) => {
    console.log("Deleted image");
    emit("gallery-updated", gallery);
  });
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
  ApiService.uploadImageFile(file, galleryId)
    .then((res) => {
      if (!res) {
        console.warn(
          "Gallery editor tried to upload image, but response is invalid:",
          res
        );
        return Promise.resolve(null);
      }
      return ApiService.fetchGallery(galleryId);
    })
    .then((result: Gallery | null) => {
      if (result) {
        emit("gallery-updated", result);
        gallerySelectedForEdit.value = result;
      }
    });
};

const newGalleryName = ref<string>("");
const addGallery = () => {
  gallerySelectedForEdit.value = null;
  formState.value = FormStateEnum.ADD_GALLERY;
};
const deleteGallery = (galleryId: number) => {
  console.log("delete gallery called");
  ApiService.deleteGallery(galleryId).then((_) => {
    emit("gallery-deleted");
    console.log("Emitted gallery deleted event");
  });
};
const saveGallery = () => {
  if (gallerySelectedForEdit.value) {
    gallerySelectedForEdit.value.name = newGalleryName.value;
  }
  const galleryApiPayload: Gallery | GalleryCreationRequest | null =
    formState.value === FormStateEnum.ADD_GALLERY
      ? new GalleryCreationRequest(
          newGalleryName.value,
          props.markdownDocument.id
        )
      : gallerySelectedForEdit.value;
  newGalleryName.value = "";
  formState.value = FormStateEnum.GALLERY_LIST;
  gallerySelectedForEdit.value = null;
  if (!galleryApiPayload) {
    console.warn(
      "Gallery selected for edit wasn't valid when saveGallery() was called"
    );
    return;
  }
  ApiService.saveGallery(galleryApiPayload).then((response: Gallery | null) => {
    console.log("Got new/updated gallery from API:", response);
    if (response) {
      props.markdownDocument.galleries = [
        ...props.markdownDocument.galleries.filter(
          (gallery: Gallery) => gallery.id !== response.id
        ),
        response,
      ];
    }
  });
};
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    dismissable-mask
    :header="`Galleries for ${props.markdownDocument.title}`"
    :style="{ maxWidth: '70vw' }"
    @hide="emit('gallery-close-requested')"
  >
    <template v-if="formState === FormStateEnum.GALLERY_LIST">
      <div class="gap-4 mb-4">
        <div
          v-for="gallery in markdownDocument?.galleries"
          @click="openGalleryDetails(gallery)"
          class="mb-2 relative"
        >
          <p>
            {{ gallery.name }}
          </p>
          <TrashIcon
            class="delete-icon"
            @click.stop="deleteGallery(gallery.id)"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Add Gallery"
          @click="addGallery()"
        ></Button>
      </div>
    </template>
    <template
      v-if="
        formState === FormStateEnum.ADD_GALLERY ||
        formState === FormStateEnum.EDIT_GALLERY
      "
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="name" class="font-semibold w-24">Name</label>
        <InputText
          v-model:model-value="newGalleryName"
          id="name"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div
        class="gallery-image-list overflow-scroll"
        v-if="formState === FormStateEnum.EDIT_GALLERY"
      >
        <div
          class="gallery-image"
          v-for="imagePath in gallerySelectedForEdit?.imagePaths"
        >
          <img
            class="gallery-item-contents"
            :src="UtilitiesService.prependApiDomain(imagePath)"
          />
          <TrashIcon
            class="delete-icon"
            @click="removeGalleryImage(imagePath)"
          />
        </div>

        <div class="gallery-item-contents">
          <p @click="addImage">Add Image</p>
        </div>
        <input
          type="file"
          ref="fileInput"
          @change="onFileSelected"
          accept="image/*"
          style="display: none"
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="formState = FormStateEnum.GALLERY_LIST"
        ></Button>
        <Button type="button" label="Save" @click="saveGallery()"></Button>
      </div>
    </template>
  </Dialog>
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

.close-icon {
  width: 5vh;
  height: 5vh;
}

.gallery-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
