import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Lead from "@/models/Lead";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// export async function GET(req: Request) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const checkoutId = url.searchParams.get("checkoutId");

//     console.log("checkout url : ",url)
//     console.log("checkout id : ",checkoutId)

//     if (!checkoutId) {
//       return NextResponse.json(
//         { success: false, message: "Missing checkoutId in query." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const lead = await Lead.findOne({ checkout: checkoutId })
//       .populate("checkout")
//       .populate("serviceCustomer")
//       .populate("serviceMan")
//       .populate("service");

//     if (!lead) {
//       return NextResponse.json(
//         { success: false, message: "No lead found for this checkoutId." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: lead },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Error fetching lead by checkoutId:", error);
//     return NextResponse.json(
//       { success: false, message: error.message || "Fetch failed." },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// export async function PUT(req: Request) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     const formData = await req.formData();
//     const leadIndex = parseInt(formData.get("leadIndex") as string);
//     const statusType = formData.get("statusType") as string;
//     const description = formData.get("description") as string;
//     const zoomLink = formData.get("zoomLink") as string;
//     const paymentLink = formData.get("paymentLink") as string;
//     const paymentType = formData.get("paymentType") as "partial" | "full";
//     const uploadedFile = formData.get("document") as File | null;

//     if (!id || isNaN(leadIndex)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid request. Missing ID or lead index." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     let documentUrl = "";
//     if (uploadedFile && uploadedFile instanceof File) {
//       const bytes = await uploadedFile.arrayBuffer();
//       const buffer = Buffer.from(bytes);
//       const uploaded = await imagekit.upload({
//         file: buffer,
//         fileName: uploadedFile.name,
//         folder: "lead-documents",
//       });
//       documentUrl = uploaded.url;
//     }

//     const lead = await Lead.findById(id);
//     if (!lead || !lead.leads[leadIndex]) {
//       return NextResponse.json(
//         { success: false, message: "Lead or lead entry not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // Update the specific entry
//     lead.leads[leadIndex].statusType = statusType;
//     lead.leads[leadIndex].description = description;
//     lead.leads[leadIndex].zoomLink = zoomLink;
//     lead.leads[leadIndex].paymentLink = paymentLink;
//     lead.leads[leadIndex].paymentType = paymentType;
//     if (documentUrl) {
//       lead.leads[leadIndex].document = documentUrl;
//     }
//     lead.leads[leadIndex].updatedAt = new Date();

//     await lead.save();

//     return NextResponse.json(
//       { success: true, data: lead },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Error updating lead:", error);
//     return NextResponse.json(
//       { success: false, message: error.message || "Update failed." },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function GET(req: Request) {
  await connectToDatabase();

  try {
   const url = new URL(req.url);

    console.log("Requested URL:", url);

    // Extract ID from pathname
    const pathnameParts = url.pathname.split("/");
    const id = pathnameParts[pathnameParts.length - 1]; // Get the last part of the path

    console.log("Lead ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing leadId in query." },
        { status: 400, headers: corsHeaders }
      );
    }

    const lead = await Lead.findById(id)
      .populate("checkout")
    // .populate("serviceCustomer")
    // .populate("serviceMan")
    // .populate("service");

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "No lead found with this ID." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: lead },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error fetching lead by ID:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Fetch failed." },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(req: Request) {
  await connectToDatabase();
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const formData = await req.formData();

    const updateType = formData.get("updateType");
    const isAdminApproved = formData.get("isAdminApproved");

    // ✅ Handle top-level admin approval
    if (updateType === "adminApproval" && isAdminApproved === "true") {
      const updated = await Lead.findByIdAndUpdate(
        id,
        { isAdminApproved: true },
        { new: true }
      );
      return NextResponse.json(
        { success: true, data: updated },
        { status: 200, headers: corsHeaders }
      );
    }

    // ✅ Existing nested update logic...
    const leadIndex = parseInt(formData.get("leadIndex") as string);
    const statusType = formData.get("statusType") as string;
    const description = formData.get("description") as string;
    const zoomLink = formData.get("zoomLink") as string;
    const paymentLink = formData.get("paymentLink") as string;
    const paymentType = formData.get("paymentType") as "partial" | "full";
    const uploadedFile = formData.get("document") as File | null;

    if (!id || isNaN(leadIndex)) {
      return NextResponse.json(
        { success: false, message: "Invalid request. Missing ID or lead index." },
        { status: 400, headers: corsHeaders }
      );
    }

    let documentUrl = "";
    if (uploadedFile && uploadedFile instanceof File) {
      const bytes = await uploadedFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: uploadedFile.name,
        folder: "lead-documents",
      });
      documentUrl = uploaded.url;
    }

    const lead = await Lead.findById(id);
    if (!lead || !lead.leads[leadIndex]) {
      return NextResponse.json(
        { success: false, message: "Lead or lead entry not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    lead.leads[leadIndex].statusType = statusType;
    lead.leads[leadIndex].description = description;
    lead.leads[leadIndex].zoomLink = zoomLink;
    lead.leads[leadIndex].paymentLink = paymentLink;
    lead.leads[leadIndex].paymentType = paymentType;
    if (documentUrl) {
      lead.leads[leadIndex].document = documentUrl;
    }
    lead.leads[leadIndex].updatedAt = new Date();

    await lead.save();

    return NextResponse.json(
      { success: true, data: lead },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Update failed." },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await Lead.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Lead deleted successfully." },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Delete failed." },
      { status: 500, headers: corsHeaders }
    );
  }
}
