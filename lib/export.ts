async function renderElementToJpegDataUrl(element: HTMLElement): Promise<string> {
  const { toJpeg } = await import("html-to-image");

  return toJpeg(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });
}

export async function exportElementToJpg(
  element: HTMLElement | null,
  fileName: string
): Promise<void> {
  if (!element) {
    throw new Error("Area hasil tidak ditemukan.");
  }

  const image = await renderElementToJpegDataUrl(element);
  const link = document.createElement("a");

  link.href = image;
  link.download = `${fileName}.jpg`;
  link.click();
}

export async function exportElementToPdf(
  element: HTMLElement | null,
  fileName: string
): Promise<void> {
  if (!element) {
    throw new Error("Area hasil tidak ditemukan.");
  }

  const image = await renderElementToJpegDataUrl(element);
  const popup = window.open("", "_blank", "noopener,noreferrer,width=960,height=1280");

  if (!popup) {
    throw new Error("Popup diblokir browser. Izinkan popup untuk export PDF.");
  }

  popup.document.title = fileName;
  popup.document.body.style.margin = "0";
  popup.document.body.style.background = "#ffffff";

  const printImage = popup.document.createElement("img");

  printImage.alt = fileName;
  printImage.style.width = "100%";
  printImage.addEventListener("load", () => {
    popup.focus();
    popup.print();
  });
  printImage.src = image;
  popup.document.body.appendChild(printImage);
}

export async function exportElementAs(
  type: "jpg" | "pdf",
  element: HTMLElement | null,
  fileName: string
): Promise<void> {
  if (type === "jpg") {
    await exportElementToJpg(element, fileName);
    return;
  }

  await exportElementToPdf(element, fileName);
}
