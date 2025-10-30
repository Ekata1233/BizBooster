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

export async function GET() {
  await connectToDatabase();
  try {
    const webinars = await LiveWebinars.find({});

    const now = new Date();
    const nowIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    await Promise.all(
      webinars.map(async (webinar) => {
        const [endHour, endMinute] = webinar.endTime.split(":").map(Number);

        const webinarDate = new Date(webinar.date);
        webinarDate.setHours(endHour, endMinute, 0, 0);
        const webinarEndIST = new Date(
          webinarDate.getTime() + 5.5 * 60 * 60 * 1000
        );

        const shouldClose = nowIST >= webinarEndIST;

        if (shouldClose && webinar.closeStatus !== true) {
          await LiveWebinars.findByIdAndUpdate(webinar._id, {
            closeStatus: true,
          });
        }
      })
    );

    // Fetch latest updated data
    const updatedWebinars = await LiveWebinars.find({});

    return NextResponse.json(
      { success: true, data: updatedWebinars },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Webinar list error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}


