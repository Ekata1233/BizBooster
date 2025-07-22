import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import LiveWebinars, { ILiveWebinar } from "@/models/LiveWebinars";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ValidationErrorItem {
  message: string;
}

interface MongooseValidationError {
  name: string;
  errors: Record<string, ValidationErrorItem>;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Webinar ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("imageUrl") as File | null;
    const date = formData.get("date") as string | null;
    const startTime = formData.get("startTime") as string | null;
    const endTime = formData.get("endTime") as string | null;

    const displayVideoUrlsRaw = formData.getAll("displayVideoUrls") as string[];
    const displayVideoUrls = displayVideoUrlsRaw.filter((url) => !!url);

    const existingWebinar = await LiveWebinars.findById(id);
    if (!existingWebinar) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (name !== null) existingWebinar.name = name;
    if (description !== null) existingWebinar.description = description;
    if (date !== null) existingWebinar.date = date;
    if (startTime !== null) existingWebinar.startTime = startTime;
    if (endTime !== null) existingWebinar.endTime = endTime;
    if (displayVideoUrls.length > 0)
      existingWebinar.displayVideoUrls = displayVideoUrls;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/certifications/images",
      });
      existingWebinar.imageUrl = uploadResponse.url;
    }

    const updated = await existingWebinar.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("PUT /api/livewebinars/[id] error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "A webinar with this name already exists." },
        { status: 409, headers: corsHeaders }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as MongooseValidationError).name === "ValidationError"
    ) {
      const validationError = error as MongooseValidationError;
      const messages = Object.values(validationError.errors).map(
        (err) => err.message
      );
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
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Webinars ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedWebinar = await LiveWebinars.findByIdAndDelete(id);
    if (!deletedWebinar) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webinar deleted successfully.",
        data: deletedWebinar,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// export async function GET(req: Request) {
//   await connectToDatabase();

//   const url = new URL(req.url);
//   const id = url.pathname.split("/").pop();

//   if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json(
//       { success: false, message: "Invalid webinar ID." },
//       { status: 400, headers: corsHeaders }
//     );
//   }

//   try {
//     // const webinar = await LiveWebinars.findById(id).populate({
//     //   path: "user",
//     //   select: "fullName email mobileNumber",
//     // });
//     const webinar = await LiveWebinars.findById(id).populate({
//       path: 'user.user',
//       model: 'User',
//       select: 'fullName email mobileNumber'
//     });



//     if (!webinar) {
//       return NextResponse.json(
//         { success: false, message: "Webinar not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: webinar },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (err: unknown) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: err instanceof Error ? err.message : "Internal Server Error",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid webinar ID." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const webinar = await LiveWebinars.findById(id)
      .populate({
        path: "user.user",
        model: "User",
        select: "fullName email mobileNumber",
      })
      .lean<ILiveWebinar | null>(); // Ensure type matches interface

    if (!webinar) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    // Normalize user array to ensure proper structure
    const normalizedUsers = webinar.user.map((entry) => ({
      status: entry.status,
      user:
        entry.user && typeof entry.user === "object" && "_id" in entry.user
          ? entry.user
          : null,
    }));

    return NextResponse.json(
      { success: true, data: { ...webinar, user: normalizedUsers } },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error("GET /livewebinars/:id error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}