import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from "uuid";
import Advisor from '@/models/Advisor';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}




export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const formData = await req.formData();

        console.log("Form Data of Advisor: ", formData)
        const name = formData.get("name") as string;
        const rating = parseFloat(formData.get("rating") as string);
        
        // Corrected line: Use getAll instead of get
        const rawTags = formData.getAll("tags") as string[]; 
        const tags = rawTags
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const language = formData.get("language") as string;
        const phoneNumber = parseInt(formData.get("phoneNumber") as string, 10);
        const chat = formData.get("chat") as string;

        
        const imageUrl = formData.get("imageUrl") as File;
        if (!imageUrl || imageUrl.size === 0) {
            return NextResponse.json(
                { success: false, message: "Main image file is required for a advisor data." },
                { status: 400, headers: corsHeaders }
            );
        }

        const mainImageBuffer = Buffer.from(await imageUrl.arrayBuffer());
        const mainImageUploadResponse = await imagekit.upload({
            file: mainImageBuffer,
            fileName: `${uuidv4()}-${imageUrl.name}`,
            folder: "/advisors/main_images",
        });
        const mainImageUrlString: string = mainImageUploadResponse.url;


        if (!name || !rating || tags.length === 0 || !imageUrl || !phoneNumber || !chat || !language) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, Rating, tags, image, phoneNumber, chat, language are required.",
                },
                { status: 400, headers: corsHeaders }
            );
        }


        const newAdvisor = await Advisor.create({
            name,
            tags,
            imageUrl: mainImageUrlString,
            language,
            chat, rating, phoneNumber

        });

        return NextResponse.json({ success: true, data: newAdvisor }, { 
            status: 201,
            headers: corsHeaders,
        });

    } catch (error: unknown) {
        console.error("POST /api/webinars error:", error);
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: number }).code === 11000
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tutorial name must be unique.",
                },
                { status: 409, headers: corsHeaders }
            );
        }
        if (
            typeof error === "object" &&
            error !== null &&
            "name" in error &&
            (error as { name: string }).name === "ValidationError" &&
            "errors" in error
        ) {
            const validationErrors = (error as { errors: Record<string, { message: string }> }).errors;
            const messages = Object.values(validationErrors).map((err) => err.message);
            return NextResponse.json(
                {
                    success: false,
                    message: `Validation Error: ${messages.join(", ")}`,
                },
                { status: 400, headers: corsHeaders }
            );
        }
        return NextResponse.json(
            {
                success: false,
                message: (error as Error).message || "Internal Server Error",
            },
            { status: 500, headers: corsHeaders }
        );
    }
}


export async function GET() {
    await connectToDatabase()

    try {
        const advisorsData = await Advisor.find({})
        return NextResponse.json({
            success: true, data: advisorsData,
            status: 201, headers: corsHeaders
        })
    }
    catch (error: unknown) {
        console.log(`api/advisor failed to return data`, error)
        return NextResponse.json(
            { success: false, message: (error as Error).message || "Internal Server Error" },
            { status: 500, headers: corsHeaders }
        )
    }
}