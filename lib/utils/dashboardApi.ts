/**
 * Dashboard API Utilities
 * Handles all API calls for the dashboard
 */

import type { GenerationOutput } from "@/lib/types/resumeSchema";

export interface Generation {
  jobId: string;
  companyName: string;
  jobTitle: string;
  completedAt: number;
  // New structured format
  structuredData?: string; // JSON string from DynamoDB
  // Old text format (for backward compatibility)
  tailoredResume?: string;
  coverLetter?: string;
}

export interface Resume {
  fileId: string;
  originalFilename: string;
  processingStatus: string;
}

export interface GenerationStatusResponse {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  // New structured format
  structuredData?: string; // JSON string from DynamoDB
  // Old text format (for backward compatibility)
  tailoredResume?: string;
  coverLetter?: string;
  errorMessage?: string;
}

/**
 * Fetch user's previously uploaded resumes
 */
export const fetchUserResumes = async (token: string): Promise<Resume[]> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_LIST_USER_RESUMES_API_URL!,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch resumes");
  }

  const data = await response.json();
  return data.resumes.filter(
    (resume: Resume) => resume.processingStatus === "READY_FOR_QUERY"
  );
};

/**
 * Fetch user's generation history
 */
export const fetchGenerationHistory = async (
  token: string
): Promise<Generation[]> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_LIST_USER_GENERATIONS_API_URL!,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch generation history");
  }

  const data = await response.json();
  return data.generations;
};

/**
 * Upload PDF to S3
 */
export const uploadPdfToS3 = async (
  presignedUrl: string,
  file: File,
  fileId: string
): Promise<void> => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": "application/pdf",
      "x-amz-meta-fileid": fileId,
    },
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
};

/**
 * Check resume processing status
 */
export const checkResumeStatus = async (
  token: string,
  fileId: string
): Promise<{ processingStatus: string }> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_GET_SUMMARY_API_URL}?fileId=${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check status");
  }

  return response.json();
};

/**
 * Start resume generation
 */
export const startGeneration = async (
  token: string,
  fileId: string,
  jobDescription: string
): Promise<{ jobId: string }> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_START_GENERATION_API_URL!,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileId,
        jobDescription,
      }),
    }
  );

  if (response.status === 401) {
    throw new Error("Authentication failed");
  }
  if (response.status === 403) {
    throw new Error("Permission denied");
  }
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
};

/**
 * Check generation status
 */
export const checkGenerationStatus = async (
  token: string,
  jobId: string
): Promise<GenerationStatusResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_GET_GENERATION_STATUS_API_URL}?jobId=${jobId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    throw new Error("Authentication expired");
  }
  if (response.status === 403) {
    throw new Error("Permission denied");
  }
  if (!response.ok) {
    throw new Error("Status check failed");
  }

  return response.json();
};
