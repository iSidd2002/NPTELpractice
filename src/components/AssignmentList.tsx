import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssignmentSummary } from '../types';
import { useProgress } from '../hooks/useProgress';

export const AssignmentList = () => {
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { isCompleted, getScore, getCumulativeScore, resetProgress } = useProgress();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) return <div className="p-4 dark:text-gray-200">Loading assignments...</div>;
  if (error) return <div className="p-4 text-red-500 dark:text-red-400">Error: {error}</div>;

  const cumulativeScore = getCumulativeScore();

  return (
    <div className="p-4 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Assignments</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {isDarkMode ? '🌞' : '🌙'}
        </button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold dark:text-gray-200">
          Cumulative Score: <span className="text-blue-600 dark:text-blue-400">{cumulativeScore.toFixed(1)}%</span>
        </div>
        <button
          onClick={resetProgress}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
        >
          Reset Progress
        </button>
      </div>
      <div className="space-y-2">
        {assignments.map((assignment) => {
          const score = getScore(assignment.id);
          return (
            <button
              key={assignment.id}
              onClick={() => navigate(`/quiz/${assignment.id}`)}
              className={`w-full p-4 text-left rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium dark:text-white">{assignment.title}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {isCompleted(assignment.id) && (
                    <span className="text-green-500 dark:text-green-400">✓ Completed</span>
                  )}
                  {isCompleted(assignment.id) && (
                    <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                      Score: {score?.toFixed(1)}%
                    </span>
                  )}
                  {isCompleted(assignment.id) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted: {formatDate(new Date().toISOString())}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 