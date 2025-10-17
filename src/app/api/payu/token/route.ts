import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Construct the token URL using the base environment variable
    const PAYU_TOKEN_URL = `${process.env.PAYU_BASE_URL}/oauth/token`;

    // Retrieve and validate OAuth credentials
    const clientId = process.env.PAYU_CLIENT_ID;
    const clientSecret = process.env.PAYU_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing PayU OAuth credentials. Check .env file.");
      return NextResponse.json(
        { error: "Payment gateway not configured properly" },
        { status: 500 }
      );
    }

    // Prepare form data for the Client Credentials grant
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', clientId.trim()); 
    formData.append('client_secret', clientSecret.trim());

    // Make the secure server-to-server request
    const response = await fetch(PAYU_TOKEN_URL, {
      method: "POST",
      headers: {
        // Essential header for form data requests
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handles the 401 error received from PayU
      console.error("PayU token API error:", response.status, data);
      return NextResponse.json(
        { 
          error: data.error || "Failed to get token",
          description: data.error_description || "Authentication failed by PayU. Check your OAuth credentials/permissions.",
          request_id: data.request_id 
        },
        { status: response.status }
      );
    }

    // Success: Return the token data to the client
    return NextResponse.json(data);
  } catch (err) {
    console.error("PayU token error (internal):", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}