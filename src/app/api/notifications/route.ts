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
        // tokens = array of FCM tokens

        if (!tokens || tokens.length === 0) {
            return NextResponse.json({ error: "FCM tokens required" }, { status: 400 });
        }

        const message = {
            notification: { title, body },
            tokens, // ✅ must be inside multicast message
        };

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
