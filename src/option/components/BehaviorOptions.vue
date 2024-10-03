<script setup lang="ts">
import { type Behavior, setting } from "../../lib/setting/behavior";
import OptionList from "./OptionList.vue";
import type { Options } from "../../lib/options";

const options: Options<Behavior> = [
  [
    "forceTrigger",
    "即使當日已簽到過，符合條件時仍強制進行簽到",
    "避免因誤判而導致漏簽",
  ],
  ["silentNotification", "通知時，不發出音效或震動"],
  ["keepPage", "簽到成功後，不自動關閉頁面", "不包含原本就已經簽到完成的情況"],
];
</script>

<template>
  <OptionList title="其他選項" :options="options" :setting="setting as any" />
</template>
