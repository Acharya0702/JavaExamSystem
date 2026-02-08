package com.examsystem.dto.exam;

import com.examsystem.model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private String text;
    private QuestionType type;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String correctAnswer;
    private Integer points;
    private String explanation;
}