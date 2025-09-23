// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import User from "@/models/User";
// import { messaging } from "@/utils/firebaseAdmin";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ✅ Handle preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, { status: 204, headers: corsHeaders });
// }

// export async function POST(req: NextRequest) {
//   try {
//     await connectToDatabase();
//     const { title, body } = await req.json();

//     if (!title || !body) {
//       return NextResponse.json(
//         { error: "Title and body are required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // ✅ Get all user tokens
//     const users = await User.find({ fcmTokens: { $exists: true, $ne: [] }, isDeleted: false }).select("fcmTokens");

//     const allTokens = users.flatMap((user) => user.fcmTokens);

//     if (allTokens.length === 0) {
//       return NextResponse.json(
//         { error: "No user tokens found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // ✅ Batch tokens (500 max per request)
//     const chunks = [];
//     for (let i = 0; i < allTokens.length; i += 500) {
//       chunks.push(allTokens.slice(i, i + 500));
//     }

//     const results = [];
//     for (const chunk of chunks) {
//       const message = {
//         notification: { title, body },
//         tokens: chunk,
//       };
//       const response = await messaging.sendEachForMulticast(message);
//       results.push(response);
//     }

//     return NextResponse.json(
//       { success: true, totalUsers: allTokens.length, results },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Notification error:", error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";
import { messaging } from "@/utils/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    // Extract fields
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const targetType = formData.get("targetType") as string;
    const targetId = formData.get("targetId") as string;

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Optional file handling
    let fileUrl = "";
    const file = formData.get("file") as File | null;
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/notifications",
      });

      fileUrl = uploadResponse.url;
    }

    // ✅ Get all user tokens
    const users = await User.find({ fcmTokens: { $exists: true, $ne: [] }, isDeleted: false }).select("fcmTokens");
    const allTokens = users.flatMap((user) => user.fcmTokens);

    if (allTokens.length === 0) {
      return NextResponse.json(
        { success: false, message: "No user tokens found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Batch tokens (500 max per request)
    const chunks = [];
    for (let i = 0; i < allTokens.length; i += 500) {
      chunks.push(allTokens.slice(i, i + 500));
    }

    const results = [];
    for (const chunk of chunks) {
      const message: any = {
        notification: { title, body },
        tokens: chunk,
      };

      // Attach optional data
      if (fileUrl || targetType || targetId) {
        message.data = {
          ...(fileUrl && { fileUrl }),
          ...(targetType && { targetType }),
          ...(targetId && { targetId }),
        };
      }

      const response = await messaging.sendEachForMulticast(message);
      results.push(response);
    }

    return NextResponse.json(
      { success: true, totalUsers: allTokens.length, results, targetType, targetId, fileUrl },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}
