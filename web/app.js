const MAX_FIRMWARE_BYTES = 992 * 1024;

const elements = {
  loadLatest: document.querySelector("#load-latest"),
  localFile: document.querySelector("#local-file"),
  download: document.querySelector("#download"),
  firmwareStatus: document.querySelector("#firmware-status"),
  firmwareName: document.querySelector("#firmware-name"),
  firmwareSize: document.querySelector("#firmware-size"),
  firmwareSha: document.querySelector("#firmware-sha"),
  sourceCommit: document.querySelector("#source-commit"),
  spikeRtCommit: document.querySelector("#spike-rt-commit"),
  loadAddress: document.querySelector("#load-address"),
  log: document.querySelector("#log"),
};

let loadedFirmware = null;

function appendLog(message) {
  const timestamp = new Date().toLocaleTimeString("ja-JP");
  elements.log.textContent += `\n[${timestamp}] ${message}`;
  elements.log.scrollTop = elements.log.scrollHeight;
}

function formatBytes(bytes) {
  return new Intl.NumberFormat("ja-JP").format(bytes) + " bytes";
}

async function sha256Hex(arrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function validateFirmware(arrayBuffer) {
  if (arrayBuffer.byteLength === 0) throw new Error("空のファイルは使用できません。");
  if (arrayBuffer.byteLength > MAX_FIRMWARE_BYTES) {
    throw new Error(`ファイルが大きすぎます。上限は${formatBytes(MAX_FIRMWARE_BYTES)}です。`);
  }
}

async function setFirmware({ name, arrayBuffer, manifest = null }) {
  validateFirmware(arrayBuffer);
  const sha256 = await sha256Hex(arrayBuffer);
  if (manifest?.sha256 && manifest.sha256.toLowerCase() !== sha256.toLowerCase()) {
    throw new Error("manifest.jsonのSHA-256とasp.binが一致しません。");
  }

  loadedFirmware = { name, arrayBuffer, sha256, manifest };
  elements.firmwareStatus.textContent = "読込済み";
  elements.firmwareName.textContent = name;
  elements.firmwareSize.textContent = formatBytes(arrayBuffer.byteLength);
  elements.firmwareSha.textContent = sha256;
  elements.sourceCommit.textContent = manifest?.sourceCommit ?? "ローカルファイル";
  elements.spikeRtCommit.textContent = manifest?.spikeRtCommit ?? "—";
  elements.loadAddress.textContent = manifest?.loadAddress ?? "0x08008000";
  elements.download.disabled = false;
  appendLog(`${name}を読み込みました。`);
}

async function loadLatestFirmware() {
  elements.loadLatest.disabled = true;
  elements.firmwareStatus.textContent = "取得中";
  try {
    const manifestResponse = await fetch(`./firmware/manifest.json?t=${Date.now()}`, { cache: "no-store" });
    if (!manifestResponse.ok) throw new Error(`manifest.jsonの取得に失敗しました (${manifestResponse.status})。`);
    const manifest = await manifestResponse.json();
    const firmwareUrl = new URL(`./firmware/${manifest.file}`, window.location.href);
    firmwareUrl.searchParams.set("commit", manifest.sourceCommit);
    const firmwareResponse = await fetch(firmwareUrl, { cache: "no-store" });
    if (!firmwareResponse.ok) throw new Error(`asp.binの取得に失敗しました (${firmwareResponse.status})。`);
    await setFirmware({ name: manifest.file, arrayBuffer: await firmwareResponse.arrayBuffer(), manifest });
  } catch (error) {
    elements.firmwareStatus.textContent = "失敗";
    appendLog(error instanceof Error ? error.message : String(error));
  } finally {
    elements.loadLatest.disabled = false;
  }
}

async function loadLocalFirmware(file) {
  if (!file) return;
  try {
    await setFirmware({ name: file.name, arrayBuffer: await file.arrayBuffer() });
  } catch (error) {
    elements.firmwareStatus.textContent = "失敗";
    appendLog(error instanceof Error ? error.message : String(error));
  }
}

function downloadFirmware() {
  if (!loadedFirmware) return;
  const blob = new Blob([loadedFirmware.arrayBuffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = loadedFirmware.name || "asp.bin";
  anchor.click();
  URL.revokeObjectURL(url);
}

elements.loadLatest.addEventListener("click", loadLatestFirmware);
elements.localFile.addEventListener("change", (event) => loadLocalFirmware(event.target.files[0]));
elements.download.addEventListener("click", downloadFirmware);

if (!window.isSecureContext) appendLog("HTTPSではないため、将来WebUSBを利用できません。");
