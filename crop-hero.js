const { Jimp } = require('jimp');

async function main() {
  try {
    const image = await Jimp.read('public/dashboard-hero.jpg');
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Crop only the top 53% blue treadmill runner section
    const cropHeight = Math.floor(height * 0.53);
    
    image.crop({ x: 0, y: 0, w: width, h: cropHeight });
    await image.write('public/dashboard-hero-clean.jpg');
      
    console.log('Image cropped successfully and saved to public/dashboard-hero-clean.jpg');
  } catch (err) {
    console.error('Failed to crop image:', err);
  }
}

main();
