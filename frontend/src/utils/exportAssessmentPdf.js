export async function exportAssessmentResultsPdf({
  rootId = "results-root",
  fileName = "assessment-report.pdf",
  excludeSelectors = ["button", "[data-pdf-exclude='true']", ".pdf-exclude"],
  marginMm = { top: 10, right: 10, bottom: 12, left: 10 },
  scale = 2,
  optimizePageBreaks = true,
  metadata = null,
} = {}) {
  const sourceElement = document.getElementById(rootId);
  if (!sourceElement) return null;

  const addMetadataHeader = (pdf, pageWidth, margin, meta) => {
    const startY = margin.top;
    const contentX = margin.left;
    const contentWidth = pageWidth - margin.left - margin.right;

    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(meta.testName || "Assessment Report", contentX, startY + 5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);

    const line1 = `Employee: ${meta.employeeName || "-"}`;
    const line2 = `Assigned: ${meta.assignmentDate || "-"}`;
    const line3 = `Completed: ${meta.completionDate || "-"}`;

    pdf.text(line1, contentX, startY + 11);
    pdf.text(line2, contentX, startY + 15.5);
    pdf.text(line3, contentX, startY + 20);

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(contentX, startY + 23, contentX + contentWidth, startY + 23);
  };

  const html2canvasMod = await import("html2canvas");
  const jspdfMod = await import("jspdf");
  const html2canvas = html2canvasMod.default || html2canvasMod;
  const jsPDFClass = jspdfMod.jsPDF || jspdfMod.default;

  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-100000px";
  mount.style.top = "0";
  mount.style.zIndex = "-1";
  mount.style.pointerEvents = "none";
  mount.style.background = "#ffffff";

  const clonedRoot = sourceElement.cloneNode(true);
  const targetWidth = Math.max(
    1,
    Math.ceil(sourceElement.getBoundingClientRect().width || 0),
    Math.ceil(sourceElement.clientWidth || 0)
  );

  clonedRoot.style.width = `${targetWidth}px`;
  clonedRoot.style.maxWidth = "none";
  clonedRoot.style.background = "#ffffff";
  clonedRoot.style.overflow = "visible";
  clonedRoot.style.maxHeight = "none";
  clonedRoot.style.height = "auto";

  mount.appendChild(clonedRoot);
  document.body.appendChild(mount);

  const cleanup = () => {
    if (mount.parentNode) mount.parentNode.removeChild(mount);
  };

  try {
    const sourceNodes = [sourceElement, ...sourceElement.querySelectorAll("*")];
    const cloneNodes = [clonedRoot, ...clonedRoot.querySelectorAll("*")];

    for (let i = 0; i < Math.min(sourceNodes.length, cloneNodes.length); i += 1) {
      const sourceNode = sourceNodes[i];
      const cloneNode = cloneNodes[i];
      const sourceStyle = window.getComputedStyle(sourceNode);

      const overflowCombined = `${sourceStyle.overflow} ${sourceStyle.overflowY} ${sourceStyle.overflowX}`;
      if (/(auto|scroll|hidden|clip)/.test(overflowCombined) || sourceStyle.maxHeight !== "none") {
        cloneNode.style.overflow = "visible";
        cloneNode.style.overflowY = "visible";
        cloneNode.style.overflowX = "visible";
        cloneNode.style.maxHeight = "none";
        cloneNode.style.height = "auto";
      }

      if (sourceStyle.position === "sticky" || sourceStyle.position === "fixed") {
        cloneNode.style.position = "static";
      }

      cloneNode.style.animation = "none";
      cloneNode.style.transition = "none";
    }

    for (const selector of excludeSelectors) {
      clonedRoot.querySelectorAll(selector).forEach((node) => node.remove());
    }

    if (metadata) {
      const metadataCard = document.createElement("div");
      metadataCard.style.background = "#ffffff";
      metadataCard.style.border = "1px solid #e2e8f0";
      metadataCard.style.borderRadius = "12px";
      metadataCard.style.padding = "14px 16px";
      metadataCard.style.marginBottom = "14px";
      metadataCard.style.fontFamily = "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

      const title = document.createElement("h1");
      title.style.margin = "0 0 10px 0";
      title.style.fontSize = "20px";
      title.style.fontWeight = "700";
      title.style.color = "#0f172a";
      title.textContent = metadata.testName || "Assessment Report";
      metadataCard.appendChild(title);

      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
      grid.style.gap = "8px 14px";

      const rows = [
        ["Employee", metadata.employeeName || "-"],
        ["Assigned", metadata.assignmentDate || "-"],
        ["Completed", metadata.completionDate || "-"],
      ];

      rows.forEach(([label, value]) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "6px";
        row.style.fontSize = "12px";

        const key = document.createElement("span");
        key.style.fontWeight = "700";
        key.style.color = "#334155";
        key.textContent = `${label}:`;

        const val = document.createElement("span");
        val.style.color = "#0f172a";
        val.textContent = value;

        row.appendChild(key);
        row.appendChild(val);
        grid.appendChild(row);
      });

      metadataCard.appendChild(grid);
      clonedRoot.prepend(metadataCard);
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const images = Array.from(clonedRoot.querySelectorAll("img"));
    await Promise.all(
      images.map(async (img) => {
        try {
          if (img.decode) {
            await img.decode();
          }
        } catch {
          // Ignore image decode errors and continue export.
        }
      })
    );

    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    const canvas = await html2canvas(clonedRoot, {
      backgroundColor: "#ffffff",
      scale,
      useCORS: true,
      allowTaint: false,
      width: Math.ceil(clonedRoot.scrollWidth),
      height: Math.ceil(clonedRoot.scrollHeight),
      windowWidth: Math.ceil(clonedRoot.scrollWidth),
      windowHeight: Math.ceil(clonedRoot.scrollHeight),
      scrollX: 0,
      scrollY: 0,
      logging: false,
      imageTimeout: 0,
    });

    const pdf = new jsPDFClass({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - marginMm.left - marginMm.right;
    const contentHeight = pageHeight - marginMm.top - marginMm.bottom;
    const metadataBlockMm = metadata ? 26 : 0;

    const pxPerMm = canvas.width / contentWidth;
    const minPageSlicePx = Math.max(1, Math.floor(80 * pxPerMm));
    const breakSearchWindowPx = Math.floor(25 * pxPerMm);
    const overlapPx = Math.max(0, Math.floor(1.5 * pxPerMm));

    const sourceContext = canvas.getContext("2d", { willReadFrequently: true });

    const findBestPageBreak = (fromY, toY, preferredY) => {
      if (!sourceContext || !optimizePageBreaks) return preferredY;

      let bestY = preferredY;
      let bestDensity = Number.POSITIVE_INFINITY;

      for (let y = fromY; y <= toY; y += 2) {
        const row = sourceContext.getImageData(0, y, canvas.width, 1).data;
        let inkDensity = 0;

        // Sample every 4 pixels to keep scanning fast while still reliable.
        for (let i = 0; i < row.length; i += 16) {
          const r = row[i];
          const g = row[i + 1];
          const b = row[i + 2];
          const a = row[i + 3];
          if (a > 20 && (r < 245 || g < 245 || b < 245)) inkDensity += 1;
        }

        if (inkDensity < bestDensity) {
          bestDensity = inkDensity;
          bestY = y;
          if (bestDensity === 0) break;
        }
      }

      return bestY;
    };

    let offsetPx = 0;
    let pageIndex = 0;

    while (offsetPx < canvas.height) {
      const availableHeightMm =
        pageIndex === 0 ? Math.max(10, contentHeight - metadataBlockMm) : contentHeight;
      const pageHeightPx = Math.max(1, Math.floor(availableHeightMm * pxPerMm));

      const preferredBreak = Math.min(offsetPx + pageHeightPx, canvas.height);
      let sliceEnd = preferredBreak;

      if (preferredBreak < canvas.height) {
        const fromY = Math.max(
          offsetPx + minPageSlicePx,
          preferredBreak - breakSearchWindowPx
        );
        const toY = Math.min(canvas.height - 1, preferredBreak + breakSearchWindowPx);
        if (fromY < toY) {
          sliceEnd = findBestPageBreak(fromY, toY, preferredBreak);
        }
      }

      const sliceHeightPx = Math.max(1, sliceEnd - offsetPx);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;

      const pageContext = pageCanvas.getContext("2d");
      if (!pageContext) break;

      pageContext.fillStyle = "#ffffff";
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        offsetPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height
      );

      const pageImage = pageCanvas.toDataURL("image/png");
      const sliceHeightMm = Math.min(availableHeightMm, sliceHeightPx / pxPerMm);

      if (pageIndex > 0) pdf.addPage();

      if (pageIndex === 0 && metadata) {
        addMetadataHeader(pdf, pageWidth, marginMm, metadata);
      }

      const imageY =
        pageIndex === 0 && metadata
          ? marginMm.top + metadataBlockMm
          : marginMm.top;

      pdf.addImage(
        pageImage,
        "PNG",
        marginMm.left,
        imageY,
        contentWidth,
        sliceHeightMm,
        undefined,
        "FAST"
      );

      if (preferredBreak >= canvas.height) {
        offsetPx = canvas.height;
      } else {
        offsetPx += Math.max(1, sliceHeightPx - overlapPx);
      }
      pageIndex += 1;
    }

    const blob = pdf.output("blob");
    pdf.save(fileName);
    return blob;
  } finally {
    cleanup();
  }
}
