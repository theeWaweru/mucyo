// js/admin-full.js

let cmsData = {
  projects: [],
  infoSection: [],
  faqs: [],
  testimonials: [],
  siteSettings: {},
};
let projectHeroFile = null;
let projectGalleryFiles = [];
let infoImageFile = null;
let testimonialImageFile = null;

function showAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.textContent = message;
  alert.className = `alert ${type} active`;
  setTimeout(() => alert.classList.remove("active"), 5000);
}

document.addEventListener("DOMContentLoaded", loadAll);

async function loadAll() {
  try {
    const response = await fetch("/data/projects.json");
    cmsData = await response.json();
    renderAll();
  } catch (error) {
    showAlert("Failed to load data", "error");
  }
}

function renderAll() {
  renderProjects();
  renderInfo();
  renderFAQs();
  renderTestimonials();
}

function switchTab(tab) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));

  event.target.classList.add("active");
  document.getElementById(`${tab}-tab`).classList.add("active");
}

function renderProjects() {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = cmsData.projects
    .map(
      (p) => `
    <div class="card">
      <img src="${p.image || "images/placeholder.jpg"}" alt="${p.title}">
      <div class="card-content">
        <h3>${p.title}</h3>
        <p>${p.category} • ${p.year}</p>
        <p>${p.description.substring(0, 80)}...</p>
        <div class="card-actions">
          <button class="btn" onclick='editProject(${JSON.stringify(p).replace(
            /'/g,
            "&apos;"
          )})'>Edit</button>
          <button class="btn btn-danger" onclick='deleteItem("projects", "${
            p.id
          }")'>Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function renderInfo() {
  const grid = document.getElementById("info-grid");
  grid.innerHTML = cmsData.infoSection
    .map(
      (i) => `
    <div class="card">
      <img src="${i.image || "images/placeholder.jpg"}" alt="${i.title}">
      <div class="card-content">
        <h3>${i.title}</h3>
        <p>Order: ${i.order}</p>
        <p>${i.description}</p>
        <div class="card-actions">
          <button class="btn" onclick='editInfo(${JSON.stringify(i).replace(
            /'/g,
            "&apos;"
          )})'>Edit</button>
          <button class="btn btn-danger" onclick='deleteItem("infoSection", "${
            i.id
          }")'>Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function renderFAQs() {
  const grid = document.getElementById("faqs-grid");
  grid.innerHTML = cmsData.faqs
    .map(
      (f) => `
    <div class="card">
      <div class="card-content">
        <h3>${f.question}</h3>
        <p>Order: ${f.order}</p>
        <p>${f.answer.substring(0, 100)}...</p>
        <div class="card-actions">
          <button class="btn" onclick='editFAQ(${JSON.stringify(f).replace(
            /'/g,
            "&apos;"
          )})'>Edit</button>
          <button class="btn btn-danger" onclick='deleteItem("faqs", "${
            f.id
          }")'>Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function renderTestimonials() {
  const grid = document.getElementById("testimonials-grid");
  grid.innerHTML = cmsData.testimonials
    .map(
      (t) => `
    <div class="card">
      <img src="${t.image || "images/placeholder.jpg"}" alt="${t.name}">
      <div class="card-content">
        <h3>${t.name}</h3>
        <p>${t.role}</p>
        <p>"${t.quote.substring(0, 80)}..."</p>
        <p>${t.featured ? "⭐ Featured" : ""}</p>
        <div class="card-actions">
          <button class="btn" onclick='editTestimonial(${JSON.stringify(
            t
          ).replace(/'/g, "&apos;")})'>Edit</button>
          <button class="btn btn-danger" onclick='deleteItem("testimonials", "${
            t.id
          }")'>Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// Modal functions
function openProjectModal() {
  document.getElementById("project-form").reset();
  document.getElementById("project-id").value = "";
  document.getElementById("project-hero-preview").innerHTML = "";
  document.getElementById("project-gallery-preview").innerHTML = "";
  projectHeroFile = null;
  projectGalleryFiles = [];
  document.getElementById("project-modal").classList.add("active");
}

