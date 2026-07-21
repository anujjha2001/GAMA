const pdf = require('pdf-parse');
console.log('Keys of pdf:', Object.keys(pdf));
console.log('pdf.PDFParse keys:', Object.keys(pdf.PDFParse || {}));
console.log('pdf.PDFParse prototype keys:', Object.keys(pdf.PDFParse.prototype || {}));
console.log('pdf.PDFParse constructor details:', pdf.PDFParse.toString());
