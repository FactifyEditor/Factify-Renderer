import { parseAudioClip } from "./utils/parser";
import ffmpeg from 'fluent-ffmpeg';
import { AudioClip } from "./common/interfaces";
import { resolve } from "path";


class AudioRenderer {
  public audioClips: AudioClip[];
  command: any = ffmpeg();
  filterGraph: any[]=[]
  constructor(options: any[]) {
    // @ts-ignore
   
       // @ts-ignore
    let audioScenes= options.scenes?.filter((scene)=> scene.type=='AudioScene');
    console.log(audioScenes);
    this.audioClips=audioScenes;
    this.filterGraph = parseAudioClip(audioScenes)
  }
  public render = async () => {
    return new Promise((resolve,reject)=>{
      this.audioClips.forEach(clip => {
        this.command.input(clip.audioUrl);
      });
   
      this.command.complexFilter(
        this.filterGraph,
        ['mixedAudio']);
      // Merge the inputs into a single output buffer
      this.command.output('output.wav')
      .on('error', function(err:any) {
        console.log('An error occurred:', err.message);
     })
     .on('end', function() {
        console.log('Merging finished!');
        resolve(true);
     });
     this.command.run();
    })
   
  }
  public mergevideo = async (audioUrl:string,videoUrl:string) => {
    return new Promise((resolve,reject)=>{
      console.log
      var proc = ffmpeg(videoUrl)
      // add another input stream
      .input(audioUrl)
      // set output format
      .format('mp4')
      // set output codec for both streams
      .videoCodec('copy')
      .audioCodec('aac')
      // save output file
      .save('output.mp4').on('error', function(err:any) {
        console.log('An error occurred:', err.message);
     })
     .on('end', function() {
        console.log('Merging finished!');
        resolve(true);
     });
    
    })
   
  }
}

export default AudioRenderer
