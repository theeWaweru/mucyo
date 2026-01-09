// api/contact.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    console.log("Contact form submission:", {
      name,
      email,
      phone,
      message,
      timestamp: new Date().toISOString(),
    });

    const fs = await import("fs/promises");
    const path = await import("path");

    const contactsPath = path.join(process.cwd(), "data", "contacts.json");

    let contacts = [];
    try {
      const data = await fs.readFile(contactsPath, "utf-8");
      contacts = JSON.parse(data);
    } catch (e) {
      // File doesn't exist yet
    }

    contacts.push({
      id: `contact-${Date.now()}`,
      name,
      email,
      phone: phone || "",
      message,
      timestamp: new Date().toISOString(),
      read: false,
    });

    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

    return res.json({
      success: true,
      message: "Thank you! I'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      error: "Failed to send message.",
    });
  }
}
