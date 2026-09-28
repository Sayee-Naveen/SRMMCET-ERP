-- ============================================================
-- SRM MCET - Semester Results Module Database Schema & Seed Data
-- Database: srm_erp
-- MySQL 8.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS srm_erp;
USE srm_erp;

-- Disable foreign key checks during cleanup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS semester_results;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS faculty_sections;
DROP TABLE IF EXISTS section_students;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS grade_scale;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. COURSES TABLE
-- ============================================================
CREATE TABLE courses (
    course_id    INT AUTO_INCREMENT PRIMARY KEY,
    course_name  VARCHAR(150) NOT NULL,
    short_name   VARCHAR(30)  NOT NULL,
    degree       VARCHAR(20)  NOT NULL,
    branch_code  VARCHAR(10)  NOT NULL UNIQUE,
    duration_yrs INT          NOT NULL DEFAULT 4,
    total_sems   INT          NOT NULL DEFAULT 8
);

-- Seed 12 SRMMCET Courses (9 UG, 3 PG)
INSERT INTO courses (course_name, short_name, degree, branch_code, duration_yrs, total_sems) VALUES
('B.E. Computer Science and Engineering', 'CSE', 'B.E.', '104', 4, 8),
('B.E. Computer Science and Engineering (Cyber Security)', 'CSE-CS', 'B.E.', '119', 4, 8),
('B.E. Computer Science and Engineering (AI & ML)', 'CSE-AIML', 'B.E.', '120', 4, 8),
('B.Tech Information Technology', 'IT', 'B.Tech', '205', 4, 8),
('B.Tech Artificial Intelligence & Data Science', 'AIDS', 'B.Tech', '724', 4, 8),
('B.E. Electrical & Electronics Engineering', 'EEE', 'B.E.', '105', 4, 8),
('B.E. Electronics & Communication Engineering', 'ECE', 'B.E.', '106', 4, 8),
('B.E. Mechanical Engineering', 'MECH', 'B.E.', '114', 4, 8),
('B.E. Civil Engineering', 'CIVIL', 'B.E.', '103', 4, 8),
('M.E. VLSI Design', 'ME-VLSI', 'M.E.', '431', 2, 4),
('M.E. Engineering Design', 'ME-ED', 'M.E.', '420', 2, 4),
('Master of Business Administration', 'MBA', 'MBA', '510', 2, 4);

-- ============================================================
-- 2. GRADE SCALE TABLE (R2021 and R2025)
-- ============================================================
CREATE TABLE grade_scale (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    regulation    VARCHAR(10)  NOT NULL,
    grade_letter  VARCHAR(5)   NOT NULL,
    grade_point   DECIMAL(4,2) NOT NULL,
    marks_min     INT          DEFAULT NULL,
    marks_max     INT          DEFAULT NULL,
    is_pass       TINYINT(1)   NOT NULL DEFAULT 1,
    display_order INT          NOT NULL,
    UNIQUE KEY uq_reg_grade (regulation, grade_letter)
);

-- Seed R2021 Grade Scale (Relative)
INSERT INTO grade_scale (regulation, grade_letter, grade_point, is_pass, display_order) VALUES
('R2021', 'O',  10.00, 1, 1),
('R2021', 'A+',  9.00, 1, 2),
('R2021', 'A',   8.00, 1, 3),
('R2021', 'B+',  7.00, 1, 4),
('R2021', 'B',   6.00, 1, 5),
('R2021', 'C',   5.00, 1, 6),
('R2021', 'U',   0.00, 0, 7),
('R2021', 'SA',  0.00, 0, 8),
('R2021', 'WH',  0.00, 0, 9);

-- Seed R2025 Grade Scale (Absolute)
INSERT INTO grade_scale (regulation, grade_letter, grade_point, marks_min, marks_max, is_pass, display_order) VALUES
('R2025', 'S',  10.00, 91, 100, 1, 1),
('R2025', 'A+',  9.00, 81,  90, 1, 2),
('R2025', 'A',   8.00, 71,  80, 1, 3),
('R2025', 'B+',  7.00, 66,  70, 1, 4),
('R2025', 'B',   6.50, 61,  65, 1, 5),
('R2025', 'C+',  6.00, 56,  60, 1, 6),
('R2025', 'C',   5.00, 50,  55, 1, 7),
('R2025', 'U',   0.00,  0,  49, 0, 8),
('R2025', 'SA',  0.00,  0,   0, 0, 9),
('R2025', 'WC',  0.00,  0,   0, 0, 10);

