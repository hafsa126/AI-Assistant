
// =====================================
// 1. WELCOME POPUP
// =====================================

const welcomeModal = document.getElementById("welcomeModal");
const closeModal = document.getElementById("closeModal");
const getStarted = document.getElementById("getStarted");

// Show popup only on the first visit
if (!localStorage.getItem("welcomeShown")) {
    welcomeModal.style.display = "flex";
}

function dismissWelcome() {
    welcomeModal.style.display = "none";
    localStorage.setItem("welcomeShown", "true");
}

closeModal.addEventListener("click", dismissWelcome);
getStarted.addEventListener("click", dismissWelcome);


// =====================================
// 2. MOBILE SIDEBAR
// =====================================

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");

menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Close sidebar when clicking outside it
document.addEventListener("click", (event) => {
    if (
        window.innerWidth <= 768 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !menuButton.contains(event.target)
    ) {
        sidebar.classList.remove("open");
    }
});


// =====================================
// 3. SIDEBAR NAVIGATION
// =====================================

const navItems = document.querySelectorAll("[data-page]");

const pages = {
    dashboard: document.getElementById("welcomeSection"),
    "project-builder": document.getElementById("projectBuilderPage"),
    saved: document.getElementById("savedPage"),
    "career-tracker": document.getElementById("careerTrackerPage"),
    "service-finder": document.getElementById("serviceFinderPage"),
    "ai-chat": document.getElementById("aiChatPage")
};

const chatSection = document.querySelector(".chat-section");

function showPage(selectedPage) {
    // Hide the welcome popup automatically
    if (welcomeModal) {
        welcomeModal.style.display = "none";
    }

    // Hide all available pages
    Object.entries(pages).forEach(([name, page]) => {
        if (page) {
            page.hidden = name !== selectedPage;
        }
    });

    // Hide chat when another module is opened
    if (chatSection) {
    chatSection.hidden = selectedPage !== "ai-chat";
}

    // Update active sidebar item
    navItems.forEach((item) => {
        item.classList.toggle(
            "active",
            item.dataset.page === selectedPage
        );
    });

    // Load data when needed
    if (selectedPage === "saved") {
        loadSavedProjects();
    }

    if (selectedPage === "career-tracker") {
        loadJobs();
    }

    // Return to top of workspace
    const mainContent = document.querySelector(".main-content");

if (mainContent) {
    mainContent.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

window.scrollTo(0, 0);
    // Close mobile sidebar
    if (sidebar) {
        sidebar.classList.remove("open");
    }
}

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        const selectedPage = item.dataset.page;

        if (pages[selectedPage]) {
            showPage(selectedPage);
        }
    });
});

async function loadSavedProjects() {
    const container = document.getElementById("savedProjectsList");

    container.innerHTML = "<p>Loading projects...</p>";

    try {
        const response = await fetch("/saved-projects");
        const projects = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load projects.");
        }

        if (projects.length === 0) {
            container.innerHTML = "<p>You haven't saved any projects yet.</p>";
            return;
        }

        container.innerHTML = "";

        projects.forEach((project) => {
            const card = document.createElement("div");
            card.className = "saved-project-card";

            const heading = document.createElement("h3");
            heading.textContent = project.idea;

            const type = document.createElement("p");
            type.textContent = "Type: " + project.project_type;

            const date = document.createElement("small");
            date.textContent = "Created: " + project.created_at;

            card.append(heading, type, date);
            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = error.message;
    }
}
// =====================================
// 4. FILE ATTACHMENT
// =====================================

const attachButton = document.getElementById("attachButton");
const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");

attachButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (file) {
        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please select a PDF, PNG or JPG image.");
            fileInput.value = "";
            fileName.textContent = "Attach a file";
            return;
        }

        // Limit file size to 5 MB
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be below 5 MB.");
            fileInput.value = "";
            fileName.textContent = "Attach a file";
            return;
        }

        fileName.textContent = file.name;
    }
});


// =====================================
// 5. CHAT INPUT
// =====================================

