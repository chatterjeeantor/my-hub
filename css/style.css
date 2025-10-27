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
  console.log(`Topic "${topicId}" marked completed (placeholder)`);
}

// Open viewer.html with correct params
function openViewer(topicId, subject) {
  window.location.href = `/my-hub/viewer.html?subject=${subject}&topic=${topicId}`;
}

// -------------------------------
// Build Topics Dynamically
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // If we’re on a subject page (like cybersecurity.html)
  if (path.includes("subjects/")) {
    const subject = path.split("/").pop().replace(".html", "");
    const container = document.querySelector(".topics-container");

    fetch(`/my-hub/data/${subject}.json`)
      .then(res => res.json())
      .then(data => buildTopics(data, subject, container))
      .catch(err => console.error("Failed to load topics:", err));
  }

  // If we’re on the viewer page
  if (path.endsWith("viewer.html")) {
    populateViewer();
  }
});

// -------------------------------
// Build topics + subtopics
// -------------------------------
function buildTopics(data, subject, container) {
  data.forEach(topic => {
    const topicDiv = document.createElement("div");
    topicDiv.classList.add("topic");
    topicDiv.dataset.topic = topic.name;
    topicDiv.textContent = topic.name;
    container.appendChild(topicDiv);

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
    viewerContent.innerHTML = "<p>Invalid topic link.</p>";
    return;
  }

  // Back button
  backBtn.href = `/my-hub/subjects/${subject}.html`;

  // Load JSON
  fetch(`/my-hub/data/${subject}.json`)
    .then(res => res.json())
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

      // Show content
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
