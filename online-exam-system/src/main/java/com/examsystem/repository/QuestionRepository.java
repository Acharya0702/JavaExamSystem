// src/main/java/com/examsystem/repository/QuestionRepository.java
package com.examsystem.repository;

import com.examsystem.model.Exam;
import com.examsystem.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExam(Exam exam);
    void deleteByExam(Exam exam);
}