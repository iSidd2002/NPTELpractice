export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Assignment {
  id: string;
  title: string;
  questions: Question[];
}

export interface AssignmentSummary {
  id: string;
  title: string;
}

export interface Answer {
  questionId: number;
  selectedOption: string;
}

export interface SubmissionResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
} 