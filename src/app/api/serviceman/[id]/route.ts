import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import ServiceMan from "@/models/ServiceMan";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET handler
// GET handler
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const serviceman = await ServiceMan.findById(id)
      .populate("provider", "providerId fullName email phoneNo");

    if (!serviceman) {
      return NextResponse.json(
        { success: false, message: "ServiceMan not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: serviceman },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching ServiceMan" },
      { status: 500, headers: corsHeaders }
    );
  }
}


// PUT handler
export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const formData = await req.formData();

    // Build updates object as before (keep same logic)
    const updates: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "generalImage" || key === "identityImage") {
        const file = value as File;
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/serviceman",
          });

          if (key === "generalImage") {
            updates.generalImage = uploadResponse.url;
          } else {
            // store nested field path as string key
            updates["businessInformation.identityImage"] = uploadResponse.url;
          }
        }
      } else {
        if (key.startsWith("businessInformation.")) {
          const nestedKey = key.split(".")[1];
          updates[`businessInformation.${nestedKey}`] = value;
        } else {
          updates[key] = value;
        }
      }
    }

    // === DUPLICATE CHECK (exclude current id) ===
    // Get incoming candidate values (prefer updates, fallback to formData)
    const incomingEmail =
      updates.email ?? (formData.get("email") ? String(formData.get("email")) : undefined);
    const incomingPhone =
      updates.phoneNo ?? (formData.get("phoneNo") ? String(formData.get("phoneNo")) : undefined);
    const incomingIdentityNumber =
      updates["businessInformation.identityNumber"] ??
      (formData.get("businessInformation.identityNumber")
        ? String(formData.get("businessInformation.identityNumber"))
        : undefined);

    const orConditions: any[] = [];
    if (incomingEmail) orConditions.push({ email: incomingEmail });
    if (incomingPhone) orConditions.push({ phoneNo: incomingPhone });
    if (incomingIdentityNumber)
      orConditions.push({ "businessInformation.identityNumber": incomingIdentityNumber });

    if (orConditions.length > 0) {
      const duplicate = await ServiceMan.findOne({
        _id: { $ne: id },
        $or: orConditions,
      }).lean();

      if (duplicate) {
        // determine which field(s) collided
        const conflicts: string[] = [];
        if (incomingEmail && duplicate.email === incomingEmail) conflicts.push("Email");
        if (incomingPhone && duplicate.phoneNo === incomingPhone) conflicts.push("Phone number");
        if (
          incomingIdentityNumber &&
          duplicate.businessInformation?.identityNumber === incomingIdentityNumber
        )
          conflicts.push("Identity number");

        const message =
          conflicts.length > 1
            ? `${conflicts.join(", ")} are already used by another ServiceMan`
            : `${conflicts[0]} is already used by another ServiceMan`;

        return NextResponse.json(
          { success: false, message },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // === Perform update (use $set for nested fields safety) ===
    const setObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      setObj[k] = v;
    }

    const updatedServiceMan = await ServiceMan.findByIdAndUpdate(
      id,
      { $set: setObj },
      { new: true }
    ).populate("provider", "providerId fullName email phoneNo");

    return NextResponse.json(
      { success: true, data: updatedServiceMan },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during update";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE handler
export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const deleted = await ServiceMan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "ServiceMan not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting ServiceMan" },
      { status: 500, headers: corsHeaders }
    );
  }
}
