import fs from 'node:fs';
import path from 'node:path';
import { formidable } from 'formidable';

export const config = { api: { bodyParser: false } };

/**
 * POST /api/upload — saves multipart file under public/uploads and returns URL.
 * Replaces Firebase Storage for product images & trade documents.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  const form = formidable({ multiples: false, maxFileSize: 15 * 1024 * 1024, uploadDir, keepExtensions: true });
  try {
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded (field name: file)' });
    const safeName = `${Date.now()}_${String(file.originalFilename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const dest = path.join(uploadDir, safeName);
    fs.renameSync(file.filepath, dest);
    const stat = fs.statSync(dest);
    return res.status(201).json({
      fileName: file.originalFilename,
      storagePath: `uploads/${safeName}`,
      downloadURL: `/uploads/${safeName}`,
      fileSize: stat.size,
      mimeType: file.mimetype || '',
    });
  } catch (err) {
    console.error('[/api/upload]', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
