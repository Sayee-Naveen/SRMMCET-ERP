-- SQL Schema & Seed Data for Medical + Disciplinary Module

CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    incident_date VARCHAR(20) NOT NULL,
    diagnosis_details TEXT NOT NULL,
    doctor_hospital_name VARCHAR(150),
    treatment_prescribed TEXT,
    document_url VARCHAR(255),
    signature_url VARCHAR(255),
    recorded_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS disciplinary_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    incident_date VARCHAR(20) NOT NULL,
    action_date VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    report_description TEXT NOT NULL,
    action_taken VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Active',
    supporting_doc_url VARCHAR(255),
    student_signature_url VARCHAR(255),
    authority_signature_url VARCHAR(255),
    recorded_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Seed Sample Medical Data
INSERT INTO medical_records (student_id, record_type, incident_date, diagnosis_details, doctor_hospital_name, treatment_prescribed, recorded_by)
VALUES 
(1, 'Medical Leave', '2026-02-10', 'Viral fever and severe dehydration', 'Apollo Hospital, Madurai', '5 days medical rest and IV hydration', 'Dr. Arunkumar'),
(1, 'Routine Checkup', '2026-01-15', 'Annual vision checkup - mild astigmatism noted', 'Campus Medical Clinic', 'Prescribed anti-glare glasses for reading', 'Campus Medical Team');

-- Seed Sample Disciplinary Data
INSERT INTO disciplinary_actions (student_id, incident_date, action_date, category, report_description, action_taken, status, recorded_by)
VALUES
(1, '2026-03-01', '2026-03-03', 'Attendance Shortage', 'Student attendance dropped below 75% threshold in Semester 4.', 'Parent Summoned', 'Active', 'HOD / Disciplinary Committee');
