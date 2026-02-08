package com.examsystem.dto.exam;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TakeExamRequest {
    @NotNull
    private List<AnswerRequest> answers;

    @NotNull
    private Integer timeTaken; // in minutes
}