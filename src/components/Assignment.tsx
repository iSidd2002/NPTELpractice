import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Assignment as AssignmentType, Answer } from '../types';
import { useProgress } from '../hooks/useProgress';

export const Assignment = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<AssignmentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [detailedResults, setDetailedResults] = useState<any[]>([]);
  const navigate = useNavigate();
  const { markAsCompleted } = useProgress();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/assignments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch assignment');
        const data = await response.json();
        setAssignment(data);
        setAnswers(data.questions.map((q: any) => ({ questionId: q.id, selectedOption: '' })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleAnswerChange = (questionId: number, selectedOption: string) => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId ? { ...answer, selectedOption } : answer
    ));
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assignments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) throw new Error('Failed to submit assignment');
      
      const result = await response.json();
      setScore(result.scorePercent);
      setDetailedResults(result.detailedResults);
      markAsCompleted(assignment.id, result.scorePercent);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 dark:text-gray-200">Loading assignment...</div>;
  if (error) return <div className="p-4 text-red-500 dark:text-red-400">Error: {error}</div>;
  if (!assignment) return <div className="p-4 dark:text-gray-200">Assignment not found</div>;

  return (
    <div className="p-4 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark:text-white">{assignment.title}</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Assignments
          </button>
        </div>

        {showResults ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Results</h2>
            <p className="text-lg mb-4 dark:text-gray-200">
              Your score: <span className="font-bold text-blue-600 dark:text-blue-400">{score?.toFixed(1)}%</span>
            </p>
            <div className="space-y-6">
              {detailedResults.map((result, idx) => (
                <div key={result.questionId} className="mb-4">
                  <div className="font-medium dark:text-white mb-2">
                    {idx + 1}. {result.questionText}
                  </div>
                  <div className="space-y-1">
                    {result.options.map((option: string, i: number) => {
                      const isSelected = result.selectedOption === option;
                      const isCorrect = result.correctAnswer === option;
                      return (
                        <div
                          key={i}
                          className={`flex items-center px-3 py-2 rounded border dark:border-gray-700 ${
                            isSelected
                              ? result.isCorrect
                                ? 'bg-green-100 dark:bg-green-900 border-green-400'
                                : 'bg-red-100 dark:bg-red-900 border-red-400'
                              : isCorrect
                                ? 'bg-green-50 dark:bg-green-800 border-green-300'
                                : 'bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={isSelected}
                            readOnly
                            className="mr-2"
                          />
                          <span className="dark:text-gray-200">{option}</span>
                          {isSelected && !result.isCorrect && (
                            <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Your answer)</span>
                          )}
                          {isCorrect && !result.isCorrect && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Correct answer)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Return to Assignments
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {assignment.questions.map((question) => (
              <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium mb-4 dark:text-white">
                  {question.id}. {question.text}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers.find(a => a.questionId === question.id)?.selectedOption === option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        className="mr-3"
                      />
                      <span className="dark:text-gray-200">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || answers.some(a => !a.selectedOption)}
                className={`px-6 py-2 rounded text-white ${
                  isSubmitting || answers.some(a => !a.selectedOption)
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 