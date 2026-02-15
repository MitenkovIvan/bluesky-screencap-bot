require("dotenv").config({ path: '.env' });
require("dotenv").config({ path: '.env.local', override: true });
const fs = require("fs");
const path = require("path");
const { BskyAgent } = require("@atproto/api");
const { imageSize } = require('image-size');

async function sendPostWithImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error("File does not exist! Try again.");
  }

  const fileName = path.basename(imagePath);
  const replacements = [[".jpg", ""], ["？", "?"], ["：", ":"]];
  const newFileName = replacements.reduce(
    (str, [target, replacement]) => 
      str.split(target).join(replacement),
    fileName
  );

  const fileExtension = path.extname(imagePath).toLowerCase();
  if (fileExtension !== ".jpg" && fileExtension !== ".png") {
    throw new Error("Only jpg and png files are supported at this time.");
  }

  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({
    identifier: process.env.IDENTIFIER,
    password: process.env.PASSWORD,
  });

  const imageBytes = await fs.promises.readFile(imagePath);
  const encoding = fileExtension === ".jpg" ? "image/jpeg" : "image/png";

  const testUpload = await agent.uploadBlob(imageBytes, { encoding });
  const imageDimensions = imageSize(imageBytes);

  const postResult = await agent.post({
    text: "",
    embed: {
      images: [
        {
          image: testUpload.data.blob,
          alt: newFileName,
          aspectRatio: {
            width: imageDimensions.width,
            height: imageDimensions.height
          }
        },
      ],
      $type: "app.bsky.embed.images",
    },
  });

  return { postResult, fileName };
}

function getRandomImagePath() {
  const dir = "./img";
  let files = fs.readdirSync(dir);

  files = files.filter((file) => {
    const extension = path.extname(file).toLowerCase();
    return [".jpg", ".gif", ".png"].includes(extension);
  });

  if (files.length === 0) {
    postError("Error: no files in img directory.");
    throw new Error("No files in img directory");
  }

  let usedImages;
  try {
    usedImages = new Set(
      JSON.parse(fs.readFileSync("usedImages.json", "utf-8"))
    );
  } catch {
    usedImages = new Set();
  }

  let unusedImages = files.filter((file) => !usedImages.has(file));

  if (unusedImages.length === 0) {
    usedImages.clear();
    fs.writeFileSync("usedImages.json", JSON.stringify(Array.from(usedImages)));
    console.log("File limit reached. Resetting usedImages.json...");
    unusedImages = files;
  }

  const randomIndex = Math.floor(Math.random() * unusedImages.length);
  const randomFile = unusedImages[randomIndex];

  usedImages.add(randomFile);
  fs.writeFileSync("usedImages.json", JSON.stringify(Array.from(usedImages)));

  return path.join(dir, randomFile);
}

function getImagePath() {
  const dir = "./img_alt";
  let files = fs.readdirSync(dir);

  files = files.sort(function(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  files = files.filter((file) => {
    const extension = path.extname(file).toLowerCase();
    return [".jpg", ".gif", ".png"].includes(extension);
  });

  if (files.length === 0) {
    postError("Error: no files in img directory.");
    throw new Error("No files in img directory");
  }

  let usedImages;
  try {
    usedImages = new Set(
      JSON.parse(fs.readFileSync("usedImages_alt.json", "utf-8"))
    );
  } catch {
    usedImages = new Set();
  }

  let unusedImages = files.filter((file) => !usedImages.has(file));

  if (unusedImages.length === 0) {
    usedImages.clear();
    fs.writeFileSync("usedImages_alt.json", JSON.stringify(Array.from(usedImages)));
    console.log("File limit reached. Resetting usedImages_alt.json...");
    unusedImages = files;
    console.log("Turning off special mode...");
    process.env.MODE = "normal";
    fs.writeFileSync('.env.local', `MODE=${process.env.MODE}`);
    return null;
  }

  const randomFile = unusedImages[0];

  usedImages.add(randomFile);
  fs.writeFileSync("usedImages_alt.json", JSON.stringify(Array.from(usedImages)));

  return path.join(dir, randomFile);
}

let imagePath;
if (process.env.MODE === "special") {
  imagePath = getImagePath();
  if (!imagePath) {
    imagePath = getRandomImagePath();
  }
} else {
  imagePath = getRandomImagePath();
}

sendPostWithImage(imagePath)
  .then(({ fileName }) => {
    console.log(`Post sent with image: ${fileName}!`);
  })
  .catch((error) => {
    console.log("Post failed:", error.message);
  });