const chatInput = document.getElementById("chatInput");
const chatForm = document.getElementById("chatForm");

// Automatically increase input height
chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = chatInput.scrollHeight + "px";
});

// Prevent page reload when submitting
chatForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const message = chatInput.value.trim();

    if (!message && !fileInput.files.length) {
        alert("Please enter a message or attach a file.");
        return;
    }

    // Temporary confirmation until the AI backend is connected
    alert(
        "Your message is ready. AI chat functionality will be connected to the backend next."
    );

    console.log("User message:", message);

    // Clear input
    chatInput.value = "";
    chatInput.style.height = "auto";

    fileInput.value = "";
    fileName.textContent = "Attach a file";
});
const generateButton = document.getElementById("generateProject");

generateButton.addEventListener("click", async () => {
    const idea = document.getElementById("projectIdea").value.trim();
    const projectType = document.getElementById("projectType").value;
    const resultBox = document.getElementById("projectResult");

    if (!idea) {
        alert("Please enter your project idea first.");
        return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Generating...";

    try {
        const response = await fetch("/generate-project", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idea: idea,
                project_type: projectType
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        resultBox.innerHTML = data.result;
        resultBox.hidden = false;

    } catch (error) {
        alert(error.message);
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = "Generate Project Plan";
    }
});

// =====================================
// CAREER TRACKER
// =====================================

const addJobButton = document.getElementById("addJobButton");

if (addJobButton) {
    addJobButton.addEventListener("click", async () => {
        const jobTitle = document.getElementById("jobTitle").value.trim();
        const company = document.getElementById("companyName").value.trim();
        const status = document.getElementById("jobStatus").value;

        if (!jobTitle || !company) {
            alert("Please enter the job title and company.");
            return;
        }

        try {
            const response = await fetch("/add-job", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    job_title: jobTitle,
                    company: company,
                    status: status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to save job.");
            }

            document.getElementById("jobTitle").value = "";
            document.getElementById("companyName").value = "";

            loadJobs();
            alert("Job opportunity saved!");

        } catch (error) {
            alert(error.message || "Unable to save job.");
        }
    });
}

async function loadJobs() {
    const container = document.getElementById("jobList");

    if (!container) return;

    try {
        const response = await fetch("/jobs");
        const jobs = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load applications.");
        }

        container.replaceChildren();

        if (jobs.length === 0) {
            container.textContent = "No applications added yet.";
            return;
        }

        jobs.forEach(job => {
            const card = document.createElement("div");
            card.className = "saved-project-card";

            const heading = document.createElement("h3");
            heading.textContent = job.job_title;

            const company = document.createElement("p");
            company.textContent = "Company: " + job.company;

            const status = document.createElement("p");
            status.textContent = "Status: " + job.status;

            card.append(heading, company, status);
            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = "Unable to load applications.";
    }
}
// =====================================
// SERVICE FINDER
// =====================================

const findServiceButton = document.getElementById("findServiceButton");

if (findServiceButton) {
    findServiceButton.addEventListener("click", async () => {
        const problem = document.getElementById("businessProblem").value;
        const budget = document.getElementById("businessBudget").value;
        const resultBox = document.getElementById("serviceResult");

        if (!problem || !budget) {
            alert("Please select your business need and budget.");
            return;
        }

        findServiceButton.disabled = true;
        findServiceButton.textContent = "Finding solutions...";

        try {
            const response = await fetch("/find-service", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    problem: problem,
                    budget: budget
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to find a solution.");
            }

            resultBox.replaceChildren();

            const heading = document.createElement("h2");
            heading.textContent = "Recommended Solution";

            const recommendation = document.createElement("p");
            recommendation.textContent = data.recommendation;

            resultBox.append(heading, recommendation);
            resultBox.hidden = false;

        } catch (error) {
            alert(error.message);
        } finally {
            findServiceButton.disabled = false;
            findServiceButton.textContent = "Find Suitable Services";
        }
    });
}