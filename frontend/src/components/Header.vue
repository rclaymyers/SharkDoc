<script setup lang="ts"></script>

<template>
  <div class="global-header">
    <p>Paged Markdown with Galleries</p>
    <p>C</p>
  </div>
</template>

<style>
.global-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--secondary-accent-color);
  color: #ccc;
  font-size: 2rem;
  padding: 0 var(--header-padding-and-margins);
  height: var(--global-header-height);
}
@media screen and (max-width: 768px) {
  .global-header {
    font-size: 1rem;
  }
}
</style>
