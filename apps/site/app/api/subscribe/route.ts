import { getSupabaseClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("email_subscribers")
      .select("email")
      .eq("email", email);

    // If we found any existing records with this email
    if (existing && existing.length > 0) {
      // Mad Max style: terse, no apologies
      return NextResponse.json({ message: "Already in." }, { status: 200 });
    }

    // Insert new subscriber
    const { error } = await supabase.from("email_subscribers").insert([
      {
        email,
        source: "landing_page",
      },
    ]);

    if (error) {
      // Check if it's a duplicate key error (race condition or check failed)
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already in." }, { status: 200 });
      }

      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    // Mad Max approved success message
    return NextResponse.json({ message: "You're early." }, { status: 201 });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
