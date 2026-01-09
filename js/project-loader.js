// js/project-loader.js - EXACT MATCH TO TEMPLATE

(async function loadProject() {
  try {
    const path = window.location.pathname;
    const slug = path.replace(/^\/|\/$/g, "");

    if (!slug || slug === "project.html") {
      window.location.href = "/works";
      return;
    }

    const timestamp = new Date().getTime();
    const response = await fetch(`/data/projects.json?v=${timestamp}`);
    const data = await response.json();
    const project = data.projects.find((p) => p.slug === slug);

    if (!project) {
      window.location.href = "/works";
      return;
    }

    // Update meta tags
    document.title = `${project.title} - Mucyo Gasana`;
    document.getElementById(
      "page-title"
    ).textContent = `${project.title} - Mucyo Gasana`;
    document.getElementById("page-description").content = project.description;
    document.getElementById(
      "og-title"
    ).content = `${project.title} - Mucyo Gasana`;
    document.getElementById("og-description").content = project.description;
    document.getElementById("og-image").content = project.image;

    // Populate ONLY what's in template
    document.getElementById("project-title").textContent = project.title;
    document.getElementById("project-description").textContent =
      project.description;
    document.getElementById("project-category").textContent = project.category;
    document.getElementById("project-year").textContent = project.year;

    // Gallery images ONLY
    const gallery = document.getElementById("project-gallery");
    let galleryHTML = "";

    if (project.images && project.images.length > 0) {
      project.images.forEach((img) => {
        galleryHTML += `
          <div class="work-item">
            <div class="work-body_item">
              <img src="${img}" loading="lazy" alt="${project.title}" class="work-body_image" />
            </div>
          </div>
        `;
      });
    }

    gallery.innerHTML = galleryHTML;
  } catch (error) {
    console.error("Error:", error);
    window.location.href = "/works";
  }
})();
