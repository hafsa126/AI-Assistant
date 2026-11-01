from flask import Flask, render_template, request, jsonify
from html import escape
import sqlite3
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_DIR = os.path.join(BASE_DIR, "database")
os.makedirs(DATABASE_DIR, exist_ok=True)

DATABASE = os.path.join(DATABASE_DIR, "projects.db")


# Create database and table
def init_db():
    conn = sqlite3.connect(DATABASE)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            idea TEXT NOT NULL,
            project_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_title TEXT NOT NULL,
            company TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

@app.route("/")
def dashboard():
    return render_template("index.html")


@app.route("/health")
def health():
    return {"status": "running"}


# Generate and save project
@app.route("/generate-project", methods=["POST"])
def generate_project():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request."}), 400

    idea = data.get("idea", "")
    project_type = data.get("project_type", "Web Application")

    if not isinstance(idea, str):
        return jsonify({"error": "Project idea must be text."}), 400

    if not isinstance(project_type, str):
        return jsonify({"error": "Invalid project type."}), 400

    idea = idea.strip()

    if not idea:
        return jsonify({"error": "Please enter a project idea."}), 400

    idea = idea[:1000]
    project_type = project_type[:100]

    result = f"""
    <h2>Project Overview</h2>
    <p><strong>Project idea:</strong> {escape(idea)}</p>
    <p><strong>Project type:</strong> {escape(project_type)}</p>

    <h3>Suggested Development Steps</h3>
    <ol>
        <li>Define the main problem and target users.</li>
        <li>List the essential features for the first version.</li>
        <li>Design the user interface and database.</li>
        <li>Build the frontend and backend.</li>
        <li>Test the application and fix errors.</li>
        <li>Deploy the completed project.</li>
    </ol>

    <h3>Suggested Technology</h3>
    <p>HTML, CSS, JavaScript, Python, Flask and SQLite.</p>
    """

    conn = sqlite3.connect(DATABASE)

    cursor = conn.execute(
        "INSERT INTO projects (idea, project_type) VALUES (?, ?)",
        (idea, project_type)
    )

    project_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "id": project_id,
        "result": result,
        "message": "Project saved successfully."
    })


# Retrieve saved projects
@app.route("/saved-projects", methods=["GET"])
def saved_projects():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    projects = conn.execute(
        "SELECT * FROM projects ORDER BY created_at DESC"
    ).fetchall()

    conn.close()

    return jsonify([dict(project) for project in projects])

# Add a job application
@app.route("/add-job", methods=["POST"])
def add_job():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request."}), 400

    job_title = data.get("job_title", "")
    company = data.get("company", "")
    status = data.get("status", "Saved")

    if not all(isinstance(value, str) for value in [job_title, company, status]):
        return jsonify({"error": "Invalid input."}), 400

    job_title = job_title.strip()[:150]
    company = company.strip()[:150]

    allowed_statuses = ["Saved", "Applied", "Interview", "Selected", "Rejected"]

    if not job_title or not company or status not in allowed_statuses:
        return jsonify({"error": "Please enter valid job details."}), 400

    conn = sqlite3.connect(DATABASE)

    conn.execute(
        "INSERT INTO jobs (job_title, company, status) VALUES (?, ?, ?)",
        (job_title, company, status)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Job added successfully."})


# Retrieve job applications
@app.route("/jobs", methods=["GET"])
def get_jobs():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    jobs = conn.execute(
        "SELECT * FROM jobs ORDER BY created_at DESC"
    ).fetchall()

    conn.close()

    return jsonify([dict(job) for job in jobs])
# Service Finder
@app.route("/find-service", methods=["POST"])
def find_service():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request."}), 400

    problem = data.get("problem")
    budget = data.get("budget")

    if not isinstance(problem, str) or not isinstance(budget, str):
        return jsonify({"error": "Business need and budget must be text."}), 400

    recommendations = {
        "website": {
            "low": "Use WordPress or a simple HTML, CSS and JavaScript website.",
            "medium": "Consider a custom website using Flask or Django.",
            "high": "Consider a full-stack website with a custom backend and database."
        },
        "automation": {
            "low": "Use Python scripts to automate repetitive tasks.",
            "medium": "Consider Python automation with APIs and workflow tools.",
            "high": "Consider a custom automation platform with integrated business workflows."
        },
        "data": {
            "low": "Use Excel or Google Sheets for basic data management.",
            "medium": "Consider Python with Pandas and visualization tools.",
            "high": "Consider a custom analytics solution with a database and BI dashboard."
        },
        "mobile": {
            "low": "Consider a simple mobile app prototype using a low-code tool.",
            "medium": "Consider Flutter for cross-platform mobile development.",
            "high": "Consider a custom mobile application with a dedicated backend."
        },
        "cloud": {
            "low": "Start with a basic cloud storage service.",
            "medium": "Consider managed cloud hosting and storage.",
            "high": "Consider scalable cloud infrastructure with monitoring and backups."
        }
    }

    if problem not in recommendations or budget not in ["low", "medium", "high"]:
        return jsonify({"error": "Please select a valid business need and budget."}), 400

    return jsonify({
        "recommendation": recommendations[problem][budget],
        "message": "Recommendation generated successfully."
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True)