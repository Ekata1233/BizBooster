import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";


const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    await connectToDatabase();

    try {
        const { checkoutId, otp } = await req.json();

        if (!checkoutId) {
            return NextResponse.json(
                { success: false, message: "checkoutId is required." },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!otp) {
            return NextResponse.json(
                { success: false, message: "OTP is required." },
                { status: 400, headers: corsHeaders }
            );
        }

        const checkout = await Checkout.findById(checkoutId);

        if (!checkout) {
            return NextResponse.json(
                { success: false, message: "Lead not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        console.log("checkout otp : " , checkout.otp);
        console.log("send otp : " , otp);


        if (checkout.otp !== otp) {
            return NextResponse.json(
                { success: false, message: "Invalid OTP." },
                { status: 401, headers: corsHeaders }
            );
        }

        checkout.isOtpVerified = true;
        await checkout.save();


        return NextResponse.json(
            { success: true, message: "OTP verified successfully." },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error("[VERIFY_OTP_ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong while verifying OTP." },
            { status: 500, headers: corsHeaders }
        );
    }
}
