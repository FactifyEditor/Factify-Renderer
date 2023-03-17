import request from 'request';
import ffmpeg from 'fluent-ffmpeg';
import  { Readable } from 'stream';

const urls = [
    
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/yXeTZURQAWIs4N5i1677565109702.wav",
        "cutFrom": 0,
        "startingTime": 0,
        "duration": 3.6,
        "name": "intro"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/NEuREyoBbPNGoiOk1677565096692.wav",
        "cutFrom": 0,
        "startingTime": 3.6,
        "duration": 8,
        "name": "headlineTrack"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/Vx9ZbAXdizjPdFeB1677565103193.wav",
        "cutFrom": 0,
        "startingTime": 11.6,
        "duration": 32,
        "name": "verificationTrack"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/Fam5hWXagh19JO2q1677565114318.wav",
        "cutFrom": 0,
        "startingTime": 44.6,
        "duration": 5,
        "name": "outroTrack"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/4jne7GWEJZMwzMc01677573035794.mp3",
        "cutFrom": 0,
        "startingTime": 3.6,
        "duration": 8,
        "name": "headlineAudio"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/A9LWmTiQGFKX5sRS1677573040535.mp3",
        "cutFrom": 0,
        "startingTime": 11.6,
        "duration": 8,
        "name": "verify1"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/MfuxJmRO3Bg7LXLu1677573044065.mp3",
        "cutFrom": 0,
        "startingTime": 19.6,
        "duration": 8,
        "name": "verify2"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/7zrnbXEhvXdjWfKM1677573049479.mp3",
        "cutFrom": 0,
        "startingTime": 27.6,
        "duration": 8,
        "name": "verify3"
    },
    {
        "type": "AudioScene",
        "audioUrl": "https://storage.googleapis.com/yug-external-files/ULUT57ASZAfVhy9M1677573056044.mp3",
        "cutFrom": 0,
        "startingTime": 36.6,
        "duration": 8,
        "name": "rating"
    }
]

let command = ffmpeg();

urls.forEach(clip=>{
    command.input(clip.audioUrl);
})

// Use complex filters to add a delay to the second file
command.complexFilter(
    [
        {
          filter: 'atrim',
          options: { start: 0, end: 3.6 },
          inputs: '0:a',
          outputs: 'a0_trimmed'
        },
        {
          filter: 'adelay',
          options: '0|0',
          inputs: 'a0_trimmed',
          outputs: 'a0_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 8 },
          inputs: '1:a',
          outputs: 'a1_trimmed'
        },
        {
          filter: 'adelay',
          options: '3600|3600',
          inputs: 'a1_trimmed',
          outputs: 'a1_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 32 },
          inputs: '2:a',
          outputs: 'a2_trimmed'
        },
        {
          filter: 'adelay',
          options: '11600|11600',
          inputs: 'a2_trimmed',
          outputs: 'a2_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 5 },
          inputs: '3:a',
          outputs: 'a3_trimmed'
        },
        {
          filter: 'adelay',
          options: '44600|44600',
          inputs: 'a3_trimmed',
          outputs: 'a3_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 8 },
          inputs: '4:a',
          outputs: 'a4_trimmed'
        },
        {
          filter: 'adelay',
          options: '3600|3600',
          inputs: 'a4_trimmed',
          outputs: 'a4_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 8 },
          inputs: '5:a',
          outputs: 'a5_trimmed'
        },
        {
          filter: 'adelay',
          options: '11600|11600',
          inputs: 'a5_trimmed',
          outputs: 'a5_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 8 },
          inputs: '6:a',
          outputs: 'a6_trimmed'
        },
        {
          filter: 'adelay',
          options: '19600|19600',
          inputs: 'a6_trimmed',
          outputs: 'a6_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 8 },
          inputs: '7:a',
          outputs: 'a7_trimmed'
        },
        {
          filter: 'adelay',
          options: '27600|27600',
          inputs: 'a7_trimmed',
          outputs: 'a7_delayed'
        },
        {
          filter: 'atrim',
          options: { start: 0, end: 8 },
          inputs: '8:a',
          outputs: 'a8_trimmed'
        },
        {
          filter: 'adelay',
          options: '36600|36600',
          inputs: 'a8_trimmed',
          outputs: 'a8_delayed'
        },
        {
          filter: 'amix',
          options: 'inputs=9',
          inputs: [
            'a0_delayed',
            'a1_delayed',
            'a2_delayed',
            'a3_delayed',
            'a4_delayed',
            'a5_delayed',
            'a6_delayed',
            'a7_delayed',
            'a8_delayed'
          ],
          outputs: 'mixedAudio'
        }
      ]
      
      
      
      ,
    ['mixedAudio']);

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


// [
//     {
//       filter: 'atrim',
//         options:{
//         start:0,
//         end:3.6
//     },
//       inputs: '0:a',
//       outputs: 'a0_trimmed',
//     },
//     {
//         filter: 'atrim',
//         options:{
//         start:0,
//         end:8
//     },
//         inputs: '1:a',
//         outputs: 'a1_trimmed',
//       },
//     {
//       filter: 'adelay',
//       options: '3600|3600',
//       inputs: 'a1_trimmed',
//       outputs: 'a1_delayed',
//     },
//     {
//       filter: 'atrim',
//         options:{
//         start:0,
//         end:5
//     },
//       inputs: '2:a',
//       outputs: 'a2_trimmed',
//     },
//     {
//         filter: 'adelay',
//         options: '11600|11600',
//         inputs: 'a2_trimmed',
//         outputs: 'a2_delayed',
//       },
//     {
//       filter: 'amix',
//       options: 'inputs=3',
//       inputs: ['a0_trimmed', 'a1_delayed', 'a2_delayed'],
//       outputs: 'mixedAudio',
//     }
// ], 