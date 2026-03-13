
import { v2 as cloudinary} from 'cloudinary';
import * as dotenv from 'dotenv'

dotenv.config()

// Initialize cloudinary configuration immediately
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "",
  api_key: process.env.API_KEY || "",
  api_secret: process.env.API_SECRET || "",
});

export const cloud = () => {
  // Ensure configuration is set each time
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || "",
    api_key: process.env.API_KEY || "",
    api_secret: process.env.API_SECRET || "",
  });
  return cloudinary;
};

export const uploadFile = async ({ file = "", path = "general" } : { file?: any, path?: string }) => {
  return await cloud().uploader.upload(file.path, {
    folder: `${process.env.APPLICATION_NAME}/${path}`,
  });
};

export const destoryFile = async ({ public_id = "" } : {public_id: string}) => {
  return await cloud().uploader.destroy(public_id);
};

type FilesInput =
  | Express.Multer.File[]
  | { [fieldname: string]: Express.Multer.File[] };


export const uploadFiles = async ({
  files,
  path = "general",
}: {
  files: FilesInput;
  path?: string;
}) => {
  let attachments: Record<string, { public_id: string; secure_url: string }> =
    {};

  if (Array.isArray(files)) {
    let result = [];

    for (const file of files) {
      const { public_id, secure_url } = await uploadFile({
        file,
        path,
      });

      result.push({ public_id, secure_url });
    }

    return result;
  }

  for (const key in files) {
    const file = files[key]?.[0];

    if (!file) continue;

    const { public_id, secure_url } = await uploadFile({
      file,
      path,
    });

    attachments[key] = { public_id, secure_url };
  }

  return attachments;
};

export const deleteResources = async ({
  public_ids = [],
  options = {
    type: "upload",
    resource_type: "image",
  },
} : { public_ids: string[], options?: any }) => {
  return await cloud().api.delete_resources(public_ids, options);
};

export const deleteFolderByPrefix = async ({ prefix = "" } : {prefix: string}) => {
  return await cloud().api.delete_resources_by_prefix(
    `${process.env.APPLICATION_NAME}/${prefix}`,
  );
};


export  {cloudinary} ;

