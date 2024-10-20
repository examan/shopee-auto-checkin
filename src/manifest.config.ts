/* eslint-disable sort-keys */

import { CHECKIN_URL, LOGIN_URL, NAME } from "./lib/constant";
import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest(() => ({
  manifest_version: 3,
  name: NAME,
  version: "2.0.3",
  description: "自動簽到蝦皮購物，賺取蝦幣獎勵",

  action: {},
  default_locale: "zh_TW",
  icons: {
    "16": "16.png",
    "32": "32.png",
    "48": "48.png",
    "128": "128.png",
    "256": "256.png",
  },
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      js: ["src/content.ts"],
      matches: [LOGIN_URL, CHECKIN_URL],
    },
  ],
  host_permissions: [LOGIN_URL, CHECKIN_URL],
  options_ui: { page: "src/option/index.html" },
  permissions: ["alarms", "notifications", "scripting", "storage"],
}));
