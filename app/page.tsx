"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

// Define the structure of the AI's response
interface AIGeneratedDocs {
  tailoredResume: string;
  coverLetter: string;
}

export default function Home() {
  // Get the logged-in user's ID from Clerk
  const { user } = useUser();
  const userId = user?.id;

  // State for Step 1: Master Resume Upload
  const [masterResumeFile, setMasterResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [fileId, setFileId] = useState<string | null>(null);

  // State for Step 2: Job Description and Generation
  const [jobDescription, setJobDescription] = useState<string>("");
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedDocs, setGeneratedDocs] = useState<AIGeneratedDocs | null>(
    null
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMasterResumeFile(event.target.files[0]);
      setUploadStatus("");
      setFileId(null);
      setGeneratedDocs(null); // Clear previous results
    }
  };

  const handleMasterResumeUpload = async () => {
    if (!masterResumeFile) {
      setUploadStatus("Please select your Master Resume first.");
      return;
    }

    setUploadStatus("Getting upload URL...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}?fileName=${masterResumeFile.name}`
      );
      if (!response.ok) throw new Error("Failed to get upload URL.");

      const { uploadUrl, fileId: newFileId } = await response.json();
      setUploadStatus("Uploading Master Resume...");

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: masterResumeFile,
        headers: {
          "Content-Type": "application/pdf",
          "x-amz-meta-fileid": newFileId, // Pass the fileId to S3
        },
      });
      if (!uploadResponse.ok) throw new Error("S3 upload failed.");

      setUploadStatus(`Processing resume... This may take a minute.`);
      setFileId(newFileId);

      // Poll to see when the resume is finished processing (status becomes READY_FOR_QUERY)
      const pollForReadyStatus = async () => {
        const statusResponse = await fetch(
          `${process.env.NEXT_PUBLIC_GET_SUMMARY_API_URL}?fileId=${newFileId}`
        );
        const result = await statusResponse.json();

        if (result.processingStatus === "READY_FOR_QUERY") {
          setUploadStatus("✅ Master Resume is processed and ready!");
        } else if (result.processingStatus === "FAILED") {
          setUploadStatus(
            "❌ Error processing resume. Please try a different file."
          );
        } else {
          setTimeout(pollForReadyStatus, 5000); // Check again in 5 seconds
        }
      };

      setTimeout(pollForReadyStatus, 5000);
    } catch (error) {
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setGenerationStatus("Please paste a job description.");
      return;
    }
    if (!fileId) {
      setGenerationStatus("Please upload and process a master resume first.");
      return;
    }

    setGenerationStatus("Starting document generation...");
    setGeneratedDocs(null);

    try {
      // Step 1: Start generation (returns immediately with jobId)
      const startResponse = await fetch(
        `${process.env.NEXT_PUBLIC_START_GENERATION_API_URL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: fileId,
            jobDescription: jobDescription,
          }),
        }
      );

      if (!startResponse.ok) {
        throw new Error(
          `Server responded with status: ${startResponse.status}`
        );
      }

      const { jobId } = await startResponse.json();
      console.log(`Generation started with jobId: ${jobId}`);

      setGenerationStatus(
        "Processing... This may take 1-2 minutes. Using AI to tailor your resume..."
      );

      // Step 2: Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `${process.env.NEXT_PUBLIC_GET_GENERATION_STATUS_API_URL}?jobId=${jobId}`
          );

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }

          const statusData = await statusResponse.json();
          console.log("Status:", statusData.status);

          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);
            setGeneratedDocs({
              tailoredResume: statusData.tailoredResume,
              coverLetter: statusData.coverLetter,
            });
            setGenerationStatus("✅ Documents generated successfully!");
          } else if (statusData.status === "FAILED") {
            clearInterval(pollInterval);
            setGenerationStatus(
              `❌ Generation failed: ${
                statusData.errorMessage || "Unknown error"
              }`
            );
          } else {
            // Still processing
            setGenerationStatus(
              "⏳ Still processing... AI is analyzing your resume and the job description..."
            );
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
          clearInterval(pollInterval);
          setGenerationStatus(
            `Error checking status: ${
              pollError instanceof Error ? pollError.message : "Unknown error"
            }`
          );
        }
      }, 5000); // Poll every 5 seconds

      // Safety timeout: stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (!generatedDocs) {
          setGenerationStatus(
            "⏰ Generation is taking longer than expected. Please try again."
          );
        }
      }, 300000); // 5 minutes
    } catch (error) {
      setGenerationStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const downloadAsPDF = async (text: string, filename: string) => {
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
        return true;
      }
      return false;
    };

    // Helper to add a horizontal line (black only)
    const addHorizontalLine = (yPos: number, thickness: number = 0.5) => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(thickness);
      doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    };

    // Parse the resume into structured sections
    const lines = text.split("\n");
    let currentSection = "";

    // ============================================
    // HEADER SECTION - Name and Contact
    // ============================================
    let nameFound = false;
    let contactFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // First non-empty line is the name
      if (!nameFound) {
        checkNewPage(15);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(line.toUpperCase(), pageWidth / 2, yPosition, {
          align: "center",
        });
        yPosition += 10;
        nameFound = true;
        continue;
      }

      // Second line is contact info
      if (
        !contactFound &&
        (line.includes("@") || line.toLowerCase().includes("email"))
      ) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        // Parse and format contact info
        const emailMatch = line.match(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        );
        const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        const linkedinMatch =
          line.match(/linkedin\.com\/in\/[\w-]+/i) ||
          line.match(/LinkedIn:\s*([\w\s]+)/i);
        const githubMatch = line.match(/github\.com\/[\w-]+/i);

        const contactParts = [];
        if (emailMatch) contactParts.push(emailMatch[0]);
        if (phoneMatch) contactParts.push(phoneMatch[0]);
        if (linkedinMatch)
          contactParts.push(linkedinMatch[0].replace("LinkedIn:", "").trim());
        if (githubMatch) contactParts.push(githubMatch[0]);

        const contactLine = contactParts.join("  •  ");
        doc.text(contactLine, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;

        // Add separator line
        addHorizontalLine(yPosition, 0.8);
        yPosition += 8;
        contactFound = true;
        continue;
      }

      // Break after header is complete
      if (nameFound && contactFound) {
        break;
      }
    }

    // ============================================
    // MAIN CONTENT SECTIONS
    // ============================================
    let headerProcessed = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        yPosition += 2;
        continue;
      }

      // Skip header lines (name and contact info) - only process once
      if (!headerProcessed) {
        if (
          trimmedLine.includes("@") ||
          /^[A-Z][a-z]+\s+[A-Z][a-z]+$/i.test(trimmedLine) || // Name pattern
          trimmedLine.toLowerCase().includes("email") ||
          trimmedLine.toLowerCase().includes("git") ||
          trimmedLine.toLowerCase().includes("linkedin")
        ) {
          continue;
        } else {
          // First non-header line found
          headerProcessed = true;
        }
      }

      // Detect section headers (ALL CAPS, standalone lines)
      // Also check for common section names even if not all caps
      const commonSections = [
        "SUMMARY",
        "SKILLS",
        "WORK EXPERIENCE",
        "EXPERIENCE",
        "CERTIFICATIONS",
        "CERTIFICATION",
        "EDUCATION",
        "PROJECTS",
      ];
      const isCommonSection = commonSections.includes(
        trimmedLine.toUpperCase()
      );

      const isAllCaps =
        (trimmedLine === trimmedLine.toUpperCase() &&
          trimmedLine.length > 3 &&
          !trimmedLine.includes("|") &&
          !trimmedLine.includes("•") &&
          !/\d{4}/.test(trimmedLine)) ||
        isCommonSection; // Not a date

      if (isAllCaps) {
        // Major section header (SUMMARY, SKILLS, WORK EXPERIENCE, etc.)
        checkNewPage(20);
        yPosition += 4;

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        const displayText = trimmedLine.toUpperCase(); // Force uppercase for consistency
        doc.text(displayText, marginLeft, yPosition);

        // Add underline under section header
        const headerWidth = doc.getTextWidth(displayText);
        doc.setLineWidth(0.6);
        doc.line(
          marginLeft,
          yPosition + 1,
          marginLeft + headerWidth,
          yPosition + 1
        );

        yPosition += 8;
        currentSection = displayText;
        continue;
      }

      // Subsection headers (ends with colon, like "Programming Languages: content")
      const isSubheader =
        /^[A-Z][a-zA-Z\s&]+:\s*.+/.test(trimmedLine) &&
        trimmedLine.split(":")[0].length < 50;

      if (isSubheader) {
        checkNewPage(10);

        // Split header from content
        const colonIndex = trimmedLine.indexOf(":");
        const header = trimmedLine.substring(0, colonIndex + 1); // Include the colon
        const content = trimmedLine.substring(colonIndex + 1).trim();

        // Bold header
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const headerWidth = doc.getTextWidth(header);
        doc.text(header, marginLeft, yPosition);

        // Normal content
        doc.setFont("helvetica", "normal");
        const contentLines = doc.splitTextToSize(
          content,
          maxLineWidth - headerWidth - 2
        );

        // First line continues after header
        doc.text(contentLines[0], marginLeft + headerWidth + 1, yPosition);
        yPosition += 5;

        // Remaining lines (if wrapped)
        for (let j = 1; j < contentLines.length; j++) {
          checkNewPage(6);
          doc.text(contentLines[j], marginLeft, yPosition);
          yPosition += 5;
        }
        continue;
      }

      // Job titles / Experience headers (contains company and dates)
      const isJobTitle = /^[A-Z][a-zA-Z\s,]+.*\(.*(\d{4}|present)/i.test(
        trimmedLine
      );

      if (isJobTitle) {
        checkNewPage(15);
        yPosition += 2;

        // Pattern: "Job Title, Company Name (Location) (2022 - Present)"
        // We want to extract the LAST parenthetical with a year as the date
        const datePattern =
          /\((\d{4}\s*[-–—]\s*(?:\d{4}|present|Present))\)\s*$/i;
        const dateMatch = trimmedLine.match(datePattern);

        if (dateMatch) {
          // Get everything before the date parentheses
          const dateStartIndex = trimmedLine.lastIndexOf(
            "(",
            trimmedLine.length - 1
          );
          const titleCompanyLocation = trimmedLine
            .substring(0, dateStartIndex)
            .trim();
          const datePart = "(" + dateMatch[1] + ")";

          // Title/Company/Location on the left (bold, size 11)
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");

          // Check if title+company+location fits, if not truncate
          const maxTitleWidth = maxLineWidth - doc.getTextWidth(datePart) - 5; // Leave space for date
          const titleLines = doc.splitTextToSize(
            titleCompanyLocation,
            maxTitleWidth
          );

          doc.text(titleLines[0], marginLeft, yPosition);

          // Date on the right (normal weight, size 10)
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const dateWidth = doc.getTextWidth(datePart);
          doc.text(datePart, pageWidth - marginRight - dateWidth, yPosition);

          // If title wrapped, add additional lines
          if (titleLines.length > 1) {
            yPosition += 5;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            for (let i = 1; i < titleLines.length; i++) {
              doc.text(titleLines[i], marginLeft, yPosition);
              yPosition += 5;
            }
          }
        } else {
          // Fallback if pattern doesn't match
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(trimmedLine, marginLeft, yPosition);
        }

        yPosition += 6;
        continue;
      }

      // Bullet points
      if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-")) {
        checkNewPage(8);
        const bulletText = trimmedLine.substring(1).trim();

        doc.setFontSize(9.5);
        doc.setFont("helvetica", "normal");

        // Add bullet
        doc.text("•", marginLeft + 3, yPosition);

        // Add text with proper wrapping
        const bulletLines = doc.splitTextToSize(bulletText, maxLineWidth - 10);
        for (let j = 0; j < bulletLines.length; j++) {
          if (j > 0) checkNewPage(6);
          doc.text(bulletLines[j], marginLeft + 8, yPosition);
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

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 md:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl space-y-12">
        {/* User Profile Button */}
        <div className="flex justify-end">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>

        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI-Powered Resume Tailor
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Never manually tailor your resume again. Let AI do the hard work.
          </p>
        </header>

        {/* Step 1: Master Resume */}
        <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">
            Step 1: Upload Your Master Resume
          </h2>
          <p className="mb-6 text-gray-400">
            Upload a PDF containing all your skills and experiences. This will
            become your personal knowledge base.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-purple-400 hover:file:bg-gray-600 cursor-pointer"
            />
            <button
              onClick={handleMasterResumeUpload}
              disabled={
                !masterResumeFile || uploadStatus.includes("Processing")
              }
              className="w-full sm:w-auto px-6 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Upload & Process
            </button>
          </div>
          {uploadStatus && (
            <p className="mt-4 text-center text-sm text-gray-400">
              {uploadStatus}
            </p>
          )}
        </div>

        {/* Step 2: Job Description & Generation */}
        {fileId && uploadStatus.includes("✅") && (
          <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">
              Step 2: Paste Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-40 p-4 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={
                !jobDescription || generationStatus.includes("Generating")
              }
              className="w-full mt-4 px-6 py-3 font-semibold bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Generate Tailored Documents
            </button>
            {generationStatus && (
              <p className="mt-4 text-center text-sm text-gray-400">
                {generationStatus}
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {generatedDocs && (
          <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-center text-purple-400">
              Your Generated Documents
            </h2>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-pink-500">
                    Tailored Resume
                  </h3>
                  <button
                    onClick={() =>
                      downloadAsPDF(
                        generatedDocs.tailoredResume,
                        "tailored-resume.pdf"
                      )
                    }
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold text-sm transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 border border-gray-600 rounded-md whitespace-pre-wrap font-sans text-sm">
                  {generatedDocs.tailoredResume}
                </pre>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-pink-500">
                    Cover Letter
                  </h3>
                  <button
                    onClick={() =>
                      downloadAsPDF(
                        generatedDocs.coverLetter,
                        "cover-letter.pdf"
                      )
                    }
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold text-sm transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 border border-gray-600 rounded-md whitespace-pre-wrap font-sans text-sm">
                  {generatedDocs.coverLetter}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
