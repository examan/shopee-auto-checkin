<script setup lang="ts">
import OptionDescription from "./OptionDescription.vue";
import { computed } from "vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value2) {
    emit("update:modelValue", value2);
  },
});
</script>

<template>
  <label>
    <input v-model="value" type="checkbox" />
    <OptionDescription><slot /></OptionDescription>
  </label>
</template>

<style scoped>
* {
  cursor: pointer;
}

label {
  display: contents;
}

input {
  width: 20px;
  height: 20px;
  margin: 0;
  grid-column: 1;
}
</style>
