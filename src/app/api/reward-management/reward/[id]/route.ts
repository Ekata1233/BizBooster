// app/api/reward/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Reward from "@/models/Reward";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET reward by id
export async function GET(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const reward = await Reward.findById(id);
    if (!reward) {
      return NextResponse.json({ success: false, message: "Reward not found" }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, data: reward }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Error fetching reward" }, { status: 500, headers: corsHeaders });
  }
}

// PUT update reward
export async function PUT(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const formData = await req.formData();
    const updates: Record<string, any> = {};

    // apply text fields and packageType validation
    const nameRaw = formData.get("name") as string | null;
    if (nameRaw !== null) updates.name = nameRaw.trim();

    const descriptionRaw = formData.get("description") as string | null;
    if (descriptionRaw !== null) updates.description = descriptionRaw;

    const packageTypeRaw = formData.get("packageType") as string | null;
    if (packageTypeRaw !== null) {
      if (packageTypeRaw === "" || packageTypeRaw === "null") {
        updates.packageType = null;
      } else if (packageTypeRaw === "SGP" || packageTypeRaw === "PGP") {
        updates.packageType = packageTypeRaw;
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid packageType. Allowed values: "SGP", "PGP", or empty/null to clear' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // handle file upload if provided
    const file = formData.get("photo") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/rewards",
      });
      updates.photo = upload.url;
    }

    const updated = await Reward.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Reward not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Error updating reward" }, { status: 500, headers: corsHeaders });
  }
}

// DELETE reward
export async function DELETE(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const deleted = await Reward.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Reward not found" }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Error deleting reward" }, { status: 500, headers: corsHeaders });
  }
}
