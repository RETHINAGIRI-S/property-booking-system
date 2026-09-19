// ---- where user photos are stored ----
// Images are NOT kept in our database. We send them to
// ImageKit and save only the link they give back.
import ImageKit from "imagekit";
import dotenv from "dotenv";


import path from "path";

// Load keys from .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// Connect once here, then every file can import and use it.
// publicKey  - can be seen by anyone
// privateKey - secret, never on GitHub
// urlEndpoint - our folder address on ImageKit
let imagekit;

const publicKey =
  process.env.IMAGEKIT_PUBLICKEY || process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey =
  process.env.IMAGEKIT_PRIVATEKEY || process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint =
  process.env.IMAGEKIT_URLENDPOINT ||
  process.env.IMAGEKIT_URL_ENDPOINT ||
  process.env.IMAGEKIT_ENDPOINT;

if (publicKey && privateKey && urlEndpoint) {
  imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
  console.log("✅ ImageKit SDK successfully initialized!");
} else {
  console.warn("⚠️ ImageKit credentials missing in .env - using local fallback");
  imagekit = {
    upload: async ({ file }) => {
      return {
        fileId: `mock_${Date.now()}`,
        url: file && (file.startsWith("http") || file.startsWith("data:"))
          ? file
          : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      };
    },
  };
}

export default imagekit;
