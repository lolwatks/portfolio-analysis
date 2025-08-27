import express from 'express';
import multer from 'multer';
import { parseECAS } from './parser.js';

const app = express();
const port = 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static('public'));

app.post('/parse', upload.single('pdfFile'), async (req, res) => {
  try {
    console.log('Received request to parse PDF');
    const pdfFile = req.file;
    const password = req.body.password;

    if (!pdfFile) {
      console.log('No PDF file received');
      res.status(400).json({ success: false, error: 'PDF file is required' });
      return;
    }

    if (!password) {
      console.log('No password received');
      res.status(400).json({ success: false, error: 'Password is required' });
      return;
    }

    console.log('Processing PDF file...');
    console.log('File size:', pdfFile.size, 'bytes');
    console.log('File type:', pdfFile.mimetype);

    const parsedData = await parseECAS(pdfFile.buffer, password);
    console.log('Successfully parsed PDF');
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
