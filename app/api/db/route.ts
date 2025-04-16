import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis"; // standard import is fine for this

const redis = new Redis({
  url: process.env.URL,
  token: process.env.TOKEN,
})

export async function GET() {
  try {
    const keys = await redis.keys("*");

    const results = await Promise.all(
      keys.map(async (key) => {
        const value = await redis.get(key);
        return { key, value };
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}
