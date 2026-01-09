// api/testimonial.js
import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = await parseMultipartForm(req);
    const testimonial = JSON.parse(formData.fields.testimonial);

    // Upload image if provided
    if (formData.files.image) {
      const blob = await put(
        `testimonial/${testimonial.id}-${Date.now()}.jpg`,
        formData.files.image.data,
        {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      );
      testimonial.image = blob.url;
    }

    // Update projects.json
    const projectsPath = path.join(process.cwd(), "data", "projects.json");
    const data = await fs.readFile(projectsPath, "utf-8");
    const json = JSON.parse(data);

    const index = json.testimonials.findIndex((i) => i.id === testimonial.id);
    if (index >= 0) {
      json.testimonials[index] = testimonial;
    } else {
      json.testimonials.push(testimonial);
    }

    await fs.writeFile(projectsPath, JSON.stringify(json, null, 2));

    return res.json({ success: true, testimonial: testimonial });
  } catch (error) {
    console.error("testimonial upload error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Copy the parseMultipartForm function from api/projects.js
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
