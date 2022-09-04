const connect = ((): (() => void) => {
  let connected = false;
  return (): void => {
    if (connected) {
      return;
    }
    connected = true;

    chrome.runtime.connect();
  };
})();

export function factory<T extends Record<string, unknown>, N extends string>(
  name: N,
  defaults: T
): {
  get: () => Promise<T>;
  set: (value: T) => Promise<void>;
  defaults: T;
} {
  return {
    defaults,

    get: async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      const setting: T = ((await chrome.storage.local.get(name)) as any)[name];

      return { ...defaults, ...setting };
    },

    set: async (value: T) => {
      await chrome.storage.local.set({ [name]: value });

      connect();
    },
  };
}
