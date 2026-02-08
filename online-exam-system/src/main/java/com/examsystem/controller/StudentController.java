package com.examsystem.controller;

import com.examsystem.dto.exam.AnswerResponse;
import com.examsystem.dto.exam.ExamResponse;
import com.examsystem.dto.exam.QuestionResponse;
import com.examsystem.dto.exam.TakeExamRequest;
import com.examsystem.dto.exam.ExamResultResponse;
import com.examsystem.model.*;
import com.examsystem.service.ExamService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@Tag(name = "Student", description = "APIs for student operations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('STUDENT')")
@Transactional
public class StudentController {

    private final ExamService examService;

    // =========== DASHBOARD ===========
    @GetMapping("/dashboard")
    @Operation(summary = "Get student dashboard data")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal User student) {
        try {
            System.out.println("🚀 =========== START DASHBOARD DEBUG ===========");
            System.out.println("Getting dashboard for student ID: " + student.getId());

            Map<String, Object> response = new HashMap<>();

            // Get available exams (published exams that student hasn't taken)
            List<Exam> allPublishedExams = examService.getPublishedExams();
            System.out.println("📊 Total published exams: " + allPublishedExams.size());

            List<Exam> availableExams = allPublishedExams.stream()
                    .filter(exam -> !hasStudentTakenExam(exam, student))
                    .collect(Collectors.toList());

            System.out.println("📊 Filtered available exams: " + availableExams.size());

            // Get exam results for this student
            List<ExamResult> studentResults = examService.getExamResultsByStudent(student);
            System.out.println("📊 Student results: " + studentResults.size());

            // Format upcoming exams (available exams)
            System.out.println("🔄 Building upcoming exams response...");
            List<Map<String, Object>> upcomingExamsData = availableExams.stream()
                    .map(exam -> {
                        System.out.println("   📝 Processing exam: " + exam.getTitle());

                        // Initialize lazy-loaded collections
                        if (exam.getQuestions() != null) {
                            exam.getQuestions().size();
                        }

                        Map<String, Object> examData = new HashMap<>();
                        examData.put("id", exam.getId());
                        examData.put("title", exam.getTitle());
                        examData.put("description", exam.getDescription());
                        examData.put("duration", exam.getDurationMinutes());
                        examData.put("totalQuestions", exam.getQuestions() != null ? exam.getQuestions().size() : 0);
                        examData.put("totalMarks", exam.getTotalMarks());
                        examData.put("passingMarks", exam.getPassingMarks());

                        // CRITICAL: Get values
                        String statusValue = exam.getStatus() != null ? exam.getStatus().name() : "UNKNOWN";
                        Boolean isPublishedValue = exam.getIsPublished();
                        LocalDateTime startTimeValue = exam.getStartTime();
                        LocalDateTime endTimeValue = exam.getEndTime();
                        Boolean availableValue = exam.isAvailable();

                        System.out.println("     Setting fields:");
                        System.out.println("       status: " + statusValue);
                        System.out.println("       isPublished: " + isPublishedValue);
                        System.out.println("       startTime: " + startTimeValue);
                        System.out.println("       endTime: " + endTimeValue);
                        System.out.println("       available: " + availableValue);

                        examData.put("status", statusValue);
                        examData.put("isPublished", isPublishedValue);
                        examData.put("startTime", startTimeValue);
                        examData.put("endTime", endTimeValue);
                        examData.put("available", availableValue);

                        // FIXED: Use getTeacher() instead of getCreatedBy()
                        examData.put("createdBy", exam.getTeacher() != null ? exam.getTeacher().getFullName() : "Unknown");
                        examData.put("createdAt", exam.getCreatedAt());
                        examData.put("publishedAt", exam.getPublishedAt());

                        System.out.println("     Created map: " + examData);
                        return examData;
                    })
                    .collect(Collectors.toList());

            // Format completed exams (exam results)
            List<Map<String, Object>> completedExamsData = studentResults.stream()
                    .map(result -> {
                        // Initialize lazy-loaded collections
                        if (result.getExam() != null) {
                            if (result.getExam().getQuestions() != null) {
                                result.getExam().getQuestions().size();
                            }
                        }

                        Map<String, Object> resultData = new HashMap<>();
                        resultData.put("id", result.getId());
                        resultData.put("examId", result.getExam().getId());
                        resultData.put("examTitle", result.getExam().getTitle());
                        resultData.put("score", result.getScore());
                        resultData.put("totalMarks", result.getTotalMarks());
                        resultData.put("percentage", result.getPercentage());
                        resultData.put("status", result.getStatus().toString());
                        resultData.put("dateTaken", result.getSubmittedAt());
                        // FIXED: Use getTeacher() instead of getCreatedBy()
                        resultData.put("createdBy", result.getExam().getTeacher() != null ?
                                result.getExam().getTeacher().getFullName() : "Unknown");
                        return resultData;
                    })
                    .collect(Collectors.toList());

            // Calculate statistics
            long totalExams = availableExams.size() + studentResults.size();
            long completedExams = studentResults.size();
            long upcomingExams = availableExams.size();
            double averageScore = studentResults.stream()
                    .mapToDouble(ExamResult::getPercentage)
                    .average()
                    .orElse(0.0);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalExams", totalExams);
            stats.put("completedExams", completedExams);
            stats.put("averageScore", Math.round(averageScore * 100.0) / 100.0);
            stats.put("upcomingExams", upcomingExams);

            // FIX: ADD THE DATA TO THE RESPONSE!
            response.put("upcomingExams", upcomingExamsData);
            response.put("completedExams", completedExamsData);
            response.put("stats", stats);

            // Debug the final response
            System.out.println("📤 FINAL RESPONSE:");
            System.out.println("  Keys: " + response.keySet());
            System.out.println("  Upcoming exams count: " + upcomingExamsData.size());
            System.out.println("  Completed exams count: " + completedExamsData.size());
            System.out.println("  Stats: " + stats);

            // Test serialization
            try {
                ObjectMapper mapper = new ObjectMapper();
                mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
                String json = mapper.writeValueAsString(response);
                System.out.println("✅ JSON serialization successful");
                System.out.println("📄 JSON length: " + json.length());
            } catch (Exception e) {
                System.out.println("❌ JSON serialization failed: " + e.getMessage());
            }

            System.out.println("✅ Dashboard response prepared successfully");
            System.out.println("=========== END DASHBOARD DEBUG ===========\n");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("❌ ERROR in getDashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to load dashboard: " + e.getMessage()));
        }
    }

    // =========== AVAILABLE EXAMS (Map Response) ===========
    @GetMapping("/exams/available")
    @Operation(summary = "Get available exams for student - Map Response")
    public ResponseEntity<?> getAvailableExams(@AuthenticationPrincipal User student) {
        try {
            System.out.println("🔍 DEBUG getAvailableExams() START");

            // Get ALL published exams
            List<Exam> allPublishedExams = examService.getPublishedExams();
            System.out.println("📊 Total exams from getPublishedExams(): " + allPublishedExams.size());

            // Debug each exam
            allPublishedExams.forEach(exam -> {
                System.out.println("🔍 Exam from DB: " + exam.getTitle());
                System.out.println("   - ID: " + exam.getId());
                System.out.println("   - Status: " + exam.getStatus());
                System.out.println("   - isPublished: " + exam.getIsPublished());
                System.out.println("   - available: " + exam.isAvailable());
            });

            // Filter exams student hasn't taken
            List<Exam> availableExams = allPublishedExams.stream()
                    .filter(exam -> !hasStudentTakenExam(exam, student))
                    .collect(Collectors.toList());

            System.out.println("📊 Filtered available exams: " + availableExams.size());

            // Build response WITH ALL FIELDS
            List<Map<String, Object>> response = availableExams.stream()
                    .map(exam -> {
                        System.out.println("🔄 Building response for exam: " + exam.getTitle());

                        Map<String, Object> examData = new HashMap<>();

                        // Basic fields
                        examData.put("id", exam.getId());
                        examData.put("title", exam.getTitle());
                        examData.put("description", exam.getDescription());
                        examData.put("duration", exam.getDurationMinutes());
                        examData.put("totalQuestions", exam.getQuestions() != null ? exam.getQuestions().size() : 0);
                        examData.put("totalMarks", exam.getTotalMarks());
                        examData.put("passingMarks", exam.getPassingMarks());

                        // CRITICAL: Add these status fields
                        examData.put("status", exam.getStatus() != null ? exam.getStatus().name() : "UNKNOWN");
                        examData.put("isPublished", exam.getIsPublished());
                        examData.put("available", exam.isAvailable());
                        examData.put("startTime", exam.getStartTime());
                        examData.put("endTime", exam.getEndTime());
                        examData.put("questionCount", exam.getQuestions() != null ? exam.getQuestions().size() : 0);

                        // Creator and timestamps - FIXED: Use getTeacher() instead of getCreatedBy()
                        examData.put("createdBy", exam.getTeacher() != null ? exam.getTeacher().getFullName() : "Unknown");
                        examData.put("createdAt", exam.getCreatedAt());
                        examData.put("publishedAt", exam.getPublishedAt());

                        System.out.println("   - Added fields: status=" + examData.get("status") +
                                ", isPublished=" + examData.get("isPublished") +
                                ", available=" + examData.get("available"));

                        return examData;
                    })
                    .collect(Collectors.toList());

            System.out.println("✅ Response built with " + response.size() + " exams");
            System.out.println("🔍 First exam in response: " + (response.isEmpty() ? "empty" : response.get(0)));
            System.out.println("🔍 DEBUG getAvailableExams() END");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("❌ ERROR in getAvailableExams: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to load available exams: " + e.getMessage()));
        }
    }

    // =========== AVAILABLE EXAMS (DTO Response) ===========
    @GetMapping("/exams/available-dto")
    @Operation(summary = "Get all available exams - DTO Response")
    public ResponseEntity<List<ExamResponse>> getAvailableExamsDTO() {
        List<Exam> exams = examService.getPublishedExams();
        List<ExamResponse> response = exams.stream()
                .map(this::toExamResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // =========== GET EXAM BY ID (Map Response) ===========
    @GetMapping("/exams/{examId}")
    @Operation(summary = "Get exam details for student (without correct answers)")
    public ResponseEntity<?> getStudentExamById(@PathVariable Long examId,
                                                @AuthenticationPrincipal User student) {
        try {
            System.out.println("Getting exam " + examId + " for student ID: " + student.getId());

            // Get exam WITHOUT modifying it
            Exam exam = examService.getExamById(examId);

            // Check if exam is published
            if (exam.getStatus() != ExamStatus.PUBLISHED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "This exam is not available"));
            }

            // Check if student has already taken this exam
            if (hasStudentTakenExam(exam, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You have already taken this exam"));
            }

            // Create response with questions but WITHOUT correct answers
            // This creates a new DTO, doesn't modify the original entities
            ExamResponse response = ExamResponse.builder()
                    .id(exam.getId())
                    .title(exam.getTitle())
                    .description(exam.getDescription())
                    .duration(exam.getDurationMinutes())
                    .totalMarks(exam.getTotalMarks())
                    .passingMarks(exam.getPassingMarks())
                    .status(exam.getStatus())
                    // FIXED: Use getTeacher() instead of getCreatedBy()
                    .createdBy(exam.getTeacher() != null ? exam.getTeacher().getFullName() : "Unknown")
                    .createdAt(exam.getCreatedAt())
                    .publishedAt(exam.getPublishedAt())
                    .questionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0)
                    .questions(exam.getQuestions().stream()
                            .map(q -> {
                                // Create new QuestionResponse WITHOUT correct answer and explanation
                                return QuestionResponse.builder()
                                        .id(q.getId())
                                        .text(q.getText())
                                        .type(q.getType())
                                        .option1(q.getOption1())
                                        .option2(q.getOption2())
                                        .option3(q.getOption3())
                                        .option4(q.getOption4())
                                        .correctAnswer(null) // Set to null in DTO, not in entity
                                        .points(q.getPoints())
                                        .explanation(null) // Set to null in DTO, not in entity
                                        .build();
                            })
                            .collect(Collectors.toList()))
                    .build();

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("ERROR in getStudentExamById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Exam not found: " + e.getMessage()));
        } catch (Exception e) {
            System.out.println("ERROR in getStudentExamById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to load exam: " + e.getMessage()));
        }
    }

    // =========== GET EXAM BY ID (DTO Response) ===========
    @GetMapping("/exams/{id}/dto")
    @Operation(summary = "Get exam details for taking - DTO Response")
    public ResponseEntity<?> getExamDTO(@PathVariable Long id,
                                        @AuthenticationPrincipal User student) {
        try {
            Exam exam = examService.getExamById(id);

            // Check if exam is published
            if (exam.getStatus() != ExamStatus.PUBLISHED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "This exam is not available"));
            }

            // Check if student has already taken the exam
            boolean hasTaken = examService.getExamResultsByStudent(student).stream()
                    .anyMatch(result -> result.getExam().getId().equals(id));

            if (hasTaken) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You have already taken this exam"));
            }

            // Create response WITHOUT correct answers for students
            ExamResponse response = ExamResponse.builder()
                    .id(exam.getId())
                    .title(exam.getTitle())
                    .description(exam.getDescription())
                    .duration(exam.getDurationMinutes())
                    .totalMarks(exam.getTotalMarks())
                    .passingMarks(exam.getPassingMarks())
                    .status(exam.getStatus())
                    // FIXED: Use getTeacher() instead of getCreatedBy()
                    .createdBy(exam.getTeacher() != null ? exam.getTeacher().getFullName() : "Unknown")
                    .createdAt(exam.getCreatedAt())
                    .publishedAt(exam.getPublishedAt())
                    .questionCount(exam.getQuestions().size())
                    .questions(exam.getQuestions().stream()
                            .map(q -> {
                                // For students, don't include correct answers
                                return QuestionResponse.builder()
                                        .id(q.getId())
                                        .text(q.getText())
                                        .type(q.getType())
                                        .option1(q.getOption1())
                                        .option2(q.getOption2())
                                        .option3(q.getOption3())
                                        .option4(q.getOption4())
                                        .points(q.getPoints())
                                        .explanation(q.getExplanation())
                                        .build();
                            })
                            .collect(Collectors.toList()))
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // =========== SUBMIT EXAM ===========
    @PostMapping("/exams/{examId}/submit")
    @Operation(summary = "Submit exam answers")
    public ResponseEntity<?> submitExam(@PathVariable Long examId,
                                        @RequestBody TakeExamRequest request,
                                        @AuthenticationPrincipal User student) {
        try {
            System.out.println("Submitting exam " + examId + " for student ID: " + student.getId());
            System.out.println("Request: " + request);

            // Submit exam
            ExamResult examResult = examService.submitExam(examId, request, student);

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", examResult.getId());
            response.put("examId", examResult.getExam().getId());
            response.put("examTitle", examResult.getExam().getTitle());
            response.put("score", examResult.getScore());
            response.put("totalMarks", examResult.getTotalMarks());
            response.put("percentage", examResult.getPercentage());
            response.put("status", examResult.getStatus().toString());
            response.put("timeTaken", examResult.getTimeTaken());
            response.put("submittedAt", examResult.getSubmittedAt());
            response.put("message", "Exam submitted successfully!");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("ERROR in submitExam: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("ERROR in submitExam: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to submit exam: " + e.getMessage()));
        }
    }

    // =========== GET STUDENT RESULTS (Map Response) ===========
    @GetMapping("/exams/results")
    @Operation(summary = "Get student's exam results - Map Response")
    public ResponseEntity<?> getStudentResults(@AuthenticationPrincipal User student) {
        try {
            System.out.println("Getting results for student ID: " + student.getId());

            List<ExamResult> results = examService.getExamResultsByStudent(student);

            List<Map<String, Object>> response = results.stream()
                    .map(result -> {
                        // Initialize lazy-loaded collections
                        if (result.getExam() != null) {
                            if (result.getExam().getQuestions() != null) {
                                result.getExam().getQuestions().size(); // Initialize questions
                            }
                            // FIXED: Use getTeacher() instead of getCreatedBy()
                            if (result.getExam().getTeacher() != null) {
                                result.getExam().getTeacher().getFullName(); // Initialize user
                            }
                        }

                        Map<String, Object> resultData = new HashMap<>();
                        resultData.put("id", result.getId());
                        resultData.put("examId", result.getExam().getId());
                        resultData.put("examTitle", result.getExam().getTitle());
                        resultData.put("score", result.getScore());
                        resultData.put("totalMarks", result.getTotalMarks());
                        resultData.put("percentage", result.getPercentage());
                        resultData.put("status", result.getStatus().toString());
                        resultData.put("timeTaken", result.getTimeTaken());
                        resultData.put("submittedAt", result.getSubmittedAt());
                        // FIXED: Use getTeacher() instead of getCreatedBy()
                        resultData.put("createdBy", result.getExam().getTeacher() != null ?
                                result.getExam().getTeacher().getFullName() : "Unknown");
                        return resultData;
                    })
                    .collect(Collectors.toList());

            System.out.println("Returning " + response.size() + " results");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR in getStudentResults: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to load results: " + e.getMessage()));
        }
    }

    // =========== GET STUDENT RESULTS (DTO Response) ===========
    @GetMapping("/exams/results-dto")
    @Operation(summary = "Get student's exam results - DTO Response")
    public ResponseEntity<List<ExamResultResponse>> getStudentResultsDTO(
            @AuthenticationPrincipal User student) {
        List<ExamResult> results = examService.getExamResultsByStudent(student);
        List<ExamResultResponse> response = results.stream()
                .map(this::toExamResultResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // =========== GET RESULT BY ID (Map Response) ===========
    @GetMapping("/exams/results/{resultId}")
    @Operation(summary = "Get detailed exam result - Map Response")
    public ResponseEntity<?> getResultById(@PathVariable Long resultId,
                                           @AuthenticationPrincipal User student) {
        try {
            System.out.println("Getting detailed result " + resultId + " for student ID: " + student.getId());

            ExamResult result = examService.getExamResult(resultId);

            // Check if result belongs to current student
            if (!result.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not authorized to view this result"));
            }

            // Initialize lazy-loaded collections
            if (result.getExam() != null) {
                if (result.getExam().getQuestions() != null) {
                    result.getExam().getQuestions().size(); // Initialize questions
                }
                // FIXED: Use getTeacher() instead of getCreatedBy()
                if (result.getExam().getTeacher() != null) {
                    result.getExam().getTeacher().getFullName(); // Initialize user
                }
            }
            if (result.getAnswers() != null) {
                result.getAnswers().size(); // Initialize answers
                result.getAnswers().forEach(answer -> {
                    if (answer.getQuestion() != null) {
                        // Initialize question if needed
                    }
                });
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", result.getId());
            response.put("examId", result.getExam().getId());
            response.put("examTitle", result.getExam().getTitle());
            response.put("score", result.getScore());
            response.put("totalMarks", result.getTotalMarks());
            response.put("percentage", result.getPercentage());
            response.put("status", result.getStatus().toString());
            response.put("timeTaken", result.getTimeTaken());
            response.put("submittedAt", result.getSubmittedAt());
            // FIXED: Use getTeacher() instead of getCreatedBy()
            response.put("createdBy", result.getExam().getTeacher() != null ?
                    result.getExam().getTeacher().getFullName() : "Unknown");

            // Include answers with correct/incorrect status
            if (result.getAnswers() != null) {
                List<Map<String, Object>> answersData = result.getAnswers().stream()
                        .map(answer -> {
                            Map<String, Object> answerData = new HashMap<>();
                            answerData.put("questionId", answer.getQuestion().getId());
                            answerData.put("questionText", answer.getQuestion().getText());
                            answerData.put("studentAnswer", answer.getAnswer());
                            answerData.put("correctAnswer", answer.getQuestion().getCorrectAnswer());
                            answerData.put("isCorrect", answer.getIsCorrect());
                            answerData.put("pointsAwarded", answer.getPointsAwarded());
                            answerData.put("questionPoints", answer.getQuestion().getPoints());
                            return answerData;
                        })
                        .collect(Collectors.toList());
                response.put("answers", answersData);
            }

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("ERROR in getResultById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Result not found: " + e.getMessage()));
        } catch (Exception e) {
            System.out.println("ERROR in getResultById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to load result: " + e.getMessage()));
        }
    }

    // =========== GET RESULT BY ID (DTO Response) ===========
    @GetMapping("/exams/results/{resultId}/dto")
    @Operation(summary = "Get detailed exam result - DTO Response")
    public ResponseEntity<?> getExamResultDTO(@PathVariable Long resultId,
                                              @AuthenticationPrincipal User student) {
        try {
            ExamResult result = examService.getExamResult(resultId);

            // Check if result belongs to student
            if (!result.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not authorized to view this result"));
            }

            return ResponseEntity.ok(toExamResultResponseDTO(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // =========== HELPER METHODS ===========

    // Helper method to check if student has taken an exam
    private boolean hasStudentTakenExam(Exam exam, User student) {
        try {
            // Get all exam results for this student
            List<ExamResult> studentResults = examService.getExamResultsByStudent(student);

            // Check if any result is for this specific exam
            return studentResults.stream()
                    .anyMatch(result -> result.getExam().getId().equals(exam.getId()));
        } catch (Exception e) {
            System.out.println("Error checking if student has taken exam: " + e.getMessage());
            return false;
        }
    }

    // DTO Conversion Methods - FIXED: Use getTeacher() instead of getCreatedBy()
    private ExamResponse toExamResponseDTO(Exam exam) {
        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .duration(exam.getDurationMinutes())
                .totalMarks(exam.getTotalMarks())
                .passingMarks(exam.getPassingMarks())
                .status(exam.getStatus())
                .createdBy(exam.getTeacher() != null ? exam.getTeacher().getFullName() : "Unknown")
                .createdAt(exam.getCreatedAt())
                .publishedAt(exam.getPublishedAt())
                .questionCount(exam.getQuestions().size())
                .build();
    }

    private ExamResultResponse toExamResultResponseDTO(ExamResult result) {
        List<AnswerResponse> answers = result.getAnswers().stream()
                .map(answer -> AnswerResponse.builder()
                        .id(answer.getId())
                        .questionId(answer.getQuestion().getId())
                        .questionText(answer.getQuestion().getText())
                        .correctAnswer(answer.getQuestion().getCorrectAnswer())
                        .studentAnswer(answer.getAnswer())
                        .isCorrect(answer.getIsCorrect())
                        .pointsAwarded(answer.getPointsAwarded())
                        .questionPoints(answer.getQuestion().getPoints())
                        .explanation(answer.getQuestion().getExplanation())
                        .build())
                .collect(Collectors.toList());

        return ExamResultResponse.builder()
                .id(result.getId())
                .examId(result.getExam().getId())
                .examTitle(result.getExam().getTitle())
                .studentName(result.getStudent().getFullName())
                .score(result.getScore())
                .totalMarks(result.getTotalMarks())
                .percentage(result.getPercentage())
                .status(result.getStatus())
                .timeTaken(result.getTimeTaken())
                .submittedAt(result.getSubmittedAt())
                .answers(answers)
                .build();
    }
}