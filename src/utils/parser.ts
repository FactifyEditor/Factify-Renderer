// @ts-nocheck
import pMap from "p-map"
import { Clip, AudioClip } from "../common/interfaces"



export const parseClips = async (clips: Clip[]) => {
  const defaults = {
    duration: 4,
    transition: {
      duration: 2,
      name: 'directional-up',
      audioOutCurve: 'tri',
      audioInCurve: 'tri'
    }
  }
  const clipsOut = await pMap(
    clips,
    async (clip, clipIndex) => {
      const { layers } = clip
      const clipDuration = defaults.duration

      const { transition: userTransition, duration: userClipDuration, layers: layersIn } = clip;
      const transition = calcTransition(defaults, userTransition, clipIndex === clips.length - 1);

      const layersOut = await pMap(layers, async (layer) => {
        let duration = {
          start: 0,
          time: clipDuration,
          stop: clipDuration,
        }
        if (layer.duration) {
          const { start = 0, stop } = layer.duration
          const layerDuration = (stop || clipDuration) - start
          duration = {
            ...duration,
            start,
            stop,
            time: layerDuration,
          }
        }

        return {
          ...layer,
          duration: { ...layer.duration, ...duration },
        }
      })
      return {
        transition ,
        layers: layersOut,
        duration: clipDuration,
      }
    },
    { concurrency: 1 }
  )
  return {
    clips: clipsOut,
    arbitraryAudio: [],
  }
}

export const parseAudioClip = (clips: AudioClip[]) => {
  let finalInputs = [];
  let complexFilters = [];
  clips?.forEach((clip, index) => {
    let trimFilter = {
      filter: 'atrim',
      options: {
        start: clip.cutFrom,
        end: clip.duration + clip.cutFrom,
      },
      inputs: `${index}:a`,
      outputs: `a${index}_trimmed`,
    };
    let delayFilter = {
      filter: 'adelay',
      options: `${clip.startingTime*1000}|${clip.startingTime*1000}`,
      inputs: `a${index}_trimmed`,
      outputs: `a${index}_delayed`,
    };
    let volumeFilter = {
      filter: 'volume',
      options: '10dB', // Increase the volume by 10dB.
      inputs: `a${index}_delayed`,
      outputs: `a${index}_volume`,
    };
    complexFilters.push(trimFilter);
    complexFilters.push(delayFilter);
    complexFilters.push(volumeFilter);
    finalInputs.push(`a${index}_volume`);
  });
  complexFilters.push({
    filter: 'amix',
    options: `inputs=${finalInputs.length}`,
    inputs: finalInputs,
    outputs: 'mixedAudio',
  });
  return complexFilters;
};
