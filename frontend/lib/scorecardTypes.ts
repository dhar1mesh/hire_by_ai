export type VerdictType = "Strong Hire" | "Hire" | "Borderline" | "Reject";

export interface ScorecardEvaluation {
  verdict: VerdictType;
  overallScore: number; // 0 - 100
  ratings: {
    technicalCompetence: number; // 1 - 5
    systemDesign: number; // 1 - 5
    communication: number; // 1 - 5
    authenticity: number; // 1 - 5
  };
  summary: string;
  recommendationReason: string;
  keyStrengths: {
    title: string;
    explanation: string;
    evidenceQuote?: string;
  }[];
  redFlags: {
    title: string;
    explanation: string;
    evidenceQuote?: string;
  }[];
  directQuotes: {
    competency: string;
    quote: string;
    analysis: string;
    impact: "positive" | "negative" | "neutral";
  }[];
  projectAssessments: {
    projectName: string;
    rating: number; // 1 - 5
    strengthsObserved: string[];
    unresolvedConcerns: string[];
  }[];
  durationSeconds: number;
  evaluatedAt: string;
  evaluationMode: "realtime_llm" | "offline_simulation";
  modelUsed?: string;
}
