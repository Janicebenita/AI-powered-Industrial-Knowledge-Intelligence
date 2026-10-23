import { NextResponse } from "next/server";

/**
 * Process-level liveness probe for the hosting platform.
 *
 * This deliberately avoids provider, model, and database checks so Render can
 * determine that the web process is accepting requests during cold starts.
 * Dependency readiness remains available from /api/readiness.
 */
export function GET() {
  return NextResponse.json(
    { status: "ok", service: "industrial-brain" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
