// ===============================
// Core JS for My Learning Hub (GitHub Pages Safe)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  console.log("My Learning Hub loaded ✅");

  // Detect subject from URL (used for topic/subtopic pages)
  const subject = window.location.pathname.includes("chemistry")
    ? "chemistry"
    : "cybersecurity";

  const basePath = "/my-learning-hub"; // CHANGE this if your repo name differs
  const container = document.querySelector(".topics-container");

  // Load topics only on subject pages
  if (container) {
    fetch(`${basePath}/data/${subject}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch JSON");
        return res.json();
      })
      .then((data) => buildTopics(data))
      .catch((err) => console.error("Error loading topics:", err));
  }

  // ===============================
  // Build topics + subtopics
  // ===============================
  function buildTopics(topics) {
    topics.forEach((topic) => {
      const topicDiv = document.createElement("div");
      topicDiv.classList.add("topic");
      topicDiv.dataset.topic = topic.name;
      topicDiv.textContent = topic.name;
      container.appendChild(topicDiv);

      const subList = document.createElement("ol");
      subList.classList.add("subtopics-container");

      topic.subtopics.forEach((sub) => {
        const li = document.createElement("li");
        li.classList.add("topic-btn");
        li.dataset.topicId = sub.id;
        li.textContent = sub.name;
        subList.appendChild(li);
      });

      container.appendChild(subList);
    });

    initMainTopicLadder();
    attachSubtopicListeners();
  }

  // ===============================
  // Toggle topic ladder
  // ===============================
  function initMainTopicLadder() {
    const mainTopics = document.querySelectorAll(".topic");
    let selected = null;

    mainTopics.forEach((topic) => {
      topic.addEventListener("click", () => {
        if (selected) selected.classList.remove("active-topic");
        topic.classList.add("active-topic");
        selected = topic;

        document.querySelectorAll(".subtopics-container.visible").forEach((el) => {
          if (el !== topic.nextElementSibling) el.classList.remove("visible");
        });

        const sub = topic.nextElementSibling;
        if (sub && sub.classList.contains("subtopics-container")) {
          sub.classList.toggle("visible");
        }
      });
    });
  }

  // ===============================
  // Subtopic click → viewer
  // ===============================
  function attachSubtopicListeners() {
    const subBtns = document.querySelectorAll(".topic-btn");
    subBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const topicId = btn.dataset.topicId;
        window.location.href = `${basePath}/viewer.html?subject=${subject}&topic=${topicId}`;
      });
    });
  }

  // ===============================
  // Viewer page logic
  // ===============================
  if (window.location.pathname.endsWith("viewer.html")) {
    populateViewer();
  }

  function populateViewer() {
    const params = getQueryParams();
    const contentContainer = document.getElementById("viewer-content");
    const topicNameElem = document.querySelector("header p");
    const backBtn = document.getElementById("back-btn");

    if (!params.subject || !params.topic) return;

    backBtn.href = `${basePath}/subjects/${params.subject}.html`;

    fetch(`${basePath}/data/${params.subject}.json`)
      .then((res) => res.json())
      .then((data) => {
        let foundSubtopic = null;

        data.forEach((topic) => {
          topic.subtopics.forEach((sub) => {
            if (sub.id === params.topic) foundSubtopic = sub;
          });
        });

        if (!foundSubtopic) {
          contentContainer.innerHTML = "<p>Content not found.</p>";
          return;
        }

        topicNameElem.textContent = `Topic: ${foundSubtopic.name}`;

        if (foundSubtopic.url.includes("youtube.com")) {
          const embedUrl = foundSubtopic.url.replace("watch?v=", "embed/");
          contentContainer.innerHTML = `
            <iframe width="100%" height="500"
              src="${embedUrl}"
              frameborder="0"
              allowfullscreen>
            </iframe>`;
        } else {
          contentContainer.innerHTML = `
            <iframe width="100%" height="500"
              src="${foundSubtopic.url}"
              frameborder="0">
            </iframe>`;
        }
      })
      .catch((err) => {
        console.error("Viewer load error:", err);
        contentContainer.innerHTML = "<p>Failed to load content.</p>";
      });
  }

  // Helper: extract query params
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      subject: params.get("subject"),
      topic: params.get("topic"),
    };
  }
});
