import { NextResponse } from "next/server";
// import Certifications from "@/models/Certifications";
import Webinars from "@/models/Webinars";
import { connectToDatabase } from "@/utils/db";
// import imagekit from "@/utils/imagekit";
// import { v4 as uuidv4 } from "uuid";


// export async function PUT(req: Request) {
//   await connectToDatabase();

//   const url = new URL(req.url);
//   const id = url.pathname.split("/").pop();

//   try {
//     const formData = await req.formData();

//     const videoIndex = parseInt(formData.get("videoIndex") as string);
//     const videoName = formData.get("videoName") as string;
//     const videoDescription = formData.get("videoDescription") as string;
//     const videoFile = formData.get("videoFile") as File | null;

//     const tutorial = await Webinars.findById(id);
//     if (!tutorial || !tutorial.video || tutorial.video.length <= videoIndex) {
//       return NextResponse.json(
//         { success: false, message: "Invalid video index or ID" },
//         { status: 404 }
//       );
//     }

//     if (videoName) tutorial.video[videoIndex].videoName = videoName;
//     if (videoDescription) tutorial.video[videoIndex].videoDescription = videoDescription;

//     if (videoFile && videoFile.size > 0) {
//       const buffer = Buffer.from(await videoFile.arrayBuffer());
//       const uploadRes = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${videoFile.name}`,
//         folder: "/tutorial-videos",
//       });
//       tutorial.video[videoIndex].videoUrl = uploadRes.url;
//     }

//     const updated = await tutorial.save();

//     return NextResponse.json({ success: true, data: updated }, { status: 200 });
//   } catch (error) {
//     console.error("PUT error:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }



export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  try {
    const { videoIndex, videoName, videoDescription, videoUrl } = await req.json();

    if (typeof videoIndex !== 'number' || isNaN(videoIndex)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing video index' },
        { status: 400 }
      );
    }

    const tutorial = await Webinars.findById(id);
    if (!tutorial || !tutorial.video || tutorial.video.length <= videoIndex) {
      return NextResponse.json(
        { success: false, message: 'Invalid video index or ID' },
        { status: 404 }
      );
    }

    // Update the fields
    if (videoName) tutorial.video[videoIndex].videoName = videoName;
    if (videoDescription) tutorial.video[videoIndex].videoDescription = videoDescription;
    if (videoUrl) tutorial.video[videoIndex].videoUrl = videoUrl;

    const updated = await tutorial.save();

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}