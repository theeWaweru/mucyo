// api/cms.js
import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const projectsPath = path.join(process.cwd(), "data", "projects.json");
    await fs.writeFile(projectsPath, JSON.stringify(req.body, null, 2));
    return res.json({ success: true });
  } catch (error) {
    console.error("CMS save error:", error);
    return res.status(500).json({ error: error.message });
  }
}
