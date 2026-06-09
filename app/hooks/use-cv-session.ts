import { useState, useEffect } from "react";

export interface TailoredCV {
  summary?: string;
  key_skills?: string[];
  experience_highlights?: Array<{
    title?: string;
    company?: string;
    duration?: string;
    bullets?: string[];
  }>;
  keywords_matched?: string[];
  keywords_missing?: string[];
  ats_score?: number;
  match_notes?: string;
}

export interface PrepTopic {
  category?: string;
  items?: string[];
  priority?: "tinggi" | "sedang" | "rendah";
}

export interface StudyDay {
  day?: string;
  focus?: string;
  tasks?: string[];
}

export interface PrepPlan {
  overview?: string;
  topics?: PrepTopic[];
  study_schedule?: StudyDay[];
  company_research_tips?: string[];
}

export interface MockQuestion {
  id?: string;
  question?: string;
  category?: "behavioral" | "technical" | "situational" | "motivational";
  hint?: string;
}

export interface MockInterview {
  questions?: MockQuestion[];
}

export interface CVSessionData {
  sessionId: string;
  jobTitle: string;
  jobDescription: string;
  cvText: string;
  result: {
    tailored_cv?: TailoredCV;
    prep_plan?: PrepPlan;
    mock_interview?: MockInterview;
  };
  createdAt: string;
}

export function useCVSession(sessionId: string | undefined) {
  const [session, setSession] = useState<CVSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    try {
      const raw = sessionStorage.getItem(`cv_session_${sessionId}`);
      if (raw) {
        setSession(JSON.parse(raw));
      }
    } catch {
      // sessionStorage unavailable (SSR)
    }
    setLoading(false);
  }, [sessionId]);

  return { session, loading };
}

export type SessionHistoryEntry = {
  sessionId: string;
  jobTitle: string;
  createdAt: string;
};

export function useSessionHistory(): SessionHistoryEntry[] {
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv_sessions");
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // localStorage unavailable
    }
  }, []);

  return history;
}
