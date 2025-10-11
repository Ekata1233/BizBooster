import type { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "@/models/User"; // import Mongoose model
import { connectToDatabase } from "@/utils/db";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { token, socialProvider } = req.body;

    try {
        await connectToDatabase();

        let userInfo: any;

        // ✅ Verify Google token
        if (socialProvider === "google") {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            userInfo = ticket.getPayload();
        }

        if (!userInfo?.email) {
            return res.status(400).json({ error: "Email not found in provider data" });
        }

        // 🧾 Check if user already exists
        let user = await User.findOne({ email: userInfo.email });

        if (!user) {
            // 🆕 Register new user
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

        return res.status(200).json({
            success: true,
            token: sessionToken,
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: "Invalid token" });
    }
}
