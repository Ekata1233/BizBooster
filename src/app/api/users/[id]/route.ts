// import { NextResponse } from 'next/server';
// import User from '@/models/User';
// import { connectToDatabase } from '@/utils/db';
// import { NextRequest } from 'next/server';

// // Correct context type
// type Params = { params: { id: string } };

// // ✅ GET /api/users/[id]
// export async function GET(
//   req: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     await connectToDatabase();
//     const { id } = context.params;
//     const user = await User.findById(id);

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     return NextResponse.json(user);
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Something went wrong' },
//       { status: 500 }
//     );
//   }
// }

// // ✅ PUT /api/users/[id]
// export async function PUT(req: NextRequest, { params }: Params) {
//   try {
//     await connectToDatabase();
//     const body = await req.json();
//     const updatedUser = await User.findByIdAndUpdate(params.id, body, { new: true });
//     if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// // ✅ DELETE /api/users/[id]
// export async function DELETE(req: NextRequest, { params }: Params) {
//   try {
//     await connectToDatabase();
//     const deletedUser = await User.findByIdAndUpdate(
//       params.id,
//       { isDeleted: true },
//       { new: true }
//     );
//     if (!deletedUser) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }
//     return NextResponse.json(
//       { success: true, message: 'User soft deleted (isDeleted: true)' },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT - Update Box
export async function PUT(request: Request, context: any) {
  await connectToDatabase();

  try {
    const { id } = context.params;
    const updateData = await request.json();

    const updatedBox = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBox) {
      return NextResponse.json(
        { success: false, message: "Box not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { success: true, data: updatedBox },
      { status: 200, headers: corsHeaders },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400, headers: corsHeaders },
    );
  }
}

// ✅ DELETE - Soft Delete Box
export async function DELETE(request: Request, context: any) {
  await connectToDatabase();

  try {
    const { id } = context.params;

    const deletedBox = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!deletedBox) {
      return NextResponse.json(
        { success: false, message: "Box not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { success: true, data: deletedBox },
      { status: 200, headers: corsHeaders },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400, headers: corsHeaders },
    );
  }
}
