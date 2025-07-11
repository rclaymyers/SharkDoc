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
  ViewColumnsIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import LightboxWrapper from "./LightboxWrapper.vue";
import { useDialog } from "primevue";
import { AuthService } from "../services/authService";
import { ToastService } from "../services/toastService";
import { ToastErrorMessages } from "../../../sharedModels/ToastMessages";
import { ConfirmationModalService } from "../services/confirmationModalService";

const EditorViewEnum = {
  DOCUMENT_ONLY: 0,
  SPLIT_PANES: 1,
  EDITOR_ONLY: 2,
};

const route = useRoute();
const router = useRouter();

const documentId = Number(route.params.id);
const dialog = useDialog();

const activeMarkdownDocument: Ref<MarkdownDocument | null> =
  ref<MarkdownDocument | null>(null);
const editingTitle = ref<boolean>(false);
const newTitle = ref<string>("");
const newTitleInputText = ref();
const mobileDrawerVisible = ref(false);
const editorViewState = ref(EditorViewEnum.DOCUMENT_ONLY);
const galleryAddEditPromptShowing = ref(false);
const selectedGallery = ref<Gallery | null>(null);
const showDesktopGallery = ref<boolean>(false);
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
  nextTick().then(() => {
    newTitleInputText.value?.$el?.focus?.();
    newTitleInputText.value?.$el?.select?.();
  });
};

