import sqlite3
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, g, json
from flask_cors import CORS
from database import (
    get_db,
    init_db,
    get_or_create_id,
    insert_book_authors,
    insert_book_keywords,
)

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

with app.app_context():
    init_db()


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


@app.route("/api/books", methods=["POST"])
def add_new_book():
    db = get_db()
    cursor = db.cursor()
    data = request.json

    title = data.get("title")
    poster = data.get("poster")
    location = data.get("location")  # Location for the first copy
    theme = data.get("theme")
    catCode = data.get("catCode")
    authors = data.get("authors")
    publisher = data.get("publisher")
    keywords = data.get("keywords")

    if not all([title, catCode, location, theme, authors, poster, publisher]):
        return (
            jsonify(
                {
                    "error": "Missing required book fields (title, code, theme, authors, publisher, poster, location)."
                }
            ),
            400,
        )

    try:
        theme_id = get_or_create_id("themes", theme, "name")
        publisher_id = get_or_create_id("publishers", publisher, "name")

        cursor.execute(
            """
            INSERT INTO books (catalog_code, title, theme_id, publisher_id, poster)
            VALUES (?, ?, ?, ?, ?)
            """,
            (catCode, title, theme_id, publisher_id, poster),
        )
        book_id = cursor.lastrowid

        insert_book_authors(book_id, authors)
        insert_book_keywords(book_id, keywords)

        cursor.execute(
            """
            INSERT INTO book_copies (book_id, location, publisher_id, is_available)
            VALUES (?, ?, ?, 1)
            """,
            (book_id, location, publisher_id),
        )

        db.commit()
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


