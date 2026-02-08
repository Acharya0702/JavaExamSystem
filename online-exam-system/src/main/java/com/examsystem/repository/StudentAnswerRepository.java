// src/main/java/com/examsystem/repository/StudentAnswerRepository.java
package com.examsystem.repository;

import com.examsystem.model.ExamResult;
import com.examsystem.model.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByExamResult(ExamResult examResult);
    List<StudentAnswer> findByExamResultId(Long examResultId);
}