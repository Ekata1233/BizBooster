// pages/api/upload.ts (or app/api/upload/route.ts if using new app router API routes)

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Adjust limit
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // You'll get file from req.body or req.files, but Next.js default API routes
    // do not parse multipart form data.
    // So you need to use a library like `multer` or `formidable` for parsing.

    // Example using formidable:

    const formidable = (await import('formidable')).default;

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing files' });
      }

      // files.file contains uploaded file info (depends on input field name 'file')

      // Now upload the file to your storage or return a dummy URL for testing

      // For example, just return a dummy URL for now:
      return res.status(200).json({
        url: 'https://via.placeholder.com/150', // Replace with your uploaded image URL
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Upload failed' });
  }
}
