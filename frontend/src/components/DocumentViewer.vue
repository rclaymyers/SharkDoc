<script setup lang="ts">
import { ref, type Ref } from "vue";
import MarkdownDisplay from "./MarkdownDisplay.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ImageGallery from "./ImageGallery.vue";
import { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";
import GalleryEditor from "./GalleryEditor.vue";
import { useRoute } from "vue-router";
import { ApiService } from "../services/apiService";
import { UtilitiesService } from "../services/utils";
import type { Gallery } from "../../../sharedModels/Gallery";
import { DocumentIcon } from "@heroicons/vue/24/outline";

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
    [...activeMarkdownDocument.value.galleries]
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
const toggleEditor = () => {
  showEditor.value = !showEditor.value;
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
  <template v-if="activeMarkdownDocument">
    <div class="flex align-items-center">
      <router-link to="/"> <DocumentIcon class="document-link" /></router-link>
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
    </div>
    <button @click="toggleEditor">Show Editor</button>
    <button @click="addPage">Add Page</button>
    <button @click="hideGallery" v-if="selectedGallery">Hide Gallery</button>
    <button @click="showGalleryPrompt">Galleries</button>
    <div class="panes">
      <div class="pane no-border">
        <div
          class="panes"
          v-for="(page, index) in activeMarkdownDocument.pages"
        >
          <div class="pane half-pane" v-if="showEditor">
            <MarkdownEditor
              :markdown-document="activeMarkdownDocument"
              :page-number="index"
              @update:markdownText="onMarkdownTextChanged"
            />
          </div>
          <div :class="[showEditor ? 'half-pane' : '', 'pane']">
            <MarkdownDisplay
              :markdown-text="page.content"
              :document-id="activeMarkdownDocument.id"
              :page-id="page.id"
              @galleryClicked="showGallery"
              @page-deletion-requested="deletePage"
            />
          </div>
        </div>
      </div>
      <div class="pane max-width-one-third" v-if="selectedGallery">
        <ImageGallery :gallery="selectedGallery" />
      </div>
    </div>
    <GalleryEditor
      v-if="galleryAddEditPromptShowing"
      :markdown-document="activeMarkdownDocument"
      :allow-image-modification="true"
      @gallery-close-requested="galleryAddEditPromptShowing = false"
      @gallery-deleted="loadDocument"
      @gallery-updated="loadDocument"
    />
  </template>
  <button @click="addPage()">Add Page</button>
</template>

<style>
.panes {
  display: flex;
}
.half-pane {
  width: 50%;
}
.pane {
  flex-grow: 1;
  border: 1px solid gray;
  margin: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
}
.pane.no-border {
  border: none;
}
.document-link {
  height: 5vh;
  width: 5vh;
}
</style>
