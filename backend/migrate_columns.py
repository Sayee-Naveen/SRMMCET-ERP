import sqlite3

def migrate():
    conn = sqlite3.connect('srm_erp.db')
    cur = conn.cursor()

    try:
        cur.execute("ALTER TABLE subjects ADD COLUMN category VARCHAR(50) DEFAULT 'Core'")
        print("Added category column to subjects!")
    except Exception as e:
        print("subjects.category note:", e)

    try:
        cur.execute("ALTER TABLE marks ADD COLUMN session_id INTEGER")
        print("Added session_id column to marks!")
    except Exception as e:
        print("marks.session_id note:", e)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate()