function openInfoModal() {
  document.getElementById("info-form").reset();
  document.getElementById("info-id").value = "";
  document.getElementById("info-image-preview").innerHTML = "";
  infoImageFile = null;
  document.getElementById("info-modal").classList.add("active");
}

function openFAQModal() {
  document.getElementById("faq-form").reset();
  document.getElementById("faq-id").value = "";
  document.getElementById("faq-modal").classList.add("active");
}

function openTestimonialModal() {
  document.getElementById("testimonial-form").reset();
  document.getElementById("testimonial-id").value = "";
  document.getElementById("testimonial-image-preview").innerHTML = "";
  testimonialImageFile = null;
  document.getElementById("testimonial-modal").classList.add("active");
}

function closeModal(type) {
  document.getElementById(`${type}-modal`).classList.remove("active");
}

function editProject(project) {
  document.getElementById("project-id").value = project.id;
  document.getElementById("project-title").value = project.title;
  document.getElementById("project-slug").value = project.slug;
  document.getElementById("project-category").value = project.category;
  document.getElementById("project-description").value = project.description;
  document.getElementById("project-story").value = project.story || "";
  document.getElementById("project-client").value = project.client || "";
  document.getElementById("project-year").value = project.year;

  if (project.image) {
    document.getElementById("project-hero-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${project.image}" alt="Hero">
      </div>
    `;
  }

  document.getElementById("project-modal").classList.add("active");
}

function editInfo(info) {
  document.getElementById("info-id").value = info.id;
  document.getElementById("info-title").value = info.title;
  document.getElementById("info-description").value = info.description;
  document.getElementById("info-order").value = info.order;

  if (info.image) {
    document.getElementById("info-image-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${info.image}" alt="Info">
      </div>
    `;
  }

  document.getElementById("info-modal").classList.add("active");
}

function editFAQ(faq) {
  document.getElementById("faq-id").value = faq.id;
  document.getElementById("faq-question").value = faq.question;
  document.getElementById("faq-answer").value = faq.answer;
  document.getElementById("faq-order").value = faq.order;
  document.getElementById("faq-modal").classList.add("active");
}

function editTestimonial(testimonial) {
  document.getElementById("testimonial-id").value = testimonial.id;
  document.getElementById("testimonial-name").value = testimonial.name;
  document.getElementById("testimonial-role").value = testimonial.role;
  document.getElementById("testimonial-quote").value = testimonial.quote;
  document.getElementById("testimonial-featured").checked =
    testimonial.featured;

  if (testimonial.image) {
    document.getElementById("testimonial-image-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${testimonial.image}" alt="Testimonial">
      </div>
    `;
  }

  document.getElementById("testimonial-modal").classList.add("active");
}

// Image upload handlers
document
  .getElementById("project-hero-image")
  .addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    projectHeroFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("project-hero-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${e.target.result}" alt="Hero">
      </div>
    `;
    };
    reader.readAsDataURL(file);
  });

document
  .getElementById("project-gallery-images")
  .addEventListener("change", (e) => {
    projectGalleryFiles = Array.from(e.target.files);
    const preview = document.getElementById("project-gallery-preview");
    preview.innerHTML = "";

    projectGalleryFiles.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement("div");
        div.className = "image-preview-item";
        div.innerHTML = `
        <img src="${e.target.result}" alt="Gallery ${i}">
        <button type="button" class="remove-image" onclick="removeGalleryImage(${i})">×</button>
      `;
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  });

document.getElementById("info-image").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  infoImageFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("info-image-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${e.target.result}" alt="Info">
      </div>
    `;
  };
  reader.readAsDataURL(file);
});

document.getElementById("testimonial-image").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  testimonialImageFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("testimonial-image-preview").innerHTML = `
      <div class="image-preview-item">
        <img src="${e.target.result}" alt="Testimonial">
      </div>
    `;
  };
  reader.readAsDataURL(file);
});

function removeGalleryImage(index) {
  projectGalleryFiles.splice(index, 1);
  document
    .getElementById("project-gallery-images")
    .dispatchEvent(new Event("change"));
}

// Form submissions
document
  .getElementById("project-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const id =
      document.getElementById("project-id").value || `project-${Date.now()}`;

    const projectData = {
      id,
      slug: document.getElementById("project-slug").value,
      title: document.getElementById("project-title").value,
      category: document.getElementById("project-category").value,
      description: document.getElementById("project-description").value,
      story: document.getElementById("project-story").value,
      client: document.getElementById("project-client").value,
      year: document.getElementById("project-year").value,
    };

    // Keep existing images if editing
    const existing = cmsData.projects.find((p) => p.id === id);
    if (existing) {
      projectData.image = existing.image;
      projectData.images = existing.images || [];
    }

    formData.append("project", JSON.stringify(projectData));

    // Add hero image if selected
    if (projectHeroFile) {
      formData.append("heroImage", projectHeroFile);
    }

    // Add gallery images if selected
    projectGalleryFiles.forEach((file, index) => {
      formData.append(`galleryImage${index}`, file);
    });

    try {
      showAlert("Uploading...", "success");

      const response = await fetch("/api/projects", {
        method: existing ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();

      // Update local data
      const index = cmsData.projects.findIndex(
        (p) => p.id === result.project.id
      );
      if (index >= 0) {
        cmsData.projects[index] = result.project;
      } else {
        cmsData.projects.push(result.project);
      }

      showAlert("Project saved successfully!", "success");
      closeModal("project");
      renderProjects();

      // Reset form
      projectHeroFile = null;
      projectGalleryFiles = [];
    } catch (error) {
      console.error("Upload error:", error);
      showAlert("Upload failed: " + error.message, "error");
    }
  });


document.getElementById("info-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  const id = document.getElementById("info-id").value || `info-${Date.now()}`;

  const infoData = {
    id,
    title: document.getElementById("info-title").value,
    description: document.getElementById("info-description").value,
    order: parseInt(document.getElementById("info-order").value),
  };

  // Keep existing image if editing
  const existing = cmsData.infoSection.find((i) => i.id === id);
  if (existing) {
    infoData.image = existing.image;
  }

  formData.append("info", JSON.stringify(infoData));

  if (infoImageFile) {
    formData.append("image", infoImageFile);
  }

  try {
    showAlert("Uploading...", "success");

    const response = await fetch("/api/info", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    const result = await response.json();

    const index = cmsData.infoSection.findIndex((i) => i.id === result.info.id);
    if (index >= 0) {
      cmsData.infoSection[index] = result.info;
    } else {
      cmsData.infoSection.push(result.info);
    }

    showAlert("Info saved successfully!", "success");
    closeModal("info");
    renderInfo();

    infoImageFile = null;
  } catch (error) {
    showAlert("Upload failed: " + error.message, "error");
  }
});

document.getElementById("faq-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("faq-id").value || `faq-${Date.now()}`;
  const faq = {
    id,
    question: document.getElementById("faq-question").value,
    answer: document.getElementById("faq-answer").value,
    order: parseInt(document.getElementById("faq-order").value),
  };
  await saveData("faqs", faq);
});

document
  .getElementById("testimonial-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const id =
      document.getElementById("testimonial-id").value ||
      `testimonial-${Date.now()}`;

    const testimonialData = {
      id,
      name: document.getElementById("testimonial-name").value,
      role: document.getElementById("testimonial-role").value,
      quote: document.getElementById("testimonial-quote").value,
      featured: document.getElementById("testimonial-featured").checked,
      rating: 5,
    };

    const existing = cmsData.testimonials.find((t) => t.id === id);
    if (existing) {
      testimonialData.image = existing.image;
    }

    formData.append("testimonial", JSON.stringify(testimonialData));

    if (testimonialImageFile) {
      formData.append("image", testimonialImageFile);
    }

    try {
      showAlert("Uploading...", "success");

      const response = await fetch("/api/testimonial", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();

      const index = cmsData.testimonials.findIndex(
        (t) => t.id === result.testimonial.id
      );
      if (index >= 0) {
        cmsData.testimonials[index] = result.testimonial;
      } else {
        cmsData.testimonials.push(result.testimonial);
      }

      showAlert("Testimonial saved successfully!", "success");
      closeModal("testimonial");
      renderTestimonials();

      testimonialImageFile = null;
    } catch (error) {
      showAlert("Upload failed: " + error.message, "error");
    }
  });