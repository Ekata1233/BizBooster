import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Reward from "@/models/Reward";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
// ✅ Validation helpers
const hasLetter = (value: string) => /[a-zA-Z]/.test(value);
const isOnlyNumber = (value: string) => /^\d+(\.\d+)?$/.test(value);

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 🟢 GET - List all rewards
export async function GET() {
  await connectToDatabase();

  try {
    const rewards = await Reward.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: rewards },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// 🟠 POST - Create or Update Reward (Upsert by packageType)
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const name = (formData.get("name") as string | null)?.trim() || "";
    const description = (formData.get("description") as string | null) || "";
    const packageTypeRaw = (formData.get("packageType") as string | null) || null;

    // 🆕 New fields
    const extraMonthlyEarn = (formData.get("extraMonthlyEarn") as string | null) || "";
    const extraMonthlyEarnDescription =
      (formData.get("extraMonthlyEarnDescription") as string | null) || "";

    // Validate packageType
    if (!packageTypeRaw || !["SGP", "PGP"].includes(packageTypeRaw)) {
      return NextResponse.json(
        { success: false, message: 'packageType must be "SGP" or "PGP"' },
        { status: 400, headers: corsHeaders }
      );
    }

if (!name || !hasLetter(name)) {
  return NextResponse.json(
    { success: false, message: "Name must contain at least one letter" },
    { status: 400, headers: corsHeaders }
  );
}
if (description && !hasLetter(description)) {
  return NextResponse.json(
    {
      success: false,
      message: "Description must contain at least one letter",
    },
    { status: 400, headers: corsHeaders }
  );
}
if (extraMonthlyEarn && !isOnlyNumber(extraMonthlyEarn)) {
  return NextResponse.json(
    {
      success: false,
      message: "Extra Monthly Earn must be a number",
    },
    { status: 400, headers: corsHeaders }
  );
}
if (
  extraMonthlyEarnDescription &&
  !hasLetter(extraMonthlyEarnDescription)
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Extra Monthly Earn Description must contain at least one letter",
    },
    { status: 400, headers: corsHeaders }
  );
}


    // Image upload handling
    let photo = "";
    const file = formData.get("photo") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: "/rewards",
      });
      photo = upload.url;
    }

    // 🟢 Check if a reward already exists with the same packageType
    const existingReward = await Reward.findOne({ packageType: packageTypeRaw });

    let reward;
    if (existingReward) {
      // 🔁 Update existing reward
      existingReward.name = name;
      existingReward.description = description;
      existingReward.extraMonthlyEarn = extraMonthlyEarn;                        // 🆕 Added
      existingReward.extraMonthlyEarnDescription = extraMonthlyEarnDescription;  // 🆕 Added
      if (photo) existingReward.photo = photo; // only update if new image
      await existingReward.save();
      reward = existingReward;
    } else {
      // 🆕 Create new reward
      reward = await Reward.create({
        name,
        description,
        photo,
        packageType: packageTypeRaw,
        extraMonthlyEarn,                        // 🆕 Added
        extraMonthlyEarnDescription,             // 🆕 Added
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: reward,
        message: existingReward ? "Reward updated" : "Reward created",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

