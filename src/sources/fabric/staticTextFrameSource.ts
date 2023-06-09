// @ts-nocheck
import { fabric } from "fabric"
import { TextLayer } from "../../interfaces/common"

import { easeOutExpo, easeInOutCubic } from '../../utils/transitions';
import fileUrl from "file-url"
import { basename, join } from 'path';
import * as gsap from 'gsap'
import { TweenLite, TimelineMax, Power3, Power2 } from 'gsap'
const isUrl = (path: string) => /^https?:\/\//.test(path)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as fs from 'fs';
import * as https from 'https';


export const  downloadFile=(url: string, filePath: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('File downloaded successfully');
        resolve();
      });
    }).on('error', error => {
      fs.unlink(filePath, () => {
        console.error(`Error downloading file: ${error.message}`);
        reject(error);
      });
    });
  });
}


const loadedFonts=[]
export function registerFont(...args) {
  fabric.nodeCanvas.registerFont(...args);
}
export function generateRandomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
async function staticTextFrameSource({ layer, options }: { layer: TextLayer; options: any }) {
  // const metadata = layer.metadata
  console.log(layer);
  const { textAlign,fontURL, fontFamily, fontSize, fontWeight, charSpacing, lineHeight, text, delay = 0, speed = 1 } = layer
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
  //
  // const imagePath = path.join(__dirname, 'assets/example.png');
  // const fontPath ='./../assets/;

  const fontPath = `${__dirname}/assets/${generateRandomString(4)}font.ttf`;
  await downloadFile(fontURL,fontPath)
  if (fontPath) {
   let family = Buffer.from(basename(fontPath)).toString('base64');
    if (!loadedFonts.includes(family)) {
      registerFont(fontPath, { family: family, weight: fontWeight, style: 'normal' });
      loadedFonts.push(family);
    }
  }
  // await loadFont(fontURL)
  const element = new fabric.StaticText(textOptions)

  let left = element.left;
  let totalFrames: number;
  let currentFrame = 0;



  async function onRender(progress: number, canvas: fabric.StaticCanvas) {
    const min = Math.min(layer.width, layer.height);
    const easedTextProgress = easeOutExpo(Math.max(0, Math.min((progress - delay - 0.02) * speed * 4, 1)));
    const easedTextOpacityProgress = easeOutExpo(Math.max(0, Math.min((progress - delay - 0.07) * speed * 4, 1)));
    const paddingV = .5 * min;
    const paddingH = 0.03 * min;
    var paddingL = paddingV + (easedTextProgress - 1) * layer.width
    element.left = paddingL < left ? paddingL : left;
    element.opacity = easedTextOpacityProgress,
      console.log(easedTextProgress);
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
    // var timeline = new TimelineMax();
    //   timeline.to(element, {
    //     duration: 3,
    //     ease: Power3.easeOut,
    //     delay:"2s"
    // });
    // Add animation sequences for the text element
    // timeline.to(element, 1, {top: paddingV + (easedTextProgress - 1) * layer.height, ease: Power2.easeInOut});
    // timeline.to(element, 1, { ease: Power2.easeInOut});
    // const tl = new TimelineMax();
    // tl.to(element, {duration: 1, y:-element.height, ease: 'power2.out'});

    // animateText(element,canvas);

    // console.log(progress);
    // element.animate('left', '+=100', { onChange: canvas.renderAll.bind(canvas) });

  }



  return { onRender }
}

export default staticTextFrameSource
