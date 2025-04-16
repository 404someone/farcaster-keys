import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis"

const url=process.env.DURL
const client = createClient ({
  url
});

client.on("error", function(err) {
  throw err;
});

export async function GET(req: NextRequest) {

  const fid = req.nextUrl.searchParams.get("fid") || ""
  const key = req.nextUrl.searchParams.get("key") || ""
  console.log(`Requested fid: ${fid}`);

  try {
    await client.connect()
    await client.set(fid, key);


    return NextResponse.json("done");
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
