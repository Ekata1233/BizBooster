// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import User from "@/models/User";
// import { connectToDatabase } from "@/utils/db";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET,OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function GET(req: Request) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const parts = url.pathname.split("/");
//     const id = parts[parts.length - 2]; // 👈 second last segment (the userId)

//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid or missing user id" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const user = await User.findById(id);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // Count how many users used this user's referral
//     const count = await User.countDocuments({
//       referredBy: user._id,
//       isDeleted: false,
//     });

//     // Optional: get details of referred users
//     const users = await User.find({
//       referredBy: user._id,
//       isDeleted: false,
//     })
//       .select("fullName email mobileNumber createdAt")
//       .lean();

//     return NextResponse.json(
//       { success: true, count, users },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 2]; // second last segment = userId

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing user id" },
        { status: 400, headers: corsHeaders }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Find all referred users of this user
    const referredUsers = await User.find({
      referredBy: user._id,
      isDeleted: false,
    }).select("packageStatus");

    // Count GP + SGP
    const gpCount = referredUsers.filter(
      (u) => u.packageStatus === "GP" || u.packageStatus === "SGP"
    ).length;

    // Count only SGP
    const sgpCount = referredUsers.filter((u) => u.packageStatus === "SGP").length;

    return NextResponse.json(
      {
        success: true,
        userId: id,
        gpCount,
        sgpCount,
        totalReferred: referredUsers.length,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
