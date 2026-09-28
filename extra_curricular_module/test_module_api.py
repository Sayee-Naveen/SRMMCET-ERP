import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8001/api"

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
    print("=" * 65)
    print("SRM MCET Extra-Curricular Activities ERP Module — API Tests")
    print("=" * 65)

    # 1. Login
    print("\n[1] Testing Faculty Authentication...")
    res = post(f"{BASE_URL}/login", {"username": "prof.kumar", "password": "kumar123"})
    token = res["access_token"]
    print(f" -> Authenticated as: {res['full_name']} ({res['role']})")

    # 2. Categories
    print("\n[2] Testing 8 Institutional Categories...")
    cats = get(f"{BASE_URL}/categories", token)
    for c in cats:
        print(f" -> Category #{c['display_order']}: {c['category_code']} - {c['display_name']}")
    assert len(cats) >= 8, "Expected at least 8 categories"

    # 3. Student list
    print("\n[3] Testing Student Directory...")
    students = get(f"{BASE_URL}/students", token)
    for s in students[:3]:
        print(f" -> {s['reg_no']}: {s['name']} ({s['department']} Sec-{s['section']}) [{s['regulation']}]")

    # 4. Filter by Category and Regulation
    print("\n[4] Testing Activities Filtering (Sports domain + R2021)...")
    sports_acts = get(f"{BASE_URL}/activities?category=Sports&regulation=R2021", token)
    print(f" -> Found {len(sports_acts)} R2021 sports activities:")
    for a in sports_acts[:2]:
        print(f"    * {a['title']} - {a['achievement']} (Reg: {a['regulation']})")

    # 5. Record activity with selective regulation and certificate
    print("\n[5] Testing Recording Activity with Selective Regulation (R2025)...")
    new_act_payload = {
        "reg_no": "911125104001",
        "regulation": "R2025",
        "category": "Sports",
        "sub_category": "Throwball",
        "title": "Inter-Collegiate Invitational Throwball Cup",
        "organizer": "Kalasalingam University",
        "level": "Inter-Collegiate",
        "role": "Team Captain",
        "achievement": "Winners Trophy",
        "event_date": "2025-02-20",
        "academic_year": "2024-2025",
        "semester": 1,
        "description": "Led collegiate throwball squad to victory in straight sets.",
        "certificate": {
            "certificate_no": "SRM-SP-2025-THB-010",
            "title": "Throwball Championship Winners Trophy Citation",
            "issuing_authority": "Kalasalingam University Sports Dept",
            "issue_date": "2025-02-20"
        }
    }
    created_act = post(f"{BASE_URL}/activities", new_act_payload, token)
    print(f" -> Activity recorded! ID: {created_act['id']} | Regulation: {created_act['regulation']} | Sub-Category: {created_act['sub_category']}")

    # 6. Student Portfolio
    print("\n[6] Testing Student Extra-Curricular Portfolio...")
    portfolio = get(f"{BASE_URL}/students/911125104001/portfolio", token)
    print(f" -> Portfolio for {portfolio['student']['name']} [{portfolio['student']['regulation']}]:")
    print(f"    Total Activities: {portfolio['total_activities']}")
    print(f"    Total Awards: {portfolio['total_awards']}")
    print(f"    Total Certificates: {portfolio['total_certificates']}")

    # 7. Analytics Summary
    print("\n[7] Testing Executive Analytics Summary...")
    analytics = get(f"{BASE_URL}/analytics/summary", token)
    print(f" -> Total System Activities: {analytics['total_activities']}")
    print(f" -> Total Certificates: {analytics['total_certificates']}")
    print(f" -> Total Awards Logged: {analytics['total_awards']}")
    print(f" -> Total Students Participated: {analytics['total_students_participated']}")

    print("\n" + "=" * 65)
    print(">>> ALL EXTRA-CURRICULAR MODULE TESTS PASSED! <<<")
    print("=" * 65)

if __name__ == "__main__":
    main()
