import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";

interface ResumeAnalyzerProps {
  resumeContent: string;
}

export function ResumeAnalyzer({ resumeContent }: ResumeAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);

  const analyzeResume = useCallback(() => {
    if (!jobDescription.trim()) return;

    const extractKeywords = (text: string) =>
      text.toLowerCase().match(/\b[a-zA-Z]{4,}\b/g) || []; // Extract words of length ≥4

    const jdKeywords = new Set(extractKeywords(jobDescription));
    const resumeWords = new Set(extractKeywords(resumeContent));

    const missing = [...jdKeywords].filter((word) => !resumeWords.has(word));

    setMissingKeywords(missing);
  }, [jobDescription, resumeContent]);

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="min-h-[200px]"
      />
      <Button onClick={analyzeResume} disabled={!jobDescription.trim()}>
        Analyze Resume
      </Button>

      {missingKeywords.length > 0 && (
        <Alert>
          <AlertDescription>
            Consider adding these keywords to your resume:
            <div className="mt-2 flex flex-wrap gap-2">
              {missingKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-block bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
