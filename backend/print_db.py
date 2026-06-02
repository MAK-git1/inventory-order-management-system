import sqlite3

conn = sqlite3.connect("inventory.db")
cursor = conn.cursor()

# Get table schema
cursor.execute("PRAGMA table_info(customers)")
print("Columns in customers table:", cursor.fetchall())

# Fetch all rows
cursor.execute("SELECT id, name, email, role FROM customers")
print("Rows in customers table:", cursor.fetchall())

conn.close()
