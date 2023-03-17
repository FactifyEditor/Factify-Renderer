// @ts-nocheck
import { fabric } from "fabric"
import { TextLayer } from "../../interfaces/common"
import { easeOutExpo, easeInOutCubic } from '../../utils/transitions';
import * as gsap from 'gsap'
import {TweenLite,TimelineMax,Power3,Power2} from 'gsap'

async function staticTextFrameSource({ layer, options }: { layer: TextLayer; options: any }) {
  // const metadata = layer.metadata
console.log(layer);
  const { textAlign, fontFamily, fontSize, fontWeight, charSpacing, lineHeight, text, delay = 0, speed = 1 } = layer
  const textOptions = {
    ...layer,
    text: text ? text : "Default Text",
    ...(textAlign && { textAlign }),
    ...(fontFamily && { fontFamily }),
    ...(fontSize && { fontSize }),
    ...(fontWeight && { fontWeight }),
    ...(charSpacing && { charSpacing }),
    ...(lineHeight && { lineHeight }),
  }

  const element = new fabric.StaticText(textOptions)

  let left = element.left;
  let totalFrames: number;
  let currentFrame = 0;



  async function onRender(progress: number, canvas: fabric.StaticCanvas) {
    const min = Math.min(layer.width, layer.height);
    const easedTextProgress = easeOutExpo(Math.max(0, Math.min((progress - delay - 0.02) * speed * 4, 1)));
    // const easedTextOpacityProgress = easeOutExpo(Math.max(0, Math.min((progress - delay - 0.07) * speed * 4, 1)));
    const paddingV = .5 * min;
    // const paddingH = 0.03 * min;
    var paddingL = paddingV + (easedTextProgress - 1) * layer.width
    // element.left = paddingL < left ? paddingL : left;
    // element.opacity = easedTextOpacityProgress,
    // console.log(easedTextProgress);
  //   var anim = new TimelineMax({ paused: true });
  //   anim.progress(easedTextProgress);
  //   const duration =  anim.duration();
  //   console.log({"totalDuration":duration});
  //   totalFrames = Math.max(1, Math.ceil((duration / 1) * 25));
  //   anim.to(element, {
  //     duration: 1,
  //     angle: 360,
  //     ease: Power3.easeOut,
  //     delay:"2s"
  // });
    canvas.add(element);
    var timeline = new TimelineMax();
  //   timeline.to(element, {
  //     duration: 3,
  //     ease: Power3.easeOut,
  //     delay:"2s"
  // });
// Add animation sequences for the text element
timeline.to(element, 1, {top: paddingV + (easedTextProgress - 1) * layer.height, ease: Power2.easeInOut});
timeline.to(element, 1, { ease: Power2.easeInOut});
// const tl = new TimelineMax();
// tl.to(element, {duration: 1, y:-element.height, ease: 'power2.out'});

    // animateText(element,canvas);

    // console.log(progress);
    // element.animate('left', '+=100', { onChange: canvas.renderAll.bind(canvas) });
 
  }
  
  

  return { onRender }
}

export default staticTextFrameSource
