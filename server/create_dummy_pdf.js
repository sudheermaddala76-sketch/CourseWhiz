const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('dummy_test.pdf'));
doc.fontSize(25).text('This is a test PDF for CourseWhiz!', 100, 100);
doc.end();
console.log('dummy_test.pdf created');
