/**
 * PDF Generator Utility
 * Handles conversion of text to formatted PDF documents
 */

export const downloadAsPDF = async (text: string, filename: string) => {
  // Dynamic import to avoid SSR issues with jsPDF
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set margins - professional spacing
  const marginLeft = 18;
  const marginRight = 18;
  const marginTop = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - marginLeft - marginRight;

  let yPosition = marginTop;

  // Helper function to check if we need a new page
  const checkNewPage = (spaceNeeded: number = 10) => {
    if (yPosition + spaceNeeded > pageHeight - 20) {
      doc.addPage();
      yPosition = marginTop;
    }
  };

  const lines = text.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines but add some spacing
    if (!trimmedLine) {
      yPosition += 3;
      continue;
    }

    // NAME (all caps, larger, bold)
    if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50 && yPosition < marginTop + 5) {
      checkNewPage(12);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(trimmedLine, marginLeft, yPosition);
      yPosition += 8;
      continue;
    }

    // Section headers (all caps with some minimum length)
    if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3 && trimmedLine.length < 50) {
      checkNewPage(12);
      yPosition += 3;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(trimmedLine, marginLeft, yPosition);
      yPosition += 6;
      continue;
    }

    // Subsection headers (Title Case with colons or ending in specific patterns)
    if (
      /^[A-Z][a-z]/.test(trimmedLine) &&
      (trimmedLine.includes(":") ||
        /\d{4}\s*-\s*(Present|\d{4})/.test(trimmedLine) ||
        /[A-Z][a-z]+\s+\d{4}/.test(trimmedLine))
    ) {
      checkNewPage(10);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const textLines = doc.splitTextToSize(trimmedLine, maxLineWidth);
      for (const tLine of textLines) {
        checkNewPage(6);
        doc.text(tLine, marginLeft, yPosition);
        yPosition += 5;
      }
      yPosition += 1;
      continue;
    }

    // Bullet points
    if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-")) {
      const bulletText = trimmedLine.substring(1).trim();
      checkNewPage(10);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Draw the bullet
      doc.text("•", marginLeft, yPosition);

      // Split and wrap the bullet text
      const bulletLines = doc.splitTextToSize(bulletText, maxLineWidth - 5);
      for (let j = 0; j < bulletLines.length; j++) {
        checkNewPage(6);
        doc.text(bulletLines[j], marginLeft + 5, yPosition);
        yPosition += j === bulletLines.length - 1 ? 5 : 4.5;
      }
      continue;
    }

    // Regular paragraph text
    checkNewPage(8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const textLines = doc.splitTextToSize(trimmedLine, maxLineWidth);
    for (const tLine of textLines) {
      checkNewPage(6);
      doc.text(tLine, marginLeft, yPosition);
      yPosition += 5;
    }
  }

  // Save the PDF
  doc.save(filename);
};
