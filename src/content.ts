import type { Result } from "./lib/result";

function checkContext(): boolean {
  return window.name === chrome.runtime.id;
}

function resetContext(): void {
  window.name = "";
}

async function waitLoad(): Promise<void> {
  await new Promise<void>((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }

    window.addEventListener(
      "load",
      () => {
        resolve();
      },
      { once: true },
    );
  });
}

function denounce(func: () => void, time: number): () => void {
  let timer = 0;

  return () => {
    clearTimeout(timer);

    timer = setTimeout(func, time);
  };
}

async function waitMutationStopped(target: Node): Promise<void> {
  await new Promise<void>((resolve) => {
    const WAITED_MUTATION_TIME = 500;

    const waitTimeout = denounce(() => {
      observer.disconnect();
      resolve();
    }, WAITED_MUTATION_TIME);

    const observer = new MutationObserver(waitTimeout);

    observer.observe(target, {
      attributes: true,
      characterData: true,
      subtree: true,
    });

    waitTimeout();
  });
}

async function waitIdle(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestIdleCallback(() => {
      resolve();
    });
  });
}

function checkLoggedOut(): boolean {
  return (
    document.querySelector('a[href^="/buyer/signup"]')?.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
    }) === true
  );
}

function getCheckinButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(
    "button[class^=pcmall-dailycheckin_]",
  );
}

async function sendResult(result: Result): Promise<void> {
  await chrome.runtime.sendMessage(result);
}

async function checkin(): Promise<void> {
  await waitLoad();
  await waitMutationStopped(document.documentElement);
  await waitIdle();

  if (checkLoggedOut()) {
    await sendResult("logout");
    resetContext();
    return;
  }

  const checkinButton = getCheckinButton();
  if (checkinButton === null) {
    await sendResult("error");
    resetContext();
    return;
  }

  if (checkinButton.dataset.inactive === "true") {
    await sendResult("checkedin");
    resetContext();
    return;
  }

  checkinButton.click();

  await waitMutationStopped(checkinButton);
  await waitIdle();
  await sendResult("success");
  resetContext();
}

if (checkContext()) {
  await checkin();
}
