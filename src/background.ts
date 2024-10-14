import { CHECKIN_URL, MINUTES_PER_DAY, NAME } from "./lib/constant";
import { isRecordToday, setRecord } from "./lib/record";
import type { Result } from "./lib/result";
import { setting as behaviorSetting } from "./lib/setting/behavior";
import { setting as notificationSetting } from "./lib/setting/notification";
import { setting as triggerSetting } from "./lib/setting/trigger";

const RESULT_MESSAGE: { [result in Result]: string } = {
  checkedin: "已為簽到狀態，不執行任何動作",
  error: "發生不明錯誤，簽到失敗",
  logout: "尚未登入，請登入後自行簽到",
  success: "簽到成功",
};

async function onNotificationClicked(notificationId: string): Promise<void> {
  console.info("通知被點擊");

  const { tabId } = JSON.parse(notificationId) as { tabId: number };

  try {
    await chrome.tabs.update(tabId, { active: true });
    console.info("顯示頁籤");
  } catch {
    console.error("無法顯示頁籤");
  }
}

async function onMessage(
  result: Result,
  { tab }: chrome.runtime.MessageSender,
): Promise<void> {
  const tabId = tab?.id ?? 0;

  const { keepPage, silentNotification } = await behaviorSetting.get();

  if (["checkedin", "success"].includes(result)) {
    await setRecord();
    console.info("寫入簽到記錄");

    if (result === "checkedin" || !keepPage) {
      await chrome.tabs.remove(tabId);
      console.info("關閉頁籤");
    }
  }

  const resultMessage = RESULT_MESSAGE[result];
  console.info(resultMessage);

  const { [result]: shouldNotify } = await notificationSetting.get();
  if (shouldNotify) {
    const notificationId = JSON.stringify({ tabId });

    console.info("產生通知");

    chrome.notifications.create(notificationId, {
      iconUrl: "/icon.ico",
      message: resultMessage,
      silent: silentNotification,
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
      window.name = chrome.runtime.id;
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

  await markAsOpenedTab(tabId);
  await chrome.tabs.move(tabId, { index: -1 });
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

  await markAsOpenedTab(tabId);
  await chrome.tabs.update(tabId, { active: false, pinned: true });
}

async function skipCheckinToday(): Promise<boolean> {
  const { forceTrigger } = await behaviorSetting.get();
  return !forceTrigger && (await isRecordToday());
}

async function startupCheckin(): Promise<void> {
  const { startup } = await triggerSetting.get();
  if (!startup) {
    console.info("不需進行啟動瀏覽器時的簽到");
    return;
  }

  await createNextAlarm();

  if (await skipCheckinToday()) {
    console.info("今日已簽到，不進行啟動簽到");
    return;
  }

  await CheckinInNewTab();
}

async function scheduledCheckin(): Promise<void> {
  console.info("排程觸發");
  await createNextAlarm();

  if (await skipCheckinToday()) {
    console.info("今日已簽到，不進行排程簽到");
    return;
  }

  const { length } = await chrome.windows.getAll();
  if (length === 0) {
    await CheckinInNewWindow();
  } else {
    await CheckinInNewTab();
  }
}

function formatDate(date: Date): string {
  const DAY_IN_WEEK = 7;
  const dayString = new Intl.RelativeTimeFormat("zh-Hant", {
    numeric: "auto",
  }).format(
    (date.getDay() + DAY_IN_WEEK - new Date().getDay()) % DAY_IN_WEEK,
    "day",
  );
  const timeString = new Intl.DateTimeFormat("zh-Hant", {
    timeStyle: "medium",
  }).format(date);

  return `${dayString}${timeString}`;
}

async function createNextAlarm(): Promise<void> {
  const { time, timeSetting } = await triggerSetting.get();
  if (!time) {
    console.info("不需設定排程");
    await chrome.alarms.clearAll();
    return;
  }

  const date = new Date(`${new Date().toDateString()} ${timeSetting}`);
  if (date.getTime() <= Date.now() || (await skipCheckinToday())) {
    date.setDate(date.getDate() + 1);
  }

  console.info("設定排程", formatDate(date));
  await chrome.alarms.create(chrome.runtime.id, {
    periodInMinutes: MINUTES_PER_DAY,
    when: date.getTime(),
  });
}

function onActionClicked(): void {
  chrome.runtime.openOptionsPage();
}

function onConnect(port: chrome.runtime.Port): void {
  port.onDisconnect.addListener(() => {
    console.info("設定後重新排程");
    void createNextAlarm();
  });
}

async function onInstalled({
  reason,
}: chrome.runtime.InstalledDetails): Promise<void> {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.info("安裝後初始化");
    await startupCheckin();
  } else {
    console.info("更新後初始化");
    await createNextAlarm();
  }
}

chrome.action.onClicked.addListener(onActionClicked);
chrome.runtime.onConnect.addListener(onConnect);

/* eslint-disable @typescript-eslint/no-misused-promises */
chrome.notifications.onClicked.addListener(onNotificationClicked);
chrome.runtime.onMessage.addListener(onMessage);
chrome.runtime.onStartup.addListener(startupCheckin);
chrome.alarms.onAlarm.addListener(scheduledCheckin);
chrome.runtime.onInstalled.addListener(onInstalled);
/* eslint-enable @typescript-eslint/no-misused-promises */
