package com.examsystem.dto.exam;

import com.examsystem.model.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {
    @NotBlank
    private String text;

    @NotNull
    private String type; // Change from QuestionType to String

    private String option1;
    private String option2;
    private String option3;
    private String option4;

    @NotBlank
    private String correctAnswer;

    @NotNull
    @Positive
    private Integer points;

    private String explanation;

    // Helper method to convert string to enum
    public QuestionType getTypeEnum() {
        try {
            return QuestionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return QuestionType.MULTIPLE_CHOICE; // Default
        }
    }
}