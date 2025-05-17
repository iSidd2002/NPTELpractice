import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Assignment, Answer, SubmissionResult } from '../types';
import { useProgress } from '../hooks/useProgress';

export const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markAsCompleted } = useProgress();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/assignments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch assignment');
        const data = await response.json();
        setAssignment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleAnswer = (selectedOption: string) => {
    const questionId = assignment?.questions[currentIndex].id;
    if (!questionId) return;

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, selectedOption };
        return updated;
      }
      return [...prev, { questionId, selectedOption }];
    });
  };

  const handleNext = () => {
    if (currentIndex < (assignment?.questions.length ?? 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/assignments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      
      if (!response.ok) throw new Error('Failed to submit answers');
      
      const result = await response.json();
      setResult(result);
      markAsCompleted(id!, result.scorePercent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers');
    }
  };

  if (loading) return <div className="p-4">Loading quiz...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!assignment) return <div className="p-4">Assignment not found</div>;
  if (result) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="mb-2">Total Questions: {result.totalQuestions}</p>
          <p className="mb-2">Correct Answers: {result.correctAnswers}</p>
          <p className="mb-4">Score: {result.scorePercent.toFixed(1)}%</p>
          <button
            onClick={() => navigate('/assignments')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = assignment.questions[currentIndex];
  const isLastQuestion = currentIndex === assignment.questions.length - 1;
  const hasAnswered = answers.some(a => a.questionId === currentQuestion.id);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <span className="text-gray-600">
            Question {currentIndex + 1} of {assignment.questions.length}
          </span>
        </div>
        <h2 className="text-xl mb-4">{currentQuestion.text}</h2>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={answers.some(
                  a => a.questionId === currentQuestion.id && a.selectedOption === option
                )}
                onChange={() => handleAnswer(option)}
                className="mr-3"
              />
              {option}
            </label>
          ))}
        </div>
        <div className="mt-6">
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={!hasAnswered}
              className={`px-4 py-2 rounded ${
                hasAnswered
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!hasAnswered}
              className={`px-4 py-2 rounded ${
                hasAnswered
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 