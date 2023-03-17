import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs  from 'fs';
import https from 'https';

// Define the input URLs, output directory and the duration to cut from the start of each file
// const inputFilePaths = [
//   'Intro.wav',
//   'Headlines.wav',
// ];

// const outputFilePath="./output.wav"
// ffmpeg()
//     .input(inputFilePaths[0])
//     .input(inputFilePaths[1])
//     .complexFilter([
//         {
//             "filter":"concat",
//             "options": {
//                 "n": "2",
//                 "v":"0",
//                 "a":"1",
//             },
//             "input": "[0:a:0][1:a:0]"
//         }
//     ])
//     // Add more input files as needed
//     // .outputOptions('-filter_complex', `concat=n=${inputFilePaths.length}:v=0:a=1`)
//     .output(outputFilePath)
//     .on('end', () => {
//       console.log('Finished merging files');
//     })
//     .run();



// Define the filtergraph to trim and merge the two videos with delay


// Trim the first video file




// Define the filtergraph to trim and merge the two audios with delay

// Set the paths to the input files
const input1 = 'Intro.wav';
const input2 = 'Headlines.wav';
const input3 = 'Outro.wav';

// Set the delay for the second file (in seconds)
const delay2 = 0;

// Create a new ffmpeg command
let command = ffmpeg();

// Add the first input file
command.input(input1);

// Add the second input file
command.input(input2);

// Add the second input file
command.input(input3);

// Use complex filters to add a delay to the second file
command.complexFilter([
        {
          filter: 'atrim',
            options:{
            start:0,
            end:3.6
        },
          inputs: '0:a',
          outputs: 'a0_trimmed',
        },
        {
            filter: 'atrim',
            options:{
            start:0,
            end:8
        },
            inputs: '1:a',
            outputs: 'a1_trimmed',
          },
        {
          filter: 'adelay',
          options: '3600|3600',
          inputs: 'a1_trimmed',
          outputs: 'a1_delayed',
        },
        {
          filter: 'atrim',
            options:{
            start:0,
            end:5
        },
          inputs: '2:a',
          outputs: 'a2_trimmed',
        },
        {
            filter: 'adelay',
            options: '11600|11600',
            inputs: 'a2_trimmed',
            outputs: 'a2_delayed',
          },
        {
          filter: 'amix',
          options: 'inputs=3',
          inputs: ['a0_trimmed', 'a1_delayed', 'a2_delayed'],
          outputs: 'mixedAudio',
        }
    //   ]
    // {
    //     filter:'atrim',
    //     options:{
    //         start:0,
    //         end:3.6
    //     },
    //     inputs:'0:a',
    //     outputs:'introTrimmedAudio'
    // },
    // {
    //     filter: 'adelay',
    //     options: `${delay2 * 1000}|${delay2 * 1000}`,
    //     inputs: '1:a',
    //     outputs: 'delayedAudio'
    // },
    // {
    //     filter: 'adelay',
    //     options: `${delay2 * 1000}|${delay2 * 1000}`,
    //     inputs: '1:a',
    //     outputs: 'delayedAudio1'
    // },
    
    // {
    //     filter: 'amix',
    //     inputs: ['introTrimmedAudio','delayedAudio1', 'delayedAudio'],
    //     outputs: 'mixedAudio'
    // }
], ['mixedAudio']);

// Merge the inputs into a single output file
command.output('output.wav')
    .on('error', function(err) {
      console.log('An error occurred:', err.message);
   })
   .on('end', function() {
      console.log('Merging finished!');
   });

// Run the command
command.run();