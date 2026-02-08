package com.examsystem.dto.exam;

import com.examsystem.model.ResultStatus;
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
public class ExamResultResponse {
    private Long id;
    private Long examId;
    private String examTitle;
    private String studentName;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private ResultStatus status;
    private Integer timeTaken;
    private LocalDateTime submittedAt;
    private List<AnswerResponse> answers;
}