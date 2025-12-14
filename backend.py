import sqlite3
import logging
from flask import Flask, request, jsonify, g, json
from flask_cors import CORS
from database import (
    get_db,
    init_db,
    get_or_create_id,
    insert_book_authors,
    insert_book_publishers,
    insert_book_keywords,
)

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)  # for full errors logging in terminal

with app.app_context():
    init_db()


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


@app.route("/api/books", methods=["GET"])
def get_books():
    conn = get_db()
    cur = conn.cursor()
    rows = cur.execute("SELECT * FROM books").fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/api/books", methods=["POST"])
def add_new_book():
    db = get_db()
    cursor = db.cursor()
    data = request.json
    title = data.get("title")
    poster = data.get("poster")
    shelf = data.get("shelf")
    theme = data.get("theme")
    catCode = data.get("catCode")
    authors = data.get("authors")
    publishers = data.get("publishers")
    keywords = data.get("keywords")

    if not all([title, catCode, shelf, theme, authors, poster, publishers]):
        return (
            jsonify(
                {
                    "error": "Missing required book fields (title, code, theme, authors, publishers, poster)."
                }
            ),
            400,
        )

    try:
        theme_id = get_or_create_id("themes", theme, "name")

        cursor.execute(
            """
            INSERT INTO books (catalog_code, title,location, theme_id,poster )
            VALUES (?, ?, ?, ?,? )
            """,
            (catCode, title, shelf, theme_id, poster),
        )
        book_id = cursor.lastrowid

        insert_book_authors(book_id, authors)
        insert_book_publishers(book_id, publishers)
        insert_book_keywords(book_id, keywords)

        return jsonify({"message": "Book added successfully", "book_id": book_id}), 201

    except sqlite3.IntegrityError as e:
        db.rollback()
        return jsonify({"error": "Database constraint failed.", "details": str(e)}), 409

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        import traceback

        traceback.print_exc()
        return (
            jsonify(
                {
                    "error": "An unexpected critical server error occurred.",
                    "details": str(e),
                }
            ),
            500,
        )


@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_db()
    cur = conn.cursor()
    rows = cur.execute("SELECT * FROM users").fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/api/login", methods=["POST", "GET"])
def login():
    data = request.get_json(force=True)

    if not data:
        return jsonify({"success": False, "msg": "No data received"}), 400

    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()

    if user is None:
        return jsonify({"success": False, "msg": "Email not found"})

    if user["password"] != password:
        return jsonify({"success": False, "msg": "Wrong password"})

    return jsonify({"success": True, "msg": "Logged in", "user": dict(user)})


@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.json
    fname = data.get("fname")
    lname = data.get("lname")
    age = data.get("age")
    state = data.get("state")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")  # 3 : change this to hashed later
    address = data.get("address")
    phone = data.get("phone")
    role = data.get("role")
    is_subscribed = data.get("is_subscribed", 0)

    required = [
        fname,
        lname,
        age,
        state,
        username,
        email,
        password,
        address,
        phone,
        role,
    ]
    conn = get_db()
    cur = conn.cursor()
    if any(field is None for field in required):
        return jsonify({"message": "Missing required fields"}), 400
    cur.execute("SELECT 1 FROM users WHERE email = ?", (email,))
    exists = cur.fetchone()

    if exists:
        return jsonify({"message": "Email already registered"}), 409

    cur.execute(
        """
        INSERT INTO users 
        (fname, lname, age, state, username, email, password, address, phone, role, is_subscribed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            fname,
            lname,
            age,
            state,
            username,
            email,
            password,
            address,
            phone,
            role,
            is_subscribed,
        ),
    )

    conn.commit()

    return jsonify({"message": "user added"}), 201


if __name__ == "__main__":
    app.run(debug=True)
