// js/cms-loader.js
let cmsData = null;

async function loadCMSData() {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/data/projects.json?v=${timestamp}`);
    cmsData = await response.json();

    // Load different sections based on containers present
    if (document.getElementById("home-projects")) loadHomeProjects();
    if (document.getElementById("works-list")) loadWorksList();
    if (document.getElementById("info-section")) loadInfoSection();
    if (document.getElementById("faqs-list")) loadFAQs();
    if (document.getElementById("testimonials-list")) loadTestimonials();

    console.log("✅ CMS data loaded");
  } catch (error) {
    console.error("Failed to load CMS:", error);
  }
}

// HOME PAGE - Exact Webflow structure, no animation interference
function loadHomeProjects() {
  const container = document.getElementById("home-projects");
  if (!container || !cmsData) return;

  // Get first 3 featured projects
  const featured = cmsData.projects.slice(0, 3);

  container.innerHTML = `
    <div class="home-work-list">
      <div class="home-work-cms">
        ${featured
          .map((project, index) => {
            const nodeId1 = `w-node-home-title-${Date.now()}-${index}`;
            const nodeId2 = `w-node-home-clip-${Date.now()}-${index}`;
            const nodeId3 = `w-node-home-image-${Date.now()}-${index}`;

            return `
            <div class="home-work-item">
              <a href="/${project.slug}" class="work-list-item w-inline-block">
                <div class="work-list-grid">
                  <div
                    id="nowThis"
                    thattextsplit="hoverTarget"
                    base="100%"
                    class="work-list-title ${nodeId1}"
                  >
                    <h3 class="heading-style-h3 text-color-white">
                      ${project.title}
                    </h3>
                  </div>
                  <div
                    id="nowThis"
                    thattextsplit="hoverTarget"
                    base="20%"
                    class="clip ${nodeId2}"
                  >
                    <div class="hover-text">
                      <div class="text-size-tiny text-style-allcaps text-color-white">
                        ${project.category}
                      </div>
                    </div>
                    <div class="hover-text bottom-hover-text">
                      <div class="text-size-tiny text-style-allcaps text-color-white">
                        ${project.category}
                      </div>
                    </div>
                  </div>
                  <div id="${nodeId3}" class="list-image">
                    <div class="list-image-item">
                      <div class="list-image-height">
                        <img
                          loading="lazy"
                          sizes="(max-width: 1225px) 100vw, 1225px"
                          src="${project.image}"
                          alt="${project.title}"
                          class="image-fill"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="line">
                  <div class="line-fill"></div>
                </div>
              </a>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `;
}

// WORKS PAGE - Exact Webflow structure, no animation interference
function loadWorksList() {
  const container = document.getElementById("works-list");
  if (!container || !cmsData) return;

  container.innerHTML = `
    <div class="work-list-wrapper">
      <div class="work-list">
        ${cmsData.projects
          .map(
            (project, index) => `
          <div class="work-list-card">
            <a href="/${project.slug}" class="work-card-item w-inline-block">
              <div class="work-card-image">
                <div class="work-card-height"></div>
                <img
                  src="${project.image}"
                  loading="lazy"
                  sizes="(max-width: 1225px) 100vw, 1225px"
                  alt="${project.title}"
                  class="image-fill"
                />
              </div>
              <div class="work-card-text">
                <div>
                  <h3 class="heading-style-h4">${project.title}</h3>
                  <div class="work-card_tag">
                    <div class="text-size-tiny text-style-allcaps text-style-muted">
                      ${project.category}
                    </div>
                  </div>
                </div>
                <div class="clip">
                  <div class="hover-arrow left">
                    <div class="icon-1x1-tiny w-embed">
                      <svg
                        width="100%"
                        height="auto"
                        viewbox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.1722 12L8.22217 7.04999L9.63617 5.63599L16.0002 12L9.63617 18.364L8.22217 16.95L13.1722 12Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div class="hover-arrow">
                    <div class="icon-1x1-tiny w-embed">
                      <svg
                        width="100%"
                        height="auto"
                        viewbox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.1722 12L8.22217 7.04999L9.63617 5.63599L16.0002 12L9.63617 18.364L8.22217 16.95L13.1722 12Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  // NO JavaScript handlers - let Webflow handle all animations
}

// INFO SECTION (About page)
function loadInfoSection() {
  const container = document.getElementById("info-section");
  if (!container || !cmsData) return;

  container.innerHTML = cmsData.infoSection
    .sort((a, b) => a.order - b.order)
    .map(
      (info, index) => `
      <div id="w-node-info-${index}" class="about-history-item">
        <div class="about-history-intro">
          <div class="about-history-title">
            <div class="margin-bottom margin-medium">
              <div class="title-tag">
                <div class="circle"></div>
                <div class="text-size-tiny text-style-allcaps">${String(
                  info.order
                ).padStart(2, "0")}</div>
              </div>
            </div>
            <h3 class="heading-style-h3">${info.title}</h3>
          </div>
          <div class="text-size-regular text-color-grey">${
            info.description
          }</div>
        </div>
      </div>
    `
    )
    .join("");
}

// FAQS - Just render, let Webflow handle animations
function loadFAQs() {
  const container = document.getElementById("faqs-list");
  if (!container || !cmsData) return;

  // Just render the HTML structure - NO JavaScript handlers
  container.innerHTML = `
    <div class="home-faq-list radius-regular">
      ${cmsData.faqs
        .sort((a, b) => a.order - b.order)
        .map((faq, index) => {
          const nodeId = `w-node-faq-${Date.now()}-${index}`;
          const isFirst = index === 0;

          return `
            <div class="home-faq-item${isFirst ? " no-border" : ""}">
              <div class="home-faq-top">
                <div id="${nodeId}-number" class="home-faq-number">
                  <div class="text-size-small">${String(index + 1).padStart(
                    2,
                    "0"
                  )}</div>
                </div>
                <div class="text-size-large">${faq.question}</div>
                <div class="home-faq-icon">
                  <div class="icon-1x1-small w-embed">
                    <svg width="420" height="420" viewbox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="currentColor"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="hame-faq-bottom">
                <div class="home-faq-content radius-regular">
                  <div class="home-faq-text">
                    <div class="text-size-regular text-color-white">${
                      faq.answer
                    }</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// TESTIMONIALS
function loadTestimonials() {
  const container = document.getElementById("testimonials-list");
  if (!container || !cmsData) return;

  const featured = cmsData.testimonials.filter((t) => t.featured);

  container.innerHTML = featured
    .map(
      (testimonial, index) => `
    <div id="w-node-testimonial-${index}" class="testimonial-item">
      <div class="testimonial-content">
        <p class="text-size-large">"${testimonial.quote}"</p>
        <div class="testimonial-author">
          <strong>${testimonial.name}</strong><br>
          <span class="text-color-grey">${testimonial.role}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// Auto-load on page ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCMSData);
} else {
  loadCMSData();
}
