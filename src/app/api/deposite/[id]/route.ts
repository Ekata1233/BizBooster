import { NextResponse } from "next/server";
import Deposite from "@/models/Deposite";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ================== GET ==================
export async function GET(req: Request) {
  await connectToDatabase(); 

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deposite = await Deposite.find({ user: id });

    if (!deposite) {
      return NextResponse.json(
        { success: false, message: "Deposite not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: deposite },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ================== PUT ==================
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();

    const updates: Record<string, any> = {};
    if (body.packagePrice != null) updates.packagePrice = Number(body.packagePrice);
    if (body.monthlyEarnings != null) updates.monthlyEarnings = Number(body.monthlyEarnings);
    if (body.lockInPeriod != null) updates.lockInPeriod = Number(body.lockInPeriod);
    if (body.deposite != null) updates.deposite = Number(body.deposite);
    if (body.user != null) updates.user = body.user;
    if (body.packageActivateDate != null) updates.packageActivateDate = new Date(body.packageActivateDate);

    const updatedDeposite = await Deposite.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedDeposite) {
      return NextResponse.json(
        { success: false, message: "Deposite not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedDeposite },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// ================== PATCH ==================
export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();

    const updates: Record<string, any> = {};
    if (body.packagePrice != null) updates.packagePrice = Number(body.packagePrice);
    if (body.monthlyEarnings != null) updates.monthlyEarnings = Number(body.monthlyEarnings);
    if (body.lockInPeriod != null) updates.lockInPeriod = Number(body.lockInPeriod);
    if (body.deposite != null) updates.deposite = Number(body.deposite);
    if (body.user != null) updates.user = body.user;
    if (body.packageActivateDate != null) updates.packageActivateDate = new Date(body.packageActivateDate);

    const updatedDeposite = await Deposite.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedDeposite) {
      return NextResponse.json(
        { success: false, message: "Deposite not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedDeposite },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// ================== DELETE ==================
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedDeposite = await Deposite.findByIdAndDelete(id);

    if (!deletedDeposite) {
      return NextResponse.json(
        { success: false, message: "Deposite not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deposite permanently deleted" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
