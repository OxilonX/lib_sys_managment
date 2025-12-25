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
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
        is_subscribed INTEGER DEFAULT 0,
        join_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    # Books Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        catalog_code TEXT UNIQUE,
        title TEXT NOT NULL,
        theme_id INTEGER,
        publisher_id INTEGER NOT NULL,
        poster TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (theme_id) REFERENCES themes(id),
        FOREIGN KEY (publisher_id) REFERENCES publishers(id)
    );
    """
    )

    # Book Copies Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS book_copies (
        copy_id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        location TEXT NOT NULL,
        publisher_id INTEGER NOT NULL,
        is_available INTEGER DEFAULT 1,
        borrowed_by INTEGER,
        borrowed_date TIMESTAMP,
        due_date TIMESTAMP,
        state INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (publisher_id) REFERENCES publishers(id),
        FOREIGN KEY (borrowed_by) REFERENCES users(user_id)
    );
    """
    )

    # Authors Table
    cur.execute(
        """CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    """
    )

    # Book Authors Junction Table
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

    # Keywords Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS keyword (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE
    );
    """
    )

    # Book Keywords Junction Table
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

    # Book Requests Table
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS book_requests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        copy_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        position INTEGER NOT NULL,
        status TEXT DEFAULT 'waiting',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (copy_id) REFERENCES book_copies(copy_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(copy_id, user_id)
    );
    """
    )

    conn.commit()
    conn.close()


# Utility functions to manipulate the database


def get_or_create_id(table_name, name_value, name_column="name"):
    """Get ID from table or create new entry and return ID"""
    db = get_db()
    cursor = db.cursor()

    query = f"SELECT id FROM {table_name} WHERE {name_column} = ?"
    cursor.execute(query, (name_value,))

    result = cursor.fetchone()
    if result:
        return result[0]

    insert_query = f"INSERT INTO {table_name} ({name_column}) VALUES (?)"
    cursor.execute(insert_query, (name_value,))
    db.commit()

    return cursor.lastrowid


def insert_book_authors(book_id, author_names):
    """Insert authors for a book"""
    db = get_db()
    cursor = db.cursor()

    for author_name in author_names:
        author_id = get_or_create_id("authors", author_name, "name")
        cursor.execute(
            """INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)""",
            (book_id, author_id),
        )
    db.commit()


def insert_book_keywords(book_id, keyword_words):
    """Insert keywords for a book"""
    db = get_db()
    cursor = db.cursor()

    for keyword_word in keyword_words:
        keyword_id = get_or_create_id("keyword", keyword_word, "word")
        cursor.execute(
            """INSERT INTO book_keywords (book_id, keyword_id) VALUES (?, ?)""",
            (book_id, keyword_id),
        )
    db.commit()
