// ===============================
// Core JS for My Learning Hub (GitHub Pages Compatible)
// ===============================

// -------------------------------
// Utility functions
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

function openViewer(topicId, subject) {
  window.location.href = `/my-hub/viewer.html?subject=${subject}&topic=${topicId}`;
}

// Smart path resolver (works locally + on GitHub Pages)
function resolveDataPath(subject) {
  const origin = window.location.origin;
  const isGitHub = origin.includes("github.io");

  if (isGitHub) {
    // GitHub Pages: include repository name
    return `${origin}/my-hub/data/${subject}.json`;
  } else {
    // Local dev
    return `../data/${subject}.json`;
  }
}

// -------------------------------
// DOM load handler
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // If we’re on a subject page (like subjects/cybersecurity.html)
  if (path.includes("subjects/")) {
    const subject = path.split("/").pop().replace(".html", "");
    const container = document.querySelector(".topics-container");
    const dataPath = resolveDataPath(subject);

    fetch(dataPath)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("✅ JSON loaded:", data);
        buildTopics(data, subject, container);
      })
      .catch(err => console.error("❌ JSON load failed:", err));
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
  document.querySelectorAll(".topic").forEach(topic => {
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
function populateViewer(topicId) {
  fetch("../js/chemistry.json")
    .then(response => response.json())
    .then(data => {
      let found = null;

      // search through all topics and subtopics
      data.forEach(topic => {
        topic.subtopics.forEach(sub => {
          if (sub.id === topicId || sub["data-topic"] === topicId) {
            found = sub;
          }
        });
      });

      if (!found) {
        document.getElementById("viewer-content").innerHTML = "<p>Topic not found.</p>";
        return;
      }

      // prepare embed URL
      let embedUrl = found.url || "";

      if (embedUrl) {
        if (embedUrl.includes("watch?v=")) {
          embedUrl = embedUrl.replace("watch?v=", "embed/");
        } else if (embedUrl.includes("youtu.be/")) {
          embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
        } else if (embedUrl.includes("shorts/")) {
          embedUrl = embedUrl.replace("shorts/", "embed/");
        }
      }

      // inject content
      document.getElementById("viewer-content").innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${found.name}</h2>
        ${embedUrl ? `
          <iframe width="100%" height="480"
            src="${embedUrl}"
            frameborder="0"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        ` : "<p>No video available.</p>"}
        ${found.description ? `<p class="mt-4 text-gray-700">${found.description}</p>` : ""}
      `;
    })
    .catch(error => {
      console.error("Error loading topic:", error);
      document.getElementById("viewer-content").innerHTML = "<p>Error loading topic.</p>";
    });
}
