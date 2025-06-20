import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";
import Lead from "@/models/Lead";
import imagekit from "@/utils/imagekit";

// UPDATE lead by ID
// UPDATE lead by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const formData = await req.formData();

    const leadIndex = parseInt(formData.get("leadIndex") as string); // Which index to update
    const statusType = formData.get("statusType") as string;
    const description = formData.get("description") as string;
    const zoomLink = formData.get("zoomLink") as string;
    const paymentLink = formData.get("paymentLink") as string;
    const paymentType = formData.get("paymentType") as "partial" | "full";
    const uploadedFile = formData.get("document") as File | null;

    if (isNaN(leadIndex)) {
      return NextResponse.json({ error: "Invalid lead index" }, { status: 400 });
    }

    let documentUrl = "";
    if (uploadedFile) {
      const bytes = await uploadedFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: uploadedFile.name,
        folder: "lead-documents",
      });

      documentUrl = uploaded.url;
    }

    const lead = await Lead.findById(params.id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.leads[leadIndex]) {
      return NextResponse.json({ error: "Lead status entry not found" }, { status: 404 });
    }

    // Update the specific entry
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

    return NextResponse.json(lead, { status: 200 });
  } catch (error) {
    console.error("Error updating lead status:", error);
    return NextResponse.json({ error: "Failed to update lead status" }, { status: 500 });
  }
}


// DELETE lead by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const deleted = await Lead.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
