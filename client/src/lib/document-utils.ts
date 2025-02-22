import mammoth from "mammoth";
import { saveAs } from "file-saver";

export interface DocumentContent {
  content: string;
  format: "txt" | "docx" | "pdf";
  html?: string;
  originalFormat: boolean;
  buffer?: ArrayBuffer; // Store original buffer for downloads
  pageCount?: number; // Track number of pages
}

/**
 * Reads a document file and extracts its content based on format.
 * Supports .txt, .docx, and .pdf formats.
 */
export async function readDocumentFile(file: File): Promise<DocumentContent> {
  const format = (file.name.split(".").pop()?.toLowerCase() || "txt") as
    | "txt"
    | "docx"
    | "pdf";
  const buffer = await file.arrayBuffer();

  try {
    switch (format) {
      case "docx": {
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        return {
          content: result.value,
          html: result.value,
          format: "docx",
          originalFormat: true,
          buffer,
        };
      }
      case "pdf": {
        // PDFs require server-side processing
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/process-pdf", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to process PDF file");

        const data = await response.json();
        return {
          content: data.text,
          format: "pdf",
          originalFormat: true,
          buffer,
          pageCount: data.pageCount, // Track page count for formatting
        };
      }
      case "txt":
      default: {
        const text = await file.text();
        return {
          content: text,
          format: "txt",
          originalFormat: true,
          buffer: new TextEncoder().encode(text).buffer, // Convert text to ArrayBuffer
        };
      }
    }
  } catch (error: any) {
    console.error("Error processing file:", error);
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Downloads the document in the specified format while preserving structure.
 */
export async function downloadDocument(
  content: string,
  format: string,
  originalBuffer?: ArrayBuffer,
  preserveFormat: boolean = false,
) {
  if (!content && !originalBuffer) {
    throw new Error("No content to download");
  }

  try {
    const mimeTypes: Record<string, string> = {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pdf: "application/pdf",
      txt: "text/plain",
    };

    const mimeType = mimeTypes[format] || "text/plain";

    if (preserveFormat && originalBuffer) {
      const blob = new Blob([originalBuffer], { type: mimeType });
      await saveAs(blob, `document.${format}`);
    } else {
      const blob = new Blob([content], { type: "text/plain" });
      await saveAs(blob, "document.txt");
    }
  } catch (error) {
    console.error("Download error:", error);
    throw new Error(
      "Failed to download document: " +
        (error instanceof Error ? error.message : "Unknown error"),
    );
  }
}

// Font options for customization
export const availableFonts = [
  { name: "Arial", value: "arial" },
  { name: "Times New Roman", value: "times-new-roman" },
  { name: "Calibri", value: "calibri" },
  { name: "Georgia", value: "georgia" },
  { name: "Helvetica", value: "helvetica" },
];

export interface SectionUpdate {
  section: "summary" | "experience" | "projects" | "skills";
  content: string;
}

/**
 * Extracts a specific section from the resume content.
 */
export function parseResumeSection(content: string, section: string): string {
  const sectionRegex = new RegExp(
    `(?:^|\\n)(${section}[^\n]*\\n.*?)(?:\\n(?:[A-Z][^\n]*)|$)`,
    "is",
  );
  const match = content.match(sectionRegex);
  return match ? match[1].trim() : "";
}

/**
 * Updates a specific section in the resume content with new details.
 */
export function updateResumeSection(
  content: string,
  section: string,
  newContent: string,
): string {
  const sectionRegex = new RegExp(
    `(^|\\n)(${section}[^\n]*\\n.*?)(\\n(?:[A-Z][^\n]*)|$)`,
    "is",
  );
  return content.replace(sectionRegex, `$1${newContent}$3`);
}
