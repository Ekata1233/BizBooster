import { messaging } from "@/utils/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight
export async function OPTIONS() {
    return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const { title, body, tokens } = await req.json();

        console.log("Request payload:", { title, body, tokens });

        if (!tokens) {
            return NextResponse.json(
                { error: "FCM token required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const message = {
            notification: {
                title,
                body,
            },
            tokens,
        };

        // ✅ Use messaging() correctly
       const response = await messaging.sendEachForMulticast(message);

        return NextResponse.json(
            { success: true, response },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error("Notification error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500, headers: corsHeaders }
        );
    }
}
