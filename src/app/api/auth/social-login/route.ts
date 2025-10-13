// import type { NextApiRequest, NextApiResponse } from "next";
// import { OAuth2Client } from "google-auth-library";
// import jwt from "jsonwebtoken";
// import User from "@/models/User"; // import Mongoose model
// import { connectToDatabase } from "@/utils/db";

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== "POST") {
//         return res.status(405).json({ error: "Method Not Allowed" });
//     }

//     const { token, socialProvider } = req.body;

//     try {
//         await connectToDatabase();

//         let userInfo: any;
//         if (socialProvider === "google") {
//             const ticket = await googleClient.verifyIdToken({
//                 idToken: token,
//                 audience: process.env.GOOGLE_CLIENT_ID,
//             });
//             userInfo = ticket.getPayload();
//         }

//         if (!userInfo?.email) {
//             return res.status(400).json({ error: "Email not found in provider data" });
//         }

//         // 🧾 Check if user already exists
//         let user = await User.findOne({ email: userInfo.email });

//         if (!user) {
//             // 🆕 Register new user
//             user = await User.create({
//                 name: userInfo.name,
//                 email: userInfo.email,
//                 socialProvider,
//                 providerId: userInfo.sub || userInfo.id,
//                 picture: userInfo.picture,
//             });
//         }

//         // 🔐 Generate JWT
//         const sessionToken = jwt.sign(
//             { id: user._id, email: user.email },
//             process.env.JWT_SECRET!,
//             { expiresIn: "7d" }
//         );

//         return res.status(200).json({
//             success: true,
//             token: sessionToken,
//             user,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(401).json({ error: "Invalid token" });
//     }
// }


import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const body = await req.json();
        const { token, socialProvider } = body;

        if (!token || !socialProvider) {
            return NextResponse.json(
                { error: "Missing token or socialProvider" },
                { status: 400, headers: corsHeaders }
            );
        }

        let userInfo: any;
        if (socialProvider === "google") {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            userInfo = ticket.getPayload();
        } else {
            return NextResponse.json(
                { error: "Unsupported social provider" },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!userInfo?.email) {
            return NextResponse.json(
                { error: "Email not found in provider data" },
                { status: 400, headers: corsHeaders }
            );
        }

        // 🧾 Check if user exists
        let user = await User.findOne({ email: userInfo.email });

        if (!user) {
            // 🆕 Create new user
            user = await User.create({
                name: userInfo.name,
                email: userInfo.email,
                socialProvider,
                providerId: userInfo.sub || userInfo.id,
                picture: userInfo.picture,
            });
        }

        // 🔐 Generate JWT
        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            { success: true, token: sessionToken, user },
            { status: 200, headers: corsHeaders }
        );
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Social login error:", errorMessage);
        return NextResponse.json(
            { error: "Invalid token or failed login" },
            { status: 401, headers: corsHeaders }
        );
    }
}
