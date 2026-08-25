// Draws the first page of a PDF to a JPEG, so a brochure can show its own cover
// on the library card instead of a stand-in.
//
// This runs in the admin only, and pdf.js is a large library, so it is imported
// on first use rather than at load: nothing on the public site pays for it.
//
// Given the actual file a person just picked, there is no network fetch and so
// nothing for a cross-origin rule to refuse. Given a URL instead, the host has
// to allow the read, which a signed link may not — hence the two entry points.

let libPromise = null;

// The worker has to be built as a module worker. Handing pdf.js a plain URL to
// pdf.worker.mjs makes it spawn a classic worker, which cannot parse the ESM
// inside; it retries, gets nowhere, and the render never settles. Vite's
// ?worker import gives us a constructor that carries the right type.
export async function getLib() {
  if (!libPromise) {
    libPromise = (async () => {
      const [pdfjs, workerMod] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.mjs?worker'),
      ]);
      return { pdfjs, PdfWorker: workerMod.default };
    })();
  }
  return libPromise;
}

// Roughly twice the width the card draws it at, so it stays sharp on a dense
// screen without carrying a full-page render around.
const COVER_WIDTH = 480;

async function render(source, name) {
  const { pdfjs, PdfWorker } = await getLib();

  // one worker per render, torn down after: a shared one outlives the document
  // that owns it and the second cover then talks to a closed port
  const port = new PdfWorker();
  const worker = new pdfjs.PDFWorker({ port });
  // it is the loading task that owns teardown, not the document it hands back
  const task = pdfjs.getDocument({ ...source, worker });
  const doc = await task.promise;
  try {
    const page = await doc.getPage(1);
    const unscaled = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: COVER_WIDTH / unscaled.width });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const canvasContext = canvas.getContext('2d');

    // a page is paper: without laying white down first, anything transparent in
    // the PDF comes out black once it is flattened to a JPEG
    canvasContext.fillStyle = '#FFFFFF';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // "print" rather than "display": for display, pdf.js drives its render loop
    // from requestAnimationFrame, which a browser stops serving to a hidden
    // tab. An admin who uploads a brochure and then switches tab would find the
    // cover still unmade on their return. Nothing here is being shown to anyone,
    // so the frame clock is the wrong thing to wait on.
    await page.render({ canvas, canvasContext, viewport, intent: 'print' }).promise;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) throw new Error('The first page would not render to an image.');
    return new File([blob], name, { type: 'image/jpeg' });
  } finally {
    try { await task.destroy(); } catch (e) { /* already gone */ }
    worker.destroy();
    port.terminate();
  }
}

// The reliable path: the File straight off the input, before it is uploaded.
export async function coverFromFile(file) {
  const data = await file.arrayBuffer();
  return render({ data }, coverName(file.name));
}

// The hopeful path, for an item whose document was uploaded before covers
// existed. Whether this is allowed is the storage host's call, not ours.
export async function coverFromUrl(url, name = 'cover.pdf') {
  return render({ url }, coverName(name));
}

function coverName(source) {
  const stem = String(source).replace(/\.[^.]+$/, '').slice(0, 60) || 'cover';
  return `${stem}-cover.jpg`;
}

export const isPdf = (nameOrUrl) => /\.pdf(\?|#|$)/i.test(String(nameOrUrl || ''));
