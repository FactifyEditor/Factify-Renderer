import Express from "express"
import cors from "cors"
import fs from "fs"
import { join, dirname } from "path"
import VideoRenderer from "./video-renderer"
import AudioRenderer from "./audio-renderer"
import aws from "./services/aws"

import googleCloud from "./services/gcloud"

const app = Express()
app.use(Express.json({limit: '1000mb'}));
app.use(Express.urlencoded({limit: '1000mb'}));
app.use(cors())

app.use(Express.json())

app.get("/", (req, res) => {
  res.send("Running")
})

app.post("/render", async (req, res) => {
  try {
    const template = req.body;
    const renderer = new VideoRenderer(template)
    renderer
      .render()
      .then(() => {
        const outDir = dirname("outPath")
        const file = join(outDir, `position.mp4`)
        const buffer = fs.readFileSync(file);
        let name= new Date().getTime()
        return googleCloud.uploadBuffer(name+"video.mp4", buffer)
      })
      .then((url) => res.json({ url }))
      .catch((err) => {
        console.log(err)
        res.send("SOMETHING WENT WRONG")
      })
  } catch (err) {
    console.log(err)
    res.send("Something went wrong")
  }
})
app.post("/render-audio", async (req, res) => {
  try {
    const template = req.body;
    // console.log(req.body);
    const renderer = new AudioRenderer(template)
    renderer
      .render()
      .then(() => {
        const outDir = dirname("outPath")
        const file = join(outDir, `output.wav`)
        const buffer = fs.readFileSync(file);
       let name= new Date().getTime()

        return googleCloud.uploadBuffer(name+"output.wav", buffer)
      })
      .then((url) => res.json({ url }))
      .catch((err) => {
        console.log(err)
        res.send("SOMETHING WENT WRONG")
      })
  } catch (err) {
    console.log(err)
    res.send("Something went wrong")
  }
})
app.post("/merge-audio-video", async (req, res) => {
  try {
    const template = req.body;
    // console.log(req.body);
    const renderer = new AudioRenderer(template);
    let audioUrl=req.body.audioUrl,videoUrl=req.body.videoUrl
    renderer
      .mergevideo(audioUrl,videoUrl)
      .then(() => {
        const outDir = dirname("outPath")
        const file = join(outDir, `output.mp4`)
        const buffer = fs.readFileSync(file);
        let name= new Date().getTime()
        return googleCloud.uploadBuffer(name+"output.mp4", buffer)
      })
      .then((url) => res.json({ url }))
      .catch((err) => {
        console.log(err)
        res.send("SOMETHING WENT WRONG")
      })
  } catch (err) {
    console.log(err)
    res.send("Something went wrong")
  }
})

app.listen(8080, () => {
  console.log("APP RUNNING ON PORT 8080")
})
