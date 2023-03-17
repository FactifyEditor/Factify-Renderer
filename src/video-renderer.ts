import { join, dirname } from "path"
import fs from "fs-extra"
import { nanoid } from "nanoid"
import parseConfig from "./parse-config"
import createFrameSource from "./sources/frameSource"
import FFmpeg from "./ffmpeg"
import { IDesign } from "./types"
import { prepareDesign } from "./prepare-design"
import GlTransitions from './utils/glTransitions';
import "@layerhub-io/objects"

const channels = 4

function parseFps(fps: any) {
  const match = typeof fps === "string" && fps.match(/^([0-9]+)\/([0-9]+)$/)
  if (match) {
    const num = parseInt(match[1], 10)
    const den = parseInt(match[2], 10)
    if (den > 0) return num / den
  }
  return undefined
}

interface VideoRendererOptions extends IDesign {
  verbose?: boolean
  fps: number
}

class VideoRenderer {
  public channels: number = 4
  public options: VideoRendererOptions
  private ffmpeg: FFmpeg
  private tmpDir: string

  constructor(options: VideoRendererOptions) {
    // @ts-ignore
    this.options = prepareDesign(options)
  }

  public render = async () => {
    const {
      verbose = false,
      scenes: clipsIn,
      frame: {  width, height },
    } = this.options

    const { clips } = await parseConfig({
      clips: clipsIn,
    })
    await this.createTempDir()

    let frameSource1
    let frameSource2
    let frameSource1Data
    let totalFramesWritten = 0
    let fromClipFrameAt = 0
    let transitionFromClipId = 0

    // Try to detect parameters from first video
    let firstVideoWidth
    let firstVideoHeight
    let firstVideoFramerateStr

    let toClipFrameAt = 0

    clips.find(
      (clip) =>
        clip &&
        clip.layers.find((layer) => {
          if (layer.type === "StaticVideo") {
            firstVideoWidth = layer.inputWidth
            firstVideoHeight = layer.inputHeight
            firstVideoFramerateStr = layer.framerateStr

            return true
          }
          return false
        })
    )

    let fps: any
    let framerateStr: any

    if (firstVideoFramerateStr) {
      fps = parseFps(firstVideoFramerateStr)
      framerateStr = firstVideoFramerateStr
    } else {
      fps = 25
      framerateStr = String(fps)
    }
    const estimatedTotalFrames = fps * clips.reduce((acc, c, i) => {
      let newAcc = acc + c.duration;
      if (i !== clips.length - 1) newAcc -= c.transition.duration;
      return newAcc;
    }, 0);
    console.log(estimatedTotalFrames);
    const { runTransitionOnFrame: runGlTransitionOnFrame } = GlTransitions({ width, height, channels });
     // @ts-ignore
    function runTransitionOnFrame({ fromFrame, toFrame, progress, transitionName, transitionParams }) {
      // A dummy transition can be used to have an audio transition without a video transition
      // (Note: You will lose a portion from both clips due to overlap)
      if (transitionName === 'dummy') return progress > 0.5 ? toFrame : fromFrame;
      return runGlTransitionOnFrame({ fromFrame, toFrame, progress, transitionName, transitionParams });
    }
    this.ffmpeg = new FFmpeg({
      fps,
      framerateStr,
      dimension: {
        width,
        height,
      },
    })
    const getTransitionFromClip = () => {
      return clips[transitionFromClipId]
    }

    // @ts-ignore
    const getSource = async (clip, clipIndex) => {
      return createFrameSource({
        clip,
        clipIndex,
        width,
        height,
        channels,
        verbose,
        fps,
        framerateStr,
      })
    }

    const getTransitionToClipId = () => transitionFromClipId + 1

    const getTransitionToClip = () => clips[getTransitionToClipId()]
    const getTransitionFromSource = async () => getSource(getTransitionFromClip(), transitionFromClipId)
    const getTransitionToSource = async () =>
      getTransitionToClip() && getSource(getTransitionToClip(), getTransitionToClipId())

    console.log(`${width}x${height} ${fps}fps`)
    try {
      frameSource1 = await getTransitionFromSource()
      frameSource2 = await getTransitionToSource()
       let index=0;
         // eslint-disable-next-line no-constant-condition
      while (true) {
        const transitionToClip = getTransitionToClip();
        const transitionFromClip = getTransitionFromClip();
        const fromClipNumFrames = Math.round(transitionFromClip.duration * fps);
        const toClipNumFrames = transitionToClip && Math.round(transitionToClip.duration * fps);
        const fromClipProgress = fromClipFrameAt / fromClipNumFrames;
        const toClipProgress = transitionToClip && toClipFrameAt / toClipNumFrames;
        const fromClipTime = transitionFromClip.duration * fromClipProgress;
        const toClipTime = transitionToClip && transitionToClip.duration * toClipProgress;

        const currentTransition = transitionFromClip.transition;

        const transitionNumFrames = Math.round(currentTransition.duration * fps);

        // Each clip has two transitions, make sure we leave enough room:
        const transitionNumFramesSafe = Math.floor(Math.min(Math.min(fromClipNumFrames, toClipNumFrames != null ? toClipNumFrames : Number.MAX_SAFE_INTEGER) / 2, transitionNumFrames));
        // How many frames into the transition are we? negative means not yet started
        const transitionFrameAt = fromClipFrameAt - (fromClipNumFrames - transitionNumFramesSafe);

        if (!verbose) {
          const percentDone = Math.floor(100 * (totalFramesWritten / estimatedTotalFrames));
          if (totalFramesWritten % 10 === 0) process.stdout.write(`${String(percentDone).padStart(3, ' ')}% `);
        }

        // console.log({ transitionFrameAt, transitionNumFramesSafe })
        // const transitionLastFrameIndex = transitionNumFramesSafe - 1;
        const transitionLastFrameIndex = transitionNumFramesSafe;

        // Done with transition?
        if (transitionFrameAt >= transitionLastFrameIndex) {
          transitionFromClipId += 1;
          console.log(`Done with transition, switching to next transitionFromClip (${transitionFromClipId})`);

          if (!getTransitionFromClip()) {
            console.log('No more transitionFromClip, done');
            break;
          }

          // Cleanup completed frameSource1, swap and load next frameSource2
          await frameSource1.close();
          frameSource1 = frameSource2;
          frameSource2 = await getTransitionToSource();

          fromClipFrameAt = transitionLastFrameIndex;
          toClipFrameAt = 0;

          // eslint-disable-next-line no-continue
          continue;
        }

      
        const newFrameSource1Data = await frameSource1.readNextFrame({ time: fromClipTime });
      
        // If we got no data, use the old data
        // TODO maybe abort?
        if (newFrameSource1Data) frameSource1Data = newFrameSource1Data;
        else console.warn('No frame data returned, using last frame');

        const isInTransition = frameSource2 && transitionNumFramesSafe > 0 && transitionFrameAt >= 0;

        let outFrameData;

        if (isInTransition) {
         
          const frameSource2Data = await frameSource2.readNextFrame({ time: toClipTime });
         

          if (frameSource2Data) {
            const progress = transitionFrameAt / transitionNumFramesSafe;
             // @ts-ignore
            const easedProgress = currentTransition.easingFunction(progress);

 // @ts-ignore          
            outFrameData = runTransitionOnFrame({ fromFrame: frameSource1Data, toFrame: frameSource2Data, progress: easedProgress, transitionName: currentTransition.name, transitionParams: currentTransition.params });
         
          } else {
            console.warn('Got no frame data from transitionToClip!');
            // We have probably reached end of clip2 but transition is not complete. Just pass thru clip1
            outFrameData = frameSource1Data;
          }
        } else {
          // Not in transition. Pass thru clip 1
          outFrameData = frameSource1Data;
        }

        if (verbose) {
           // @ts-ignore
          if (isInTransition) console.log('Writing frame:', totalFramesWritten, 'from clip', transitionFromClipId, `(frame ${fromClipFrameAt})`, 'to clip', getTransitionToClipId(), `(frame ${toClipFrameAt} / ${transitionNumFramesSafe})`, currentTransition.name, `${currentTransition.duration}s`);
          else console.log('Writing frame:', totalFramesWritten, 'from clip', transitionFromClipId, `(frame ${fromClipFrameAt})`);
          // console.log(outFrameData.length / 1e6, 'MB');
        }

        const nullOutput = false;

          await this.ffmpeg.write(outFrameData)

        totalFramesWritten += 1;
        fromClipFrameAt += 1;
        if (isInTransition) toClipFrameAt += 1;
      } // End while loop

      // while (true) {
      //   const transitionToClip = getTransitionToClip();
      //   const transitionFromClip = getTransitionFromClip();
      //   console.log("transitionFromClip",transitionFromClip.duration);
      //   const toClipNumFrames = transitionToClip && Math.round(transitionToClip.duration * fps);
      //   const fromClipNumFrames = Math.round(transitionFromClip.duration * fps)
      //   const fromClipProgress = fromClipFrameAt / fromClipNumFrames
      //   const fromClipTime = transitionFromClip.duration * fromClipProgress;
      //   const toClipProgress = transitionToClip && toClipFrameAt / toClipNumFrames;
      //   const toClipTime = transitionToClip && transitionToClip.duration * toClipProgress;
      //   const currentTransition = transitionFromClip.transition;

      //   const transitionNumFrames = Math.round(currentTransition.duration * fps);

      //   // Each clip has two transitions, make sure we leave enough room:
      //   const transitionNumFramesSafe = Math.floor(Math.min(Math.min(fromClipNumFrames, toClipNumFrames != null ? toClipNumFrames : Number.MAX_SAFE_INTEGER) / 2, transitionNumFrames));
      //   // How many frames into the transition are we? negative means not yet started
      //   const transitionFrameAt = fromClipFrameAt - (fromClipNumFrames - transitionNumFramesSafe);
      //   // console.log(fromClipFrameAt, fromClipNumFrames, transitionNumFramesSafe)
      //   const transitionLastFrameIndex = transitionNumFramesSafe;
        
      //   console.log(transitionFrameAt,transitionLastFrameIndex)
      //   if (transitionFrameAt >= transitionLastFrameIndex) {
      //     transitionFromClipId += 1
      //     console.log(`Done with transition, switching to next transitionFromClip (${transitionFromClipId})`)
      //     if (!getTransitionFromClip()) {
      //       console.log("No more transitionFromClip, done")
      //       break
      //     }
      //     await frameSource1.close()
      //     frameSource1 = frameSource2
      //     frameSource2 = await getTransitionToSource()

      //     fromClipFrameAt = transitionLastFrameIndex
      //     toClipFrameAt = 0

      //     continue
      //   }

      //   const newFrameSource1Data = await frameSource1.readNextFrame({ time: fromClipTime })
      //   // If we got no data, use the old data
      //   // TODO maybe abort?
      //   if (newFrameSource1Data) {
      //     frameSource1Data = newFrameSource1Data
      //   } else {
      //     console.warn("No frame data returned, using last frame")
      //   }

      //   let outFrameData = frameSource1Data;
      //   const isInTransition = frameSource2 && transitionNumFramesSafe > 0 && transitionFrameAt >= 0;
      //   if (isInTransition) {
         
      //     const frameSource2Data = await frameSource2.readNextFrame({ time: toClipTime });

      //     if (frameSource2Data) {
      //       const progress = transitionFrameAt / transitionNumFramesSafe;
      //         // @ts-ignore
      //       const easedProgress = currentTransition.easingFunction(progress);
      //         // @ts-ignore
      //       outFrameData = runTransitionOnFrame({ fromFrame: frameSource1Data, toFrame: frameSource2Data, progress: easedProgress, transitionName: currentTransition.name, transitionParams: currentTransition.params });
      //     } else {
      //       console.warn('Got no frame data from transitionToClip!');
      //       // We have probably reached end of clip2 but transition is not complete. Just pass thru clip1
      //       outFrameData = frameSource1Data;
      //     }
      //   } else {
      //     // Not in transition. Pass thru clip 1
      //     outFrameData = frameSource1Data;
      //   }
      //   console.log("ffmpeg")
      //   await this.ffmpeg.write(outFrameData)

      //   if (this.ffmpeg.outProcessError) {
      //     break
      //   }

      //   totalFramesWritten += 1
      //   fromClipFrameAt += 1
      // }

      this.ffmpeg.close()
    } catch (err) {
      this.ffmpeg.kill()
      throw err
    } finally {
      if (frameSource1) {
        await frameSource1.close()
      }
      await this.removeTempDir()
    }

    try {
      await this.ffmpeg.ensureDone()
    } catch (err: any) {
      if (this.ffmpeg.outProcessExitCode !== 0 && !err.killed) throw err
    }

    console.log("Done")
  }

  public createTempDir = async () => {
    const outPath = "./position.mp4"
    const outDir = dirname(outPath)
    const tmpDir = join(outDir, `renderer-tmp-${nanoid()}`)
    await fs.mkdirp(tmpDir)
    this.tmpDir = tmpDir
  }

  public removeTempDir = async () => {
    await fs.remove(this.tmpDir)
  }

  public getEstimatedTotalFrames = (clips: any) => {
    const { fps } = this.options
    const estimatedTotalFrames =
      fps *
      clips.reduce((acc: any, c: any, i: any) => {
        let newAcc = acc + c.duration
        if (i !== clips.length - 1) newAcc -= c.transition.duration
        return newAcc
      }, 0)
    return estimatedTotalFrames
  }
}
export default VideoRenderer
