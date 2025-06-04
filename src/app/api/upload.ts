import { IncomingForm, File as FormidableFile, Files, Fields } from 'formidable';
import fs from 'fs/promises'; // use promises version for async/await
import { NextApiRequest, NextApiResponse } from 'next';
import imagekit from '../../utils/imagekit'; // make sure this is properly configured

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();

  form.parse(req, async (err: Error | null, _fields: Fields, files: Files) => {
    try {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'File parsing failed' });
      }

      const fileField = files.upload;

      if (!fileField) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file: FormidableFile =
        Array.isArray(fileField) ? fileField[0] : fileField;

      const fileBuffer = await fs.readFile(file.filepath);
      const fileName = file.originalFilename || 'uploaded-image';

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName,
      });

      return res.status(200).json({
        url: response.url,
      });
    } catch (uploadErr) {
      console.error('Upload failed:', uploadErr);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}
