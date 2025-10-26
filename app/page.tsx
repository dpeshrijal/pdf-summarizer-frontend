'use client';

import { useState } from 'react';

// Define the structure of the AI's response
interface AIGeneratedDocs {
  tailoredResume: string;
  coverLetter: string;
  resumePdfUrl?: string;
  coverLetterPdfUrl?: string;
}

export default function Home() {
  // State for Step 1: Master Resume Upload
  const [masterResumeFile, setMasterResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [fileId, setFileId] = useState<string | null>(null);

  // State for Step 2: Job Description and Generation
  const [jobDescription, setJobDescription] = useState<string>('');
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [generatedDocs, setGeneratedDocs] = useState<AIGeneratedDocs | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMasterResumeFile(event.target.files[0]);
      setUploadStatus('');
      setFileId(null);
      setGeneratedDocs(null); // Clear previous results
    }
  };

  const handleMasterResumeUpload = async () => {
    if (!masterResumeFile) {
      setUploadStatus('Please select your Master Resume first.');
      return;
    }

    setUploadStatus('Getting upload URL...');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}?fileName=${masterResumeFile.name}`
      );
      if (!response.ok) throw new Error('Failed to get upload URL.');
      
      const { uploadUrl, fileId: newFileId } = await response.json();
      setUploadStatus('Uploading Master Resume...');

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: masterResumeFile,
        headers: { 
          'Content-Type': 'application/pdf',
          'x-amz-meta-fileid': newFileId // Pass the fileId to S3
        },
      });
      if (!uploadResponse.ok) throw new Error('S3 upload failed.');

      setUploadStatus(`Processing resume... This may take a minute.`);
      setFileId(newFileId);

      // Poll to see when the resume is finished processing (status becomes READY_FOR_QUERY)
      const pollForReadyStatus = async () => {
        const statusResponse = await fetch(
          `${process.env.NEXT_PUBLIC_GET_SUMMARY_API_URL}?fileId=${newFileId}`
        );
        const result = await statusResponse.json();

        if (result.processingStatus === 'READY_FOR_QUERY') {
          setUploadStatus('✅ Master Resume is processed and ready!');
        } else if (result.processingStatus === 'FAILED') {
          setUploadStatus('❌ Error processing resume. Please try a different file.');
        } else {
          setTimeout(pollForReadyStatus, 5000); // Check again in 5 seconds
        }
      };

      setTimeout(pollForReadyStatus, 5000);

    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setGenerationStatus('Please paste a job description.');
      return;
    }
    if (!fileId) {
        setGenerationStatus('Please upload and process a master resume first.');
        return;
    }

    setGenerationStatus('Generating tailored documents... This can take up to a minute.');
    setGeneratedDocs(null);

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_GENERATE_DOCS_API_URL}`, // The new endpoint
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileId: fileId,
                    jobDescription: jobDescription,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data: AIGeneratedDocs = await response.json();
        setGeneratedDocs(data);
        setGenerationStatus('✅ Documents generated successfully!');

    } catch (error) {
        setGenerationStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 md:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl space-y-12">
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
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Step 1: Upload Your Master Resume</h2>
            <p className="mb-6 text-gray-400">Upload a PDF containing all your skills and experiences. This will become your personal knowledge base.</p>
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
                    disabled={!masterResumeFile || uploadStatus.includes('Processing')}
                    className="w-full sm:w-auto px-6 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    Upload & Process
                </button>
            </div>
            {uploadStatus && <p className="mt-4 text-center text-sm text-gray-400">{uploadStatus}</p>}
        </div>

        {/* Step 2: Job Description & Generation */}
        {fileId && uploadStatus.includes('✅') && (
            <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-pink-500">Step 2: Paste Job Description</h2>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-40 p-4 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
                <button
                    onClick={handleGenerate}
                    disabled={!jobDescription || generationStatus.includes('Generating')}
                    className="w-full mt-4 px-6 py-3 font-semibold bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    Generate Tailored Documents
                </button>
                {generationStatus && <p className="mt-4 text-center text-sm text-gray-400">{generationStatus}</p>}
            </div>
        )}
        
        {/* Results */}
        {generatedDocs && (
            <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                 <h2 className="text-2xl font-semibold mb-6 text-center text-purple-400">Your Generated Documents</h2>
                 <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-pink-500">Tailored Resume</h3>
                            {generatedDocs.resumePdfUrl && (
                                <a
                                    href={generatedDocs.resumePdfUrl}
                                    download="tailored-resume.pdf"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold text-sm transition-colors"
                                >
                                    Download PDF
                                </a>
                            )}
                        </div>
                        <pre className="p-4 bg-gray-900 border border-gray-600 rounded-md whitespace-pre-wrap font-sans text-sm">{generatedDocs.tailoredResume}</pre>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-pink-500">Cover Letter</h3>
                            {generatedDocs.coverLetterPdfUrl && (
                                <a
                                    href={generatedDocs.coverLetterPdfUrl}
                                    download="cover-letter.pdf"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold text-sm transition-colors"
                                >
                                    Download PDF
                                </a>
                            )}
                        </div>
                        <pre className="p-4 bg-gray-900 border border-gray-600 rounded-md whitespace-pre-wrap font-sans text-sm">{generatedDocs.coverLetter}</pre>
                    </div>
                 </div>
            </div>
        )}
      </div>
    </main>
  );
}