import sqlite3


def get_db():
    conn = sqlite3.connect("data.db")
    conn.row_factory = sqlite3.Row
    return conn


conn = sqlite3.connect("data.db")
cur = conn.cursor()
cur.execute(
    """
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    age INTEGER NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('kid', 'student', 'pro')),
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL, 
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    is_subscribed INTEGER DEFAULT 0
);
"""
)
# cur.execute("DELETE FROM users")
# cur.execute("DELETE FROM sqlite_sequence WHERE name='users'")
conn.commit()
conn.close()
