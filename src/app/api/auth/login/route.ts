// import { NextResponse } from 'next/server';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import User from '@/models/User';
// import { connectToDatabase } from '@/utils/db';

// // ✅ Add CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// interface IUser extends Document {
//   email: string;
//   mobileNumber: string;
//   // other fields
// }
// // ✅ Handle preflight request
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export const POST = async (req: Request) => {
//   try {
//     await connectToDatabase();

//     const body = await req.json();
//     const { email, mobileNumber, password } = body;

//     if (!email && !mobileNumber) {
//       return NextResponse.json(
//         { error: 'Email or Mobile number is required' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!password) {
//       return NextResponse.json(
//         { error: 'Password is required' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//    const user = await User.findOne<IUser>({
//   $or: [{ email }, { mobileNumber }],
// }).exec();

//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!user.otp?.verified) {
//       return NextResponse.json(
//         { error: 'Please verify your OTP before logging in.' },
//         { status: 403, headers: corsHeaders }
//       );
//     }

//     console.log("Input password:", password);
//     console.log("Stored hashed password:", user.password);

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("Password match result:", isMatch);

//     if (!isMatch) {
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET!,
//       { expiresIn: '1h' }
//     );

//     const userObject = user.toObject();
//     delete userObject.password;
//     delete userObject.otp;
//     const userInfo = userObject;

//     return NextResponse.json(
//       { message: 'Login successful', token, user: userInfo },
//       { status: 200, headers: corsHeaders }
//     );

//   } catch (error: unknown) {
//     console.error('Error during login:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 400, headers: corsHeaders }
//     );
//   }
// };
