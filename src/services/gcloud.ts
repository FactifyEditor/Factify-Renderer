import { customAlphabet } from "nanoid"

import AWS from "aws-sdk"
import {Storage}  from '@google-cloud/storage';
import config from "../common/app-config"
import mime from "mime/lite"

class GcloudService {
  bucket: any;
  constructor() {
    this.init()
  }

  uploadBuffer = async (filename: string, data: Buffer): Promise<string> => {
    const key = uniqueFilename(filename);
    const contentType = mime.getType(key) as string;
    const file = this.bucket.file(key);
    await file.save(data)
    return config.cdnBase+key;
  }

 

  init = () => {
    const storage = new Storage();
    
    this.bucket = storage.bucket('yug-external-files');
   
  }
}

export default new GcloudService()

function uniqueId() {
  const nanoid = customAlphabet("_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 24)
  return nanoid()
}

function uniqueFilename(name: string) {
  const nameArray = name.split(".")
  const extension = nameArray[nameArray.length - 1]
  const uniqueName = [uniqueId(), extension].join(".")
  return uniqueName
}
