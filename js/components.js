// js/components.js
async function loadComponents() {
  try {
    // Load navigation
    const navResponse = await fetch("/components/nav.html");
    const navHTML = await navResponse.text();
    const navContainer = document.getElementById("navbar-container");
    if (navContainer) {
      navContainer.innerHTML = navHTML;
    }

    // Load footer
    const footerResponse = await fetch("/components/footer.html");
    const footerHTML = await footerResponse.text();
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
      footerContainer.innerHTML = footerHTML;
    }

    // CRITICAL: Re-initialize Webflow after components load
    initializeWebflow();
  } catch (error) {
    console.error("Error loading components:", error);
  }
}

function initializeWebflow() {
  // Wait for Webflow to be available
  if (typeof window.Webflow !== "undefined") {
    // Destroy existing instance
    if (window.Webflow.destroy) {
      window.Webflow.destroy();
    }

    // Re-initialize
    window.Webflow.ready();

    // Re-initialize interactions
    if (window.Webflow.require) {
      document.dispatchEvent(new Event("readystatechange"));
      window.Webflow.require("ix2").init();
    }
  } else {
    // If Webflow not loaded yet, wait and try again
    setTimeout(initializeWebflow, 100);
  }
}

// Load components when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadComponents);
} else {
  loadComponents();
}
