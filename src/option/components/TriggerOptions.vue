<script setup lang="ts">
import OptionList from "./OptionList.vue";
import type { Trigger } from "../../lib/setting/trigger";
import setting from "../../lib/setting/trigger";

const options: [Trigger, string][] = [
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
        step="1"
        :disabled="!values.time"
      />
    </template>
  </OptionList>
</template>
