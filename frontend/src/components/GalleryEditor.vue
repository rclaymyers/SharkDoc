<script setup lang="ts">
import { ref } from "vue";
import {
  GalleryCreationRequest,
  type Gallery,
} from "../../../sharedModels/Gallery";
import { TrashIcon } from "@heroicons/vue/20/solid";
import { ApiService } from "../services/apiService";
import {
  MarkdownDocument,
  MarkdownDocumentPage,
} from "../../../sharedModels/MarkdownDocument";
import { UtilitiesService } from "../services/utils";
import { InputText, Button } from "primevue";
import { ToastService } from "../services/toastService";
import { ToastErrorMessages } from "../../../sharedModels/ToastMessages";

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
        ToastService.showSuccess("Success", "Image uploaded!");
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
    ToastService.showSuccess("Success", "Gallery deleted!");
  });
};
const saveGallery = () => {
  if (!newGalleryName.value) {
    ToastService.showError("Error", ToastErrorMessages.GalleryNameRequired);
    return;
  }
  console.log("Save gallery called:", gallerySelectedForEdit.value);
  const oldGalleryNameToUpdate = gallerySelectedForEdit.value?.name;
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
  let updatedGallery: Gallery | null = null;
  ApiService.saveGallery(galleryApiPayload)
    .then((response: Gallery | null) => {
      console.log("Got new/updated gallery from API:", response);
      if (response) {
        updatedGallery = response;
        props.markdownDocument.galleries = [
          ...props.markdownDocument.galleries.filter(
            (gallery: Gallery) => gallery.id !== response.id
          ),
          response,
        ];
        const updatePromises: Promise<MarkdownDocument | null>[] = [];
        if (oldGalleryNameToUpdate) {
          props.markdownDocument.pages.forEach((page: MarkdownDocumentPage) => {
            page.content = page.content.replace(
              `gallery(${oldGalleryNameToUpdate})`,
              `gallery(${response.name})`
            );
            updatePromises.push(
              ApiService.updatePageAndFetchUpdatedDocument(
                page,
                props.markdownDocument.id
              )
            );
          });
        }
        return Promise.all(updatePromises);
      }
    })
    .then((_) => {
      if (updatedGallery) {
        emit("gallery-updated", updatedGallery);
        ToastService.showSuccess("Success", "Gallery saved!");
      }
    });
};
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    dismissable-mask
    :header="`Galleries for '${props.markdownDocument.title}'`"
    @hide="emit('gallery-close-requested')"
    class="min-height-50vh"
    data-cy="gallery-manager-modal"
  >
    <template v-if="formState === FormStateEnum.GALLERY_LIST">
      <div class="gap-4 mb-4">
        <div
          v-for="gallery in markdownDocument?.galleries"
          @click="openGalleryDetails(gallery)"
          class="gallery-list-entry"
          data-cy="gallery-instance"
        >
          <p>
            {{ gallery.name }}
          </p>
          <div
            class="gallery-list-entry-delete-icon"
            @click.stop="deleteGallery(gallery.id)"
            data-cy="delete-gallery-button"
          >
            <TrashIcon />
          </div>
        </div>
      </div>
    </template>
    <template
      v-if="
        formState === FormStateEnum.ADD_GALLERY ||
        formState === FormStateEnum.EDIT_GALLERY
      "
    >
      <div class="flex items-center gap-4 mb-4">
        <InputText
          v-model:model-value="newGalleryName"
          id="name"
          class="flex-auto"
          autocomplete="off"
          placeholder="Name"
          @keydown.enter="saveGallery"
          data-cy="gallery-name-editor"
        />
      </div>
      <div
        class="gallery-image-list overflow-scroll"
        v-if="formState === FormStateEnum.EDIT_GALLERY"
      >
        <div
          class="gallery-image"
          v-for="imagePath in gallerySelectedForEdit?.imagePaths"
          data-cy="gallery-image-in-editor"
        >
          <img
            class="gallery-item-contents"
            :src="UtilitiesService.prependApiDomain(imagePath)"
          />
          <div
            class="delete-icon"
            @click="removeGalleryImage(imagePath)"
            data-cy="image-delete-button"
          >
            <TrashIcon />
          </div>
        </div>

        <div class="gallery-item-contents">
          <button @click="addImage" data-cy="add-image-button">
            Add Image
          </button>
        </div>
        <input
          type="file"
          ref="fileInput"
          @change="onFileSelected"
          accept="image/*"
          style="display: none"
          data-cy="image-file-input"
        />
      </div>
    </template>
    <template #footer
      ><div
        v-if="formState === FormStateEnum.GALLERY_LIST"
        class="flex justify-end gap-2"
      >
        <Button
          type="button"
          label="Add Gallery"
          @click="addGallery()"
          data-cy="add-gallery-button"
        ></Button>
      </div>
      <div
        v-if="
          formState === FormStateEnum.EDIT_GALLERY ||
          formState === FormStateEnum.ADD_GALLERY
        "
        class="flex justify-end gap-2"
      >
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="formState = FormStateEnum.GALLERY_LIST"
        ></Button>
        <Button
          type="button"
          label="Save"
          @click="saveGallery()"
          data-cy="save-gallery-button"
        ></Button>
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
.gallery-list-entry {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: var(--secondary-background-color);
  border-radius: 5px;
  cursor: pointer;
}
.gallery-list-entry-delete-icon {
  width: 1rem;
  height: 1rem;
  color: red;
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
