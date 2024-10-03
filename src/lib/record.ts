const RECORD_KEY = "record";

async function getRecord(): Promise<string> {
  return ((await chrome.storage.local.get(RECORD_KEY))[RECORD_KEY] ??
    "") as string;
}

export async function setRecord(): Promise<void> {
  await chrome.storage.local.set({ [RECORD_KEY]: new Date().toDateString() });
}

export async function isRecordToday(): Promise<boolean> {
  return (await getRecord()) === new Date().toDateString();
}
