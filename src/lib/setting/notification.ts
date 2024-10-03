import type { Result } from "../result";
import { factory } from "./factory";

type Notifications = {
  [k in Result]: boolean;
};

const DEFAULTS: Notifications = {
  checkedin: false,
  error: true,
  logout: true,
  success: true,
};

export const setting = factory("notification", DEFAULTS);
