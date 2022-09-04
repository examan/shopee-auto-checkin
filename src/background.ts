import { CHECKIN_URL, MINUTES_PER_DAY, NAME } from "./lib/constant";
import type { Result } from "./lib/result";
import notificationSetting from "./lib/setting/notification";
import triggerSetting from "./lib/setting/trigger";

const RESULT_MESSAGE: { [result in Result]: string } = {
  checkedin: "已為簽到狀態，不執行任何動作",
  error: "發生不明錯誤，簽到失敗",
  logout: "尚未登入，請登入後自行簽到",
  success: "簽到成功",
};

async function onNotificationClicked(notificationId: string): Promise<void> {
  console.info("通知被點擊");

  const { result, tabId } = JSON.parse(notificationId) as {
    result: Result;
    tabId: number;
  };

  if (!["error", "logout"].includes(result)) {
    console.error("無相對應通知動作，執行中斷");
    return;
  }

  await chrome.tabs.update(tabId, { active: true });
  console.info("顯示頁籤");
}

async function onMessage(
  result: Result,
  { tab }: chrome.runtime.MessageSender
): Promise<void> {
  const tabId = tab?.id ?? 0;

  if (["checkedin", "success"].includes(result)) {
    await chrome.tabs.remove(tabId);
    console.info("關閉頁籤");
  }

  const resultMessage = RESULT_MESSAGE[result];
  console.info(resultMessage);

  const setting = await notificationSetting.get();
  if (setting[result]) {
    const notificationId = JSON.stringify({ result, tabId });

    console.info("產生通知");

    chrome.notifications.create(notificationId, {
      iconUrl: "/icon.ico",
      message: resultMessage,
      title: NAME,
      type: "basic",
    });
  }
}

async function waitCurrentWindow(): Promise<chrome.windows.Window> {
  try {
    return await chrome.windows.getCurrent();
  } catch {
    return await waitCurrentWindow();
  }
}

function validTabId(tabId: number | undefined): tabId is number {
  return typeof tabId !== "undefined" && tabId !== 0;
}

async function markAsOpenedTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    func: () => {
      document.documentElement.dataset[chrome.runtime.id] = "true";
    },
    target: { tabId },
  });
}

async function CheckinInNewTab(): Promise<void> {
  console.info("取得當前視窗");

  await waitCurrentWindow();

  console.info("開啟頁籤");

  const { id: tabId } = await chrome.tabs.create({
    active: false,
    url: CHECKIN_URL,
  });

  if (!validTabId(tabId)) {
    console.error("頁籤開啟失敗");
    return;
  }

  await chrome.tabs.move(tabId, { index: -1 });

  await markAsOpenedTab(tabId);
}

async function CheckinInNewWindow(): Promise<void> {
  console.info("開啟視窗");
  const window = await chrome.windows.create({
    focused: false,
    state: "minimized",
    url: CHECKIN_URL,
  });

  const tabId = window.tabs?.[0]?.id;

  if (!validTabId(tabId)) {
    console.error("視窗開啟失敗");
    return;
  }

  await chrome.tabs.update(tabId, { active: false, pinned: true });

  await markAsOpenedTab(tabId);
}

async function startupCheckin(): Promise<void> {
  const { startup } = await triggerSetting.get();

  if (!startup) {
    return;
  }

  await CheckinInNewTab();
}

async function scheduledCheckin(): Promise<void> {
  console.info("確認是否有已開啟視窗");

  const { length } = await chrome.windows.getAll();

  if (length === 0) {
    await CheckinInNewWindow();
  } else {
    await CheckinInNewTab();
  }
}

function createAlarm(timeSetting: string): void {
  const date = new Date(`${new Date().toDateString()} ${timeSetting}`);
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  console.info("設定鬧鐘", date);

  chrome.alarms.create(chrome.runtime.id, {
    periodInMinutes: MINUTES_PER_DAY,
    when: date.getTime(),
  });
}

function onActionClicked(): void {
  chrome.runtime.openOptionsPage();
}

function onConnect(port: chrome.runtime.Port): void {
  port.onDisconnect.addListener(() => {
    chrome.runtime.reload();
  });
}

async function init(): Promise<void> {
  chrome.action.onClicked.addListener(onActionClicked);
  chrome.runtime.onConnect.addListener(onConnect);

  /* eslint-disable @typescript-eslint/no-misused-promises */
  chrome.notifications.onClicked.addListener(onNotificationClicked);
  chrome.runtime.onMessage.addListener(onMessage);
  /* eslint-enable @typescript-eslint/no-misused-promises */

  /* eslint-disable @typescript-eslint/no-misused-promises */
  chrome.runtime.onStartup.addListener(startupCheckin);
  chrome.runtime.onInstalled.addListener(startupCheckin);
  /* eslint-enable @typescript-eslint/no-misused-promises */

  const { time, timeSetting } = await triggerSetting.get();
  if (time) {
    /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
    chrome.alarms.onAlarm.addListener(scheduledCheckin);
    createAlarm(timeSetting);
  }
}

void init();
