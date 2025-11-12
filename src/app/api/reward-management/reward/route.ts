import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Reward from "@/models/Reward";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    // Validate packageType
    if (!packageTypeRaw || !["SGP", "PGP"].includes(packageTypeRaw)) {
      return NextResponse.json(
        { success: false, message: 'packageType must be "SGP" or "PGP"' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
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
      });
    }

    return NextResponse.json(
      { success: true, data: reward, message: existingReward ? "Reward updated" : "Reward created" },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
