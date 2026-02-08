// src/main/java/com/examsystem/repository/ExamResultRepository.java
package com.examsystem.repository;

import com.examsystem.model.Exam;
import com.examsystem.model.ExamResult;
import com.examsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    @Query("SELECT r FROM ExamResult r LEFT JOIN FETCH r.exam WHERE r.student = :student AND r.exam = :exam")
    Optional<ExamResult> findByStudentAndExam(@Param("student") User student, @Param("exam") Exam exam);
    List<ExamResult> findByStudent(User student);
    List<ExamResult> findByExam(Exam exam);
    Optional<ExamResult> findByExamAndStudent(Exam exam, User student);
    long countByExam(Exam exam);
    long countByStudent(User student);
}