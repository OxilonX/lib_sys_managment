import sqlite3
from datetime import datetime
import random

# Connect to database
conn = sqlite3.connect("data.db")
cur = conn.cursor()

# Sample data
themes = [
    "Action",
    "Science",
    "History",
    "Fiction",
    "Romance",
    "Mystery",
    "Fantasy",
    "Thriller",
]
publishers = [
    "Penguin Books",
    "Simon & Schuster",
    "Hachette",
    "HarperCollins",
    "Random House",
    "Oxford Press",
    "Cambridge Press",
]
locations = [
    "Aisle A",
    "Aisle B",
    "Aisle C",
    "Aisle D",
    "Aisle E",
    "Shelf 1",
    "Shelf 2",
    "Shelf 3",
    "Shelf 4",
    "Shelf 5",
]
authors = [
    "George Orwell",
    "Jane Austen",
    "Mark Twain",
    "Ernest Hemingway",
    "F. Scott Fitzgerald",
    "Harper Lee",
    "Stephen King",
    "J.R.R. Tolkien",
    "C.S. Lewis",
    "Roald Dahl",
    "Isaac Asimov",
    "Arthur C. Clarke",
    "Philip K. Dick",
    "Ray Bradbury",
    "Ursula K. Le Guin",
    "Margaret Atwood",
    "Toni Morrison",
    "Gabriel García Márquez",
    "Paulo Coelho",
    "Haruki Murakami",
]
keywords_list = [
    "adventure",
    "mystery",
    "love",
    "drama",
    "sci-fi",
    "fantasy",
    "horror",
    "romance",
    "thriller",
    "classic",
    "modern",
    "historical",
    "philosophical",
    "psychological",
    "magical",
]

book_titles = [
    "The Great Gatsby",
    "To Kill a Mockingbird",
    "1984",
    "Pride and Prejudice",
    "The Hobbit",
    "Harry Potter and the Sorcerer's Stone",
    "The Lord of the Rings",
    "The Catcher in the Rye",
    "Brave New World",
    "Wuthering Heights",
    "Jane Eyre",
    "The Odyssey",
    "The Iliad",
    "Don Quixote",
    "Moby Dick",
    "War and Peace",
    "Crime and Punishment",
    "The Brothers Karamazov",
    "Anna Karenina",
    "Les Misérables",
]

# High-quality, working book cover images from Open Library Covers API
book_images = [
    "https://covers.openlibrary.org/b/id/7725406-M.jpg",  # The Great Gatsby
    "https://covers.openlibrary.org/b/id/8421453-M.jpg",  # To Kill a Mockingbird
    "https://covers.openlibrary.org/b/id/7725382-M.jpg",  # 1984
    "https://covers.openlibrary.org/b/id/7725386-M.jpg",  # Pride and Prejudice
    "https://covers.openlibrary.org/b/id/7725402-M.jpg",  # The Hobbit
    "https://covers.openlibrary.org/b/id/8421406-M.jpg",  # Harry Potter
    "https://covers.openlibrary.org/b/id/8421524-M.jpg",  # The Lord of the Rings
    "https://covers.openlibrary.org/b/id/7725388-M.jpg",  # The Catcher in the Rye
    "https://covers.openlibrary.org/b/id/7725411-M.jpg",  # Brave New World
    "https://covers.openlibrary.org/b/id/8421441-M.jpg",  # Wuthering Heights
    "https://covers.openlibrary.org/b/id/7725384-M.jpg",  # Jane Eyre
    "https://covers.openlibrary.org/b/id/7725423-M.jpg",  # The Odyssey
    "https://covers.openlibrary.org/b/id/7725424-M.jpg",  # The Iliad
    "https://covers.openlibrary.org/b/id/8421493-M.jpg",  # Don Quixote
    "https://covers.openlibrary.org/b/id/7725425-M.jpg",  # Moby Dick
    "https://covers.openlibrary.org/b/id/8421462-M.jpg",  # War and Peace
    "https://covers.openlibrary.org/b/id/8421455-M.jpg",  # Crime and Punishment
    "https://covers.openlibrary.org/b/id/8421472-M.jpg",  # The Brothers Karamazov
    "https://covers.openlibrary.org/b/id/8421473-M.jpg",  # Anna Karenina
    "https://covers.openlibrary.org/b/id/8421474-M.jpg",  # Les Misérables
]

