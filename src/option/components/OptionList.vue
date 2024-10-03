<script setup lang="ts">
import { onMounted, reactive, watch } from "vue";
import CheckOption from "./CheckOption.vue";
import OptionDescription from "./OptionDescription.vue";
import type { Options } from "../../lib/options";

type T = Record<string, boolean>;

const props = defineProps<{
  title: string;
  options: Options<string>;
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
      <template v-for="[name, description, extra] of props.options" :key="name">
        <CheckOption
          :model-value="values[name]!"
          @update:model-value="values[name] = $event"
        >
          {{ description }}
        </CheckOption>
        <slot :name="name" :values="values" />
        <OptionDescription v-if="extra" class="extra">
          （{{ extra }}）
        </OptionDescription>
      </template>
    </div>
  </div>
</template>

<style scoped>
.block {
  --low-key-color: color-mix(in oklab, CanvasText, Canvas);

  padding: 18px 32px;

  & + & {
    border-top: 0.5px solid var(--low-key-color);
  }
}

.block-name {
  margin-bottom: 10px;
  font-weight: bold;
}

.option-list {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  grid-gap: 10px;
}

.extra {
  font-size: 0.8em;
  color: var(--low-key-color);
  margin-top: -6px;
}
</style>
