// api/projects.js
import fs from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (method === "GET") {
      return handleGet(req, res);
    }
    if (method === "POST") {
      return handlePost(req, res);
    }
    if (method === "PUT") {
      return handlePut(req, res);
    }
    if (method === "DELETE") {
      return handleDelete(req, res);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleGet(req, res) {
  const projectsPath = path.join(process.cwd(), "data", "projects.json");
  const data = await fs.readFile(projectsPath, "utf-8");
  return res.json(JSON.parse(data));
}

async function handlePost(req, res) {
  const formData = await parseMultipartForm(req);
  const projectData = JSON.parse(formData.fields.project);

  if (formData.files.heroImage) {
    const blob = await put(
      `projects/${projectData.slug}/hero-${Date.now()}.jpg`,
      formData.files.heroImage.data,
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );
    projectData.image = blob.url;
  }

  const galleryUrls = [];
  for (const [key, file] of Object.entries(formData.files)) {
    if (key.startsWith("galleryImage")) {
      const blob = await put(
        `projects/${projectData.slug}/gallery-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.jpg`,
        file.data,
        {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      );
      galleryUrls.push(blob.url);
    }
  }

  projectData.images = galleryUrls.length > 0 ? galleryUrls : [];

  const projectsPath = path.join(process.cwd(), "data", "projects.json");
  const data = await fs.readFile(projectsPath, "utf-8");
  const json = JSON.parse(data);
  json.projects.push(projectData);
  await fs.writeFile(projectsPath, JSON.stringify(json, null, 2));

  return res.json({ success: true, project: projectData });
}

async function handlePut(req, res) {
  const formData = await parseMultipartForm(req);
  const projectData = JSON.parse(formData.fields.project);

  if (formData.files.heroImage) {
    const blob = await put(
      `projects/${projectData.slug}/hero-${Date.now()}.jpg`,
      formData.files.heroImage.data,
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );
    projectData.image = blob.url;
  }

  const newGalleryUrls = [];
  for (const [key, file] of Object.entries(formData.files)) {
    if (key.startsWith("galleryImage")) {
      const blob = await put(
        `projects/${projectData.slug}/gallery-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.jpg`,
        file.data,
        {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      );
      newGalleryUrls.push(blob.url);
    }
  }

  if (newGalleryUrls.length > 0) {
    projectData.images = [...(projectData.images || []), ...newGalleryUrls];
  }

  const projectsPath = path.join(process.cwd(), "data", "projects.json");
  const data = await fs.readFile(projectsPath, "utf-8");
  const json = JSON.parse(data);
  const index = json.projects.findIndex((p) => p.id === projectData.id);
  if (index >= 0) {
    json.projects[index] = projectData;
  }
  await fs.writeFile(projectsPath, JSON.stringify(json, null, 2));

  return res.json({ success: true, project: projectData });
}

async function handleDelete(req, res) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString();
  const { id } = JSON.parse(body);

  const projectsPath = path.join(process.cwd(), "data", "projects.json");
  const data = await fs.readFile(projectsPath, "utf-8");
  const json = JSON.parse(data);
  const project = json.projects.find((p) => p.id === id);

  if (project) {
    if (project.image) {
      try {
        await del(project.image, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (e) {
        console.error("Failed to delete hero image:", e);
      }
    }
    if (project.images) {
      for (const imgUrl of project.images) {
        try {
          await del(imgUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
        } catch (e) {
          console.error("Failed to delete gallery image:", e);
        }
      }
    }
  }

  json.projects = json.projects.filter((p) => p.id !== id);
  await fs.writeFile(projectsPath, JSON.stringify(json, null, 2));

  return res.json({ success: true });
}

async function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const boundary = getBoundary(req.headers["content-type"]);
    if (!boundary) return reject(new Error("No boundary found"));

    let buffer = Buffer.alloc(0);
    const fields = {};
    const files = {};

    req.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    req.on("end", () => {
      try {
        const parts = splitBuffer(buffer, boundary);
        for (const part of parts) {
          if (part.length === 0) continue;
          const parsed = parsePart(part);
          if (parsed) {
            if (parsed.filename) {
              files[parsed.name] = {
                filename: parsed.filename,
                contentType: parsed.contentType,
                data: parsed.data,
              };
            } else {
              fields[parsed.name] = parsed.data.toString("utf-8");
            }
          }
        }
        resolve({ fields, files });
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function getBoundary(contentType) {
  if (!contentType) return null;
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  return match ? match[1] || match[2] : null;
}

function splitBuffer(buffer, boundary) {
  const boundaryBuffer = Buffer.from("--" + boundary);
  const parts = [];
  let start = 0;

  while (start < buffer.length) {
    const index = buffer.indexOf(boundaryBuffer, start);
    if (index === -1) break;
    if (start !== 0) {
      parts.push(buffer.slice(start, index));
    }
    start = index + boundaryBuffer.length;
  }
  return parts;
}

function parsePart(buffer) {
  const headerEnd = buffer.indexOf("\r\n\r\n");
  if (headerEnd === -1) return null;

  const headerSection = buffer.slice(0, headerEnd).toString("utf-8");
  const dataSection = buffer.slice(headerEnd + 4);
  const data = dataSection.slice(0, dataSection.length - 2);

  const dispositionMatch = headerSection.match(
    /Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/
  );
  if (!dispositionMatch) return null;

  const name = dispositionMatch[1];
  const filename = dispositionMatch[2];
  const contentTypeMatch = headerSection.match(/Content-Type: (.+)/);
  const contentType = contentTypeMatch
    ? contentTypeMatch[1].trim()
    : "text/plain";

  return { name, filename, contentType, data };
}
