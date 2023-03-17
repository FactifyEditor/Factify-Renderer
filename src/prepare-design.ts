import { ILayer, IScene } from "@layerhub-io/types"
import { IDesign } from "./types"

export const prepareDesign = (design: IDesign): IDesign => {

  const preparedScenes = design.scenes.filter((scene)=>scene.layers).map((scene) => prepareScene(scene))
  return { ...design, scenes: preparedScenes }
}

const prepareScene = (scene: IScene) => {
  const updatedLayers = scene.layers.map((layer) => prepareLayer(layer as ILayer))
  return { ...scene, layers: updatedLayers, duration: scene.duration! }
}

const prepareLayer = (layer: ILayer) => {
  if (layer.type === "StaticVideo") {
    const parsedLayer = {
      ...layer,
      ...(layer.duration && { duration: layer.duration  }),
      ...(layer.cut && {
        cut: { from: layer.cut.from! , to: layer.cut.to!  },
      }),
    }
    return parsedLayer
  }
  return layer
}
