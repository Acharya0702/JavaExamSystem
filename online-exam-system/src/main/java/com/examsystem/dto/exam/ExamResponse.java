package com.examsystem.dto.exam;

import com.examsystem.model.ExamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {
    private Long id;
    private String title;
    private String description;
    private Integer duration;
    private Integer totalMarks;
    private Integer passingMarks;
    private ExamStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;
    private Integer questionCount;
    private LocalDateTime startTime; // Add this
    private LocalDateTime endTime;   // Add this
    private List<QuestionResponse> questions;
}