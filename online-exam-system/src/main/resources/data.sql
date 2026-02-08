-- Insert Admin User (password: admin123)
INSERT INTO users (username, password, email, role, full_name, enabled)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'admin@examsystem.com', 'ADMIN', 'System Admin', true);

-- Insert Teacher (password: teacher123)
INSERT INTO users (username, password, email, role, full_name, enabled)
VALUES ('teacher', '$2a$10$YourHashedPasswordHere', 'teacher@examsystem.com', 'TEACHER', 'John Teacher', true);

-- Insert Student (password: student123)
INSERT INTO users (username, password, email, role, full_name, enabled)
VALUES ('student', '$2a$10$YourHashedPasswordHere', 'student@examsystem.com', 'STUDENT', 'Jane Student', true);