-- ============================================================
-- 3. STUDENTS TABLE
-- ============================================================
CREATE TABLE students (
    student_id   INT AUTO_INCREMENT PRIMARY KEY,
    reg_no       VARCHAR(20)  NOT NULL UNIQUE,
    name         VARCHAR(100) NOT NULL,
    course_id    INT          NOT NULL,
    batch_year   INT          NOT NULL,
    regulation   VARCHAR(10)  NOT NULL,
    current_sem  INT          NOT NULL DEFAULT 1,
    section      VARCHAR(10)  DEFAULT 'A',
    is_active    TINYINT(1)   NOT NULL DEFAULT 1,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- Seed Sample Students
INSERT INTO students (reg_no, name, course_id, batch_year, regulation, current_sem, section) VALUES
('911124104001', 'Arjun R',          1, 2024, 'R2021', 2, 'A'),
('911124104002', 'Priya S',          1, 2024, 'R2021', 2, 'A'),
('911124104003', 'Vijay K',          1, 2024, 'R2021', 2, 'A'),
('911123104001', 'Dharani K',        1, 2023, 'R2021', 4, 'A'),
('911125104001', 'Suresh M',         1, 2025, 'R2025', 1, 'A'),
('911124205001', 'Karthik M',        4, 2024, 'R2021', 2, 'A'),
('911124205002', 'Lakshmi N',        4, 2024, 'R2021', 2, 'A'),
('911125205001', 'Ravi T',           4, 2025, 'R2025', 1, 'A');

-- ============================================================
-- 4. SUBJECTS TABLE
-- ============================================================
CREATE TABLE subjects (
    subject_id   INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20)  NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    credits      DECIMAL(4,2) NOT NULL,
    subject_type VARCHAR(20)  NOT NULL, -- Theory, Practical, Activity
    semester     INT          NOT NULL,
    course_id    INT          NOT NULL,
    regulation   VARCHAR(10)  NOT NULL,
    is_active    TINYINT(1)   NOT NULL DEFAULT 1,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE KEY uq_sub (subject_code, course_id, regulation)
);

-- Real Anna University R2021 CSE Subjects (Sem 1 & 2)
INSERT INTO subjects (subject_code, subject_name, credits, subject_type, semester, course_id, regulation) VALUES
-- CSE R2021 Sem 1
('HS3151', 'Professional English - I',                 3.0, 'Theory',    1, 1, 'R2021'),
('MA3151', 'Matrices and Calculus',                    4.0, 'Theory',    1, 1, 'R2021'),
('PH3151', 'Engineering Physics',                      3.0, 'Theory',    1, 1, 'R2021'),
('CY3151', 'Engineering Chemistry',                    3.0, 'Theory',    1, 1, 'R2021'),
('GE3151', 'Problem Solving and Python Programming',    3.0, 'Theory',    1, 1, 'R2021'),
('GE3152', 'Heritage of Tamils',                       1.0, 'Theory',    1, 1, 'R2021'),
('GE3171', 'Python Programming Laboratory',            2.0, 'Practical', 1, 1, 'R2021'),
('BS3171', 'Physics and Chemistry Laboratory',         2.0, 'Practical', 1, 1, 'R2021'),
('GE3172', 'English Laboratory',                       1.0, 'Practical', 1, 1, 'R2021'),
-- CSE R2021 Sem 2
('HS3251', 'Professional English - II',                2.0, 'Theory',    2, 1, 'R2021'),
('MA3251', 'Statistics and Numerical Methods',         4.0, 'Theory',    2, 1, 'R2021'),
('PH3256', 'Physics for Information Science',          3.0, 'Theory',    2, 1, 'R2021'),
('BE3251', 'Basic Electrical and Electronics Engg',    3.0, 'Theory',    2, 1, 'R2021'),
('GE3251', 'Engineering Graphics',                     4.0, 'Theory',    2, 1, 'R2021'),
('CS3251', 'Programming in C',                         3.0, 'Theory',    2, 1, 'R2021'),
('GE3252', 'Tamils and Technology',                    1.0, 'Theory',    2, 1, 'R2021'),
('GE3271', 'Engineering Practices Laboratory',         2.0, 'Practical', 2, 1, 'R2021'),
('CS3271', 'Programming in C Laboratory',              2.0, 'Practical', 2, 1, 'R2021'),
-- CSE R2025 Sem 1
('HS4151', 'Technical English',                        3.0, 'Theory',    1, 1, 'R2025'),
('MA4151', 'Linear Algebra and Calculus',              4.0, 'Theory',    1, 1, 'R2025'),
('PH4151', 'Applied Physics',                          3.0, 'Theory',    1, 1, 'R2025'),
('CS4151', 'Programming Fundamentals',                 3.0, 'Theory',    1, 1, 'R2025'),
('CS4171', 'Programming Fundamentals Lab',             2.0, 'Practical', 1, 1, 'R2025'),
-- IT R2021 Sem 1
('HS3151_IT', 'Professional English - I',              3.0, 'Theory',    1, 4, 'R2021'),
('MA3151_IT', 'Matrices and Calculus',                 4.0, 'Theory',    1, 4, 'R2021'),
('IT3151',    'Python for Data Science',               3.0, 'Theory',    1, 4, 'R2021'),
('IT3171',    'Python Data Science Lab',               2.0, 'Practical', 1, 4, 'R2021');

