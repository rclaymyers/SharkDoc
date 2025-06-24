<template>
  <div ref="editorContainer" class="editor"></div>
</template>

<script setup lang="ts">
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { onMounted, ref } from "vue";

const editorContainer = ref(null);
let editorView: EditorView | null = null;

const props = defineProps<{
  markdownText: string;
}>();

const emit = defineEmits<{
  (event: "update:markdownText", value: string): void;
}>();

onMounted(() => {
  const editorState = EditorState.create({
    doc: props.markdownText,
    extensions: [
      basicSetup,
      markdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newDoc = update.state.doc.toString();
          emit("update:markdownText", newDoc);
        }
      }),
    ],
  });

  const editorContainerElement = editorContainer.value;
  if (editorContainerElement) {
    editorView = new EditorView({
      state: editorState,
      parent: editorContainerElement,
    });
  }
});
</script>
