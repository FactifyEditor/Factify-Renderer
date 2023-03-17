import { fabric } from "fabric"
import fileUrl from "file-url"
import { easeOutExpo, easeInOutCubic } from '../../utils/transitions';
import * as gsap from 'gsap'
import { TweenLite, TimelineMax, Power3, Power2 } from 'gsap'
const isUrl = (path: string) => /^https?:\/\//.test(path)

const loadImage = async (pathOrUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve) =>
    fabric.util.loadImage(isUrl(pathOrUrl) ? pathOrUrl : fileUrl(pathOrUrl), (img) => {
      resolve(img)
    })
  )

const imageFrameSource = async ({ verbose, params, width, height, text, delay = 0, speed = 1 }: any) => {
  const { path } = params
  const imgData = await loadImage(path)
  const createImg = () =>
    new fabric.Image(imgData, {
      originX: "center",
      originY: "center",
      left: width / 2,
      top: height / 2,
    })
  var left = width / 2
  async function onRender(progress: number, canvas: fabric.StaticCanvas) {
    const img = createImg()

    canvas.add(img)
 
  
     
    // Use TimelineMax from GSAP to define the animation
    const tl = new TimelineMax();
        tl.to(img, {
      duration: 3,
      angle: 360,
      ease: Power3.easeOut,
      delay:"2s"
  });
    // @ts-ignore
    // tl.to(img, {duration: 1, opacity: 0, ease: 'power2.inOut'}, '+=0.5');
    // tl.to(img, {duration: 1, y: canvas2.height - img2.height, ease: 'power2.out'}, '-=1');


  }
  function onClose() { }
  return {
    onRender,
    onClose,
  }
}

export default imageFrameSource
