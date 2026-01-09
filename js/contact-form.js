// js/contact-form.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    const formData = {
      name: form.querySelector("#name").value,
      email: form.querySelector("#email").value,
      phone: form.querySelector("#phone")?.value || "",
      message: form.querySelector("#message").value,
    };

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(data.message || "Message sent!", "success");
        form.reset();
      } else {
        showAlert(data.error || "Failed to send", "error");
      }
    } catch (error) {
      showAlert("Network error. Please try again.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});

function showAlert(message, type) {
  let alert = document.getElementById("form-alert");

  if (!alert) {
    alert = document.createElement("div");
    alert.id = "form-alert";
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(alert);
  }

  if (type === "success") {
    alert.style.backgroundColor = "#d1fae5";
    alert.style.color = "#065f46";
    alert.style.border = "1px solid #6ee7b7";
  } else {
    alert.style.backgroundColor = "#fee2e2";
    alert.style.color = "#991b1b";
    alert.style.border = "1px solid #fca5a5";
  }

  alert.textContent = message;
  alert.style.display = "block";

  setTimeout(() => {
    alert.style.display = "none";
  }, 5000);
}
