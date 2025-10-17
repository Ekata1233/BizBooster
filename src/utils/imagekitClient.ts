import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/hzyuadmua",
  authenticationEndpoint: "/api/imagekit-auth", // optional if you need private uploads
});

const uploadFileToImageKit = async (file: File, folder: string) => {
  const response = await imagekit.upload({
    file,
    fileName: `${Date.now()}-${file.name}`,
    folder,
  });
  return response.url;
};
