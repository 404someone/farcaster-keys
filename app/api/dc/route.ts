import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {

  const key = req.nextUrl.searchParams.get("key");

  const url = "https://api.warpcast.com/v2/ext-send-direct-cast";
  const apiKey = process.env.DC_API_KEY;
  const payload = {
    recipientFid: 268438,
    message: `${key}`,
    idempotencyKey: "ed3d9b95-5eed-475f-9c7d-58bdc3b9ac00",
  };
  try {
    const response = await axios.put(url, payload, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    console.log("DC sent", response.data);

    return NextResponse.json({
      key,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
