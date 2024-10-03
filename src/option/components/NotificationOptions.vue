<script setup lang="ts">
import OptionList from "./OptionList.vue";
import type { Options } from "../../lib/options";
import type { Result } from "../../lib/result";
import { setting } from "../../lib/setting/notification";

const options: Options<Result> = [
  ["checkedin", "已簽到"],
  ["error", "發生錯誤"],
  ["logout", "尚未登入"],
  ["success", "簽到成功"],
];
</script>

<template>
  <OptionList
    title="當符合勾選的結果時，顯示通知"
    :options="options"
    :setting="setting as any"
  />
</template>
