<template>
  <div class="app">
    <Editor v-model="state" :fromData="fromData" />
  </div>
</template>

<script setup>
import data from "./data.json";
import { ref, provide } from "vue";
import Editor from "./packages/editor";
import { config } from './utils/editor-config';

const state = ref(data);
provide('config', config);

const fromData = ref({
  username: 'veloma',
  password: 123,
  start: 0,
  end: 100
});

</script>

<style lang="scss">
  .app {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: 10px;
    top: 10px;
  }
</style>
