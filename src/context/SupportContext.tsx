// context/SupportContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface SupportQuestion {
  _id: string;
  question: string;
  answer?: string;
  createdAt: string;
  updatedAt: string;
}

interface SupportContextType {
  supportQuestions: SupportQuestion[];
  unansweredCount: number;
  refreshSupportQuestions: () => Promise<void>;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function SupportQuestionProvider({ children }: { children: React.ReactNode }) {
  const [supportQuestions, setSupportQuestions] = useState<SupportQuestion[]>([]);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSupportQuestions = async () => {
    try {
      const res = await axios.get("/api/support/question");
      const questions = res.data?.data || [];
      setSupportQuestions(questions);
      
      const unanswered = questions.filter((q: SupportQuestion) => !q.answer).length;
      setUnansweredCount(unanswered);
      return questions;
    } catch (err) {
      console.error("Error fetching support questions:", err);
      return [];
    }
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchSupportQuestions();
      setHasFetched(true);
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchSupportQuestions, 30000);
      return () => clearInterval(interval);
    }
  }, [hasFetched]);

  const refreshSupportQuestions = async () => {
    return fetchSupportQuestions();
  };

  return (
    <SupportContext.Provider value={{ supportQuestions, unansweredCount, refreshSupportQuestions }}>
      {children}
    </SupportContext.Provider>
  );
}

export function useSupportQuestions() {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error('useSupportQuestions must be used within a SupportQuestionProvider');
  }
  return context;
}