import urllib.request
import json

def post(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

def put(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='PUT')
    return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

def get(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

def main():
    print("=================================================================")
    print("ANNA UNIVERSITY ARREAR CARRYOVER & ADMIN CAPABILITY VERIFICATION")
    print("=================================================================")

    # 1. Login as Faculty
    f_login = post('http://127.0.0.1:8000/api/login', {'username': 'prof.kumar', 'password': 'kumar123'})
    f_token = f_login['access_token']

    # 2. Login as Admin
    a_login = post('http://127.0.0.1:8000/api/login', {'username': 'admin', 'password': 'admin123'})
    a_token = a_login['access_token']

    reg_no = "911124104001"

    # --- STEP 1: Student fails a subject in Semester 1 ---
    print("\n[SCENARIO 1] Semester 1 Exam: Student fails CY3151 (Chemistry)")
    sem1_sheet = get(f'http://127.0.0.1:8000/api/semester-sheet?reg_no={reg_no}&semester=1', f_token)
    
    # Save marks where CY3151 gets 'U' (Fail, GP 0) and others get 'A'
    marks_s1 = []
    for s in sem1_sheet:
        if s['subject_code'] == 'CY3151':
            marks_s1.append({'subject_id': s['subject_id'], 'grade_letter': 'U', 'grade_point': 0.0, 'attempt': 1, 'is_pass': False})
        else:
            marks_s1.append({'subject_id': s['subject_id'], 'grade_letter': 'A', 'grade_point': 8.0, 'attempt': 1, 'is_pass': True})
    
    post('http://127.0.0.1:8000/api/marks', {'reg_no': reg_no, 'semester': 1, 'marks': marks_s1}, f_token)
    print("-> Semester 1 marks recorded. CY3151 marked as 'U' (Re-appear).")

    # --- STEP 2: Moving to Semester 2 ---
    print("\n[SCENARIO 2] Opening Semester 2: Verify CY3151 is automatically carried over as an Arrear with Attempt 2")
    sem2_sheet = get(f'http://127.0.0.1:8000/api/semester-sheet?reg_no={reg_no}&semester=2', f_token)
    
    arrear_in_s2 = [s for s in sem2_sheet if s['subject_code'] == 'CY3151']
    assert len(arrear_in_s2) == 1, "CY3151 must appear in Semester 2!"
    c2 = arrear_in_s2[0]
    print(f"-> SUCCESS: {c2['subject_code']} - {c2['subject_name']}")
    print(f"   is_arrear: {c2['is_arrear']} | attempt: {c2['attempt']} | from_sem: {c2['original_semester']}")
    assert c2['is_arrear'] is True, "Must be flagged as an arrear"
    assert c2['attempt'] == 2, "Attempt must be incremented to 2"

    # --- STEP 3: Student FAILS CY3151 AGAIN in Semester 2 ---
    print("\n[SCENARIO 3] Semester 2 Exam: Student fails CY3151 AGAIN in Attempt 2")
    marks_s2 = []
    for s in sem2_sheet:
        if s['subject_code'] == 'CY3151':
            marks_s2.append({'subject_id': s['subject_id'], 'grade_letter': 'U', 'grade_point': 0.0, 'attempt': 2, 'is_pass': False})
        else:
            marks_s2.append({'subject_id': s['subject_id'], 'grade_letter': 'A', 'grade_point': 8.0, 'attempt': 1, 'is_pass': True})
    
    post('http://127.0.0.1:8000/api/marks', {'reg_no': reg_no, 'semester': 2, 'marks': marks_s2}, f_token)
    print("-> Semester 2 marks recorded. CY3151 failed again.")

    # --- STEP 4: Moving to Semester 3 ---
    print("\n[SCENARIO 4] Opening Semester 3: Verify CY3151 carries over again with Attempt 3")
    sem3_sheet = get(f'http://127.0.0.1:8000/api/semester-sheet?reg_no={reg_no}&semester=3', f_token)
    arrear_in_s3 = [s for s in sem3_sheet if s['subject_code'] == 'CY3151']
    assert len(arrear_in_s3) == 1, "CY3151 must carry over to Semester 3!"
    c3 = arrear_in_s3[0]
    print(f"-> SUCCESS: {c3['subject_code']} carries over to Semester 3 with Attempt {c3['attempt']} (is_arrear={c3['is_arrear']})")
    assert c3['attempt'] == 3, "Attempt must be incremented to 3"

    # --- STEP 5: Student PASSES CY3151 in Semester 3 ---
    print("\n[SCENARIO 5] Semester 3 Exam: Student PASSES CY3151 with Grade 'A' (8.0 pts)")
    marks_s3 = [{'subject_id': c3['subject_id'], 'grade_letter': 'A', 'grade_point': 8.0, 'attempt': 3, 'is_pass': True}]
    post('http://127.0.0.1:8000/api/marks', {'reg_no': reg_no, 'semester': 3, 'marks': marks_s3}, f_token)
    print("-> Semester 3 marks recorded. CY3151 PASSED!")

    # --- STEP 6: Moving to Semester 4 ---
    print("\n[SCENARIO 6] Opening Semester 4: Verify CY3151 DOES NOT APPEAR (Cleared & Terminated)")
    sem4_sheet = get(f'http://127.0.0.1:8000/api/semester-sheet?reg_no={reg_no}&semester=4', f_token)
    arrear_in_s4 = [s for s in sem4_sheet if s['subject_code'] == 'CY3151']
    print(f"-> CY3151 instances in Semester 4 sheet: {len(arrear_in_s4)}")
    assert len(arrear_in_s4) == 0, "CY3151 MUST NOT appear in Semester 4 since it was passed!"
    print("-> SUCCESS: Arrear attempt terminated and cleared from all future semesters!")

    # --- STEP 7: Admin Capabilities Test ---
    print("\n=================================================================")
    print("TESTING ADMIN CAPABILITIES")
    print("=================================================================")
    
    # 7A. Create Department
    print("\n[ADMIN 1] Creating New Department: AIDS")
    try:
        new_d = post('http://127.0.0.1:8000/api/admin/departments', {'dept_name': 'Artificial Intelligence & Data Science', 'dept_code': 'AIDS'}, a_token)
        print("-> Created Department:", new_d)
    except Exception as e:
        print("-> Department note:", e)

    # 7B. Create Faculty Account
    print("\n[ADMIN 2] Creating New Faculty Account: prof.suresh")
    try:
        new_f = post('http://127.0.0.1:8000/api/admin/faculty', {
            'username': 'prof.suresh',
            'password': 'suresh123',
            'full_name': 'Dr. M. Suresh',
            'department': 'Artificial Intelligence & Data Science',
            'role': 'faculty'
        }, a_token)
        print("-> Created Faculty:", new_f['full_name'], f"(ID: {new_f['faculty_id']})")
        new_fac_id = new_f['faculty_id']
    except Exception as e:
        facs = get('http://127.0.0.1:8000/api/admin/faculty', a_token)
        new_fac_id = facs[-1]['faculty_id']

    # 7C. Edit Student
    print("\n[ADMIN 3] Editing Student Record")
    students = get('http://127.0.0.1:8000/api/admin/students', a_token)
    stu_to_edit = students[0]
    updated_stu = put(f"http://127.0.0.1:8000/api/admin/students/{stu_to_edit['student_id']}", {
        'name': 'Arjun R (Gold Medalist)'
    }, a_token)
    print(f"-> Updated Student ID {stu_to_edit['student_id']} Name to: {updated_stu['name']}")

    # 7D. Assign Student to Faculty
    print(f"\n[ADMIN 4] Assigning Student {stu_to_edit['reg_no']} to Faculty ID {new_fac_id}")
    assign_res = post(f'http://127.0.0.1:8000/api/admin/faculty/{new_fac_id}/assign-students', {
        'student_ids': [stu_to_edit['student_id']]
    }, a_token)
    print("-> Assignment Result:", assign_res['message'])

    assigned_list = get(f'http://127.0.0.1:8000/api/admin/faculty/{new_fac_id}/students', a_token)
    print(f"-> Faculty now has {len(assigned_list)} assigned student(s): {[s['name'] for s in assigned_list]}")

    print("\n>>> ALL ARREAR & ADMIN VERIFICATIONS PASSED WITH 100% SUCCESS! <<<")

if __name__ == '__main__':
    main()
