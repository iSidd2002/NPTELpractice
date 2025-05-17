import { useState, useEffect } from 'react';

const STORAGE_KEY = 'completedAssignments';
const SCORE_KEY = 'assignmentScores';

export const useProgress = () => {
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [scores, setScores] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem(SCORE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
  }, [scores]);

  const markAsCompleted = (id: string, scorePercent?: number) => {
    if (!completedIds.includes(id)) {
      setCompletedIds([...completedIds, id]);
    }
    if (scorePercent !== undefined) {
      setScores(prev => ({ ...prev, [id]: scorePercent }));
    }
  };

  const isCompleted = (id: string) => completedIds.includes(id);

  const getScore = (id: string) => scores[id];

  const getCumulativeScore = () => {
    const values = Object.values(scores);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const resetProgress = () => {
    setCompletedIds([]);
    setScores({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SCORE_KEY);
  };

  return {
    completedIds,
    markAsCompleted,
    isCompleted,
    getScore,
    getCumulativeScore,
    resetProgress,
    scores,
  };
}; 