# Insert Users
print("📝 Inserting users...")
users_data = [
    {
        "fname": "Admin",
        "lname": "User",
        "age": 30,
        "state": "pro",
        "username": "admin",
        "email": "a",
        "password": "a",
        "address": "123 Admin St, City, State",
        "phone": "555-0001",
        "role": "admin",
        "is_subscribed": 1,
    },
    {
        "fname": "John",
        "lname": "Subscriber",
        "age": 25,
        "state": "student",
        "username": "john_sub",
        "email": "b",
        "password": "b",
        "address": "456 User Ave, City, State",
        "phone": "555-0002",
        "role": "user",
        "is_subscribed": 1,
    },
    {
        "fname": "Jane",
        "lname": "Reader",
        "age": 28,
        "state": "pro",
        "username": "jane_sub",
        "email": "c",
        "password": "c",
        "address": "789 Reader Blvd, City, State",
        "phone": "555-0003",
        "role": "user",
        "is_subscribed": 1,
    },
]

for user in users_data:
    try:
        cur.execute(
            """INSERT INTO users (fname, lname, age, state, username, email, password, address, phone, role, is_subscribed)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user["fname"],
                user["lname"],
                user["age"],
                user["state"],
                user["username"],
                user["email"],
                user["password"],
                user["address"],
                user["phone"],
                user["role"],
                user["is_subscribed"],
            ),
        )
        print(f"✓ Inserted user: {user['email']} ({user['role']})")
    except Exception as e:
        print(f"Error inserting user {user['email']}: {e}")
        conn.rollback()

# Generate 20 unique books with 3 copies each
print("\n📚 Inserting books...")
for i in range(20):
    try:
        # Generate book data
        title = book_titles[i]
        catalog_code = f"BOOK{str(i+1).zfill(5)}"
        theme = random.choice(themes)
        publisher = random.choice(publishers)
        poster = book_images[i]  # One-to-one mapping with working images

        # Get or create theme
        cur.execute("SELECT id FROM themes WHERE name = ?", (theme,))
        theme_result = cur.fetchone()
        if theme_result:
            theme_id = theme_result[0]
        else:
            cur.execute("INSERT INTO themes (name) VALUES (?)", (theme,))
            theme_id = cur.lastrowid

        # Get or create publisher
        cur.execute("SELECT id FROM publishers WHERE name = ?", (publisher,))
        pub_result = cur.fetchone()
        if pub_result:
            publisher_id = pub_result[0]
        else:
            cur.execute("INSERT INTO publishers (name) VALUES (?)", (publisher,))
            publisher_id = cur.lastrowid

        # Insert book
        cur.execute(
            """INSERT INTO books (catalog_code, title, theme_id, publisher_id, poster)
               VALUES (?, ?, ?, ?, ?)""",
            (catalog_code, title, theme_id, publisher_id, poster),
        )
        book_id = cur.lastrowid

        # Add random authors (1-3 per book)
        num_authors = random.randint(1, 3)
        selected_authors = random.sample(authors, num_authors)
        for author_name in selected_authors:
            cur.execute("SELECT id FROM authors WHERE name = ?", (author_name,))
            auth_result = cur.fetchone()
            if auth_result:
                author_id = auth_result[0]
            else:
                cur.execute("INSERT INTO authors (name) VALUES (?)", (author_name,))
                author_id = cur.lastrowid

            cur.execute(
                """INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)""",
                (book_id, author_id),
            )

        # Add random keywords (2-4 per book)
        num_keywords = random.randint(2, 4)
        selected_keywords = random.sample(keywords_list, num_keywords)
        for keyword in selected_keywords:
            cur.execute("SELECT id FROM keyword WHERE word = ?", (keyword,))
            kw_result = cur.fetchone()
            if kw_result:
                keyword_id = kw_result[0]
            else:
                cur.execute("INSERT INTO keyword (word) VALUES (?)", (keyword,))
                keyword_id = cur.lastrowid

            cur.execute(
                """INSERT INTO book_keywords (book_id, keyword_id) VALUES (?, ?)""",
                (book_id, keyword_id),
            )

        # Insert 3 copies for each book
        for copy_num in range(3):
            copy_location = random.choice(locations)
            copy_publisher = random.choice(publishers)

            # Get or create copy's publisher
            cur.execute("SELECT id FROM publishers WHERE name = ?", (copy_publisher,))
            copy_pub_result = cur.fetchone()
            if copy_pub_result:
                copy_publisher_id = copy_pub_result[0]
            else:
                cur.execute(
                    "INSERT INTO publishers (name) VALUES (?)", (copy_publisher,)
                )
                copy_publisher_id = cur.lastrowid

            cur.execute(
                """INSERT INTO book_copies (book_id, location, publisher_id, is_available, state)
                   VALUES (?, ?, ?, 1, 100)""",
                (book_id, copy_location, copy_publisher_id),
            )

        print(f"✓ Inserted '{title}' with 3 copies...")

    except Exception as e:
        print(f"Error inserting book {i + 1}: {e}")
        conn.rollback()

conn.commit()
print("\n✅ Successfully inserted 3 users and 20 books with 3 copies each!")
print("\n👤 Users created:")
print("   Admin: a / a")
print("   User 1: b / b (subscribed)")
print("   User 2: c / c (subscribed)")
conn.close()
