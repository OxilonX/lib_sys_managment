from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db

app = Flask(__name__)
CORS(app)


@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_db()
    cur = conn.cursor()
    rows = cur.execute("SELECT * FROM users").fetchall()
    conn.close()
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
        conn.close()
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
    conn.close()

    return jsonify({"message": "user added"}), 201


if __name__ == "__main__":
    app.run(debug=True)
