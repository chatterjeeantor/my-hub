// ===============================
// Core JS for My Learning Hub (GitHub Pages Compatible)
// ===============================

// -------------------------------
// Utility Functions
// -------------------------------
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    subject: params.get("subject"),
    topic: params.get("topic")
  };
}

function markCompleted(topicId) {
  console.log(`✅ Topic "${topicId}" marked completed (placeholder)`);
}

// Open viewer.html with correct params
function openViewer(topicId, subject) {
  // Handle both local and GitHub Pages paths
  const basePath = window.location.origin.includes("github.io")
    ? "/my-hub"
    : "";
  window.location.href = `${basePath}/viewer.html?subject=${subject}&topic=${topicId}`;
}

// -------------------------------
// Detect correct JSON path
// -------------------------------
function resolveDataPath(subject) {
  const basePath = window.location.origin.includes("github.io")
    ? "/my-hub"
    : ".";
  return `${basePath}/data/${subject}.json`;
}

// -------------------------------
// DOM Ready
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // If on subject page (like cybersecurity.html)
  if (path.includes("subjects/")) {
    const subject = path.split("/").pop().replace(".html", "");
    const container = document.querySelector(".topics-container");

    fetch(resolveDataPath(subject))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => buildTopics(data, subject, container))
      .catch(err => console.error("❌ JSON load failed:", err));
  }

  // If on viewer page
  if (path.endsWith("viewer.html")) {
    populateViewer();
  }
});

// -------------------------------
// Build topics + subtopics
// -------------------------------
function buildTopics(data, subject, container) {
  data.forEach(topic => {
    // Main topic element
    const topicDiv = document.createElement("div");
    topicDiv.classList.add("topic");
    topicDiv.dataset.topic = topic.name;
    topicDiv.textContent = topic.name;
    container.appendChild(topicDiv);

    // Subtopics list
    const subList = document.createElement("ol");
    subList.classList.add("subtopics-container");

    topic.subtopics.forEach(sub => {
      const li = document.createElement("li");
      li.classList.add("topic-btn");
      li.dataset.topicId = sub.id;
      li.textContent = sub.name;
      subList.appendChild(li);
    });

    container.appendChild(subList);
  });

  initMainTopicLadder();
  attachSubtopicListeners(subject);
}

// -------------------------------
// Toggle subtopics visibility
// -------------------------------
function initMainTopicLadder() {
  const mainTopics = document.querySelectorAll(".topic");
  mainTopics.forEach(topic => {
    topic.addEventListener("click", () => {
      const subtopics = topic.nextElementSibling;
      if (subtopics && subtopics.classList.contains("subtopics-container")) {
        subtopics.classList.toggle("visible");
      }
    });
  });
}

// -------------------------------
// Subtopic buttons → Viewer
// -------------------------------
function attachSubtopicListeners(subject) {
  document.querySelectorAll(".topic-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const topicId = btn.dataset.topicId;
      openViewer(topicId, subject);
      markCompleted(topicId);
    });
  });
}

// -------------------------------
// Populate viewer.html
// -------------------------------
function populateViewer() {
  const { subject, topic } = getQueryParams();
  const header = document.querySelector("header p");
  const backBtn = document.getElementById("back-btn");
  const viewerContent = document.getElementById("viewer-content");

  if (!subject || !topic) {
    viewerContent.innerHTML = "<p>⚠️ Invalid topic link.</p>";
    return;
  }

  // Handle path for back button and JSON
  const basePath = window.location.origin.includes("github.io")
    ? "/my-hub"
    : ".";
  backBtn.href = `${basePath}/subjects/${subject}.html`;

  // Load JSON data
  fetch(resolveDataPath(subject))
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      let found = null;
      data.forEach(t => {
        t.subtopics.forEach(s => {
          if (s.id === topic) found = s;
        });
      });

      if (!found) {
        viewerContent.innerHTML = "<p>Topic not found.</p>";
        return;
      }

      header.textContent = `Topic: ${found.name}`;

      // Show video or article
      if (found.url && found.url.includes("youtube.com")) {
        viewerContent.innerHTML = `
          <iframe width="100%" height="500"
            src="${found.url.replace("watch?v=", "embed/")}"
            frameborder="0" allowfullscreen>
          </iframe>`;
      } else if (found.url) {
        viewerContent.innerHTML = `
          <iframe width="100%" height="500"
            src="${found.url}" frameborder="0">
          </iframe>`;
      } else {
        viewerContent.innerHTML = "<p>No content available.</p>";
      }
    })
    .catch(err => {
      console.error("Error loading viewer:", err);
      viewerContent.innerHTML = "<p>Failed to load content.</p>";
    });
}