@app.route("/api/books/<int:book_id>/delete", methods=["DELETE"])
def delete_book(book_id):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT COUNT(*) as borrowed_count FROM book_copies WHERE book_id = ? AND is_available = 0",
            (book_id,),
        )
        borrowed = cursor.fetchone()["borrowed_count"]

        cursor.execute("DELETE FROM book_authors WHERE book_id = ?", (book_id,))
        cursor.execute("DELETE FROM book_keywords WHERE book_id = ?", (book_id,))
        cursor.execute(
            "DELETE FROM book_requests WHERE copy_id IN (SELECT copy_id FROM book_copies WHERE book_id = ?)",
            (book_id,),
        )
        cursor.execute("DELETE FROM book_copies WHERE book_id = ?", (book_id,))
        cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))

        db.commit()

        msg = f"Book deleted."
        if borrowed > 0:
            msg += f" Warning: {borrowed} borrowed copies were forcefully removed."

        return jsonify({"message": msg}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/books/<int:book_id>/copies", methods=["GET"])
def get_book_copies(book_id):
    """Get all copies of a specific book"""
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT bc.copy_id, bc.book_id, bc.location, p.name as publisher, 
               bc.is_available, bc.borrowed_by, bc.borrowed_date,bc.state
        FROM book_copies bc
        JOIN publishers p ON bc.publisher_id = p.id
        WHERE bc.book_id = ?
        ORDER BY bc.copy_id
        """,
        (book_id,),
    )

    copies = [dict(row) for row in cursor.fetchall()]
    return jsonify(copies), 200


@app.route("/api/books/<int:book_id>/copies", methods=["POST"])
def add_book_copy(book_id):
    """Add a new copy of an existing book with different publisher and/or location"""
    db = get_db()
    cursor = db.cursor()
    data = request.json

    location = data.get("location")
    publisher = data.get("publisher")

    if not location or not publisher:
        return jsonify({"error": "Location and publisher are required"}), 400

    try:
        # Verify book exists
        cursor.execute("SELECT id FROM books WHERE id = ?", (book_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Book not found"}), 404

        # Get or create publisher
        publisher_id = get_or_create_id("publishers", publisher, "name")

        # Create new copy
        cursor.execute(
            """
            INSERT INTO book_copies (book_id, location, publisher_id, is_available)
            VALUES (?, ?, ?, 1)
            """,
            (book_id, location, publisher_id),
        )

        db.commit()
        copy_id = cursor.lastrowid

        return jsonify({"message": "Copy added successfully", "copy_id": copy_id}), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/books/copies/<int:copy_id>/borrow", methods=["POST"])
def borrow_book_copy(copy_id):
    db = get_db()
    cursor = db.cursor()
    data = request.json

    user_id = data.get("user_id")
    due_date = data.get("due_date")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        cursor.execute(
            "SELECT is_available FROM book_copies WHERE copy_id = ?", (copy_id,)
        )
        copy = cursor.fetchone()

        if not copy:
            return jsonify({"error": "Copy not found"}), 404
        if copy["is_available"] == 0:
            return jsonify({"error": "Copy is not available"}), 400

        cursor.execute(
            """
            UPDATE book_copies 
            SET is_available = 0, borrowed_by = ?, borrowed_date = ?, due_date = ?
            WHERE copy_id = ?
            """,
            (user_id, datetime.now().isoformat(), due_date, copy_id),
        )

        db.commit()
        return (
            jsonify(
                {
                    "message": "Book borrowed successfully",
                    "copy_id": copy_id,
                    "removed": False,
                }
            ),
            200,
        )

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/books/copies/<int:copy_id>", methods=["DELETE"])
def delete_book_copy(copy_id):
    """Delete a specific book copy"""
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("DELETE FROM book_copies WHERE copy_id = ?", (copy_id,))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Copy not found"}), 404

        return jsonify({"message": "Copy deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/users/<int:user_id>/borrowed", methods=["GET"])
def get_user_borrowed_books(user_id):
    """Get all books currently held by a specific user with full details"""
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT 
            bc.copy_id, 
            b.title, 
            b.poster,
            bc.location,
            p.name as publisher,
            t.name as theme,
            bc.borrowed_date, 
            bc.due_date,
            bc.state
        FROM book_copies bc
        JOIN books b ON bc.book_id = b.id
        LEFT JOIN publishers p ON bc.publisher_id = p.id
        LEFT JOIN themes t ON b.theme_id = t.id
        WHERE bc.borrowed_by = ? AND bc.is_available = 0
    """,
        (user_id,),
    )

    borrowed_books = [dict(row) for row in cursor.fetchall()]
    return jsonify(borrowed_books), 200


@app.route("/api/books/copies/<int:copy_id>", methods=["PUT"])
def update_book_copy(copy_id):
    """Update copy location and/or publisher"""
    db = get_db()
    cursor = db.cursor()
    data = request.json

    try:
        if "location" in data:
            cursor.execute(
                "UPDATE book_copies SET location = ? WHERE copy_id = ?",
                (data["location"], copy_id),
            )

        if "publisher" in data:
            publisher_id = get_or_create_id("publishers", data["publisher"], "name")
            cursor.execute(
                "UPDATE book_copies SET publisher_id = ? WHERE copy_id = ?",
                (publisher_id, copy_id),
            )

        db.commit()

        # Return updated copy
        cursor.execute(
            """
            SELECT bc.copy_id, bc.book_id, bc.location, p.name as publisher, bc.is_available
            FROM book_copies bc
            JOIN publishers p ON bc.publisher_id = p.id
            WHERE bc.copy_id = ?
            """,
            (copy_id,),
        )

        updated_copy = dict(cursor.fetchone())
        return jsonify(updated_copy), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/books/copies/<int:copy_id>/return", methods=["POST"])
