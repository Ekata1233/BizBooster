import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from '@/utils/db';
import imagekit from "@/utils/imagekit";
import Advisor from "@/models/Advisor";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ PUT — Update advisor
export async function PUT(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop(); 

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing advisor ID." },
                { status: 400, headers: corsHeaders }
            );
        }

        const formData = await req.formData();
        console.log("Formdata of edit advisor : ", formData);
        const advisor = await Advisor.findById(id);

        if (!advisor) {
            return NextResponse.json(
                { success: false, message: "Advisor not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        const name = formData.get("name") as string | null;
        const rating = formData.get("rating") ? parseFloat(formData.get("rating") as string) : null;
        const rawTags = formData.get("tags") as string | null;
        const tags = rawTags ? rawTags.split(",").map(tag => tag.trim()).filter(Boolean) : null;
        const language = formData.get("language") as string | null;
        const phoneNumber = formData.get("phoneNumber") ? parseInt(formData.get("phoneNumber") as string, 10) : null;
        const chat = formData.get("chat") as string | null;

        const imageFile = formData.get("imageUrl") as File;
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadRes = await imagekit.upload({
                file: buffer,
                fileName: `${uuidv4()}-${imageFile.name}`,
                folder: "/advisors/main_images",
            });
            advisor.imageUrl = uploadRes.url;
        }

        if (name) advisor.name = name;
        if (rating !== null) advisor.rating = rating;
        if (tags !== null) advisor.tags = tags;
        if (language) advisor.language = language;
        if (phoneNumber !== null) advisor.phoneNumber = phoneNumber;
        if (chat) advisor.chat = chat;

        await advisor.save();

        return NextResponse.json({ success: true, data: advisor }, { headers: corsHeaders });

    } catch (error) {
        console.error("PUT /api/advisors/[id] error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500, headers: corsHeaders }
        );
    }
}

// ✅ DELETE — Delete advisor
export async function DELETE(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const advisorId = url.pathname.split('/').pop();

        if (!advisorId) {
            return NextResponse.json(
                { success: false, message: "Missing advisor ID." },
                { status: 400, headers: corsHeaders }
            );
        }

        const deleted = await Advisor.findByIdAndDelete(advisorId);
        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Advisor not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, message: "Advisor deleted successfully." },
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("DELETE /api/advisors/[id] error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message || "Internal Server Error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// ✅ GET — Get advisor by ID
export async function GET(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const advisorId = url.pathname.split('/').pop();

        if (!advisorId) {
            return NextResponse.json(
                { success: false, message: "Missing advisor ID." },
                { status: 400, headers: corsHeaders }
            );
        }

        const getData = await Advisor.findById(advisorId);
        if (!getData) {
            return NextResponse.json(
                { success: false, message: "Advisor ID not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, data: getData },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("GET /api/advisors/[id] error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message || "Internal Server Error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
