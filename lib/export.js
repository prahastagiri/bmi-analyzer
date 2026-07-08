/**
 * Renders a DOM node into a JPEG data URL. Shared by both export paths so the
 * downloaded JPG and the printed PDF always look identical to the on-screen
 * result card (Tailwind styles included).
 *
 * @param {HTMLElement} element
 * @returns {Promise<string>}
 */
async function renderElementToJpegDataUrl(element) {
  const { toJpeg } = await import("html-to-image");

  return toJpeg(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });
}

/**
 * Exports a DOM node as a JPG image. The result card is rendered to an image
 * on the client, then downloaded through a temporary anchor element.
 *
 * @param {HTMLElement | null} element
 * @param {string} fileName
 * @returns {Promise<void>}
 */
export async function exportElementToJpg(element, fileName) {
  if (!element) {
    throw new Error("Area hasil tidak ditemukan.");
  }

  const image = await renderElementToJpegDataUrl(element);
  const link = document.createElement("a");

  link.href = image;
  link.download = `${fileName}.jpg`;
  link.click();
}

/**
 * Exports the current result by opening a print-friendly popup that shows a
 * rendered snapshot of the element, then triggers the browser's native
 * "Save as PDF" flow. A pre-rendered image is used instead of raw markup so the
 * printout keeps the exact on-screen styling without needing the app's
 * stylesheets inside the popup.
 *
 * @param {HTMLElement | null} element
 * @param {string} fileName
 * @returns {Promise<void>}
 */
export async function exportElementToPdf(element, fileName) {
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

/**
 * Convenience wrapper so callers can pick the export format with a single
 * argument instead of branching on the type themselves.
 *
 * @param {"jpg" | "pdf"} type
 * @param {HTMLElement | null} element
 * @param {string} fileName
 * @returns {Promise<void>}
 */
export async function exportElementAs(type, element, fileName) {
  if (type === "jpg") {
    await exportElementToJpg(element, fileName);
    return;
  }

  await exportElementToPdf(element, fileName);
}
