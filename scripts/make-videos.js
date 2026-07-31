const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = ffmpeg.path;
const inputFiles = ['dashboard-1.png', 'dashboard-2.png', 'dashboard-3.png'];
const publicDir = path.join(__dirname, '..', 'public');

console.log(`Using ffmpeg at: ${ffmpegPath}`);

async function processImage(imageName) {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(publicDir, imageName);
    if (!fs.existsSync(inputPath)) {
        console.log(`Skipping ${imageName}, not found.`);
        return resolve();
    }
    const outputName = imageName.replace('.png', '-motion.mp4');
    const outputPath = path.join(publicDir, outputName);
    
    // Ken Burns effect: zoom in by 1.1x over 15 seconds, and pan slightly
    const command = `"${ffmpegPath}" -loop 1 -i "${inputPath}" -t 15 -vf "scale=1920:-2,zoompan=z='min(zoom+0.0015,1.15)':d=450:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'" -c:v libx264 -pix_fmt yuv420p -y "${outputPath}"`;
    
    console.log(`Processing ${imageName}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing ${imageName}:`, error);
        reject(error);
        return;
      }
      console.log(`Successfully generated ${outputName}`);
      resolve();
    });
  });
}

async function main() {
  for (const file of inputFiles) {
    try {
      await processImage(file);
    } catch (e) {
      console.error(e);
    }
  }
}

main();