def return_book_copy(copy_id):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT is_available, state FROM book_copies WHERE copy_id = ?", (copy_id,)
        )
        copy = cursor.fetchone()

        if not copy or copy["is_available"] == 1:
            return jsonify({"error": "Copy not found or not borrowed"}), 400

        current_state = copy["state"] if copy["state"] is not None else 100
        new_state = max(0, current_state - 20)

        if new_state <= 0:
            cursor.execute("DELETE FROM book_requests WHERE copy_id = ?", (copy_id,))
            cursor.execute("DELETE FROM book_copies WHERE copy_id = ?", (copy_id,))
            db.commit()
            return (
                jsonify(
                    {
                        "message": "Copy returned in poor condition and retired from inventory.",
                        "removed": True,
                        "copy_id": copy_id,
                    }
                ),
                200,
            )

        cursor.execute(
            """
            SELECT request_id, user_id FROM book_requests 
            WHERE copy_id = ? AND status = 'waiting'
            ORDER BY position ASC LIMIT 1
        """,
            (copy_id,),
        )
        next_request = cursor.fetchone()

        if next_request:
            # Auto-borrow for next person
            user_id = next_request["user_id"]
            due_date = (datetime.now() + timedelta(days=15)).isoformat()

            cursor.execute(
                """
                UPDATE book_copies 
                SET is_available = 0, borrowed_by = ?, borrowed_date = ?, due_date = ?, state = ?
                WHERE copy_id = ?
            """,
                (user_id, datetime.now().isoformat(), due_date, new_state, copy_id),
            )

            cursor.execute(
                "DELETE FROM book_requests WHERE request_id = ?",
                (next_request["request_id"],),
            )

            # Reorder queue
            cursor.execute(
                """
                UPDATE book_requests SET position = position - 1 
                WHERE copy_id = ? AND status = 'waiting'
            """,
                (copy_id,),
            )
        else:
            # Make available for everyone
            cursor.execute(
                """
                UPDATE book_copies 
                SET is_available = 1, borrowed_by = NULL, borrowed_date = NULL, due_date = NULL, state = ?
                WHERE copy_id = ?
            """,
                (new_state, copy_id),
            )

        db.commit()
        return (
            jsonify(
                {
                    "message": "Book returned successfully",
                    "new_state": new_state,
                    "auto_borrowed": bool(next_request),
                }
            ),
            200,
        )

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/books", methods=["GET"])
def get_books():
    """Get all books with their publisher info and copy counts"""
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT b.id, b.catalog_code, b.title, b.poster, t.name as theme,
               p.name as publisher,GROUP_CONCAT(DISTINCT k.word) as keywords,
               COUNT(bc.copy_id) as total_copies,
               SUM(CASE WHEN bc.is_available = 1 THEN 1 ELSE 0 END) as available_copies
        FROM books b
        LEFT JOIN themes t ON b.theme_id = t.id
        LEFT JOIN publishers p ON b.publisher_id = p.id
        LEFT JOIN book_copies bc ON b.id = bc.book_id
        LEFT JOIN book_keywords bk ON b.id = bk.book_id
        LEFT JOIN keyword k ON bk.keyword_id = k.id
        GROUP BY b.id
        ORDER BY b.id
        """
    )

    books = [dict(row) for row in cursor.fetchall()]
    return jsonify(books), 200


# requests functions


@app.route("/api/books/copies/<int:copy_id>/request", methods=["POST"])
def request_book_copy(copy_id):
    """Request a book copy that is currently borrowed"""
    db = get_db()
    cursor = db.cursor()
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        # Check if copy exists
        cursor.execute(
            "SELECT is_available FROM book_copies WHERE copy_id = ?", (copy_id,)
        )
        copy = cursor.fetchone()

        if not copy:
            return jsonify({"error": "Copy not found"}), 404

        if copy["is_available"] == 1:
            return (
                jsonify({"error": "Copy is available, you can borrow it directly"}),
                400,
            )

        # Check if user already requested this copy
        cursor.execute(
            "SELECT request_id FROM book_requests WHERE copy_id = ? AND user_id = ?",
            (copy_id, user_id),
        )
        if cursor.fetchone():
            return jsonify({"error": "You already requested this copy"}), 409

        # Get position in queue (count existing requests + 1)
        cursor.execute(
            "SELECT COUNT(*) as count FROM book_requests WHERE copy_id = ?", (copy_id,)
        )
        position = cursor.fetchone()["count"] + 1

        # Create request
        cursor.execute(
            """
            INSERT INTO book_requests (copy_id, user_id, position, status)
            VALUES (?, ?, ?, 'waiting')
            """,
            (copy_id, user_id, position),
        )

        db.commit()
        request_id = cursor.lastrowid

        return (
            jsonify(
                {
                    "message": "Request created successfully",
                    "request_id": request_id,
                    "position": position,
                }
            ),
            201,
        )

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/users/<int:user_id>/requests", methods=["GET"])
def get_user_requests(user_id):
    """Get all book requests for a user"""
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            SELECT 
                br.request_id,
                br.copy_id,
                br.position,
                br.status,
                br.requested_date,
                b.title,
                b.poster,
                p.name as publisher,
                bc.location
            FROM book_requests br
            JOIN book_copies bc ON br.copy_id = bc.copy_id
            JOIN books b ON bc.book_id = b.id
            LEFT JOIN publishers p ON bc.publisher_id = p.id
            WHERE br.user_id = ?
            ORDER BY br.status DESC, br.position ASC
            """,
            (user_id,),
        )

        requests = [dict(row) for row in cursor.fetchall()]
        return jsonify(requests), 200

    except Exception as e:
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/books/copies/<int:copy_id>/requests", methods=["GET"])
def get_copy_requests(copy_id):
    """Get request queue for a specific copy"""
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            SELECT 
                br.request_id,
                br.user_id,
                br.position,
                br.requested_date,
                u.fname,
                u.lname,
                u.email
            FROM book_requests br
            JOIN users u ON br.user_id = u.user_id
            WHERE br.copy_id = ?
            ORDER BY br.position ASC
            """,
            (copy_id,),
        )

        queue = [dict(row) for row in cursor.fetchall()]
        return jsonify(queue), 200

    except Exception as e:
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/books/requests/<int:request_id>/cancel", methods=["POST"])
def cancel_book_request(request_id):
    """Cancel a book request"""
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT copy_id, position FROM book_requests WHERE request_id = ?",
            (request_id,),
        )
        request = cursor.fetchone()

        if not request:
            return jsonify({"error": "Request not found"}), 404

        copy_id = request["copy_id"]
        position = request["position"]

        # Delete request
        cursor.execute("DELETE FROM book_requests WHERE request_id = ?", (request_id,))

        # Decrement positions for requests after this one
        cursor.execute(
            """
            UPDATE book_requests 
            SET position = position - 1 
            WHERE copy_id = ? AND position > ?
            """,
            (copy_id, position),
        )

        db.commit()

        return jsonify({"message": "Request cancelled successfully"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Server error", "details": str(e)}), 500


# users manipulation functions
@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_db()
    cur = conn.cursor()
    rows = cur.execute("SELECT * FROM users").fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/api/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
def manage_user(user_id):
    conn = get_db()
    cur = conn.cursor()

    if request.method == "GET":
        # Get a single user
        row = cur.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()
        if not row:
            return jsonify({"error": f"User {user_id} not found"}), 404
        return jsonify(dict(row))

    elif request.method == "PUT":
        # Update a user (subscribe, makeAdmin, etc)
        data = request.get_json()

        if "is_subscribed" in data:
            cur.execute(
                "UPDATE users SET is_subscribed = ? WHERE user_id = ?",
                (data["is_subscribed"], user_id),
            )

        if "role" in data:
            cur.execute(
                "UPDATE users SET role = ? WHERE user_id = ?", (data["role"], user_id)
            )

        conn.commit()

        # Return updated user
        row = cur.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()
        return jsonify(dict(row))

    elif request.method == "DELETE":
        # Delete a user
        cur.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
        conn.commit()
        return jsonify({"message": "User deleted"}), 200


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
