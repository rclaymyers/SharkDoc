<script setup lang="ts">
import { nextTick, ref, type Ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";
import { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";
import GalleryEditor from "./GalleryEditor.vue";
import { useRoute, useRouter } from "vue-router";
import { ApiService } from "../services/apiService";
import { UtilitiesService } from "../services/utils";
import type { Gallery } from "../../../sharedModels/Gallery";
import {
  Bars3Icon,
  DocumentIcon,
  DocumentPlusIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import LightboxWrapper from "./LightboxWrapper.vue";
import { useDialog } from "primevue";
import { AuthService } from "../services/authService";
import { ToastService } from "../services/toastService";

const route = useRoute();
const router = useRouter();
const documentId = Number(route.params.id);
const dialog = useDialog();

const activeMarkdownDocument: Ref<MarkdownDocument | null> =
  ref<MarkdownDocument | null>(null);
const editingTitle = ref<boolean>(false);
const newTitle = ref<string>("");
const mobileDrawerVisible = ref(false);
const showEditor = ref(false);
const galleryAddEditPromptShowing = ref(false);
const selectedGallery = ref<Gallery | null>(null);
const showMobileLightbox = ref<boolean>(false);
const showDocumentRenameDialog = ref<boolean>(false);

const loadDocument = () => {
  console.log("Load document called");
  ApiService.fetchMarkdownDocument(documentId).then(
    (document: MarkdownDocument | null) => {
      if (!document) {
        console.warn("Got invalid document from API for id:", documentId, null);
        return;
      }
      console.log("Document viewer set active document to:", document);
      activeMarkdownDocument.value = document;
    }
  );
};
loadDocument();

const beginEditingTitle = () => {
  editingTitle.value = true;
  newTitle.value = activeMarkdownDocument.value?.title ?? "";
};

const saveDocumentTitle = () => {
  if (!activeMarkdownDocument.value || !newTitle.value) {
    //todo show error
    return;
  }

  const documentSavePayload = new MarkdownDocument(
    activeMarkdownDocument.value.id,
    newTitle.value,
    [...activeMarkdownDocument.value.pages],
    [...activeMarkdownDocument.value.galleries],
    activeMarkdownDocument.value.ownerId
  );
  ApiService.saveDocument(documentSavePayload).then(
    (updatedDocument: MarkdownDocument | null) => {
      if (!updatedDocument) {
        console.warn("Invalid response:", updatedDocument);
        //todo show error
      } else {
        activeMarkdownDocument.value = updatedDocument;
        ToastService.showSuccess("Success", "Document renamed!");
      }
      editingTitle.value = false;
      showDocumentRenameDialog.value = false;
    }
  );
};

const updateMarkdownText = (payload: { pageNumber: number; text: string }) => {
  if (!activeMarkdownDocument.value?.pages) {
    console.warn(
      "updateMarkdownText() was called, but the active document is invalid"
    );
    return;
  }
  console.log("Update markdown text called with payload:", payload);
  activeMarkdownDocument.value.pages[payload.pageNumber].content = payload.text;
};

const debouncedUpdateFn = UtilitiesService.buildDebouncedFn(
  (payload: { pageNumber: number; text: string }) => {
    if (!activeMarkdownDocument.value) {
      return;
    }
    console.log("Updating page");
    ApiService.updatePageAndFetchUpdatedDocument(
      activeMarkdownDocument.value.pages[payload.pageNumber],
      activeMarkdownDocument.value.id
    ).then((document) => {
      console.log("Got updated document:", document);
      if (document) {
        activeMarkdownDocument.value = document;
      }
    });
  },
  500
);

const onMarkdownTextChanged = (payload: {
  pageNumber: number;
  text: string;
}) => {
  updateMarkdownText(payload);
  debouncedUpdateFn(payload);
};

const toggleEditor = (newValue: boolean) => {
  showEditor.value = newValue;
};

const addPage = () => {
  if (!activeMarkdownDocument.value?.id) {
    return;
  }
  ApiService.createPageAndFetchUpdatedDocument(
    activeMarkdownDocument.value?.id
  ).then((updatedDocument) => {
    if (updatedDocument) {
      activeMarkdownDocument.value = updatedDocument;
      nextTick().then((_) => window.scrollTo(0, document.body.scrollHeight));
      ToastService.showSuccess("Success", "Page added!");
    }
  });
};

const showGalleryPrompt = () => {
  galleryAddEditPromptShowing.value = true;
};

const showGallery = (galleryName: string) => {
  const gallery = activeMarkdownDocument.value?.galleries.find(
    (gallery: Gallery) => gallery.name === galleryName
  );
  if (!gallery) {
    console.warn("Tried to open a gallery that doesn't exist");
    //todo show error
    return;
  }

  selectedGallery.value = gallery;
  showMobileLightbox.value = window.innerWidth <= 768;
  console.log("Selected gallery set to:", selectedGallery.value);
  console.log("Show mobile lightbox set to:", showMobileLightbox);
};
const hideGallery = () => (selectedGallery.value = null);

const deletePage = (pageId: number) => {
  const documentId = activeMarkdownDocument.value?.id;
  if (!documentId) {
    return;
  }
  ApiService.deletePage(documentId, pageId).then((updatedDocument) => {
    if (!updatedDocument) {
      return;
    }
    activeMarkdownDocument.value = updatedDocument;
    ToastService.showSuccess("Success", "Page deleted!");
  });
};

const onReturnToDocumentsClicked = () => {
  router.push("/");
};
const onSignOutClicked = () => {
  AuthService.beginSignOutFlow(dialog);
};
const onEditTitleClicked = () => {
  newTitle.value = activeMarkdownDocument.value?.title ?? "";
  showDocumentRenameDialog.value = true;
};
const onMobileLightboxDismissed = () => {
  selectedGallery.value = null;
  showMobileLightbox.value = false;
};
</script>

<template>
  <div class="document-viewer" v-if="activeMarkdownDocument">
    <div class="toolbar align-items-center subheader hidden md:flex">
      <router-link to="/">
        <DocumentIcon class="document-link" />
      </router-link>
      <h1
        class="cursor-pointer"
        v-if="!editingTitle"
        @click="beginEditingTitle()"
      >
        {{ activeMarkdownDocument.title }}
      </h1>
      <InputText
        autofocus
        v-if="editingTitle"
        v-model="newTitle"
        @keydown.enter="saveDocumentTitle()"
        @keydown.esc="editingTitle = false"
      />
      <div class="editor-toggle-buttons interactive-toolbar-element">
        <EyeIcon
          class="editor-tool-icon"
          :class="{ active: !showEditor }"
          @click="toggleEditor(false)"
        ></EyeIcon>
        <PencilIcon
          class="editor-tool-icon"
          :class="{ active: showEditor }"
          @click="toggleEditor(true)"
        ></PencilIcon>
      </div>
      <button class="interactive-toolbar-element" @click="showGalleryPrompt">
        Manage Galleries
      </button>
    </div>
    <div class="document-page-container content-under-subheader">
      <div class="panes">
        <div class="pane no-border">
          <div
            class="panes"
            v-for="(page, index) in activeMarkdownDocument.pages"
          >
            <div
              class="pane half-pane m-1 mx-1 md:mx-8 mb-4 document-editor-pane"
              v-if="showEditor"
            >
              <MarkdownEditor
                :markdown-document="activeMarkdownDocument"
                :page-number="index"
                @update:markdownText="onMarkdownTextChanged"
              ></MarkdownEditor>
            </div>
            <div
              :class="[
                showEditor ? 'w-1/2 mobile-hidden' : '',
                'drop-shadow-xl mx-1 md:mx-8 mb-4 mt-1 p-3 document-page',
              ]"
            >
              <MarkdownDisplay
                :markdown-document="activeMarkdownDocument"
                :document-id="activeMarkdownDocument.id"
                :page-index="index"
                :page-id="page.id"
                @galleryClicked="showGallery"
                @page-deletion-requested="deletePage"
              ></MarkdownDisplay>
            </div>
          </div>
          <div class="w-full flex justify-around">
            <!-- spacer -->
            <div class="mobile-hidden"></div>
            <DocumentPlusIcon
              class="size-[2rem] clickable"
              @click="addPage"
            ></DocumentPlusIcon>
            <!-- spacer -->
            <div v-if="!showEditor" class="mobile-hidden"></div>
          </div>
        </div>
        <div
          class="pane max-width-one-third"
          v-if="selectedGallery && !showMobileLightbox"
        >
          <XMarkIcon
            class="close-icon"
            @click="selectedGallery = null"
          ></XMarkIcon>
          <ImageGallery :gallery="selectedGallery" />
        </div>
      </div>
    </div>
    <GalleryEditor
      v-if="galleryAddEditPromptShowing"
      :markdown-document="activeMarkdownDocument"
      :allow-image-modification="true"
      @gallery-close-requested="galleryAddEditPromptShowing = false"
      @gallery-deleted="loadDocument"
      @gallery-updated="loadDocument"
    ></GalleryEditor>
    <LightboxWrapper
      :initialActiveIndex="0"
      :gallery="selectedGallery"
      v-if="selectedGallery && showMobileLightbox"
      @gallery-closed="onMobileLightboxDismissed"
    ></LightboxWrapper>
  </div>
  <Drawer
    v-model:visible="mobileDrawerVisible"
    :header="activeMarkdownDocument?.title ?? 'Menu'"
    position="right"
  >
    <div class="flex flex-column space-y-4">
      <button @click="onEditTitleClicked">Rename Document</button>
      <button @click="galleryAddEditPromptShowing = true">
        Manage Galleries
      </button>
      <button @click="onReturnToDocumentsClicked">
        Return to Document List
      </button>
      <button @click="onSignOutClicked">Sign Out</button>
    </div>
  </Drawer>
  <div
    class="mobile-hamburger-button md:hidden"
    @click="mobileDrawerVisible = true"
  >
    <Bars3Icon class="hamburger-icon"></Bars3Icon>
  </div>
  <div class="mobile-edit-view-toolbar md:hidden">
    <div
      class="mobile-edit-view-button-container"
      :class="{ active: !showEditor }"
      @click="showEditor = false"
    >
      <EyeIcon class="mobile-edit-view-button"></EyeIcon>
    </div>
    <div
      class="mobile-edit-view-button-container"
      :class="{ active: showEditor }"
      @click="showEditor = true"
    >
      <PencilIcon class="mobile-edit-view-button"></PencilIcon>
    </div>
  </div>
  <Dialog
    v-model:visible="showDocumentRenameDialog"
    class="max-height-20vh"
    header="Rename Document"
    modal
    dismissable-mask
  >
    <div class="flex w-full justify-center">
      <InputText placeholder="Title" v-model="newTitle"></InputText>
    </div>
    <template #footer>
      <div class="flex w-full justify-center">
        <button @click="saveDocumentTitle">Save Title</button>
      </div>
    </template>
  </Dialog>
</template>

<style>
.document-viewer {
  height: 100%;
  width: 100%;
  background-color: var(--secondary-background-color);

  --toolbar-element-size: 2.75rem;
}
.document-viewer p,
.document-viewer a {
  font-size: 1.5rem;
}
.panes {
  display: flex;
}
.document-page-container {
  position: relative;
}
.half-pane {
  width: 50%;
}
.pane {
  flex-grow: 1;
  border: 1px solid gray;
  padding: 1rem;
  border-radius: 0.5rem;
}
.pane.no-border {
  border: none;
}
.document-link {
  height: var(--toolbar-element-size);
  width: var(--toolbar-element-size);
}
.document-editor-pane {
  background-color: var(--document-page-color);
}
.document-page {
  flex-grow: 1;
  min-height: 20rem;
  background-color: var(--document-page-color);
}
@media screen and (max-width: 768px) {
  .mobile-hidden {
    display: none;
  }
}
.editor-tool-icon {
  width: var(--toolbar-element-size);
  height: var(--toolbar-element-size);
  cursor: pointer;
  padding: 0.5rem;
  border: inherit;
  border-radius: inherit;
}
.editor-tool-icon:first-child {
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.editor-tool-icon:last-child {
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.editor-tool-icon.active {
  background-color: var(--accent-color);
  color: var(--accent-text-color);
}
.editor-tool-icon:not(.active):hover {
  background-color: var(--highlight-color);
}
.editor-toggle-buttons {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border: 1px solid black;
  border-radius: 5px;
}
.toolbar {
  padding-left: var(--header-padding-and-margins);
}
.toolbar > * {
  margin-right: var(--header-padding-and-margins);
}
.toolbar h1 {
  font-size: 3.5rem;
}
.interactive-toolbar-element {
  height: var(--toolbar-element-size);
  font-size: 1rem;
}
.close-icon {
  width: 3rem;
  height: 3rem;
  cursor: pointer;
}
.mobile-hamburger-button {
  height: var(--global-header-height);
  width: var(--global-header-height);
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background-color: var(--primary-background-color);
  cursor: pointer;
}
.hamburger-icon {
  width: 100%;
  height: 100%;
}
.mobile-edit-view-toolbar {
  height: 4rem;
  width: 100vw;
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
}
.mobile-edit-view-button-container {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--primary-background-color);
}
.mobile-edit-view-button {
  width: 4rem;
  height: 4rem;
}
.mobile-edit-view-button-container.active {
  color: var(--accent-text-color);
  background-color: var(--accent-color);
}
li {
  list-style-position: inside;
}
ul li {
  list-style-type: disc;
}
ol li {
  list-style-type: decimal;
}
</style>
