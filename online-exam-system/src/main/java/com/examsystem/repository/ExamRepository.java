package com.examsystem.repository;

import com.examsystem.model.Exam;
import com.examsystem.model.ExamStatus;
import com.examsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    // FIXED: Changed from findByCreatedBy to findByTeacher
    @Query("SELECT DISTINCT e FROM Exam e LEFT JOIN FETCH e.questions WHERE e.teacher = :teacher")
    List<Exam> findByTeacher(@Param("teacher") User teacher);

    @Query("SELECT DISTINCT e FROM Exam e LEFT JOIN FETCH e.questions WHERE e.status = :status")
    List<Exam> findByStatus(@Param("status") ExamStatus status);

    // FIXED: Changed from findByCreatedByAndStatus to findByTeacherAndStatus
    @Query("SELECT DISTINCT e FROM Exam e LEFT JOIN FETCH e.questions WHERE e.teacher = :teacher AND e.status = :status")
    List<Exam> findByTeacherAndStatus(@Param("teacher") User teacher, @Param("status") ExamStatus status);

    // FIXED: Changed LEFT JOIN FETCH e.createdBy to LEFT JOIN FETCH e.teacher
    @Query("SELECT DISTINCT e FROM Exam e LEFT JOIN FETCH e.questions LEFT JOIN FETCH e.teacher WHERE e.id = :id")
    Optional<Exam> findByIdWithQuestions(@Param("id") Long id);

    // FIXED: Changed countByCreatedBy to countByTeacher
    long countByTeacher(User teacher);

    long countByStatus(ExamStatus status);
}