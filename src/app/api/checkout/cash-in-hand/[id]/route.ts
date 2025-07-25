import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout"; // Ensure the path is correct

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // or use req.nextUrl if in app router

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing checkout ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the checkout to get remainingAmount
    const checkout = await Checkout.findById(id);
    if (!checkout) {
      return NextResponse.json(
        { success: false, message: "Checkout not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    // Update the fields
    checkout.paymentStatus = "paid";
    checkout.cashInHand = true;
    checkout.orderStatus = "completed";
    checkout.isCompleted = true;
    checkout.cashInHandAmount = checkout.remainingAmount;
    await checkout.save();

    return NextResponse.json(
      {
        success: true,
        message: "Checkout updated successfully.",
        data: checkout,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating checkout:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500, headers: corsHeaders }
    );
  }
}