const saveDocumentTitle = () => {
  if (!activeMarkdownDocument.value || !newTitle.value) {
    ToastService.showError("Error", ToastErrorMessages.DocumentNameRequired);
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

const changeEditorView = (newValue: number) => {
  editorViewState.value = newValue;
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
  showDesktopGallery.value = window.innerWidth > 768;
  showMobileLightbox.value = window.innerWidth <= 768;
  console.log("Selected gallery set to:", selectedGallery.value);
  console.log("Show mobile lightbox set to:", showMobileLightbox);
};

const deletePage = (pageId: number) => {
  const documentId = activeMarkdownDocument.value?.id;
  if (!documentId) {
    return;
  }
  ConfirmationModalService.showDeletionDialog("page", () => {
    ApiService.deletePage(documentId, pageId).then((updatedDocument) => {
      if (!updatedDocument) {
        return;
      }
      activeMarkdownDocument.value = updatedDocument;
      ToastService.showSuccess("Success", "Page deleted!");
    });
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
        data-cy="document-title"
      >
        {{ activeMarkdownDocument.title }}
      </h1>
      <InputText
        autofocus
        v-if="editingTitle"
        v-model="newTitle"
        :style="{ minWidth: '30ch' }"
        @keydown.enter="saveDocumentTitle()"
        @keydown.esc="editingTitle = false"
        data-cy="document-title-editor"
        ref="newTitleInputText"
      />
      <div class="editor-toggle-buttons interactive-toolbar-element">
        <div
          class="editor-tool-icon"
          :class="{ active: editorViewState === EditorViewEnum.DOCUMENT_ONLY }"
          @click="changeEditorView(EditorViewEnum.DOCUMENT_ONLY)"
          data-cy="compiled-markdown-only-view-button"
        >
          <EyeIcon></EyeIcon>
        </div>
        <div
          class="editor-tool-icon"
          :class="{ active: editorViewState === EditorViewEnum.SPLIT_PANES }"
          @click="changeEditorView(EditorViewEnum.SPLIT_PANES)"
          data-cy="split-pane-view-button"
        >
          <ViewColumnsIcon></ViewColumnsIcon>
        </div>
        <div
          class="editor-tool-icon"
          :class="{ active: editorViewState === EditorViewEnum.EDITOR_ONLY }"
          @click="changeEditorView(EditorViewEnum.EDITOR_ONLY)"
          data-cy="editor-only-view-button"
        >
          <PencilIcon></PencilIcon>
        </div>
      </div>
      <button
        class="interactive-toolbar-element"
        @click="showGalleryPrompt"
        data-cy="manage-galleries-button-desktop"
      >
        Manage Galleries
      </button>
    </div>
    <div class="document-page-container content-under-subheader">
      <div class="panes max-h-full">
        <div
          class="pane overflow-scroll no-border"
          :class="{ 'share-space-with-gallery': !!selectedGallery }"
        >
          <div
            class="panes"
            v-for="(page, index) in activeMarkdownDocument.pages"
          >
            <div
              class="pane m-1 mx-1 mb-4 document-editor-pane"
              :class="{
                'half-pane': editorViewState === EditorViewEnum.SPLIT_PANES,
              }"
              v-if="
                editorViewState === EditorViewEnum.SPLIT_PANES ||
                editorViewState === EditorViewEnum.EDITOR_ONLY
              "
            >
              <MarkdownEditor
                :markdown-document="activeMarkdownDocument"
                :page-number="index"
                @update:markdownText="onMarkdownTextChanged"
                data-cy="markdown-editor-instance"
              ></MarkdownEditor>
            </div>
            <div
              class="drop-shadow-xl mx-1 mb-4 mt-1 p-3 document-page"
              :class="{
                'half-pane mobile-hidden':
                  editorViewState === EditorViewEnum.SPLIT_PANES,
                hidden: editorViewState === EditorViewEnum.EDITOR_ONLY,
              }"
            >
              <MarkdownDisplay
                :markdown-document="activeMarkdownDocument"
                :document-id="activeMarkdownDocument.id"
                :page-index="index"
                :page-id="page.id"
                @galleryClicked="showGallery"
                @page-deletion-requested="deletePage"
                data-cy="markdown-display-instance"
              ></MarkdownDisplay>
            </div>
          </div>
          <div class="w-full flex justify-around mb-8 md:pb-0">
            <!-- spacer -->
            <div
              :class="{
                'mobile-hidden': editorViewState === EditorViewEnum.SPLIT_PANES,
                hidden: editorViewState === EditorViewEnum.EDITOR_ONLY,
              }"
            ></div>
            <div
              class="size-[2rem] clickable"
              @click="addPage"
              data-cy="add-page-button"
            >
              <DocumentPlusIcon></DocumentPlusIcon>
            </div>
            <!-- spacer -->
            <div
              :class="{
                'mobile-hidden': editorViewState === EditorViewEnum.SPLIT_PANES,
                hidden: editorViewState === EditorViewEnum.EDITOR_ONLY,
              }"
            ></div>
          </div>
        </div>
        <div
          class="background-secondary-accent pane animate-width relative"
          :class="{
            'show-gallery':
              selectedGallery && !showMobileLightbox && showDesktopGallery,
          }"
        >
          <XMarkIcon
            class="close-icon"
            @click="showDesktopGallery = false"
            data-cy="close-gallery-button"
          ></XMarkIcon>
          <div class="flex w-full justify-center py-2">
            <p class="overflow-hidden">{{ selectedGallery?.name }}</p>
          </div>
          <ImageGallery :gallery="selectedGallery" v-if="selectedGallery" />
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
      data-cy="lightbox-wrapper"
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
      :class="{ active: editorViewState === EditorViewEnum.DOCUMENT_ONLY }"
      @click="editorViewState = EditorViewEnum.DOCUMENT_ONLY"
    >
      <EyeIcon class="mobile-edit-view-button"></EyeIcon>
    </div>
    <div
      class="mobile-edit-view-button-container"
      :class="{
        active:
          editorViewState === EditorViewEnum.EDITOR_ONLY ||
          editorViewState === EditorViewEnum.SPLIT_PANES,
      }"
      @click="editorViewState = EditorViewEnum.EDITOR_ONLY"
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

  --toolbar-element-size: 2rem;
  --toolbar-bottom-border-color: #eee;
}
@media (prefers-color-scheme: dark) {
  .document-viewer {
    --toolbar-bottom-border-color: #555;
  }
}
.document-viewer p,
.document-viewer a {
  font-size: 1.5em;
}
.document-viewer p a {
  font-size: 1em;
}
.document-page-container {
  position: relative;
}
.panes {
  display: flex;
  justify-content: space-evenly;
  max-width: 100%;
}
.pane {
  flex-grow: 1;
  border: 1px solid gray;
  padding: 1rem;
  border-radius: 0.5rem;
  max-width: 100%;
}
@media screen and (min-width: 769px) {
  .half-pane {
    max-width: 45%;
  }
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
  border-radius: 0;
}
.editor-tool-icon:first-child {
  border-right: none;
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
}
.editor-tool-icon:last-child {
  border-left: none;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
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
  border-bottom: 1px solid var(--toolbar-bottom-border-color);
}
.toolbar > * {
  margin-right: var(--header-padding-and-margins);
}
.toolbar > :first-child {
  margin-left: calc(var(--header-padding-and-margins) - 8px);
  margin-right: calc(var(--header-padding-and-margins) - 8px);
}
.toolbar h1 {
  font-size: 1rem;
}
.interactive-toolbar-element {
  height: var(--toolbar-element-size);
  font-size: 0.75rem;
}
.close-icon {
  width: 2rem;
  height: 2rem;
  max-width: 100%;
  cursor: pointer;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
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
  --mobile-toolbar-height: 3rem;
  height: var(--mobile-toolbar-height);
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
  width: var(--mobile-toolbar-height);
  height: var(--mobile-toolbar-height);
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
.animate-width {
  flex-grow: 0;
  padding: 0;
  width: 0px !important;
  transition: width 0.25s ease;
}

.show-gallery {
  width: 66% !important;
}
</style>
