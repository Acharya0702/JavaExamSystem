package com.examsystem.service;

import com.examsystem.dto.exam.AnswerRequest;
import com.examsystem.dto.exam.CreateExamRequest;
import com.examsystem.dto.exam.CreateQuestionRequest;
import com.examsystem.dto.exam.TakeExamRequest;
import com.examsystem.model.*;
import com.examsystem.repository.ExamRepository;
import com.examsystem.repository.QuestionRepository;
import com.examsystem.repository.ExamResultRepository;
import com.examsystem.repository.StudentAnswerRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamResultRepository examResultRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final UserService userService;
    private final EntityManager entityManager;

    @Transactional
    public Exam createExam(CreateExamRequest request, User teacher) {
        System.out.println("🚀 === CREATE EXAM DEBUG START ===");
        System.out.println("📥 Teacher ID: " + teacher.getId());
        System.out.println("📥 Teacher Name: " + teacher.getFullName());

        // Calculate total marks
        int totalMarks = request.getQuestions().stream()
                .mapToInt(CreateQuestionRequest::getPoints)
                .sum();

        System.out.println("📥 Request Data:");
        System.out.println("  Title: " + request.getTitle());
        System.out.println("  Duration: " + request.getDuration());
        System.out.println("  Start Time: " + request.getStartTime());
        System.out.println("  End Time: " + request.getEndTime());
        System.out.println("  Passing Marks: " + request.getPassingMarks());
        System.out.println("  Status: " + request.getStatus());

        // Convert string status to enum
        ExamStatus examStatus = ExamStatus.DRAFT;
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            try {
                examStatus = ExamStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                examStatus = ExamStatus.DRAFT;
            }
        }

        // Set default times if not provided
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();

        if (startTime == null) {
            startTime = LocalDateTime.now();
            System.out.println("⚠️ Start time not provided, using current time: " + startTime);
        }

        if (endTime == null) {
            endTime = startTime.plusHours(1); // Default: 1 hour duration
            System.out.println("⚠️ End time not provided, using: " + endTime);
        }

        // Create the exam - IMPORTANT: Set teacher field
        Exam exam = Exam.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDuration())
                .totalMarks(totalMarks)
                .passingMarks(request.getPassingMarks())
                .status(examStatus)
                .isPublished(examStatus == ExamStatus.PUBLISHED)
                .startTime(startTime)
                .endTime(endTime)
                .teacher(teacher)  // THIS IS CRITICAL - Use teacher, not createdBy
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Set publishedAt if publishing
        if (examStatus == ExamStatus.PUBLISHED) {
            exam.setPublishedAt(LocalDateTime.now());
        }

        System.out.println("📤 Exam object before save:");
        System.out.println("  Teacher ID: " + (exam.getTeacher() != null ? exam.getTeacher().getId() : "NULL"));
        System.out.println("  Start Time: " + exam.getStartTime());
        System.out.println("  End Time: " + exam.getEndTime());

        // Save exam
        Exam savedExam = examRepository.save(exam);
        System.out.println("💾 Exam saved with ID: " + savedExam.getId());

        // Create questions
        List<Question> questions = request.getQuestions().stream()
                .map(q -> {
                    QuestionType questionType = QuestionType.MULTIPLE_CHOICE;
                    if (q.getType() != null && !q.getType().isEmpty()) {
                        try {
                            questionType = QuestionType.valueOf(q.getType().toUpperCase());
                        } catch (IllegalArgumentException e) {
                            questionType = QuestionType.MULTIPLE_CHOICE;
                        }
                    }

                    return Question.builder()
                            .text(q.getText())
                            .type(questionType)
                            .option1(q.getOption1())
                            .option2(q.getOption2())
                            .option3(q.getOption3())
                            .option4(q.getOption4())
                            .correctAnswer(q.getCorrectAnswer())
                            .points(q.getPoints())
                            .explanation(q.getExplanation())
                            .exam(savedExam)
                            .build();
                })
                .collect(Collectors.toList());

        questionRepository.saveAll(questions);
        savedExam.setQuestions(questions);

        System.out.println("✅ Created " + questions.size() + " questions");
        System.out.println("🚀 === CREATE EXAM DEBUG END ===\n");
        return savedExam;
    }

    @Transactional(readOnly = true)
    public List<Exam> getExamsByTeacher(User teacher) {
        try {
            System.out.println("Getting exams for teacher ID: " + teacher.getId());

            // FIXED: Use findByTeacher instead of findByCreatedBy
            List<Exam> exams = examRepository.findByTeacher(teacher);
            System.out.println("Found " + exams.size() + " exams in repository");

            // Eagerly load ALL relationships within the transaction
            exams.forEach(exam -> {
                // Load questions
                if (exam.getQuestions() != null) {
                    exam.getQuestions().size(); // This triggers loading
                }

                // Load teacher (if needed)
                if (exam.getTeacher() != null) {
                    exam.getTeacher().getFullName(); // Trigger loading
                }
            });

            return exams;
        } catch (Exception e) {
            System.out.println("ERROR in getExamsByTeacher: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<Exam> getPublishedExams() {
        List<Exam> exams = examRepository.findByStatus(ExamStatus.PUBLISHED);

        // Eagerly load questions for each exam within the transaction
        exams.forEach(exam -> {
            if (exam.getQuestions() != null) {
                exam.getQuestions().size(); // This triggers loading
            }

            // Load teacher
            if (exam.getTeacher() != null) {
                exam.getTeacher().getFullName(); // Trigger loading
            }
        });

        return exams;
    }

    @Transactional(readOnly = true)
    public Exam getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        // Eagerly load questions within the transaction
        if (exam.getQuestions() != null) {
            exam.getQuestions().size(); // This triggers loading
        }

        // Eagerly load teacher
        if (exam.getTeacher() != null) {
            exam.getTeacher().getFullName(); // Trigger loading
        }

        return exam;
    }

    @Transactional(readOnly = true)
    public Exam getExamByIdWithQuestions(Long id) {
        // Use JPQL with JOIN FETCH to load everything in one query
        try {
            return entityManager.createQuery(
                            "SELECT DISTINCT e FROM Exam e " +
                                    "LEFT JOIN FETCH e.questions " +
                                    "LEFT JOIN FETCH e.teacher " +  // FIXED: Use teacher, not createdBy
                                    "WHERE e.id = :id", Exam.class)
                    .setParameter("id", id)
                    .getSingleResult();
        } catch (Exception e) {
            // Fallback to regular findById if JOIN FETCH fails
            return getExamById(id);
        }
    }

    @Transactional(readOnly = true)
    public Exam getExamForStudent(Long id) {
        // For students, we don't need to load the correct answers
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        // Eagerly load questions (without modifying the entity)
        if (exam.getQuestions() != null) {
            exam.getQuestions().size(); // Just trigger loading, don't modify
        }

        // Load teacher
        if (exam.getTeacher() != null) {
            exam.getTeacher().getFullName();
        }

        return exam;
    }

    @Transactional
    public Exam updateExam(Long id, CreateExamRequest request, User teacher) {
        Exam exam = getExamById(id);

        // Check if teacher owns the exam - FIXED: Use getTeacher() not getCreatedBy()
        if (!exam.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not authorized to update this exam");
        }

        // Calculate total marks
        int totalMarks = request.getQuestions().stream()
                .mapToInt(CreateQuestionRequest::getPoints)
                .sum();

        // Convert string status to enum
        ExamStatus newStatus = exam.getStatus();
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            try {
                newStatus = ExamStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                newStatus = exam.getStatus();
            }
        }

        // Update exam details
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setDurationMinutes(request.getDuration());
        exam.setTotalMarks(totalMarks);
        exam.setPassingMarks(request.getPassingMarks());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setUpdatedAt(LocalDateTime.now());

        // Update status and publishedAt if publishing
        if (newStatus == ExamStatus.PUBLISHED && exam.getStatus() != ExamStatus.PUBLISHED) {
            exam.setStatus(ExamStatus.PUBLISHED);
            exam.setIsPublished(true);
            exam.setPublishedAt(LocalDateTime.now());
        } else {
            exam.setStatus(newStatus);
            exam.setIsPublished(newStatus == ExamStatus.PUBLISHED);
        }

        // Delete old questions
        questionRepository.deleteByExam(exam);
        exam.getQuestions().clear();

        // Create new questions
        List<Question> questions = request.getQuestions().stream()
                .map(q -> {
                    // Convert string type to enum
                    QuestionType questionType = QuestionType.MULTIPLE_CHOICE; // Default
                    if (q.getType() != null && !q.getType().isEmpty()) {
                        try {
                            questionType = QuestionType.valueOf(q.getType().toUpperCase());
                        } catch (IllegalArgumentException e) {
                            questionType = QuestionType.MULTIPLE_CHOICE;
                        }
                    }

                    Question.QuestionBuilder questionBuilder = Question.builder()
                            .text(q.getText())
                            .type(questionType)
                            .correctAnswer(q.getCorrectAnswer())
                            .points(q.getPoints())
                            .exam(exam);

                    // Set options based on question type
                    if (questionType == QuestionType.MULTIPLE_CHOICE) {
                        questionBuilder
                                .option1(q.getOption1())
                                .option2(q.getOption2())
                                .option3(q.getOption3())
                                .option4(q.getOption4());
                    } else if (questionType == QuestionType.TRUE_FALSE) {
                        questionBuilder
                                .option1("True")
                                .option2("False");
                    }

                    if (q.getExplanation() != null && !q.getExplanation().isEmpty()) {
                        questionBuilder.explanation(q.getExplanation());
                    }

                    return questionBuilder.build();
                })
                .collect(Collectors.toList());

        questionRepository.saveAll(questions);
        exam.setQuestions(questions);

        return examRepository.save(exam);
    }

    @Transactional
    public void deleteExam(Long id, User teacher) {
        Exam exam = getExamById(id);

        // Check if teacher owns the exam - FIXED: Use getTeacher() not getCreatedBy()
        if (!exam.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not authorized to delete this exam");
        }

        examRepository.delete(exam);
    }

    @Transactional
    public ExamResult submitExam(Long examId, TakeExamRequest request, User student) {
        System.out.println("🚀 ExamService.submitExam() START");
        System.out.println("📥 Exam ID from path: " + examId);
        System.out.println("📥 Time taken: " + request.getTimeTaken());
        System.out.println("📥 Number of answers: " + request.getAnswers().size());

        try {
            Exam exam = getExamById(examId);
            System.out.println("📥 Exam found: " + exam.getTitle());
            System.out.println("📥 Exam has " + exam.getQuestions().size() + " questions");

            // Log all questions with their details
            System.out.println("📥 Questions in exam:");
            for (Question question : exam.getQuestions()) {
                System.out.println("   Question ID: " + question.getId() +
                        ", Text: " + question.getText() +
                        ", Type: " + question.getType() +
                        ", Correct Answer: '" + question.getCorrectAnswer() + "'" +
                        ", Points: " + question.getPoints());
                if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                    System.out.println("   Options: 1='" + question.getOption1() +
                            "', 2='" + question.getOption2() +
                            "', 3='" + question.getOption3() +
                            "', 4='" + question.getOption4() + "'");
                }
            }

            // Check if exam is published
            if (exam.getStatus() != ExamStatus.PUBLISHED) {
                throw new RuntimeException("Exam is not published");
            }

            // Check if student has already taken the exam
            if (examResultRepository.findByExamAndStudent(exam, student).isPresent()) {
                throw new RuntimeException("You have already taken this exam");
            }

            // Calculate score and create answers
            int score = 0;
            List<StudentAnswer> answers = new ArrayList<>();

            System.out.println("📥 Processing answers:");
            for (AnswerRequest answerReq : request.getAnswers()) {
                System.out.println("📥 AnswerRequest: questionId=" + answerReq.getQuestionId() +
                        ", answer='" + answerReq.getAnswer() + "'");

                Question question = exam.getQuestions().stream()
                        .filter(q -> q.getId().equals(answerReq.getQuestionId()))
                        .findFirst()
                        .orElseThrow(() -> {
                            System.out.println("❌ Question not found: " + answerReq.getQuestionId());
                            return new RuntimeException("Question not found: " + answerReq.getQuestionId());
                        });

                boolean isCorrect = isAnswerCorrect(question, answerReq.getAnswer());
                int pointsAwarded = isCorrect ? question.getPoints() : 0;

                System.out.println("   Question found: ID=" + question.getId() +
                        ", Text: " + question.getText());
                System.out.println("   Correct answer in DB: '" + question.getCorrectAnswer() + "'");
                System.out.println("   Student answer: '" + answerReq.getAnswer() + "'");
                System.out.println("   Is correct: " + isCorrect);
                System.out.println("   Points awarded: " + pointsAwarded);

                StudentAnswer studentAnswer = StudentAnswer.builder()
                        .question(question)
                        .answer(answerReq.getAnswer())
                        .isCorrect(isCorrect)
                        .pointsAwarded(pointsAwarded)
                        .build();

                answers.add(studentAnswer);
                score += pointsAwarded;

                System.out.println("---");
            }

            // Calculate percentage
            double percentage = (score * 100.0) / exam.getTotalMarks();

            // Determine result status
            ResultStatus status = percentage >= exam.getPassingMarks() ? ResultStatus.PASSED : ResultStatus.FAILED;

            // Create exam result
            ExamResult examResult = ExamResult.builder()
                    .exam(exam)
                    .student(student)
                    .score(score)
                    .totalMarks(exam.getTotalMarks())
                    .percentage(percentage)
                    .status(status)
                    .timeTaken(request.getTimeTaken())
                    .submittedAt(LocalDateTime.now())
                    .build();

            // Save exam result first
            ExamResult savedResult = examResultRepository.save(examResult);

            // Set exam result reference in answers and save them
            for (StudentAnswer answer : answers) {
                answer.setExamResult(savedResult);
            }

            // Save all answers using StudentAnswerRepository
            studentAnswerRepository.saveAll(answers);

            // Set answers in exam result (for bidirectional relationship)
            savedResult.setAnswers(answers);

            System.out.println("✅ Exam submitted successfully!");
            System.out.println("📊 Final score: " + score + "/" + exam.getTotalMarks());
            System.out.println("📊 Percentage: " + String.format("%.2f", percentage) + "%");
            System.out.println("📊 Status: " + status);
            System.out.println("📊 Passing marks required: " + exam.getPassingMarks() + "%");
            System.out.println("🚀 ExamService.submitExam() END");

            return savedResult;

        } catch (Exception e) {
            System.out.println("❌ ERROR in submitExam: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private boolean isAnswerCorrect(Question question, String studentAnswer) {
        System.out.println("🔍 === isAnswerCorrect() START ===");
        System.out.println("   Question ID: " + question.getId());
        System.out.println("   Question text: " + question.getText());
        System.out.println("   Student answer: '" + studentAnswer + "'");
        System.out.println("   Correct answer from DB: '" + question.getCorrectAnswer() + "'");
        System.out.println("   Question type: " + question.getType());

        if (studentAnswer == null || studentAnswer.trim().isEmpty()) {
            System.out.println("   ❌ Student answer is null or empty");
            return false;
        }

        String correctAnswer = question.getCorrectAnswer();
        if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
            System.out.println("   ⚠️ WARNING: Correct answer is null or empty");
            return false;
        }

        String studentAnswerTrimmed = studentAnswer.trim();
        String correctAnswerTrimmed = correctAnswer.trim();

        System.out.println("   Student answer (trimmed): '" + studentAnswerTrimmed + "'");
        System.out.println("   Correct answer (trimmed): '" + correctAnswerTrimmed + "'");

        boolean isCorrect = false;

        switch (question.getType()) {
            case MULTIPLE_CHOICE:
                System.out.println("   🔵 MULTIPLE_CHOICE question");
                System.out.println("   Options available:");
                System.out.println("     1. '" + question.getOption1() + "'");
                System.out.println("     2. '" + question.getOption2() + "'");
                System.out.println("     3. '" + question.getOption3() + "'");
                System.out.println("     4. '" + question.getOption4() + "'");

                // Try to parse student answer as option index (1, 2, 3, 4)
                try {
                    int optionIndex = Integer.parseInt(studentAnswerTrimmed);
                    System.out.println("   Student selected option index: " + optionIndex);

                    // Get the option text for this index
                    String selectedOptionText = null;
                    switch (optionIndex) {
                        case 1: selectedOptionText = question.getOption1(); break;
                        case 2: selectedOptionText = question.getOption2(); break;
                        case 3: selectedOptionText = question.getOption3(); break;
                        case 4: selectedOptionText = question.getOption4(); break;
                    }

                    if (selectedOptionText != null) {
                        System.out.println("   Selected option text: '" + selectedOptionText + "'");
                        // Now compare the selected option text with the correct answer
                        isCorrect = selectedOptionText.trim().equalsIgnoreCase(correctAnswerTrimmed);
                        System.out.println("   Comparing '" + selectedOptionText.trim() + "' with '" + correctAnswerTrimmed + "'");
                    } else {
                        System.out.println("   ❌ Invalid option index: " + optionIndex);
                        isCorrect = false;
                    }
                } catch (NumberFormatException e) {
                    // Student answer is not a number (maybe they sent option text directly)
                    System.out.println("   Student answer is not numeric, comparing directly");
                    isCorrect = correctAnswerTrimmed.equalsIgnoreCase(studentAnswerTrimmed);
                }
                break;

            case TRUE_FALSE:
                System.out.println("   🔵 TRUE_FALSE question");
                // Handle different formats for true/false
                if (studentAnswerTrimmed.equalsIgnoreCase("true") ||
                        studentAnswerTrimmed.equalsIgnoreCase("false")) {
                    isCorrect = correctAnswerTrimmed.equalsIgnoreCase(studentAnswerTrimmed);
                } else if (studentAnswerTrimmed.equalsIgnoreCase("t")) {
                    isCorrect = correctAnswerTrimmed.equalsIgnoreCase("true");
                } else if (studentAnswerTrimmed.equalsIgnoreCase("f")) {
                    isCorrect = correctAnswerTrimmed.equalsIgnoreCase("false");
                } else if (studentAnswerTrimmed.equals("1")) {
                    // Some systems use 1 for true, 0 for false
                    isCorrect = correctAnswerTrimmed.equalsIgnoreCase("true");
                } else if (studentAnswerTrimmed.equals("0")) {
                    isCorrect = correctAnswerTrimmed.equalsIgnoreCase("false");
                }
                break;

            case SHORT_ANSWER:
                System.out.println("   🔵 SHORT_ANSWER question");
                // For short answer, do case-insensitive comparison
                isCorrect = correctAnswerTrimmed.equalsIgnoreCase(studentAnswerTrimmed);
                break;

            default:
                System.out.println("   ❌ Unknown question type");
                isCorrect = false;
        }

        System.out.println("   Result: " + (isCorrect ? "✅ CORRECT" : "❌ INCORRECT"));
        System.out.println("🔍 === isAnswerCorrect() END ===\n");
        return isCorrect;
    }

    @Transactional(readOnly = true)
    public List<ExamResult> getExamResultsByStudent(User student) {
        System.out.println("🔵 Getting exam results for student ID: " + student.getId());

        List<ExamResult> results = examResultRepository.findByStudent(student);
        System.out.println("🔵 Found " + results.size() + " results for student: " + student.getFullName());

        // Eagerly load all necessary relationships within the transaction
        results.forEach(result -> {
            // Load exam
            if (result.getExam() != null) {
                // Initialize exam's basic fields
                result.getExam().getTitle();

                // Load exam's teacher (not createdBy)
                if (result.getExam().getTeacher() != null) {
                    result.getExam().getTeacher().getFullName();
                }

                // Load exam's questions count
                if (result.getExam().getQuestions() != null) {
                    result.getExam().getQuestions().size();
                }
            }

            // Load student
            if (result.getStudent() != null) {
                result.getStudent().getFullName();
            }

            // Load answers
            if (result.getAnswers() != null) {
                result.getAnswers().size();
            }
        });

        return results;
    }

    @Transactional(readOnly = true)
    public List<ExamResult> getExamResultsByExam(Long examId) {
        System.out.println("🔵 Getting exam results for exam ID: " + examId);

        Exam exam = getExamById(examId);
        System.out.println("🔵 Exam found: " + exam.getTitle());

        List<ExamResult> results = examResultRepository.findByExam(exam);
        System.out.println("🔵 Found " + results.size() + " results for exam: " + exam.getTitle());

        // Eagerly load student details for each result
        results.forEach(result -> {
            if (result.getStudent() != null) {
                String studentName = result.getStudent().getFullName();
                System.out.println("🔵 Result for student: " + studentName +
                        " - Score: " + result.getScore() +
                        "/" + result.getTotalMarks());
            } else {
                System.out.println("⚠️ Result has no student associated!");
            }
        });

        return results;
    }

    @Transactional(readOnly = true)
    public ExamResult getExamResult(Long resultId) {
        ExamResult result = examResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Exam result not found with id: " + resultId));

        // Eagerly load exam and questions
        if (result.getExam() != null && result.getExam().getQuestions() != null) {
            result.getExam().getQuestions().size();
        }

        // Eagerly load student
        if (result.getStudent() != null) {
            result.getStudent().getFullName();
        }

        return result;
    }

    @Transactional(readOnly = true)
    public long getTotalQuestionsForTeacher(Long teacherId) {
        try {
            User teacher = userService.getUserById(teacherId);
            // FIXED: Use findByTeacher instead of findByCreatedBy
            return examRepository.findByTeacher(teacher)
                    .stream()
                    .flatMap(exam -> exam.getQuestions().stream())
                    .count();
        } catch (Exception e) {
            System.out.println("Error calculating total questions: " + e.getMessage());
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public long getTotalStudentsForTeacher(Long teacherId) {
        try {
            User teacher = userService.getUserById(teacherId);
            // FIXED: Use findByTeacher instead of findByCreatedBy
            return examRepository.findByTeacher(teacher)
                    .stream()
                    .flatMap(exam -> examResultRepository.findByExam(exam).stream())
                    .map(result -> result.getStudent().getId())
                    .distinct()
                    .count();
        } catch (Exception e) {
            System.out.println("Error calculating total students: " + e.getMessage());
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public long getActiveExamsForTeacher(Long teacherId) {
        try {
            User teacher = userService.getUserById(teacherId);
            // FIXED: Use findByTeacher instead of findByCreatedBy
            return examRepository.findByTeacher(teacher)
                    .stream()
                    .filter(exam -> exam.getStatus() == ExamStatus.PUBLISHED)
                    .count();
        } catch (Exception e) {
            System.out.println("Error calculating active exams: " + e.getMessage());
            return 0;
        }
    }
}