"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchScore } from "@/lib/types/resumeSchema";

interface MatchScoreDisplayProps {
  matchScore: MatchScore;
  compact?: boolean; // For use in history table
}

export function MatchScoreDisplay({ matchScore, compact = false }: MatchScoreDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 75) return "bg-blue-100 dark:bg-blue-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    if (score >= 40) return "bg-orange-100 dark:bg-orange-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Excellent Match";
    if (score >= 75) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Weak Match";
  };

  // Compact view for history table
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(matchScore.overallScore)}`}>
          <span className={`text-lg font-bold ${getScoreColor(matchScore.overallScore)}`}>
            {matchScore.overallScore}
          </span>
        </div>
        <div className="text-xs">
          <div className={`font-semibold ${getScoreColor(matchScore.overallScore)}`}>
            {getScoreLabel(matchScore.overallScore)}
          </div>
          <div className="text-muted-foreground">
            {matchScore.overallScore}% match
          </div>
        </div>
      </div>
    );
  }

  // Full detailed view - Compact single line
  return (
    <Card className="border-2">
      <CardContent className="p-0">
        {/* Compact Header - Single Line */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* Score Badge */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(matchScore.overallScore)}`}>
              <span className={`text-lg font-bold ${getScoreColor(matchScore.overallScore)}`}>
                {matchScore.overallScore}%
              </span>
            </div>

            {/* Title and Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">ATS Match Score</span>
                  <span className={`text-sm font-medium ${getScoreColor(matchScore.overallScore)}`}>
                    {getScoreLabel(matchScore.overallScore)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Skills: {matchScore.skillsMatch}% • Experience: {matchScore.experienceMatch}% • Education: {matchScore.educationMatch}%
                </div>
              </div>
            </div>
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t">
            {/* Summary */}
            <div className="text-sm text-muted-foreground pt-4">
              {matchScore.summary}
            </div>

            {/* Breakdown Scores */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Detailed Breakdown</div>
              <ScoreBar label="Skills Match" score={matchScore.skillsMatch} />
              <ScoreBar label="Experience Match" score={matchScore.experienceMatch} />
              <ScoreBar label="Education Match" score={matchScore.educationMatch} />
            </div>

            {/* Strengths */}
            {matchScore.strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Strengths
                </div>
                <ul className="space-y-1 text-sm">
                  {matchScore.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {matchScore.gaps.length > 0 && matchScore.gaps[0] !== "none identified" && matchScore.gaps[0] !== "None identified" && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Improvement
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {matchScore.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  const getBarColor = (score: number): string => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{score}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(score)} transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
