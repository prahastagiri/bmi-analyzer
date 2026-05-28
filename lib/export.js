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

  const { toJpeg } = await import("html-to-image");
  const image = await toJpeg(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });
  const link = document.createElement("a");

  link.href = image;
  link.download = `${fileName}.jpg`;
  link.click();
}

/**
 * Exports the current result by opening a print-friendly popup. We rely on the
 * browser's native "Save as PDF" flow because it is simpler and lighter than a
 * dedicated PDF renderer for this project stage.
 *
 * @param {HTMLElement | null} element
 * @param {string} fileName
 * @returns {Promise<void>}
 */
export async function exportElementToPdf(element, fileName) {
  if (!element) {
    throw new Error("Area hasil tidak ditemukan.");
  }

  const popup = window.open("", "_blank", "noopener,noreferrer,width=960,height=1280");

  if (!popup) {
    throw new Error("Popup diblokir browser. Izinkan popup untuk export PDF.");
  }

  popup.document.write(`
    <html>
      <head>
        <title>${fileName}</title>
        <style>
          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, Helvetica, sans-serif;
            background: #ffffff;
            color: #0f172a;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}
