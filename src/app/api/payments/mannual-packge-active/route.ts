import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { Package } from "@/models/Package";
import axios from 'axios';


const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const body = await req.json();

        // Extract only the fields you want from body
        const { amount, payment_id, description, updaterName, customerId, status } = body;

        // Generate an order_id (must be unique)
        const orderId = `ORD-${Date.now()}`;

        const newPayment = new Payment({
            order_id: payment_id,
            amount: amount || 0,
            payment_id: payment_id || null,
            description: description || null,
            updaterName: updaterName || null,
            customerId: customerId || null,
            status: status || null,
        });

        await newPayment.save();

        const amountPaid = Number(amount);

        const pkg = await Package.findOne();
        if (!pkg || typeof pkg.price !== "number") {
            return NextResponse.json(
                { success: false, message: "Valid package not found." },
                { status: 400, headers: corsHeaders }
            );
        }

        const fullPackageAmount = pkg.grandtotal;

        console.log("full packge amount : ", fullPackageAmount)

        const user = await User.findById(customerId);
        if (!user) throw new Error("User not found");

        const newTotalPaid = (user.packageAmountPaid || 0) + amountPaid;

        console.log("newTotalPaid : ", newTotalPaid)


        // ✅ Set packagePrice only once during the first partial payment
        if ((user.packagePrice ?? 0) === 0 && newTotalPaid < fullPackageAmount) {
            user.packagePrice = fullPackageAmount;
            console.log("packagePrice : ", user.packagePrice)

        }

        // ✅ Ensure remainingAmount is based on the correct packagePrice (even if it was set earlier)
        const effectivePackagePrice = user.packagePrice > 0 ? user.packagePrice : fullPackageAmount;

        console.log("effectivePackagePrice : ", effectivePackagePrice)

        const remaining = effectivePackagePrice - newTotalPaid;
        console.log("remaining : ", remaining)


        user.packageAmountPaid = newTotalPaid;
        user.remainingAmount = Math.max(remaining, 0);
        user.packageType = newTotalPaid >= effectivePackagePrice ? "full" : "partial";

        // ✅ Trigger commission only if fully paid and not already active
        if (newTotalPaid >= effectivePackagePrice && !user.packageActive) {
            try {
                await axios.post(
                    "https://api.fetchtrue.com/api/distributePackageCommission",
                    { userId: user._id }
                );
            } catch (err: any) {
                console.error("❌ Failed to distribute package commission:", err?.response?.data || err.message);
            }
        }

        await user.save();

        return NextResponse.json(
            { success: true, message: "Payment saved successfully", data: newPayment },
            { status: 201, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, message },
            { status: 400, headers: corsHeaders }
        );
    }
}
