// online-exam-frontend/src/types/exam.types.ts
export interface Exam {
    id: number;
    title: string;
    description: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    status: string;  // 'PUBLISHED', 'DRAFT', etc.
    isPublished: boolean;
    startTime: string | null;
    endTime: string | null;
    available: boolean;
    createdBy: string;
    createdAt: string;
    publishedAt: string | null;
    questionCount: number;
    totalQuestions: number; // Add this for compatibility
}

export interface Question {
    id: number;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    points: number;
    explanation?: string;
    correctAnswer: string;
}

export interface ExamWithQuestions extends Exam {
    questions: Question[];
}

export interface StudentAnswer {
    questionId: number;
    answer: string;
}

export interface TakeExamRequest {
    examId: number;
    answers: StudentAnswer[];
    timeTaken: number;
}

export interface ExamResult {
    id: number;
    examId: number;
    examTitle: string;
    studentName: string;
    score: number;
    totalMarks: number;
    percentage: number;
    status: 'PASSED' | 'FAILED';
    timeTaken: number;
    submittedAt: string;
    answers: AnswerDetail[];
}

export interface AnswerDetail {
    id: number;
    questionId: number;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    pointsAwarded: number;
    questionPoints: number;
    explanation?: string;
}

export interface CreateQuestionRequest {
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    correctAnswer: string;
    points: number;
    explanation?: string;
}

export interface CreateExamRequest {
    title: string;
    description: string;
    duration: number;
    passingMarks: number;
    status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED'; // Make sure this is required
    startTime?: string;
    endTime?: string;
    questions: CreateQuestionRequest[];
}

export interface ExamWithCorrectAnswers extends Exam {
    questions: QuestionWithCorrectAnswer[];
}

export interface QuestionWithCorrectAnswer extends Question {
    correctAnswer: string;
}