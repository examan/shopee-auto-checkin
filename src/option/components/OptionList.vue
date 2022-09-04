<script setup lang="ts">
import { onMounted, reactive, watch } from "vue";
import CheckOption from "./CheckOption.vue";

type T = Record<string, boolean>;

const props = defineProps<{
  title: string;
  options: [string, string][];
  setting: {
    defaults: T;
    get: () => Promise<T>;
    set: (value: T) => Promise<void>;
  };
}>();

const values = reactive(props.setting.defaults);

watch(values, async (value) => {
  await props.setting.set(value);
});

onMounted(async () => {
  const value = await props.setting.get();

  Object.assign(values, value);
});
</script>

<template>
  <div class="block">
    <div class="block-name">{{ props.title }}</div>
    <div class="option-list">
      <template v-for="[name, description] of props.options" :key="name">
        <CheckOption
          :model-value="values[name]!"
          @update:model-value="values[name] = $event"
        >
          {{ description }}
        </CheckOption>
        <slot :name="name" :values="values"></slot>
      </template>
    </div>
  </div>
</template>

<style scoped>
.block {
  padding: 18px 32px 12px;
  border-top: 1px solid #737373;
}

.block-name {
  margin-bottom: 10px;
  font-weight: bold;
}

.option-list {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  justify-items: start;
  grid-gap: 10px;
}
</style>
