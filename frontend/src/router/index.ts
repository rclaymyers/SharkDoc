// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import DocumentList from "../components/DocumentList.vue";
import DocumentViewer from "../components/DocumentViewer.vue";

const routes = [
  { path: "/", name: "Home", component: DocumentList },
  { path: "/document/:id", name: "Document", component: DocumentViewer },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
