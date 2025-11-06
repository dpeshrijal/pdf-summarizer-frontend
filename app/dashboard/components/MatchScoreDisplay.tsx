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

  // Gradient colors matching GenerationHistory
  const getScoreGradient = (score: number): string => {
    if (score >= 80) return "from-green-500 to-green-600";   // Strong = Green
    if (score >= 60) return "from-blue-500 to-blue-600";     // Good = Blue
    if (score >= 40) return "from-yellow-500 to-yellow-600"; // Fair = Yellow
    return "from-red-500 to-red-600";                         // Low = Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  // Compact view for history table
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getScoreGradient(matchScore.overallScore)} opacity-10 blur-md`} />
          <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${getScoreGradient(matchScore.overallScore)} flex items-center justify-center shadow-lg`}>
            <div className="text-xl font-bold text-white">{matchScore.overallScore}</div>
          </div>
        </div>
        <div className="text-xs leading-tight">
          <div className="font-semibold text-primary">
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
          className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Score Badge with Gradient */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getScoreGradient(matchScore.overallScore)} opacity-10 blur-md`} />
              <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${getScoreGradient(matchScore.overallScore)} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-bold text-white leading-none">
                  {matchScore.overallScore}
                </span>
              </div>
            </div>

            {/* Title and Quick Stats */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold whitespace-nowrap">ATS Match Score</span>
                <span className="text-sm font-medium whitespace-nowrap text-primary">
                  {getScoreLabel(matchScore.overallScore)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Skills: {matchScore.skillsMatch}% • Experience: {matchScore.experienceMatch}% • Education: {matchScore.educationMatch}%
              </div>
            </div>
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          )}
        </button>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-6 border-t bg-gradient-to-b from-muted/30 to-background">
            {/* Summary - Elegant typography */}
            <div className="text-sm text-foreground/70 pt-6 leading-relaxed">
              {matchScore.summary}
            </div>

            {/* Breakdown Scores - Modern grid layout */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Detailed Breakdown</h3>
              <div className="grid grid-cols-1 gap-4">
                <ScoreBar label="Skills Match" score={matchScore.skillsMatch} />
                <ScoreBar label="Experience Match" score={matchScore.experienceMatch} />
                <ScoreBar label="Education Match" score={matchScore.educationMatch} />
              </div>
            </div>

            {/* Two-column layout for strengths and gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths - Modern card design */}
              {matchScore.strengths.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Key Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {matchScore.strengths.map((strength, idx) => (
                      <li key={idx} className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-green-500/5 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-500/20 transition-colors">
                          <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">✓</span>
                        </div>
                        <span className="text-sm text-foreground/80 leading-relaxed">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps - Modern card design */}
              {matchScore.gaps.length > 0 && matchScore.gaps[0] !== "none identified" && matchScore.gaps[0] !== "None identified" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Areas for Improvement</h3>
                  </div>
                  <ul className="space-y-2">
                    {matchScore.gaps.map((gap, idx) => (
                      <li key={idx} className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-orange-500/5 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-orange-500/20 transition-colors">
                          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">•</span>
                        </div>
                        <span className="text-sm text-foreground/70 leading-relaxed">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
  const getBarGradient = (score: number): string => {
    if (score >= 90) return "from-emerald-500 to-green-600";
    if (score >= 75) return "from-blue-500 to-indigo-600";
    if (score >= 60) return "from-amber-400 to-yellow-600";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-700";
  };

  const getIconColor = (score: number): string => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBgColor = (score: number): string => {
    if (score >= 90) return "bg-emerald-500/10";
    if (score >= 75) return "bg-blue-500/10";
    if (score >= 60) return "bg-amber-500/10";
    if (score >= 40) return "bg-orange-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="group relative p-4 rounded-xl border border-border/50 hover:border-border transition-all hover:shadow-sm bg-card/50">
      {/* Header with label and score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getBgColor(score)} ${getIconColor(score)} animate-pulse`} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${getIconColor(score)} tabular-nums`}>{score}</span>
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>

      {/* Modern progress bar with gradient */}
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getBarGradient(score)} opacity-20 blur-sm`}
          style={{ width: `${score}%` }}
        />
        {/* Actual bar */}
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBarGradient(score)} rounded-full transition-all duration-700 ease-out shadow-sm`}
          style={{ width: `${score}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
