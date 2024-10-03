import { factory } from "./factory";

export type Trigger = "startup" | "time";

type Triggers = {
  [k in Trigger]: boolean;
} & { timeSetting: string };

const DEFAULTS: Triggers = {
  startup: true,
  time: true,
  timeSetting: "00:01",
};

export const setting = factory("trigger", DEFAULTS);
