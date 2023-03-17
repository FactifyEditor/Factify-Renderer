import { Dimension } from "../interfaces/common"
import { execa } from "execa"
const FFMPEG = "ffmpeg"

interface WriterProcessOptions {
  fps: number
  dimension: Dimension
  outPath: string
  outputArgs: string[]
}

export const startFFmpegWriterProcess = ({ fps, dimension, outPath, outputArgs }: WriterProcessOptions) => {
  const { width, height } = dimension
  let framerateStr = String(fps)
  const args = 
  // [
  //   ...["-hide_banner", "-loglevel", "error"],
  //   "-f",
  //   "rawvideo",
  //   "-vcodec",
  //   "rawvideo",
  //   "-pix_fmt",
  //   "rgba",
  //   "-s",
  //   `${width}x${height}`,
  //   "-r",
  //   framerateStr,
  //   "-i",
  //   "-",
  //   ...outputArgs,
  //   "-y",
  //   outPath,
  // ]
  [
    '-hide_banner',     '-loglevel',
    'error',            '-f',
    'rawvideo',         '-vcodec',
    'rawvideo',         '-pix_fmt',
    'rgba',             '-s',
    '900x1600',         '-r',
    '25',               '-i',
    '-',                '-map',
    '0:v:0',            '-vf',
    'format=yuv420p',   '-vcodec',
    'libx264',          '-profile:v',
    'high',             '-preset:v',
    'medium',           '-crf',
    '18',               '-movflags',
    'faststart',        '-y',
    './newsTitle.mp4'
  ]
  console.log(args);

  return execa(FFMPEG, args, {
    encoding: null,
    buffer: false,
    stdin: "pipe",
    stdout: process.stdout,
    stderr: process.stderr,
  })
}

export const getOutputArgs = () => {
  const outputArgs = [
    "-vf",
    "format=yuv420p",
    "-vcodec",
    "libx264",
    "-profile:v",
    "high",
    "-preset:v",
    "medium",
    "-crf",
    "18",
    "-movflags",
    "faststart",
  ]

  return [...outputArgs]
}
