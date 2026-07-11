import { NextRequest, NextResponse } from "next/server";

// Premier point de capture de lead réel du site — jusqu'ici ContactForm.tsx
// ne transmettait rien (voir son commentaire "Submission is mocked for
// launch"). Route unique, volontairement minimale : valide, relaie au CRM
// interne (rempart-crm) via INGEST_TOKEN, jamais de faux succès renvoyé au
// visiteur (contrairement au mock précédent qui, lui, l'assumait
// explicitement en l'affichant).
const CRM_INGEST_URL = "https://rempart-crm.vercel.app/api/ingest/lead";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name, email, subject, message } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ ok: false, error: "invalid_name" }, { status: 400 });
  }
  if (typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json({ ok: false, error: "invalid_message" }, { status: 400 });
  }

  const token = process.env.INGEST_TOKEN;
  if (!token) {
    console.error("[api/lead] INGEST_TOKEN manquant : capture impossible.");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 502 });
  }

  const sujetTexte = typeof subject === "string" && subject ? `[${subject}] ` : "";

  try {
    const res = await fetch(CRM_INGEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        sourceSite: "fiscalplace",
        email: email.trim(),
        prenom: name.trim(),
        message: `${sujetTexte}${message.trim()}`,
      }),
    });
    if (!res.ok) {
      console.error("[api/lead] CRM interne a refusé le lead:", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
    }
  } catch (e) {
    console.error("[api/lead] Erreur réseau CRM interne:", e);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
