package com.examsystem.controller;

import com.examsystem.dto.exam.ExamResponse;
import com.examsystem.dto.exam.QuestionResponse;
import com.examsystem.model.Exam;
import com.examsystem.model.ExamResult;
import com.examsystem.model.User;
import com.examsystem.repository.ExamRepository;
import com.examsystem.service.ExamService;
import com.examsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
@Tag(name = "Teacher", description = "APIs for teacher operations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('TEACHER')")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {

    private final ExamService examService;
    private final ExamRepository examRepository;
    private final UserService userService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get teacher dashboard data")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal User user) {
        try {
            System.out.println("🔵 Teacher Dashboard called for: " + user.getUsername() + " (ID: " + user.getId() + ")");

            Map<String, Object> response = new HashMap<>();

            // Get teacher's exams
            List<Exam> teacherExams = examService.getExamsByTeacher(user);
            System.out.println("🔵 Teacher has " + teacherExams.size() + " exams");

            // Load questions for each exam
            teacherExams.forEach(exam -> {
                if (exam.getQuestions() != null) {
                    exam.getQuestions().size();
                }
            });

            List<Map<String, Object>> examsData = teacherExams.stream()
                    .map(exam -> {
                        System.out.println("🔵 Processing exam: " + exam.getTitle() + " (ID: " + exam.getId() + ")");

                        Map<String, Object> examData = new HashMap<>();
                        examData.put("id", exam.getId());
                        examData.put("title", exam.getTitle());
                        examData.put("description", exam.getDescription());
                        examData.put("totalQuestions", exam.getQuestions() != null ? exam.getQuestions().size() : 0);
                        examData.put("totalMarks", exam.getTotalMarks());
                        examData.put("passingMarks", exam.getPassingMarks());
                        examData.put("status", exam.getStatus().toString().toLowerCase());
                        examData.put("createdAt", exam.getCreatedAt());

                        // Get results for this exam to calculate statistics
                        List<com.examsystem.model.ExamResult> results = examService.getExamResultsByExam(exam.getId());
                        int studentsTakenExam = results.size(); // Students who have taken this exam
                        double averageScore = results.stream()
                                .mapToDouble(r -> r.getPercentage())
                                .average()
                                .orElse(0.0);

                        examData.put("studentsTaken", studentsTakenExam); // Rename for clarity
                        examData.put("averageScore", Math.round(averageScore * 100.0) / 100.0);

                        System.out.println("🔵 Exam " + exam.getTitle() + " has " + studentsTakenExam + " students who have taken it");

                        return examData;
                    })
                    .collect(Collectors.toList());

            response.put("exams", examsData);

            // Calculate statistics
            long totalExams = teacherExams.size();
            long totalQuestions = teacherExams.stream()
                    .mapToLong(exam -> exam.getQuestions() != null ? exam.getQuestions().size() : 0)
                    .sum();

            // FIX: Count students who have taken exams
            Set<Long> distinctStudentIds = new HashSet<>();
            System.out.println("🔵 Calculating students who have taken exams...");

            for (Exam exam : teacherExams) {
                System.out.println("🔵 Checking exam: " + exam.getTitle() + " (ID: " + exam.getId() + ")");
                List<ExamResult> results = examService.getExamResultsByExam(exam.getId());
                System.out.println("🔵 Found " + results.size() + " results for this exam");

                results.forEach(result -> {
                    if (result.getStudent() != null) {
                        Long studentId = result.getStudent().getId();
                        distinctStudentIds.add(studentId);
                        System.out.println("🔵 Added student ID: " + studentId);
                    }
                });
            }

            long totalStudentsTakenExams = distinctStudentIds.size();
            System.out.println("🔵 Total students who have taken exams: " + totalStudentsTakenExams);

            // Get total number of student users in system (if you want to show enrolled students)
            long totalEnrolledStudents = userService.countStudents(); // You need to create this method

            long activeExams = teacherExams.stream()
                    .filter(exam -> exam.getStatus() == com.examsystem.model.ExamStatus.PUBLISHED)
                    .count();

            System.out.println("🔵 Final stats: Exams=" + totalExams +
                    ", Questions=" + totalQuestions +
                    ", StudentsTakenExams=" + totalStudentsTakenExams +
                    ", TotalEnrolledStudents=" + totalEnrolledStudents +
                    ", Active=" + activeExams);

            // Update response to show BOTH metrics
            response.put("stats", Map.of(
                    "totalExams", totalExams,
                    "totalQuestions", totalQuestions,
                    "studentsTakenExams", totalStudentsTakenExams, // Students who have actually taken exams
                    "totalEnrolledStudents", totalEnrolledStudents, // All student users in system
                    "activeExams", activeExams
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("🔴 Dashboard Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/exams/{examId}")
    @Operation(summary = "Delete an exam")
    public ResponseEntity<?> deleteExam(@PathVariable Long examId,
                                        @AuthenticationPrincipal User user) {
        try {
            examService.deleteExam(examId, user);
            return ResponseEntity.ok(Map.of(
                    "message", "Exam deleted successfully",
                    "examId", examId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/exams")
    @Operation(summary = "Get all exams for teacher")
    public ResponseEntity<?> getAllExams(@AuthenticationPrincipal User user) {
        try {
            System.out.println("Fetching exams for teacher: " + user.getId());

            List<Exam> exams = examService.getExamsByTeacher(user);

            // Load questions for each exam to avoid lazy loading issues
            exams.forEach(exam -> {
                if (exam.getQuestions() != null) {
                    exam.getQuestions().size();
                }
            });

            System.out.println("Found " + exams.size() + " exams");

            List<Map<String, Object>> response = exams.stream()
                    .map(exam -> {
                        Map<String, Object> examData = new HashMap<>();
                        examData.put("id", exam.getId());
                        examData.put("title", exam.getTitle());
                        examData.put("description", exam.getDescription());
                        examData.put("duration", exam.getDurationMinutes());
                        examData.put("totalMarks", exam.getTotalMarks());
                        examData.put("passingMarks", exam.getPassingMarks());
                        examData.put("status", exam.getStatus().toString());

                        int questionCount = exam.getQuestions() != null ? exam.getQuestions().size() : 0;
                        examData.put("questionCount", questionCount);

                        // FIXED: Use teacher instead of createdBy
                        String teacherName = exam.getTeacher() != null ? exam.getTeacher().getFullName() : "Unknown";
                        examData.put("createdBy", teacherName); // Still called createdBy in response for frontend compatibility

                        examData.put("createdAt", exam.getCreatedAt());
                        examData.put("publishedAt", exam.getPublishedAt());

                        return examData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to fetch exams: " + e.getMessage()));
        }
    }

    @GetMapping("/exams/{examId}")
    @Operation(summary = "Get exam details with correct answers (for teachers)")
    public ResponseEntity<?> getTeacherExamById(@PathVariable Long examId,
                                                @AuthenticationPrincipal User user) {
        try {
            Exam exam = examService.getExamById(examId);

            if (exam.getTeacher() == null || !exam.getTeacher().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not authorized to access this exam"));
            }

            if (exam.getQuestions() != null) {
                exam.getQuestions().size();
            }

            ExamResponse response = ExamResponse.builder()
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
                    .startTime(exam.getStartTime()) // Add this
                    .endTime(exam.getEndTime())     // Add this
                    .questionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0)
                    .questions(exam.getQuestions().stream()
                            .map(q -> QuestionResponse.builder()
                                    .id(q.getId())
                                    .text(q.getText())
                                    .type(q.getType())
                                    .option1(q.getOption1())
                                    .option2(q.getOption2())
                                    .option3(q.getOption3())
                                    .option4(q.getOption4())
                                    .correctAnswer(q.getCorrectAnswer())
                                    .points(q.getPoints())
                                    .explanation(q.getExplanation())
                                    .build())
                            .collect(Collectors.toList()))
                    .build();

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Exam not found: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/exams")
    @Operation(summary = "Create a new exam")
    public ResponseEntity<?> createExam(@RequestBody com.examsystem.dto.exam.CreateExamRequest request,
                                        @AuthenticationPrincipal User user) {
        try {
            Exam createdExam = examService.createExam(request, user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", createdExam.getId());
            response.put("title", createdExam.getTitle());
            response.put("message", "Exam created successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/exams/{examId}")
    @Operation(summary = "Update an existing exam")
    public ResponseEntity<?> updateExam(@PathVariable Long examId,
                                        @RequestBody com.examsystem.dto.exam.CreateExamRequest request,
                                        @AuthenticationPrincipal User user) {
        try {
            Exam updatedExam = examService.updateExam(examId, request, user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedExam.getId());
            response.put("title", updatedExam.getTitle());
            response.put("message", "Exam updated successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/exams/{examId}/results")
    @Operation(summary = "Get results for a specific exam")
    public ResponseEntity<?> getExamResults(@PathVariable Long examId,
                                            @AuthenticationPrincipal User user) {
        try {
            // Verify teacher owns the exam
            Exam exam = examService.getExamById(examId);

            // FIXED: Use getTeacher() instead of getCreatedBy()
            if (exam.getTeacher() == null || !exam.getTeacher().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not authorized to access these results"));
            }

            List<com.examsystem.model.ExamResult> results = examService.getExamResultsByExam(examId);

            List<Map<String, Object>> response = results.stream()
                    .map(result -> {
                        Map<String, Object> resultData = new HashMap<>();
                        resultData.put("id", result.getId());
                        resultData.put("examId", result.getExam().getId());
                        resultData.put("examTitle", result.getExam().getTitle());
                        resultData.put("studentId", result.getStudent().getId());
                        resultData.put("studentName", result.getStudent().getFullName());
                        resultData.put("score", result.getScore());
                        resultData.put("totalMarks", result.getTotalMarks());
                        resultData.put("percentage", result.getPercentage());
                        resultData.put("status", result.getStatus().toString());
                        resultData.put("timeTaken", result.getTimeTaken());
                        resultData.put("submittedAt", result.getSubmittedAt());
                        return resultData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/exams/{examId}/publish")
    @Operation(summary = "Publish an exam")
    public ResponseEntity<?> publishExam(@PathVariable Long examId,
                                         @AuthenticationPrincipal User user) {
        try {
            Exam exam = examService.getExamById(examId);

            // FIXED: Use getTeacher() instead of getCreatedBy()
            if (exam.getTeacher() == null || !exam.getTeacher().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not authorized to publish this exam"));
            }

            // Check if exam can be published (has questions)
            if (exam.getQuestions() == null || exam.getQuestions().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot publish exam without questions"));
            }

            // Publish the exam
            exam.setStatus(com.examsystem.model.ExamStatus.PUBLISHED);
            exam.setIsPublished(true);
            exam.setPublishedAt(LocalDateTime.now());

            Exam savedExam = examRepository.save(exam);

            return ResponseEntity.ok(Map.of(
                    "message", "Exam published successfully",
                    "examId", savedExam.getId(),
                    "status", savedExam.getStatus(),
                    "isPublished", savedExam.getIsPublished(),
                    "publishedAt", savedExam.getPublishedAt()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}