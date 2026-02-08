package com.examsystem.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponse {
    private Long id;
    private Long questionId;
    private String questionText;
    private String studentAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private Integer pointsAwarded;
    private Integer questionPoints;
    private String explanation;
}