import type { Result } from "../result";
import { factory } from "./factory";

type Notifications = {
  [k in Result]: boolean;
};

const defaults: Notifications = {
  checkedin: false,
  error: true,
  logout: true,
  success: true,
};

export default factory("notification", defaults);
