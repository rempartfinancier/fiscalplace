import { NextRequest, NextResponse } from "next/server";

// Premier point de capture de lead réel du site — jusqu'ici ContactForm.tsx
// ne transmettait rien (voir son commentaire "Submission is mocked for
// launch"). Route unique, volontairement minimale : valide, relaie au CRM
// interne (rempart-crm) via INGEST_TOKEN, jamais de faux succès renvoyé au
// visiteur (contrairement au mock précédent qui, lui, l'assumait
// explicitement en l'affichant).
const CRM_INGEST_URL = "https://rempart-crm.vercel.app/api/ingest/lead";
// Notification email interne (Brevo), déclenchée EN PLUS du relais CRM ci-dessus,
// jamais à sa place : le CRM interne reste l'unique source de vérité du succès
// renvoyé au visiteur. Un échec Brevo (clé absente, API en erreur, réseau) est
// seulement journalisé, jamais remonté dans la réponse HTTP.
const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_NOTIFICATION_RECIPIENTS = [
  { email: "contact@fiscalplace.com" },
  { email: "alexandre.pollet@uptimi.fr" },
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name, email, subject, message, source } = (body ?? {}) as Record<string, unknown>;

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

  // "source" est un tag optionnel et additif (ex. "lead_magnet") permettant de
  // distinguer l'origine d'un lead sans changer sourceSite (utilisé pour le
  // filtrage par site côté CRM). Absent -> comportement inchangé (ContactForm).
  const sourceTag = typeof source === "string" && source.trim() ? source.trim() : "";
  const sujetTexte =
    typeof subject === "string" && subject
      ? `[${subject}] `
      : sourceTag
        ? `[${sourceTag}] `
        : "";

  try {
    const res = await fetch(CRM_INGEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        sourceSite: "fiscalplace",
        ...(sourceTag ? { source: sourceTag } : {}),
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

  // Notification email interne (Brevo) — additive, best-effort : ne doit jamais
  // faire échouer la réponse renvoyée au visiteur, qui dépend uniquement du CRM
  // interne ci-dessus (source de vérité du succès, inchangée par cet ajout).
  try {
    await sendBrevoLeadNotification({
      name: name.trim(),
      email: email.trim(),
      subject: typeof subject === "string" && subject.trim() ? subject.trim() : undefined,
      source: sourceTag || undefined,
      message: message.trim(),
    });
  } catch (e) {
    console.error("[api/lead] Erreur inattendue lors de la notification email interne (Brevo):", e);
  }

  return NextResponse.json({ ok: true });
}

interface BrevoLeadFields {
  name: string;
  email: string;
  subject?: string;
  source?: string;
  message: string;
}

// Best-effort : toute erreur est journalisée ici et jamais propagée à l'appelant
// (voir commentaire au point d'appel). Couvre à la fois la clé API absente,
// le refus de l'API Brevo, et les erreurs réseau.
async function sendBrevoLeadNotification(lead: BrevoLeadFields) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error(
      "[api/lead] BREVO_API_KEY manquant : notification email interne non envoyée (le lead reste capturé via le CRM interne). Variable à configurer sur le projet Vercel de fiscalplace.com.",
    );
    return;
  }

  const champs = [
    `Nom : ${lead.name}`,
    `Email : ${lead.email}`,
    lead.subject ? `Sujet : ${lead.subject}` : null,
    lead.source ? `Source : ${lead.source}` : null,
    `Message : ${lead.message}`,
  ]
    .filter((ligne): ligne is string => ligne !== null)
    .join("\n");

  try {
    const res = await fetch(BREVO_EMAIL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "FiscalPlace", email: "contact@fiscalplace.com" },
        to: BREVO_NOTIFICATION_RECIPIENTS,
        replyTo: { email: lead.email, name: lead.name },
        subject: "Nouveau lead FiscalPlace",
        textContent: `Nouveau lead reçu sur fiscalplace.com :\n\n${champs}`,
      }),
    });
    if (!res.ok) {
      console.error(
        "[api/lead] Brevo a refusé la notification email interne:",
        res.status,
        await res.text(),
      );
    }
  } catch (e) {
    console.error("[api/lead] Erreur réseau lors de la notification email interne (Brevo):", e);
  }
}
