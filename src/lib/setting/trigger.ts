import { factory } from "./factory";

export type Trigger = "startup" | "time";

type Triggers = {
  [k in Trigger]: boolean;
} & { timeSetting: string };

const defaults: Triggers = {
  startup: true,
  time: true,
  timeSetting: "00:01:00",
};

export default factory("trigger", defaults);
