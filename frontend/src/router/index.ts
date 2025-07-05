// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import DocumentList from "../components/DocumentList.vue";
import DocumentViewer from "../components/DocumentViewer.vue";
import UserLoginRegistration from "../components/UserLoginRegistration.vue";
import { LocalStorageService } from "../services/localStorageService";

const routes = [
  { path: "/", name: "Home", component: DocumentList },
  { path: "/document/:id", name: "Document", component: DocumentViewer },
  { path: "/signin", name: "Sign In", component: UserLoginRegistration },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const publicPaths = ["/signin"];
router.beforeEach((to, from, next) => {
  const token = LocalStorageService.getJwt();
  if (!tokenValid(token) && !publicPaths.includes(to.path)) {
    next("/signin");
  } else {
    next();
  }
});

const tokenValid = (token: string | null): boolean => {
  if (!token) {
    return false;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return !payload?.exp || payload.exp >= currentTime;
  } catch (e) {
    return false;
  }
};

export default router;