-- ============================================================
-- 5. FACULTY TABLE
-- ============================================================
CREATE TABLE faculty (
    faculty_id   INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    full_name    VARCHAR(100) NOT NULL,
    department   VARCHAR(100) NOT NULL,
    role         ENUM('faculty','admin') NOT NULL DEFAULT 'faculty',
    is_active    TINYINT(1)   NOT NULL DEFAULT 1
);

-- Seed Demo Faculty & Admin Accounts
INSERT INTO faculty (username, password, full_name, department, role) VALUES
('admin',      'admin123',  'ERP Administrator', 'Academic Cell', 'admin'),
('prof.kumar', 'kumar123',  'Dr. R. Kumar',      'Computer Science', 'faculty'),
('prof.meena', 'meena123',  'Dr. S. Meena',      'Information Technology', 'faculty');

-- ============================================================
-- 6. SECTIONS TABLE
-- ============================================================
CREATE TABLE sections (
    section_id   INT AUTO_INCREMENT PRIMARY KEY,
    section_name VARCHAR(50)  NOT NULL,
    course_id    INT          NOT NULL,
    batch_year   INT          NOT NULL,
    regulation   VARCHAR(10)  NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

INSERT INTO sections (section_name, course_id, batch_year, regulation) VALUES
('CSE-A-2024', 1, 2024, 'R2021'),
('CSE-A-2025', 1, 2025, 'R2025'),
('IT-A-2024',  4, 2024, 'R2021');

-- ============================================================
-- 7. SECTION_STUDENTS TABLE
-- ============================================================
CREATE TABLE section_students (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    student_id INT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    UNIQUE KEY uq_sec_stu (section_id, student_id)
);

INSERT INTO section_students (section_id, student_id) VALUES
(1, 1), -- Arjun R -> CSE-A-2024
(1, 2), -- Priya S -> CSE-A-2024
(1, 3), -- Vijay K -> CSE-A-2024
(2, 5), -- Suresh M -> CSE-A-2025
(3, 6), -- Karthik M -> IT-A-2024
(3, 7); -- Lakshmi N -> IT-A-2024

-- ============================================================
-- 8. FACULTY_SECTIONS TABLE
-- ============================================================
CREATE TABLE faculty_sections (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    section_id INT NOT NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    UNIQUE KEY uq_fac_sec (faculty_id, section_id)
);

INSERT INTO faculty_sections (faculty_id, section_id) VALUES
(2, 1), -- prof.kumar -> CSE-A-2024
(2, 2), -- prof.kumar -> CSE-A-2025
(3, 3); -- prof.meena -> IT-A-2024

-- ============================================================
-- 9. MARKS TABLE
-- ============================================================
CREATE TABLE marks (
    mark_id      INT AUTO_INCREMENT PRIMARY KEY,
    reg_no       VARCHAR(20)  NOT NULL,
    subject_id   INT          NOT NULL,
    semester     INT          NOT NULL,
    attempt      INT          NOT NULL DEFAULT 1,
    grade_letter VARCHAR(5)   NOT NULL,
    grade_point  DECIMAL(4,2) NOT NULL,
    is_pass      TINYINT(1)   NOT NULL DEFAULT 1,
    entered_by   INT          DEFAULT NULL,
    entered_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    UNIQUE KEY uq_mark (reg_no, subject_id, attempt)
);

-- Seed Marks for Arjun R (911124104001) - Sem 1
INSERT INTO marks (reg_no, subject_id, semester, attempt, grade_letter, grade_point, is_pass, entered_by) VALUES
('911124104001', 1, 1, 1, 'O',  10.00, 1, 2),
('911124104001', 2, 1, 1, 'A+',  9.00, 1, 2),
('911124104001', 3, 1, 1, 'A',   8.00, 1, 2),
('911124104001', 4, 1, 1, 'B+',  7.00, 1, 2),
('911124104001', 5, 1, 1, 'A',   8.00, 1, 2),
('911124104001', 6, 1, 1, 'O',  10.00, 1, 2),
('911124104001', 7, 1, 1, 'A+',  9.00, 1, 2),
('911124104001', 8, 1, 1, 'O',  10.00, 1, 2),
('911124104001', 9, 1, 1, 'A',   8.00, 1, 2);

-- ============================================================
-- 10. SEMESTER_RESULTS TABLE
-- ============================================================
CREATE TABLE semester_results (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    reg_no        VARCHAR(20)  NOT NULL,
    semester      INT          NOT NULL,
    sgpa          DECIMAL(4,2) NOT NULL,
    cgpa          DECIMAL(4,2) NOT NULL,
    total_credits DECIMAL(6,2) NOT NULL,
    computed_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sem_res (reg_no, semester)
);

-- Seed Semester Result for Arjun R Sem 1
INSERT INTO semester_results (reg_no, semester, sgpa, cgpa, total_credits) VALUES
('911124104001', 1, 8.77, 8.77, 21.00);
