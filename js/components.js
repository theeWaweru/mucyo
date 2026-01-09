// js/components.js
const timestamp = new Date().getTime();

(async function loadComponents() {
  try {
    // Load navigation
    const navResponse = await fetch(`/components/nav.html?v=${timestamp}`);
    const navHTML = await navResponse.text();
    const navContainer = document.getElementById("navbar-container");
    if (navContainer) {
      navContainer.innerHTML = navHTML;
    }

    // Load footer
    const footerResponse = await fetch(
      `/components/footer.html?v=${timestamp}`
    );
    const footerHTML = await footerResponse.text();
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
      footerContainer.innerHTML = footerHTML;
    }

    // Load Google Analytics
    const analyticsResponse = await fetch(
      `/components/analytics.html?v=${timestamp}`
    );
    const analyticsHTML = await analyticsResponse.text();
    const analyticsContainer = document.getElementById("analytics-container");
    if (analyticsContainer) {
      analyticsContainer.innerHTML = analyticsHTML;
    } else {
      // If no container, inject directly into head
      const range = document.createRange();
      range.selectNode(document.head);
      const documentFragment = range.createContextualFragment(analyticsHTML);
      document.head.appendChild(documentFragment);
    }

    // Load SEO tags
    const seoResponse = await fetch(`/components/seo.html?v=${timestamp}`);
    const seoHTML = await seoResponse.text();
    const range = document.createRange();
    range.selectNode(document.head);
    const documentFragment = range.createContextualFragment(seoHTML);
    document.head.appendChild(documentFragment);

    console.log("✅ Components loaded");

    // Force Webflow script reload
    const webflowScript = document.querySelector('script[src*="webflow.js"]');
    if (webflowScript) {
      const newScript = document.createElement("script");
      newScript.src = webflowScript.src.split("?")[0] + `?v=${timestamp}`;
      newScript.onload = () => {
        setTimeout(reinitializeWebflow, 100);
      };
      webflowScript.parentNode.replaceChild(newScript, webflowScript);
    } else {
      setTimeout(reinitializeWebflow, 100);
    }
  } catch (error) {
    console.error("Error loading components:", error);
  }
})();

function reinitializeWebflow() {
  if (typeof window.Webflow === "undefined") {
    console.log("⏳ Waiting for Webflow...");
    setTimeout(reinitializeWebflow, 100);
    return;
  }

  try {
    console.log("🔄 Reinitializing Webflow...");

    if (window.Webflow.destroy) {
      window.Webflow.destroy();
    }

    window.Webflow.ready();

    const modules = ["ix2", "ix", "navbar", "dropdown", "slider", "tabs"];
    modules.forEach((module) => {
      try {
        if (window.Webflow.require) {
          const mod = window.Webflow.require(module);
          if (mod) {
            if (mod.destroy) mod.destroy();
            if (mod.init) mod.init();
            if (mod.redraw) mod.redraw();
            if (mod.refresh) mod.refresh();
          }
        }
      } catch (e) {}
    });

    setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    setTimeout(() => window.dispatchEvent(new Event("scroll")), 100);

    console.log("✅ Webflow reinitialized");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}
