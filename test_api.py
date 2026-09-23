import urllib.request
import json

def post(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

def get(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

def main():
    print("=== 1. Testing Faculty Login ===")
    res = post('http://127.0.0.1:8000/api/login', {'username': 'prof.kumar', 'password': 'kumar123'})
    token = res['access_token']
    print(f"Logged in as: {res['full_name']} | Role: {res['role']}")

    print("\n=== 2. Testing Faculty Scoped Students ===")
    students = get('http://127.0.0.1:8000/api/students', token)
    for s in students:
        print(f"-> {s['reg_no']} - {s['name']} | Reg: {s['regulation']} | Sem: {s['current_sem']}")

    print("\n=== 3. Testing R2021 Sem 1 Subjects ===")
    subs = get('http://127.0.0.1:8000/api/subjects?course_id=1&semester=1&regulation=R2021', token)
    for sub in subs[:3]:
        print(f"-> {sub['subject_code']} - {sub['subject_name']} ({sub['credits']} credits)")

    print("\n=== 4. Testing Marks Entry & Live SGPA/CGPA Calculation ===")
    marks_payload = {
        'reg_no': '911124104001',
        'semester': 1,
        'marks': [{'subject_id': s['subject_id'], 'grade_letter': 'O', 'grade_point': 10.0, 'attempt': 1, 'is_pass': True} for s in subs]
    }
    save_res = post('http://127.0.0.1:8000/api/marks', marks_payload, token)
    print(f"-> Marks Saved! SGPA: {save_res['sgpa']} | CGPA: {save_res['cgpa']} | Total Credits: {save_res['total_credits']}")

    print("\n=== 5. Testing R2025 Grade Scale ===")
    gs25 = get('http://127.0.0.1:8000/api/grade-scale?regulation=R2025', token)
    print("R2025 Grades:", [f"{g['grade_letter']}:{g['grade_point']}" for g in gs25])

    print("\n=== 6. Testing Admin Login & Access ===")
    adm = post('http://127.0.0.1:8000/api/login', {'username': 'admin', 'password': 'admin123'})
    adm_token = adm['access_token']
    courses = get('http://127.0.0.1:8000/api/admin/courses', adm_token)
    print(f"-> Admin successfully authenticated and fetched {len(courses)} courses!")

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == '__main__':
    main()
