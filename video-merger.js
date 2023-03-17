import ffmpeg from 'fluent-ffmpeg';

// make sure you set the correct paths to your video and audio files
var video = 'position.mp4';
var audio = 'output.wav';

// create a new ffmpeg process
var proc = ffmpeg(video)
  // add another input stream
  .input(audio)
  // set output format
  .format('mp4')
  // set output codec for both streams
  .videoCodec('copy')
  .audioCodec('aac')
  // save output file
  .save('output.mp4');