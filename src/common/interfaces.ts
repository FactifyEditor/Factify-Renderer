import { Layer } from "../interfaces/common"

export type RenderingProgress = number

export interface VideoRendererOptions {
  clips: Clip[]
}

export interface Clip {
  id: string
  duration?: string
  name?: string
  description?: string
  layers: Layer[]
}
export interface AudioClip{
    type: string
    audioUrl:string
    cutFrom:number //cut-to will be 35
    startingTime: number
    duration: number
}

export type LayerType = "Video" | "Image" | "Path"
