import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { connectToDatabase } from "@/utils/db";

export async function POST(req: Request) {
  await connectToDatabase();
  
  try {
    const { categories } = await req.json();

    for (let item of categories) {
      await Category.findByIdAndUpdate(item._id, { sortOrder: item.sortOrder });
    }

    return NextResponse.json({ success: true, message: "Category order updated" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
