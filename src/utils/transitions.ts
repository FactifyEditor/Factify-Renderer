import assert from 'assert';

const randomTransitionsSet = ['fade', 'fadegrayscale', 'directionalwarp', 'crosswarp', 'dreamyzoom', 'burn', 'crosszoom', 'simplezoom', 'linearblur', 'directional-left', 'directional-right', 'directional-up', 'directional-down'];

function getRandomTransition() {
  console.log("getting random transitions");
  return randomTransitionsSet[Math.floor(Math.random() * randomTransitionsSet.length)];
}

// https://easings.net/

export function easeOutExpo(x:any) {
  return x === 1 ? 1 : 1 - (2 ** (-10 * x));
}

export function easeInOutCubic(x:any) {
  return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
}

function getTransitionEasingFunction(easing:any, transitionName:any) {
  if (easing !== null) {
      // @ts-ignore
    if (easing) return { easeOutExpo }[easing];
    if (transitionName === 'directional') return easeOutExpo;
  }
    // @ts-ignore
  return (progress) => progress;
}
  // @ts-ignore
export function calcTransition(defaults, transition, isLastClip) {
  console.log("default",defaults,transition);
  if (transition === null || isLastClip) return { duration: 0 };
  // @ts-ignore
  const getTransitionDefault = (key) => (defaults.transition ? defaults.transition[key] : undefined);

  let transitionOrDefault = {
    name: (transition && transition.name) || getTransitionDefault('name'),
    duration: (transition && transition.duration != null) ? transition.duration : getTransitionDefault('duration'),
    params: (transition && transition.params) || getTransitionDefault('params'),
    easing: (transition && transition.easing !== undefined) ? transition.easing : getTransitionDefault('easing'),
    audioOutCurve: (transition && transition.audioOutCurve) || getTransitionDefault('audioOutCurve'),
    audioInCurve: (transition && transition.audioInCurve) || getTransitionDefault('audioInCurve'),
  };

  assert(!transitionOrDefault.duration || transitionOrDefault.name, 'Please specify transition name or set duration to 0');

  if (transitionOrDefault.name === 'random' && transitionOrDefault.duration) {
    transitionOrDefault = { ...transitionOrDefault, name: getRandomTransition() };
  }
  // @ts-ignore
  const aliasedTransition = {
    'directional-left': { name: 'directional', params: { direction: [1, 0] } },
    'directional-right': { name: 'directional', params: { direction: [-1, 0] } },
    'directional-down': { name: 'directional', params: { direction: [0, 1] } },
    'directional-up': { name: 'directional', params: { direction: [0, -1] } },
  }[transitionOrDefault.name];
  if (aliasedTransition) {
    transitionOrDefault = { ...transitionOrDefault, ...aliasedTransition };
  }

  return {
    ...transitionOrDefault,
    duration: transitionOrDefault.duration || 0,
    easingFunction: getTransitionEasingFunction(transitionOrDefault.easing, transitionOrDefault.name),
  };
}
