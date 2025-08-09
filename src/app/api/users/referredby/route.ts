import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PATCH: Update referredBy field based on referralCode
// export async function PATCH(req: Request) {
//   await connectToDatabase();

//   try {
//     const { userId, referralCode } = await req.json();

//     if (!userId || !referralCode) {
//       return NextResponse.json(
//         { success: false, message: "Missing userId or referralCode." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }
//     if (user.referredBy) {
//       return NextResponse.json(
//         { success: false, message: "User has already been referred." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Find the referrer by referralCode
//     const referrer = await User.findOne({ referralCode });

//     if (!referrer) {
//       return NextResponse.json(
//         { success: false, message: "Invalid referral code." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // Update the target user's referredBy field
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { referredBy: referrer._id },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return NextResponse.json(
//         { success: false, message: "User not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, message: "Referral applied successfully." },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred.";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
// ✅ PATCH: Update referredBy field based on referralCode and add to myTeams
export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const { userId, referralCode } = await req.json();

    if (!userId || !referralCode) {
      return NextResponse.json(
        { success: false, message: "Missing userId or referralCode." },
        { status: 400, headers: corsHeaders }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (user.referredBy) {
      return NextResponse.json(
        { success: false, message: "User has already been referred." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the referrer by referralCode
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return NextResponse.json(
        { success: false, message: "Invalid referral code." },
        { status: 404, headers: corsHeaders }
      );
    }

     if (referrer.referredBy?.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Circular referrals are not allowed." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ 1. Update current user
    user.referredBy = referrer._id;
    await user.save();

    // ✅ 2. Add userId to referrer's myTeams
    if (!referrer.myTeams.includes(user._id)) {
      referrer.myTeams.push(user._id);
      await referrer.save();
    }

    return NextResponse.json(
      { success: true, message: "Referral applied and tracked successfully." },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}



// ✅ GET: Get user by referralCode
export async function GET(req: Request) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  console.log("serach params : ", searchParams)
  const referralCode = searchParams.get("referralCode");

  if (!referralCode) {
    return NextResponse.json(
      { success: false, message: "Missing referralCode." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const user = await User.findOne({ referralCode }).select(
      "fullName email mobileNumber referralCode"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No user found with this referral code." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: user },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
