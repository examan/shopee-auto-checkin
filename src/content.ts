import type { Result } from "./lib/result";

function checkContext(): boolean {
  console.log("檢查環境設置:", window.name === chrome.runtime.id);
  return window.name === chrome.runtime.id;
}

function resetContext(): void {
  console.log("重置環境設置");
  window.name = "";
}

async function waitLoad(): Promise<void> {
  console.log("等待頁面加載...");
  await new Promise<void>((resolve) => {
    if (document.readyState === "complete") {
      console.log("頁面已完全加載");
      resolve();
      return;
    }

    window.addEventListener(
      "load",
      () => {
        console.log("頁面加載完成");
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
  console.log("等待DOM變化停止...");
  await new Promise<void>((resolve) => {
    const WAITED_MUTATION_TIME = 500;

    const waitTimeout = denounce(() => {
      console.log("DOM變化停止，解除觀察");
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
  console.log("等待空閒時間...");
  await new Promise<void>((resolve) => {
    requestIdleCallback(() => {
      console.log("獲得空閒時間");
      resolve();
    });
  });
}

function checkLoggedOut(): boolean {
  console.log(
    "檢查是否已登出:",
    document.querySelector('a[href^="/buyer/signup"]')?.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
    }),
  );
  return (
    document.querySelector('a[href^="/buyer/signup"]')?.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
    }) === true
  );
}

function getCheckinButton(): HTMLButtonElement | null {
  console.log("查找簽到按鈕");
  return document.querySelector<HTMLButtonElement>(
    "button[class^=pcmall-dailycheckin_]",
  );
}

async function sendResult(result: Result): Promise<void> {
  console.log("發送結果:", result);
  await chrome.runtime.sendMessage(result);
}

async function checkin(): Promise<void> {
  console.log("開始簽到流程...");
  await waitLoad();
  await waitMutationStopped(document.documentElement);
  await waitIdle();

  if (checkLoggedOut()) {
    console.log("用戶已登出，退出簽到流程");
    await sendResult("logout");
    resetContext();
    return;
  }

  const checkinButton = getCheckinButton();
  if (checkinButton === null) {
    console.log("未找到簽到按鈕，退出簽到流程");
    await sendResult("error");
    resetContext();
    return;
  }

  if (checkinButton.dataset.inactive === "true") {
    console.log("簽到按鈕處於非活動狀態");
    await sendResult("checkedin");
    resetContext();
    return;
  }

  checkinButton.click();

  await waitMutationStopped(checkinButton);
  await waitIdle();
  console.log("簽到成功");
  await sendResult("success");
  resetContext();
}

if (checkContext()) {
  console.log("環境設置檢查通過，開始執行簽到");
  await checkin();
}
