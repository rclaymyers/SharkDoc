<script setup lang="ts">
import { nextTick, ref, type Ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";
import { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";
import GalleryEditor from "./GalleryEditor.vue";
import { useRoute } from "vue-router";
import { ApiService } from "../services/apiService";
import { UtilitiesService } from "../services/utils";
import type { Gallery } from "../../../sharedModels/Gallery";
import {
  ChevronRightIcon,
  CodeBracketSquareIcon,
  DocumentIcon,
  DocumentPlusIcon,
  EyeIcon,
  PencilIcon,
  PencilSquareIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const documentId = Number(route.params.id);

const activeMarkdownDocument: Ref<MarkdownDocument | null> =
  ref<MarkdownDocument | null>(null);
const editingTitle = ref<boolean>(false);
const newTitle = ref<string>("");

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
      }
      editingTitle.value = false;
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

const showEditor = ref(false);
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
    }
  });
};

const galleryAddEditPromptShowing = ref(false);
const showGalleryPrompt = () => {
  galleryAddEditPromptShowing.value = true;
};

const selectedGallery = ref<Gallery | null>(null);
const showGallery = (galleryName: string) => {
  const gallery = activeMarkdownDocument.value?.galleries.find(
    (gallery: Gallery) => gallery.name === galleryName
  );
  if (gallery) {
    selectedGallery.value = gallery;
  }
};
const hideGallery = () => (selectedGallery.value = null);

const deletePage = (pageId: number) => {
  const documentId = activeMarkdownDocument.value?.id;
  if (!documentId) {
    return;
  }
  ApiService.deletePage(documentId, pageId).then((updatedDocument) => {
    if (!updatedDocument) {
      //todo show error
      return;
    }
    activeMarkdownDocument.value = updatedDocument;
  });
};
</script>

<template>
  <div class="document-viewer" v-if="activeMarkdownDocument">
    <div class="toolbar flex align-items-center subheader">
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
              class="pane half-pane m-1 mx-8 mb-4 document-editor-pane"
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
                showEditor ? 'w-1/2' : '',
                'drop-shadow-xl mx-8 mb-4 mt-1 p-3 document-page',
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
            <div></div>
            <DocumentPlusIcon
              class="size-[2rem] clickable"
              @click="addPage"
            ></DocumentPlusIcon>
            <!-- spacer -->
            <div v-if="!showEditor"></div>
          </div>
        </div>
        <div class="pane max-width-one-third" v-if="selectedGallery">
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
  </div>
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
.interactive-toolbar-element {
  height: var(--toolbar-element-size);
}
.close-icon {
  width: 3rem;
  height: 3rem;
  cursor: pointer;
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
