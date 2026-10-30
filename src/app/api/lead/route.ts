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
  { email: "alexandre.pollet@rempartfinancier.fr" },
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
    console.error("[api/lead] INGEST_TOKEN manquant : relais CRM impossible, bascule sur le mail de secours.");
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

  // Le CRM reste la destination principale ; trois tentatives pour absorber
  // un incident réseau ou un redémarrage à froid.
  let crmOk = false;
  let crmError = token ? "" : "INGEST_TOKEN manquant";
  if (token) {
    for (let attempt = 1; attempt <= 3 && !crmOk; attempt++) {
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
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          crmOk = true;
        } else {
          crmError = `HTTP ${res.status}`;
          console.error("[api/lead] CRM a refusé le lead (tentative", attempt, "):", res.status, await res.text());
          // Un 4xx (hors 408/429) ne se corrigera pas en réessayant.
          if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) break;
        }
      } catch (e) {
        crmError = e instanceof Error ? e.message : String(e);
        console.error("[api/lead] Erreur réseau CRM (tentative", attempt, "):", e);
      }
      if (!crmOk && attempt < 3) await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }

  // Mail interne (Brevo) : toujours envoyé. Si le CRM a échoué, il devient le
  // filet de sécurité et son objet l'indique.
  const mailOk = await sendBrevoLeadNotification(
    {
      name: name.trim(),
      email: email.trim(),
      subject: typeof subject === "string" && subject.trim() ? subject.trim() : undefined,
      source: sourceTag || undefined,
      message: message.trim(),
    },
    crmOk ? undefined : crmError || "inconnue",
  );

  if (!crmOk && !mailOk) {
    console.error("[api/lead] PERTE POTENTIELLE : ni le CRM ni le mail de secours n'ont abouti.", {
      email: email.trim(),
    });
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
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
async function sendBrevoLeadNotification(lead: BrevoLeadFields, crmFailure?: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error(
      "[api/lead] BREVO_API_KEY manquant : notification email interne non envoyée (le lead reste capturé via le CRM interne). Variable à configurer sur le projet Vercel de fiscalplace.com.",
    );
    return false;
  }

  const champs = [
    `Nom : ${lead.name}`,
    `Email : ${lead.email}`,
    lead.subject ? `Sujet : ${lead.subject}` : null,
    lead.source ? `Source : ${lead.source}` : null,
    `Message : ${lead.message}`,
    crmFailure ? `\n⚠ Le relais CRM a échoué (${crmFailure}) : à saisir manuellement dans le CRM.` : null,
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
        subject: crmFailure ? "[ÉCHEC CRM] Nouveau lead FiscalPlace" : "Nouveau lead FiscalPlace",
        textContent: `Nouveau lead reçu sur fiscalplace.com :\n\n${champs}`,
      }),
    });
    if (!res.ok) {
      console.error(
        "[api/lead] Brevo a refusé la notification email interne:",
        res.status,
        await res.text(),
      );
      return false;
    }
    return true;
  } catch (e) {
    console.error("[api/lead] Erreur réseau lors de la notification email interne (Brevo):", e);
    return false;
  }
}
