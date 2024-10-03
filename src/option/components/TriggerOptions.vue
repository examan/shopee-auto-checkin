<script setup lang="ts">
import { type Trigger, setting } from "../../lib/setting/trigger";
import OptionList from "./OptionList.vue";
import type { Options } from "../../lib/options";

const options: Options<Trigger> = [
  ["startup", "啟動瀏覽器"],
  ["time", "每天同一時間"],
];
</script>

<template>
  <OptionList
    title="當符合勾選的條件時，進行自動簽到"
    :options="options"
    :setting="setting as any"
  >
    <template #time="{ values }">
      <input
        v-model="values.timeSetting"
        type="time"
        step="60"
        :disabled="!values.time"
      />
    </template>
  </OptionList>
</template>
