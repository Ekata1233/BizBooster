// import { messaging } from "@/utils/firebaseAdmin";
// import { NextRequest, NextResponse } from "next/server";

// const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ✅ Handle preflight
// export async function OPTIONS() {
//     return NextResponse.json({}, { status: 204, headers: corsHeaders });
// }

// export async function POST(req: NextRequest) {
//     try {
//         const { title, body, tokens } = await req.json();
//         // tokens = array of FCM tokens

//         if (!tokens || tokens.length === 0) {
//             return NextResponse.json({ error: "FCM tokens required" }, { status: 400 });
//         }

//         const message = {
//             notification: { title, body },
//             tokens, // ✅ must be inside multicast message
//         };

//         const response = await messaging.sendEachForMulticast(message);

//         return NextResponse.json(
//             { success: true, response },
//             { status: 200, headers: corsHeaders }
//         );
//     } catch (error: any) {
//         console.error("Notification error:", error);
//         return NextResponse.json(
//             { error: error.message || "Something went wrong" },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }


import { NextResponse } from "next/server";
import { messaging } from "@/utils/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Preflight
export async function OPTIONS() {
    return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Get fields
        const title = formData.get("title") as string;
        const body = formData.get("body") as string;
        const tokensRaw = formData.get("tokens") as string;
        const targetType = formData.get("targetType") as string;
        const targetId = formData.get("targetId") as string;

        if (!title || !body || !tokensRaw) {
            return NextResponse.json(
                { success: false, message: "Title, body, and tokens are required." },
                { status: 400, headers: corsHeaders }
            );
        }

        // Parse tokens array
        // Parse tokens array and filter invalid ones
        let tokens: string[] = [];
        try {
            tokens = JSON.parse(tokensRaw);
            tokens = tokens
                .map(t => t.trim())           // remove whitespace/newlines
                .filter(t => t.length > 0);   // remove empty strings
        } catch {
            return NextResponse.json(
                { success: false, message: "Tokens must be a valid JSON array." },
                { status: 400, headers: corsHeaders }
            );
        }

        if (tokens.length === 0) {
            return NextResponse.json(
                { success: false, message: "At least one valid token is required." },
                { status: 400, headers: corsHeaders }
            );
        }

        // Optional file handling
        let fileUrl = "";
        const file = formData.get("file") as File | null;
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: `${uuidv4()}-${file.name}`,
                folder: "/notifications",
            });

            fileUrl = uploadResponse.url;
        }

        // Send FCM notification
        const message: any = {
            tokens,
            notification: { title, body },
        };

        // Only attach data if fileUrl is non-empty string
        if (fileUrl && fileUrl.trim() !== "") {
            message.data = { fileUrl: fileUrl.trim() };
        }


        console.log("Tokens:", tokens);
        console.log("Message:", message);

        const response = await messaging.sendEachForMulticast(message);


        return NextResponse.json(
            { success: true, response, targetType, targetId, fileUrl },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Notification error:", message);

        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}
