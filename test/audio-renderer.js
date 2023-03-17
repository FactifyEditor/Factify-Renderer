import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs  from 'fs';
import https from 'https';

// Define the input URLs, output directory and the duration to cut from the start of each file
const inputUrls = [
  'https://storage.googleapis.com/yug-external-files/HmPTHIZGWp9yWYjf1677479498411.wav',
  'https://storage.googleapis.com/yug-external-files/wJz1d5fNMstWuOdC1677479494493.wav',

];
const outputDir = './';
const cutDuration = 10; // In seconds

// Define a counter to keep track of how many files have been processed
let fileCounter = 0;

// Loop through each input URL and process each file
inputUrls.forEach((inputUrl, index) => {
  const inputPath = path.join(outputDir, `input${index}.mp3`);
  // Download the input file from the URL
  const file = fs.createWriteStream(inputPath);
  https.get(inputUrl, (response) => {
    response.pipe(file);
  });
  
  file.on('finish', () => {
    console.log(`Finished downloading input file ${index}`);
    // Cut the specific duration from the start of the file
    ffmpeg(inputPath)
      .seekInput(0)
      .setDuration(cutDuration)
      .output(path.join(outputDir, `output${index}.mp3`))
      .on('end', () => {
        console.log(`Finished cutting file ${index}`);
        fileCounter++;
        // If all files have been processed, merge the output files into a single file
        if (fileCounter === inputUrls.length) {
          mergeFiles();
        }
      })
      .run();
  });
});

// Merge all the output files into a single file
function mergeFiles() {
  const outputFilePath = path.join(outputDir, 'merged.mp3');
  
  // Define an array of input file paths
  const inputFilePaths = inputUrls.map((inputUrl, index) => path.join(outputDir, `output${index}.mp3`));
  
  // Merge all the output files into a single file
  ffmpeg()
    .input(inputFilePaths[0])
    .input(inputFilePaths[1])
    .input(inputFilePaths[2])
    // Add more input files as needed
    .outputOptions('-filter_complex', `concat=n=${inputUrls.length}:v=0:a=1`)
    .output(outputFilePath)
    .on('end', () => {
      console.log('Finished merging files');
    })
    .run();
}
