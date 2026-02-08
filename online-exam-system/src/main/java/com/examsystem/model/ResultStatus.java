package com.examsystem.model;

public enum ResultStatus {
    IN_PROGRESS,  // 11 characters
    SUBMITTED,    // 9 characters
    GRADED,       // 6 characters
    EXPIRED,      // 7 characters

    // If you need PASSED/FAILED logic, you can map them
    PASSED {
        @Override
        public String toString() {
            return "GRADED"; // Map PASSED to GRADED
        }
    },
    FAILED {
        @Override
        public String toString() {
            return "GRADED"; // Map FAILED to GRADED
        }
    };
}