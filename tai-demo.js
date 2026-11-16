const status = document.querySelector('#status');
const progress = document.querySelector('#progress');
const save = document.querySelector('#save');
const retry = document.querySelector('#retry');
const partSize = 16 * 1024 * 1024;
const fileSize = 132088986;
const downloadParts = Math.ceil(fileSize / partSize);

async function loadPart(index) {
  const response = await fetch(`downloads/windows-1.0.0/part-${index}.bin`);
  if (!response.ok) throw new Error(`Download part ${index}: ${response.status}`);
  const bytes = await response.arrayBuffer();
  const expectedSize = Math.min(partSize, fileSize - index * partSize);
  if (bytes.byteLength !== expectedSize) throw new Error(`Incomplete download part ${index}`);
  return bytes;
}

async function download() {
  retry.hidden = true;
  progress.max = fileSize;
  progress.value = 0;
  progress.hidden = false;
  status.textContent = 'Đang tải tệp .exe. Hãy giữ trang này mở.';

  try {
    const parts = [];
    for (let index = 0; index < downloadParts; index += 1) {
      const bytes = await loadPart(index);
      parts.push(bytes);
      progress.value += bytes.byteLength;
    }
    const file = new Blob(parts, {type: 'application/octet-stream'});
    save.href = URL.createObjectURL(file);
    save.hidden = false;
    save.click();
    status.textContent = 'Tệp đã sẵn sàng. Nếu trình duyệt chưa lưu tệp, hãy bấm Tải tệp .exe.';
  } catch {
    progress.hidden = true;
    status.textContent = 'Tải tệp bị gián đoạn. Bạn có thể thử lại.';
    retry.hidden = false;
  }
}

const deadline = Date.now() + 10_000;
const countdown = setInterval(() => {
  const seconds = Math.ceil((deadline - Date.now()) / 1000);
  if (seconds > 0) {
    status.textContent = `Tệp sẽ bắt đầu tải sau ${seconds} giây.`;
    return;
  }
  clearInterval(countdown);
  download();
}, 200);

retry.addEventListener('click', download);
