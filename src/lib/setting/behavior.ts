import { factory } from "./factory";

export type Behavior = "forceTrigger" | "keepPage" | "silentNotification";

type Behaviors = {
  [k in Behavior]: boolean;
};

const DEFAULTS: Behaviors = {
  forceTrigger: false,
  keepPage: false,
  silentNotification: false,
};

export const setting = factory("behavior", DEFAULTS);
