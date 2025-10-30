import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
// import Webinars from "@/models/Webinars";
import LiveWebinars from "@/models/LiveWebinars";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";
// import { date } from "zod";
// import { time } from "console";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// interface VideoEntry {
//   videoName: string;
//   videoUrl: string;
//   videoDescription: string;
// }

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const displayVideoUrls = formData.get("displayVideoUrls") as string;
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    
    // const videoNames = formData.getAll("videoName") as string[];
    // const videoDescriptions = formData.getAll("videoDescription") as string[];

    // --- Handle Image Upload ---
    const imageFile = formData.get("imageUrl") as File;
    let imageUrlString = "";

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/certifications/images",
      });
      imageUrlString = uploadResponse.url;
    } else {
      return NextResponse.json(
        { success: false, message: "Image file for imageUrl is required." },
        { status: 400, headers: corsHeaders }
      );
    }

  
    const existingWebinar = await LiveWebinars.findOne({ name });

    if (existingWebinar) {
      console.log("Found existing webinar:", existingWebinar.name);
      const updatedFields: Partial<typeof existingWebinar> = {};

      if (description) updatedFields.description = description;
    //   if (videoToAppend.length > 0) {
    //     existingWebinar.video.push(...videoToAppend);
    //   }

      Object.assign(existingWebinar, updatedFields);
      await existingWebinar.save();

      return NextResponse.json(existingWebinar, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      if (!name || !description || !imageUrlString || !displayVideoUrls || !date || !startTime || !endTime) {
        return NextResponse.json(
          {
            success: false,
            message: "Name, Description, Image, Display Video URLs, Date, Start Time, and End Time are required for new certification",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      

      const newWebinar = await LiveWebinars.create({
        name,
        imageUrl: imageUrlString,
        description,
        displayVideoUrls,
        date,
        startTime,
        endTime,
      });

      return NextResponse.json(newWebinar, {
        status: 201,
        headers: corsHeaders,
      });
    }
  } catch (error: unknown) {
    console.error("POST /api/webinars error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Certification name must be unique.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

   if (
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  (error as { name: string }).name === "ValidationError" &&
  "errors" in error
) {
  const validationErrors = (error as { errors: Record<string, { message: string }> }).errors;
  const messages = Object.values(validationErrors).map((err) => err.message);
  return NextResponse.json(
    {
      success: false,
      message: `Validation Error: ${messages.join(", ")}`,
    },
    { status: 400, headers: corsHeaders }
  );
}


    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET ALL Certifications
export async function GET() {
  await connectToDatabase();
  try {
    const webinarEntry = await LiveWebinars.find({});

   const now = new Date();
  //  console.log("🕒 Current Time:", now.toString());

for (let webinar of webinarEntry) {
  const webinarDate = new Date(webinar.date);
  const [endHour, endMinute] = webinar.endTime.split(":").map(Number);

  webinarDate.setHours(endHour, endMinute, 0, 0);
//  console.log("📅 Webinar:", webinar.name || webinar._id);
      // console.log("➡️ Webinar End Time:", webinarDate.toString());
  // ✅ When current time >= end time, close webinar
  if (now >= webinarDate && webinar.closeStatus !== true) {
    webinar.closeStatus = true;
    await webinar.save();
  }
  
  // ✅ If webinar is still ongoing or future, keep it open
  if (now < webinarDate && webinar.closeStatus !== false) {
    webinar.closeStatus = false;
    await webinar.save();
  }
}


    return NextResponse.json(
      { success: true, data: webinarEntry },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /api/webinars error:", error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
