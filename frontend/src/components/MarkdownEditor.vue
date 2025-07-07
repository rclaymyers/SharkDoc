<template>
  <div ref="editorContainer" class="editor"></div>
</template>

<script setup lang="ts">
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { onMounted, ref } from "vue";
import type { MarkdownDocument } from "../../../sharedModels/MarkdownDocument";

const editorContainer = ref(null);

const props = defineProps<{
  markdownDocument: MarkdownDocument;
  pageNumber: number;
}>();

const emit = defineEmits<{
  (
    event: "update:markdownText",
    payload: { pageNumber: number; text: string }
  ): void;
}>();

onMounted(() => {
  const editorState = EditorState.create({
    doc: props.markdownDocument.pages[props.pageNumber].content,
    extensions: [
      basicSetup,
      markdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newDoc = update.state.doc.toString();
          emit("update:markdownText", {
            pageNumber: props.pageNumber,
            text: newDoc,
          });
        }
      }),
    ],
  });

  const editorContainerElement = editorContainer.value;
  if (editorContainerElement) {
    new EditorView({
      state: editorState,
      parent: editorContainerElement,
    });
  }
});
</script>
