// js/admin.js

let projects = [];
let currentProject = null;
let heroImageFile = null;
let galleryImageFiles = [];

// Load projects on page load
document.addEventListener("DOMContentLoaded", loadProjects);

async function loadProjects() {
  try {
    const response = await fetch("/data/projects.json");
    const data = await response.json();
    projects = data.projects;
    renderProjects();
  } catch (error) {
    showAlert("Failed to load projects", "error");
  }
}

function renderProjects() {
  const grid = document.getElementById("projects-grid");

  if (projects.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No projects yet. Add your first one!</p>';
    return;
  }

  grid.innerHTML = projects
    .map(
      (project) => `
    <div class="project-card">
      <img src="${project.image}" alt="${project.title}">
      <div class="project-card-content">
        <h3>${project.title}</h3>
        <p>${project.category} • ${project.year}</p>
        <p>${project.description}</p>
        <div class="project-card-actions">
          <button class="btn" onclick='editProject("${project.id}")'>Edit</button>
          <button class="btn btn-danger" onclick='deleteProject("${project.id}")'>Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function openAddModal() {
  currentProject = null;
  document.getElementById("modal-title").textContent = "Add New Project";
  document.getElementById("project-form").reset();
  document.getElementById("project-id").value = "";
  document.getElementById("hero-preview").innerHTML = "";
  document.getElementById("gallery-preview").innerHTML = "";
  heroImageFile = null;
  galleryImageFiles = [];
  document.getElementById("project-modal").classList.add("active");
}

function editProject(projectId) {
  currentProject = projects.find((p) => p.id === projectId);
  if (!currentProject) return;

  document.getElementById("modal-title").textContent = "Edit Project";
  document.getElementById("project-id").value = currentProject.id;
  document.getElementById("title").value = currentProject.title;
  document.getElementById("slug").value = currentProject.slug;
  document.getElementById("category").value = currentProject.category;
  document.getElementById("description").value = currentProject.description;
  document.getElementById("story").value = currentProject.story || "";
  document.getElementById("client").value = currentProject.client || "";
  document.getElementById("year").value = currentProject.year;

  // Show existing hero image
  if (currentProject.image) {
    document.getElementById("hero-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${currentProject.image}" alt="Hero">
      </div>
    `;
  }

  // Show existing gallery images
  if (currentProject.images && currentProject.images.length > 0) {
    document.getElementById("gallery-preview").innerHTML = currentProject.images
      .map(
        (img, index) => `
      <div class="image-preview-item">
        <img src="${img}" alt="Gallery ${index + 1}">
      </div>
    `
      )
      .join("");
  }

  document.getElementById("project-modal").classList.add("active");
}

function closeModal() {
  document.getElementById("project-modal").classList.remove("active");
}

function handleHeroUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  heroImageFile = file;
  const reader = new FileReader();

  reader.onload = (e) => {
    document.getElementById("hero-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${e.target.result}" alt="Hero preview">
      </div>
    `;
  };

  reader.readAsDataURL(file);
}

function handleGalleryUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  galleryImageFiles = [...galleryImageFiles, ...files];

  const previewHTML = galleryImageFiles
    .map((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById(`gallery-img-${index}`);
        if (preview) preview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      return `
      <div class="image-preview-item">
        <img id="gallery-img-${index}" alt="Gallery ${index + 1}">
        <button type="button" class="remove-image" onclick="removeGalleryImage(${index})">×</button>
      </div>
    `;
    })
    .join("");

  document.getElementById("gallery-preview").innerHTML = previewHTML;
}

function removeGalleryImage(index) {
  galleryImageFiles.splice(index, 1);
  handleGalleryUpload({ target: { files: [] } }); // Re-render
}

async function deleteProject(projectId) {
  if (!confirm("Are you sure you want to delete this project?")) return;

  try {
    showLoading();

    const response = await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId }),
    });

    if (!response.ok) throw new Error("Delete failed");

    projects = projects.filter((p) => p.id !== projectId);
    renderProjects();
    showAlert("Project deleted successfully!", "success");
  } catch (error) {
    showAlert("Failed to delete project", "error");
  } finally {
    hideLoading();
  }
}

// Form submission
document
  .getElementById("project-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Gather form data
    const projectData = {
      id: document.getElementById("project-id").value || generateId(),
      title: document.getElementById("title").value,
      slug: document.getElementById("slug").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
      story: document.getElementById("story").value,
      client: document.getElementById("client").value,
      year: document.getElementById("year").value,
    };

    formData.append("project", JSON.stringify(projectData));

    if (heroImageFile) {
      formData.append("heroImage", heroImageFile);
    }

    galleryImageFiles.forEach((file, index) => {
      formData.append(`galleryImage${index}`, file);
    });

    try {
      showLoading();

      const response = await fetch("/api/projects", {
        method: currentProject ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Save failed");

      const result = await response.json();

      if (currentProject) {
        const index = projects.findIndex((p) => p.id === currentProject.id);
        projects[index] = result.project;
      } else {
        projects.push(result.project);
      }

      renderProjects();
      closeModal();
      showAlert("Project saved successfully!", "success");
    } catch (error) {
      showAlert("Failed to save project", "error");
    } finally {
      hideLoading();
    }
  });

function generateId() {
  return (
    "project-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
  );
}

function showAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.textContent = message;
  alert.className = `alert ${type} active`;
  setTimeout(() => alert.classList.remove("active"), 5000);
}

function showLoading() {
  document.getElementById("submit-text").style.display = "none";
  document.getElementById("submit-loader").style.display = "inline-block";
}

function hideLoading() {
  document.getElementById("submit-text").style.display = "inline";
  document.getElementById("submit-loader").style.display = "none";
}
