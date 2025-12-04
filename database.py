import sqlite3
from flask import g


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect("./data.db")
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON;")
    return g.db


def init_db():
    conn = sqlite3.connect("data.db")
    cur = conn.cursor()
    # Users Table
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
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user' ,
        is_subscribed INTEGER DEFAULT 0
    );
    """
    )
    # Books Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        catalog_code TEXT UNIQUE,
        title TEXT NOT NULL,
        theme_id INTEGER,
        publisher_id INTEGER,
        poster TEXT NOT NULL,
        FOREIGN KEY (theme_id) REFERENCES Theme(id),
        FOREIGN KEY (publisher_id) REFERENCES Publisher(id)
    );
    """
    )
    # Authors Table
    cur.execute(
        """CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT,
        lastname TEXT NOT NULL
    );
    """
    )
    # Jointures
    # JOIN books with authors Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS book_authors (
        book_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        PRIMARY KEY (book_id, author_id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
    );
    """
    )
    # JOIN books with keyword Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS book_keywords (
        book_id INTEGER NOT NULL,
        keyword_id INTEGER NOT NULL,
        PRIMARY KEY (book_id, keyword_id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (keyword_id) REFERENCES keyword(id) ON DELETE CASCADE
    );
    """
    )

    # JOIN books with publishers Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS book_publishers (
        book_id INTEGER NOT NULL,
        publisher_id INTEGER NOT NULL,
        PRIMARY KEY (book_id, publisher_id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE CASCADE
    );
    """
    )

    # Themes Table
    cur.execute(
        """CREATE TABLE IF NOT EXISTS themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    );
    """
    )
    # Publishers Table
    cur.execute(
        """CREATE TABLE IF NOT EXISTS publishers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    """
    )

    # Keywords Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS keyword (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE
    );
    """
    )
    conn.commit()
    conn.close()


# Delete users with empty age row
# cur.execute("DELETE FROM users WHERE age= ?", ("",))
# cur.execute("UPDATE users SET role = 'admin' WHERE email= ?", ("a@gmail.com",))
# cur.execute("DELETE FROM users WHERE age= ?",("",))
# cur.execute("DELETE FROM sqlite_sequence WHERE name='users'")
