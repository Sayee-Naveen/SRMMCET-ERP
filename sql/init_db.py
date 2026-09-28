import pymysql

def main():
    # Connect to MySQL server (create DB if not exists handled in script or connection)
    conn = pymysql.connect(
        host='localhost',
        port=3306,
        user='root',
        password='root',
        autocommit=True
    )
    cursor = conn.cursor()

    with open(r"D:\SRM_ERP\sql\semester_module.sql", "r", encoding="utf-8") as f:
        sql_script = f.read()

    # Split commands by semicolon, ignoring empty lines or comments
    statements = sql_script.split(';')
    for stmt in statements:
        stmt = stmt.strip()
        if stmt:
            try:
                cursor.execute(stmt)
            except Exception as e:
                print(f"Error executing statement:\n{stmt[:100]}...\nError: {e}")

    print("Database initialisation completed successfully!")
    conn.close()

if __name__ == "__main__":
    main()
