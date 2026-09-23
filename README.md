# Faculty-Student Academic Management System

> **FACULTY & STUDENT MANAGEMENT MODULE**
>
> A production-ready, modular Faculty-Student Management module for a college administration system.
> Designed to digitally replace the information maintained in the college **Student's Data Book**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [User Roles](#2-user-roles)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Faculty Dashboard](#4-faculty-dashboard)
5. [Faculty Management](#5-faculty-management)
6. [Student Profile](#6-student-profile)
7. [Counselor Information](#7-counselor-information)
8. [Parent / Guardian Information](#8-parent--guardian-information)
9. [Academic Management](#9-academic-management)
10. [Attendance](#10-attendance)
11. [Periodical Test Marks](#11-periodical-test-marks)
12. [University Results](#12-university-results)
13. [Semester Remarks](#13-semester-remarks)
14. [Arrear Management](#14-arrear-management)
15. [Placement / Higher Studies](#15-placement--higher-studies)
16. [Parent Meetings](#16-parent-meetings)
17. [Student Counseling](#17-student-counseling)
18. [Student Search & Filters](#18-student-search--filters)
19. [Faculty Allocation](#19-faculty-allocation)
20. [Role-Based Access Control](#20-role-based-access-control)
21. [Audit Logs](#21-audit-logs)
22. [Data Validation](#22-data-validation)
23. [Security](#23-security)
24. [File / Photo Management](#24-file--photo-management)
25. [Reporting](#25-reporting)
26. [Database Design](#26-database-design)
27. [API Structure](#27-api-structure)
28. [UI/UX Requirements](#28-uiux-requirements)
29. [Workflows](#29-workflows)
30. [Data Import](#30-data-import)
31. [Performance](#31-performance)
32. [Error Handling](#32-error-handling)
33. [Development Requirements](#33-development-requirements)
34. [Testing](#34-testing)
35. [Implementation Phases](#35-implementation-phases)
36. [Acceptance Criteria](#36-acceptance-criteria)
37. [Final Instructions](#37-final-instructions)

---

## 1. Project Overview

| Field | Details |
|---|---|
| **Module Name** | Faculty-Student Academic Management System |
| **Purpose** | Digitally manage student academic records maintained in the college Student's Data Book |
| **Primary Roles** | Admin, Faculty |
| **Integration** | Modular - integrates into an existing college ERP system |
| **Data Storage** | All data stored dynamically - no hard-coded student information |
| **UI** | Clean, professional, responsive (desktop / tablet / mobile) |

> [!IMPORTANT]
> Do **not** create unnecessary modules outside the defined scope.
> Keep the module isolated so it can be plugged into an existing college management system later.

---

## 2. User Roles

### A. ADMIN - Full Management Access

| # | Capability |
|---|---|
| 1 | Admin Dashboard |
| 2 | Create Faculty |
| 3 | Edit Faculty |
| 4 | View Faculty |
| 5 | Activate / Deactivate Faculty |
| 6 | Reset Faculty access |
| 7 | Create Student |
| 8 | Edit Student |
| 9 | View Student |
| 10 | Search Students |
| 11 | Filter Students |
| 12 | Allocate Students to Faculty |
| 13 | Reassign Students across Faculty |
| 14 | View Faculty-wise Student Lists |
| 15 | View overall academic information |
| 16 | View student performance |
| 17 | View attendance |
| 18 | View marks |
| 19 | View arrears |
| 20 | View counseling history |
| 21 | View parent-meeting history |
| 22 | View placement / higher-study information |
| 23 | Generate student reports |
| 24 | Generate faculty-wise reports |

> Admin can view the **complete student profile**.
> Admin must **not** need to manually enter duplicate information when assigning students to faculty.

---

### B. FACULTY - Assigned Students Only

Faculty can access **only students assigned to them**.

| # | Capability |
|---|---|
| 1 | Faculty Dashboard |
| 2 | View assigned students |
| 3 | Search assigned students |
| 4 | Filter assigned students |
| 5 | View student profile |
| 6 | Add / edit permitted student information |
| 7 | Manage academic information |
| 8 | Manage attendance |
| 9 | Manage periodical test marks |
| 10 | Manage university-result information |
| 11 | Manage arrears information |
| 12 | Add placement / higher-study records |
| 13 | Add parent-meeting records |
| 14 | Add student-counseling records |
| 15 | Add / update remarks |
| 16 | Generate / view student reports |

> [!WARNING]
> Faculty must **NOT** be able to:
> - Create another Admin or unrestricted Faculty accounts
> - View students assigned to other faculty (unless explicitly authorized by Admin)
> - Change system permissions or their own role
> - Access Admin-only configuration

---

## 3. Admin Dashboard

A professional dashboard dynamically calculated from the database.

### Cards / KPIs

- Total Students
- Total Faculty
- Students Assigned
- Unassigned Students

### Charts & Lists

- Students by Department / Branch
- Students by Batch
- Students with Arrears
- Students with Attendance Issues
- Recent Counseling Records
- Recent Parent Meetings
- Recent Academic Updates

> All dashboard data must be **dynamically calculated** - no static/mocked values.

---

## 4. Faculty Dashboard

### Cards / KPIs

- Total Assigned Students
- Students by Batch
- Students by Branch
- Students with Arrears
- Students Requiring Attention

### Activity Feed

- Recent Counseling
- Recent Parent Meetings
- Recent Mark Updates
- Attendance Summary

### Quick Actions

| Action | Description |
|---|---|
| Add Student Record | Jump to student creation |
| Enter Marks | Quick mark entry |
| Update Attendance | Quick attendance update |
| Add Counseling | Log a counseling session |
| Add Parent Meeting | Log a parent meeting |
| Search Student | Instant search |

---

## 5. Faculty Management

Admin can create and manage faculty accounts.

### Faculty Fields

| Field | Notes |
|---|---|
| Faculty ID | Auto-generated or admin-assigned |
| Full Name | |
| Email | Unique - used for login |
| Mobile Number | |
| Department | |
| Designation | |
| Username / Email | Login identifier |
| Password | Hashed - never displayed after creation |
| Profile Photo | Uploaded securely |
| Status | Active / Inactive |
| Created Date | Auto-set |
| Last Login | Auto-updated |

> [!CAUTION]
> Passwords must be **hashed** using a secure algorithm (e.g., bcrypt).
> Passwords must **never** be displayed, logged, or returned via any API response.

---

## 6. Student Profile

A complete student profile organized into tabs / sections.

### Section A - Personal Information

| Field | Notes |
|---|---|
| Student Photo | Secure file upload |
| Student Name | |
| Roll Number | Unique |
| Registration Number | Unique |
| Date of Admission | |
| Batch | e.g., 2022-2026 |
| Branch | e.g., CSE, ECE |
| Department | |
| Aadhaar Number | Masked in normal view: XXXX XXXX 1234 |
| Date of Birth | |
| Blood Group | |
| Religion | |
| Gender | |
| Student Email ID | |
| Student Mobile Number | |

> [!CAUTION]
> Aadhaar and other PII must **not** be exposed in lists, dashboards, logs, or URLs.
> Only authorized users can reveal the full Aadhaar value.

---

## 7. Counselor Information

Each student may have an assigned counselor.

| Field | Notes |
|---|---|
| Counselor Name | Preferably linked to Faculty record |
| Counselor Department / Designation | Auto-populated from Faculty record |
| Counselor Email ID | Auto-populated from Faculty record |
| Counselor Mobile Number | Auto-populated from Faculty record |

> The system should **link counselors to existing Faculty records** to avoid data duplication.
> Selecting a faculty member as counselor should auto-populate their details.

---

## 8. Parent / Guardian Information

Supports three relationship types per student.

| Relationship | Required? |
|---|---|
| Father | Optional |
| Mother | Optional |
| Guardian | Optional |

### Fields per Parent / Guardian

| Field |
|---|
| Relationship (Father / Mother / Guardian) |
| Name |
| Photo |
| Occupation |
| Address |
| Contact Number |
| Email ID |
| Signature |

> Do **not** force all three records to exist. Guardian section is entirely optional.

---

## 9. Academic Management

### Semesters Supported

Semester 1 through Semester 8

> Do **not** hard-code the data structure to a single semester.
> Each semester contains multiple subjects.

### Subject Fields

| Field |
|---|
| Subject Code |
| Subject Name |

---

## 10. Attendance

Attendance is tracked **per subject, per semester**.

### Attendance Periods

| Period | Example Value |
|---|---|
| Attendance 1 | 82% |
| Attendance 2 | 85% |
| Attendance 3 | 90% |
| Attendance 4 | 88% |

- Store actual attendance values / percentages and assessment period dates.
- System should **automatically calculate overall attendance** when sufficient data exists.

---

## 11. Periodical Test Marks

Tracked **per subject, per semester**.

### Tests Supported

| Test | Example |
|---|---|
| Periodical Test 1 (PT1) | 38 / 50 |
| Periodical Test 2 (PT2) | 42 / 50 |
| Periodical Test 3 (PT3) | 44 / 50 |

### Fields per Test Record

| Field |
|---|
| Exam / Test Name |
| Marks Obtained |
| Maximum Marks |
| Exam Date |
| Remarks |

---

## 12. University Results

Semester-wise university results - **per subject**, not fixed meaningless columns.

### Results Supported

Result 1 through Result 8 (structured as individual subject results)

### Fields per Result Record

| Field | Options |
|---|---|
| Subject | |
| Result / Grade | |
| Grade Point | |
| Credits | |
| Result Status | Pass / Fail / RA / Absent / Withheld / Other |
| Attempt | |
| Semester | 1-8 |
| Remarks | |

---

## 13. Semester Remarks

- Each semester has a **Remarks** field.
- Faculty can add/edit remarks per their permissions.
- **Update history** must be maintained where practical.

---

## 14. Arrear Management

### Arrear Summary - Per Semester

| Semester | Arrear Count |
|---|---|
| Semester 1 | Dynamic |
| Semester 2 | Dynamic |
| ... | ... |
| Semester 8 | Dynamic |

### Additional Tracking

- Total Arrears (auto-calculated)
- History of Arrears
- Current / Standing Arrears

> [!TIP]
> The system must **automatically calculate total arrears** from subject-level records.
> Faculty must **not** manually calculate totals.

---

## 15. Placement / Higher Studies

A **repeatable** section supporting multiple records per student.

| Field | Options |
|---|---|
| Serial Number | Auto-increment |
| Organization / University Name | |
| Campus Selection / Degree | |
| Month | |
| Year | |
| Type | Placement / Higher Studies |
| Remarks | |

---

## 16. Parent Meetings

A chronological history of all parent meetings.

| Field |
|---|
| Serial Number |
| Date |
| Parent / Guardian Name |
| Parent / Guardian Contact |
| Purpose |
| Discussion Details |
| Action Taken |
| Remarks |
| Recorded By |
| Created Date |

> Allow **unlimited historical records**. Display chronologically.

---

## 17. Student Counseling

A chronological history of all counseling sessions.

| Field |
|---|
| Serial Number |
| Date |
| Faculty / Counselor |
| Counseling Details |
| Action Taken |
| Follow-up Date |
| Remarks |
| Recorded By |
| Created Date |

> Allow **unlimited records**. Display counseling history chronologically.

---

## 18. Student Search & Filters

### Search By

- Student Name
- Roll Number
- Registration Number
- Email
- Mobile Number
- Batch
- Branch
- Department
- Faculty
- Counselor

### Filter By

| Filter | Values |
|---|---|
| Batch | Dynamic |
| Branch | Dynamic |
| Faculty | Dynamic |
| Semester | 1-8 |
| Arrear Status | Has Arrears / Clear |
| Placement Status | Placed / Higher Studies / None |
| Attendance Status | Below threshold / Normal |

---

## 19. Faculty Allocation

A dedicated Admin interface for faculty-student allocation.

### Functions

| Function | Description |
|---|---|
| Assign Student | Link a student to a faculty |
| Remove Assignment | Unlink a student |
| Reassign Student | Move student to a different faculty |
| Bulk Assign Students | Assign multiple students at once |
| View Faculty Student Count | Dashboard-level insight |

> Maintain **allocation history** when a student is reassigned.

---

## 20. Role-Based Access Control

| Role | Access |
|---|---|
| **Admin** | Full access to all features |
| **Faculty** | Assigned students + permitted operations only |

> [!IMPORTANT]
> Every **API endpoint** must verify authentication and authorization server-side.
> Do **not** rely solely on frontend route protection - backend authorization is **mandatory**.

---

## 21. Audit Logs

### Fields Tracked

| Field | Description |
|---|---|
| User | Who performed the action |
| Role | Admin / Faculty |
| Action | e.g., CREATED, UPDATED, DELETED |
| Entity | e.g., Student, Faculty, Marks |
| Entity ID | Record identifier |
| Timestamp | ISO 8601 datetime |
| Previous Value | Where applicable |
| New Value | Where applicable |

### Events Logged

- Faculty created
- Student created
- Student assigned
- Student reassigned
- Marks updated
- Attendance updated
- Parent record updated
- Counseling added
- Student profile modified

---

## 22. Data Validation

| Validation | Rule |
|---|---|
| Required fields | Must not be empty |
| Email format | Valid RFC email |
| Mobile number | Valid 10-digit Indian mobile |
| Date fields | Valid date format |
| Marks range | 0 <= marks <= maximum marks |
| Attendance range | 0% to 100% |
| Roll Number | Unique per batch |
| Registration Number | Unique system-wide |
| Aadhaar | 12-digit, Luhn-validated if applicable |

> Do **not** silently accept invalid data. Return descriptive validation errors.

---

## 23. Security

| Requirement | Detail |
|---|---|
| Authentication | Secure login (JWT / session) |
| Password hashing | bcrypt or Argon2 |
| Role-based authorization | Every route and endpoint |
| Input validation | Both frontend and backend |
| SQL injection protection | Parameterized queries / ORM |
| XSS protection | Output encoding |
| CSRF protection | CSRF tokens for state-changing requests |
| File uploads | Type validation, size limits, safe filenames |
| Access-controlled files | Student photos / documents not publicly accessible |
| Audit logging | All sensitive operations |
| No passwords in logs | Enforce at all layers |
| No sensitive PII in URLs | Roll No., Aadhaar, etc. |
| No hard-coded secrets | Environment variables for all secrets |

> [!CAUTION]
> Aadhaar and PII must **not** appear in lists, dashboards, logs, or browser URLs.

---

## 24. File / Photo Management

### Supported Uploads

| Type | Field |
|---|---|
| Student Photo | Student profile |
| Father Photo | Parent section |
| Mother Photo | Parent section |
| Guardian Photo | Parent section |
| Parent / Guardian Signature | Parent section |

### Requirements

- Validate **file type** (JPEG, PNG, PDF only as applicable)
- Validate **file size** (enforce limits, e.g., max 2 MB for photos)
- Generate **safe, randomized filenames** - never trust original filenames
- Store files **outside the public web root** or in secure object storage
- Provide **image preview** in the UI
- Allow **replacement** of existing images
- Restrict access via **signed / access-controlled URLs**

---

## 25. Reporting

Configurable reports that include any combination of:

- Student Profile
- Personal Information
- Parent / Guardian Details
- Academic Information
- Attendance
- Periodical Marks
- University Results
- Arrears
- Placement / Higher Studies
- Parent Meetings
- Counseling
- Remarks

**Print-friendly formatting** required.
**PDF generation** must be properly formatted for **A4** printing.

---

## 26. Database Design

Use **normalized relational database** design with foreign keys and indexes.

### Recommended Tables

```
users
roles
faculty
students
parent_guardians
faculty_student_assignments
student_counselors
semesters
subjects
student_semesters
attendance
periodical_tests
periodical_marks
university_results
arrears
placement_higher_studies
parent_meetings
student_counseling
student_remarks
file_uploads
audit_logs
```

### Entity Relationships

```
User
  +-- Faculty

Faculty
  +-- Faculty Student Assignment
        +-- Student

Student
  +-- Parent / Guardian
  +-- Semester
  |     +-- Subjects
  |           +-- Attendance (x4)
  |           +-- Periodical Marks (PT1, PT2, PT3)
  |           +-- University Results
  +-- Arrears
  +-- Placement / Higher Studies
  +-- Parent Meetings
  +-- Counseling
```

---

## 27. API Structure

RESTful API - follow existing project architecture where applicable.

### Authentication

```
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### Faculty (Admin)

```
GET    /admin/faculty
POST   /admin/faculty
GET    /admin/faculty/:id
PUT    /admin/faculty/:id
PATCH  /admin/faculty/:id/status
```

### Students

```
GET    /students
POST   /students
GET    /students/:id
PUT    /students/:id
DELETE /students/:id
```

### Allocation

```
GET    /admin/allocations
POST   /admin/allocations
PUT    /admin/allocations/:id
DELETE /admin/allocations/:id
```

### Academic

```
GET    /students/:id/academic
POST   /students/:id/subjects
PUT    /students/:id/subjects/:subjectId
```

### Attendance

```
GET    /students/:id/attendance
POST   /students/:id/attendance
PUT    /attendance/:id
```

### Marks

```
GET    /students/:id/marks
POST   /students/:id/marks
PUT    /marks/:id
```

### University Results

```
GET    /students/:id/results
POST   /students/:id/results
PUT    /results/:id
```

### Arrears

```
GET    /students/:id/arrears
POST   /students/:id/arrears
PUT    /arrears/:id
```

### Counseling

```
GET    /students/:id/counseling
POST   /students/:id/counseling
```

### Parent Meetings

```
GET    /students/:id/parent-meetings
POST   /students/:id/parent-meetings
```

### Placement / Higher Studies

```
GET    /students/:id/placements
POST   /students/:id/placements
```

### Reports

```
GET    /students/:id/report
```

---

## 28. UI/UX Requirements

### Design Style

- Professional, clean, minimal
- Fully responsive (desktop / tablet / mobile)
- Easy for **non-technical faculty users**
- Clear typography and consistent spacing
- Accessible forms with proper labels

### UX Components Required

| Component | Usage |
|---|---|
| Confirmation dialogs | Delete / reassign actions |
| Toast notifications | Success, error, info |
| Loading states | All async operations |
| Empty states | No records found |
| Error states | Failed API calls |
| Skeleton loading | List and profile pages |

### Admin Sidebar Navigation

```
Dashboard
Faculty
Students
Faculty Allocation
Academic
Reports
Audit Logs
Settings
```

### Faculty Sidebar Navigation

```
Dashboard
My Students
Attendance
Marks
Academic Records
Counseling
Parent Meetings
Placement / Higher Studies
Reports
```

---

## 29. Workflows

### Admin Workflow

```
1. Admin logs in
2. Admin creates Faculty account
3. Admin creates / imports students
4. Admin assigns students to Faculty
5. Faculty receives access to assigned students
6. Faculty manages academic / student records
7. Admin monitors all records
```

### Faculty Workflow

```
1.  Faculty logs in
2.  Dashboard displays assigned students
3.  Faculty selects a student
4.  Faculty opens Student Profile
5.  Faculty updates permitted information
6.  Faculty enters attendance / marks / results
7.  Faculty adds counseling or parent-meeting records
8.  System saves the information
9.  Audit log records important changes
10. Updated data becomes available in reports
```

---

## 30. Data Import

Admin can import students via **CSV / Excel**.

### Import Fields

- Student Name, Roll Number, Registration Number
- Batch, Branch, Department
- Date of Birth, Admission Date
- Email, Mobile
- Faculty Assignment

### Import Process

```
1. Validate columns
2. Validate data
3. Detect duplicates
4. Show preview to Admin
5. Display validation errors inline
6. Admin confirms import
7. Create records only after confirmation
```

---

## 31. Performance

| Requirement | Implementation |
|---|---|
| Pagination | Server-side, all list views |
| Search | Server-side |
| Filtering | Server-side |
| Database indexing | On foreign keys, roll number, reg number |
| Efficient joins | ORM / query optimization |
| Lazy loading | Profile sections loaded on demand |
| Image optimization | Resize on upload, serve optimized versions |

> Do **not** load the entire student database into the browser.

---

## 32. Error Handling

All operations must return **meaningful errors**.

| Scenario | Message |
|---|---|
| Duplicate registration | Student already exists with this registration number. |
| Unauthorized access | You are not authorized to access this student. |
| Marks validation | Marks cannot exceed the maximum marks. |
| Failed allocation | Faculty assignment failed. |
| Invalid email | Invalid email address. |
| Invalid file type | File type is not supported. |

---

## 33. Development Requirements

Before writing any code:

1. Inspect the existing project structure
2. Identify existing frontend framework
3. Identify existing backend framework
4. Identify existing database
5. Identify existing authentication system
6. Reuse existing architecture where possible
7. Do **not** replace the current stack unnecessarily
8. Follow existing coding conventions
9. Create database migrations
10. Create seed data for development (realistic dummy data only - no real student data)

> [!WARNING]
> Do **not** destroy or rewrite unrelated existing modules.

---

## 34. Testing

### Test Coverage Required

| Area | Tests |
|---|---|
| Authentication | Login, logout, token expiry |
| Admin authorization | All admin routes |
| Faculty authorization | All faculty routes |
| Cross-faculty isolation | Faculty A cannot access Faculty B's students |
| Student CRUD | Create, edit, view, delete |
| Faculty CRUD | Create, edit, activate/deactivate |
| Faculty allocation | Assign, reassign, bulk assign |
| Attendance | Add, update, calculate |
| Marks | Add, update, validation |
| University results | Add, update |
| Arrears | Auto-calculation |
| Parent meetings | Add, view |
| Counseling | Add, view |
| File uploads | Type validation, size limits |
| Search / filter | All filter combinations |
| Report generation | PDF, print |

---

## 35. Implementation Phases

| Phase | Scope |
|---|---|
| **Phase 1** | Authentication + Roles + Admin / Faculty setup |
| **Phase 2** | Faculty Management |
| **Phase 3** | Student Management + Faculty Allocation |
| **Phase 4** | Complete Student Profile |
| **Phase 5** | Academic / Semester Management |
| **Phase 6** | Attendance + Periodical Marks + University Results |
| **Phase 7** | Arrears + Placement / Higher Studies |
| **Phase 8** | Parent Meetings + Counseling |
| **Phase 9** | Reports + Search + Filters |
| **Phase 10** | Security + Audit Logs + Testing + Performance Optimization |

### After Each Phase

- Verify functionality
- Fix errors
- Do not break previous functionality
- Keep database migrations consistent
- Keep frontend and backend models synchronized

---

## 36. Acceptance Criteria

The module is considered **complete** only when all items below are checked:

### Authentication & Roles
- [ ] Admin login works
- [ ] Faculty login works

### Faculty Management
- [ ] Admin can create Faculty
- [ ] Admin can activate / deactivate Faculty

### Student Management
- [ ] Admin can create Student
- [ ] Admin can assign Student to Faculty
- [ ] Admin can reassign Student
- [ ] Faculty sees **only** assigned Students

### Student Profile
- [ ] Student Profile page works
- [ ] Personal Information works
- [ ] Parent / Guardian Information works

### Academic Records
- [ ] Academic Information works
- [ ] Attendance works
- [ ] Periodical Marks work
- [ ] University Results work
- [ ] Arrears work
- [ ] Placement / Higher Studies works
- [ ] Parent Meetings work
- [ ] Counseling works
- [ ] Remarks work

### System Features
- [ ] Student search works
- [ ] Filtering works
- [ ] File uploads work securely
- [ ] Role-based authorization works (backend-enforced)
- [ ] Audit logging works
- [ ] Validation works
- [ ] Reports work
- [ ] Responsive UI works (desktop / tablet / mobile)
- [ ] Database migrations work

### Security & Compliance
- [ ] No hard-coded credentials
- [ ] No sensitive information exposed unnecessarily
- [ ] Existing application functionality remains unaffected

---

## 37. Final Instructions

> [!IMPORTANT]
> Act as a **senior full-stack architect and developer**.

1. **Inspect** the existing project structure before writing any code.
2. **Plan** - create an implementation plan before coding.
3. **Do NOT** immediately rewrite the entire application.
4. **Implement incrementally** - phase by phase.
5. Use the **Student's Data Book** structure as the source for student information requirements.
6. Use **realistic dummy data** for development - do not copy real personal data.

### Priorities

| Priority | Area |
|---|---|
| 1 | Correct data structure |
| 2 | Security |
| 3 | Role-based access |
| 4 | Data integrity |
| 5 | Maintainability |
| 6 | Simple faculty workflow |
| 7 | Responsive UI |
| 8 | Accurate academic record management |

### Deliverables at Completion

At the end of implementation, provide:

- Files created / modified
- Database schema / migrations
- API documentation
- Authentication / authorization flow
- Admin features summary
- Faculty features summary
- Testing results
- Remaining issues
- Instructions to run the module locally
- Instructions to deploy the module

> [!NOTE]
> Do **not** claim a feature is complete unless it has actually been implemented and tested.

---

## Tech Stack (To Be Confirmed)

> These will be confirmed after inspecting the existing project.

| Layer | Options |
|---|---|
| Frontend | React / Next.js / Vue / Angular |
| Backend | Node.js / Django / Laravel / Spring Boot |
| Database | PostgreSQL / MySQL / MongoDB |
| Auth | JWT / Session-based |
| File Storage | Local / AWS S3 / Google Cloud Storage |
| PDF Generation | Puppeteer / PDFKit / WeasyPrint |

---

## Suggested Project Structure

```
faculty-student-module/
+-- backend/
|   +-- src/
|   |   +-- auth/
|   |   +-- admin/
|   |   +-- faculty/
|   |   +-- students/
|   |   +-- academic/
|   |   +-- attendance/
|   |   +-- marks/
|   |   +-- results/
|   |   +-- arrears/
|   |   +-- placements/
|   |   +-- counseling/
|   |   +-- parent-meetings/
|   |   +-- reports/
|   |   +-- audit-logs/
|   |   +-- uploads/
|   |   +-- common/
|   +-- migrations/
|   +-- seeds/
|   +-- tests/
+-- frontend/
|   +-- src/
|   |   +-- pages/
|   |   |   +-- admin/
|   |   |   +-- faculty/
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- services/
|   |   +-- store/
|   |   +-- utils/
|   +-- public/
+-- docs/
|   +-- api.md
|   +-- database-schema.md
|   +-- deployment.md
+-- .env.example
+-- docker-compose.yml
+-- README.md
```

---

*Faculty-Student Academic Management System*
*Generated from the Master Prompt specification.*
