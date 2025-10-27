// ===============================
// Core JS for My Learning Hub
// ===============================

// ===============================
// Placeholder functions for modules/topics
// ===============================

function markCompleted(topicId) {
  console.log(`Topic "${topicId}" marked completed (placeholder)`);
  // Future: save to localStorage and update UI
}

function openViewer(topicId, subject) {
  console.log(`Opening viewer for topic "${topicId}" in subject "${subject}"`);
  window.location.href = `/my-hub/viewer.html?subject=${subject}&topic=${topicId}`;
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    subject: params.get('subject'),
    topic: params.get('topic')
  };
}

// ===============================
// Viewer Page Logic
// ===============================
function populateViewer() {
  const params = getQueryParams();
  const titleElem = document.getElementById('topic-title');
  const backBtn = document.getElementById('back-btn');
  const contentContainer = document.getElementById('viewer-content');

  if (!params.subject || !params.topic) return;

  // Back button path
  backBtn.href = `subjects/${params.subject}.html`;

  // Load the JSON for this subject
  fetch(`../data/${params.subject}.json`)
    .then(res => res.json())
    .then(data => {
      let foundSubtopic = null;

      // Find matching subtopic by ID
      data.forEach(topic => {
        topic.subtopics.forEach(sub => {
          if (sub.id === params.topic) foundSubtopic = sub;
        });
      });

      if (!foundSubtopic) {
        contentContainer.innerHTML = `<p> Content not found for this topic.</p>`;
        return;
      }

      // Display topic name
      titleElem.textContent = foundSubtopic.name;

      // Determine type: YouTube video or article
      if (foundSubtopic.url.includes('youtube.com') || foundSubtopic.url.includes('youtu.be')) {
        // Convert YouTube URL to embeddable
        let embedUrl = foundSubtopic.url
          .replace('watch?v=', 'embed/')
          .replace('youtu.be/', 'www.youtube.com/embed/');
        contentContainer.innerHTML = `
          <div style="display:flex;justify-content:center;">
            <iframe width="80%" height="480" src="${embedUrl}" 
              frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
              encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
            </iframe>
          </div>`;
      } else {
        // Show webpage article
        contentContainer.innerHTML = `
          <iframe src="${foundSubtopic.url}" width="100%" height="600" 
            style="border:none;border-radius:0.5rem;">
          </iframe>`;
      }
    })
    .catch(err => {
      console.error('Error loading viewer:', err);
      contentContainer.innerHTML = `<p> Failed to load viewer content.</p>`;
    });
}

// ===============================
// Dynamic loader for subject topics
// ===============================
function loadSubjectData() {
  const container = document.querySelector('.topics-container');
  if (!container) return;

  const path = window.location.pathname;
  const subject = path.includes('cybersecurity')
    ? 'cybersecurity'
    : path.includes('chemistry')
    ? 'chemistry'
    : null;

  if (!subject) return;

  fetch(`/my-hub/data/${subject}.json`)
    .then(res => res.json())
    .then(data => {
      buildTopicStructure(container, data);
      initMainTopicLadder();
      attachSubtopicListeners(subject);
    })
    .catch(err => console.error(`Failed to load ${subject}.json:`, err));
}

// ===============================
// Build topics and subtopics
// ===============================
function buildTopicStructure(container, data) {
  container.innerHTML = '';

  data.forEach(topic => {
    const topicDiv = document.createElement('div');
    topicDiv.classList.add('topic');
    topicDiv.dataset.topic = topic.name;
    topicDiv.textContent = topic.name;
    container.appendChild(topicDiv);

    if (topic.subtopics && topic.subtopics.length > 0) {
      const subList = document.createElement('ol');
      subList.classList.add('subtopics-container');

      topic.subtopics.forEach(sub => {
        const li = document.createElement('li');
        li.classList.add('topic-btn');
        li.dataset.topicId = sub.id; // ✅ ID = "net_1" (for linking)
        li.textContent = sub.name;   // ✅ Display name = "TCP/IP"
        subList.appendChild(li);
      });

      container.appendChild(subList);
    }
  });
}

// ===============================
// Main-topic ladder logic
// ===============================
function initMainTopicLadder() {
  const mainTopics = document.querySelectorAll('.topic');
  let selectedTopic = null;

  mainTopics.forEach(topic => {
    topic.addEventListener('click', () => {
      const topicName = topic.dataset.topic;
      console.log(`Main topic "${topicName}" clicked`);

      if (selectedTopic) selectedTopic.classList.remove('active-topic');
      topic.classList.add('active-topic');
      selectedTopic = topic;

      document.querySelectorAll('.subtopics-container.visible').forEach(container => {
        if (container !== topic.nextElementSibling) container.classList.remove('visible');
      });

      const subtopicsContainer = topic.nextElementSibling;
      if (
        subtopicsContainer &&
        subtopicsContainer.classList.contains('subtopics-container')
      ) {
        subtopicsContainer.classList.toggle('visible');
      }
    });
  });
}

// ===============================
// Subtopic buttons
// ===============================
function attachSubtopicListeners(subject) {
  const topicButtons = document.querySelectorAll('.topic-btn');

  topicButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.topicId; // use ID like net_1
      openViewer(topicId, subject);
      markCompleted(topicId);
    });
  });
}

// ===============================
// DOMContentLoaded
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Core JS loaded and initializing...');
  loadSubjectData();

  if (window.location.pathname.endsWith('viewer.html')) {
    populateViewer();
  }
});
