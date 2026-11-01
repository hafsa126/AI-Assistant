# AI Assistant

A full stack web application prototype that helps users plan software projects, find technology solutions, and track job applications.

## Features

- **Dashboard:** Central workspace for accessing application tools.
- **Project Builder:** Accepts a project idea and type, generates a structured project overview, and saves it to the database.
- **Saved Items:** Retrieves previously generated project records.
- **Service Finder:** Provides technology recommendations based on business needs and budget using predefined rules.
- **Career Tracker:** Adds job applications and tracks their status: Saved, Applied, Interview, Selected, or Rejected.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** SQLite
- **Version Control:** Git and GitHub

## Project Structure

```text
AI-Assistant/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── database/
│   └── projects.db
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

The SQLite database is generated locally and excluded from GitHub.

## Installation and Setup

**Prerequisites:** Python 3.13 and pip.

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the project directory

```bash
cd AI-Assistant
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the application

```bash
python app.py
```

The application will be available at:

`http://127.0.0.1:5000/`

The database and required tables are initialized when the application is run directly using `python app.py`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Loads the application |
| GET | `/health` | Checks application status |
| POST | `/generate-project` | Generates and saves a project |
| GET | `/saved-projects` | Retrieves saved projects |
| POST | `/add-job` | Adds a job application |
| GET | `/jobs` | Retrieves job applications |
| POST | `/find-service` | Returns a service recommendation |

### Example API Requests

**1. Generate a project**

`POST /generate-project`

```json
{
  "idea": "An online learning platform",
  "project_type": "Web Application"
}
```

**2. Add a job application**

`POST /add-job`

```json
{
  "job_title": "Python Developer Intern",
  "company": "Example Company",
  "status": "Applied"
}
```

**3. Find a service**

`POST /find-service`

```json
{
  "problem": "automation",
  "budget": "medium"
}
```

All three endpoints accept JSON request bodies.

## Current Limitations

- Project Builder uses predefined development guidance, not an AI model.
- Service Finder uses rule based recommendations.
- File attachment functionality does not yet upload or process file contents.
- AI Chat, Product Comparison, and some navigation sections are placeholders.
- User authentication and account management are not implemented.
- Production deployment and configuration are not yet completed.

## Future Improvements

- Integrate an AI model through an API.
- Implement file uploading and document processing.
- Add authentication and user accounts.
- Complete the remaining application sections.
- Improve production security, testing, and deployment.

## Project Information

- **Project:** AI Assistant
- **Type:** Full-Stack Web Application Prototype
- **Status:** Development