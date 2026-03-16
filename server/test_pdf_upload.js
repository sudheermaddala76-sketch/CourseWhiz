const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testPdfUpload() {
  try {
    console.log('1. Testing PDF Upload (/api/ingest)...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy_test.pdf'));

    const ingestRes = await axios.post('http://localhost:3001/api/ingest', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    console.log('Ingest Success - Filename:', ingestRes.data.filename);
    console.log('Ingest Success - Extracted Text Length:', ingestRes.data.text.length);

    console.log('\n2. Testing Course Creation (/api/courses)...');
    
    const courseRes = await axios.post('http://localhost:3001/api/courses', {
      title: 'Test PDF Course',
      description: 'A course to test PDF uploads',
      content: ingestRes.data.text,
      pdfFilename: ingestRes.data.filename
    });
    
    console.log('Course Created Successfully!');
    console.log('Course ID:', courseRes.data._id);
    console.log('Saved PDF Filename in DB:', courseRes.data.pdfFilename);
    console.log('\nYou can now test viewing this in the frontend at: http://localhost:5174/course/' + courseRes.data._id);
    
  } catch (error) {
    if (error.response) {
      console.error('API Error - Status:', error.response.status);
      console.error('API Error - Data:', error.response.data);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

testPdfUpload();
