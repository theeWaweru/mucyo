// api/projects.js
import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const PROJECTS_FILE = path.join(process.cwd(), "data/projects.json");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === "GET") {
      const data = await fs.readFile(PROJECTS_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }

    if (method === "POST" || method === "PUT") {
      // Handle file uploads and save project
      const project = await handleProjectSave(req);
      return res.json({ success: true, project });
    }

    if (method === "DELETE") {
      const { id } = req.body;
      await handleProjectDelete(id);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleProjectSave(req) {
  // Parse multipart form data
  const formData = await parseForm(req);
  const projectData = JSON.parse(formData.fields.project);

  // Upload images to Vercel Blob
  if (formData.files.heroImage) {
    const blob = await put(
      `projects/${projectData.slug}/hero.jpg`,
      formData.files.heroImage.data,
      { access: "public" }
    );
    projectData.image = blob.url;
  }

  // Handle gallery images
  const galleryUrls = [];
  for (const [key, file] of Object.entries(formData.files)) {
    if (key.startsWith("galleryImage")) {
      const blob = await put(
        `projects/${projectData.slug}/gallery-${Date.now()}.jpg`,
        file.data,
        { access: "public" }
      );
      galleryUrls.push(blob.url);
    }
  }

  projectData.images = galleryUrls;

  // Update projects.json
  const data = await fs.readFile(PROJECTS_FILE, "utf-8");
  const json = JSON.parse(data);

  const existingIndex = json.projects.findIndex((p) => p.id === projectData.id);
  if (existingIndex >= 0) {
    json.projects[existingIndex] = projectData;
  } else {
    json.projects.push(projectData);
  }

  await fs.writeFile(PROJECTS_FILE, JSON.stringify(json, null, 2));
  return projectData;
}

async function handleProjectDelete(id) {
  const data = await fs.readFile(PROJECTS_FILE, "utf-8");
  const json = JSON.parse(data);
  json.projects = json.projects.filter((p) => p.id !== id);
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(json, null, 2));
}
