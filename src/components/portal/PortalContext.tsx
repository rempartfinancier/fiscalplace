"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_CLAIMS,
  DEMO_NOTIFICATIONS,
  type DemoClaim,
  type DemoNotification,
} from "@/data/demo-portal";

/**
 * Client-side demo state for the portal — simulates what the real backend
 * would persist. localStorage-backed so the demo survives reloads.
 */

export type EntityFilter = "all" | string;

interface PortalState {
  /** Demo session entered (gate passed). */
  entered: boolean;
  enter: () => void;
  exit: () => void;
  entityFilter: EntityFilter;
  setEntityFilter: (f: EntityFilter) => void;
  /** Claim ids whose mandate was signed during this demo session. */
  signedClaims: string[];
  signClaim: (id: string) => void;
  notifications: DemoNotification[];
  markAllRead: () => void;
  claims: DemoClaim[];
}

const PortalCtx = createContext<PortalState | null>(null);

const SESSION_KEY = "fp-demo-session";
const SIGNED_KEY = "fp-demo-signed";
const READ_KEY = "fp-demo-notifs-read";

export function PortalProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [entered, setEntered] = useState(false);
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
  const [signedClaims, setSignedClaims] = useState<string[]>([]);
  const [allRead, setAllRead] = useState(false);

  useEffect(() => {
    setEntered(localStorage.getItem(SESSION_KEY) === "1");
    setSignedClaims(JSON.parse(localStorage.getItem(SIGNED_KEY) ?? "[]"));
    setAllRead(localStorage.getItem(READ_KEY) === "1");
    setHydrated(true);
  }, []);

  const enter = () => {
    localStorage.setItem(SESSION_KEY, "1");
    setEntered(true);
  };
  const exit = () => {
    localStorage.removeItem(SESSION_KEY);
    setEntered(false);
  };
  const signClaim = (id: string) => {
    const next = [...new Set([...signedClaims, id])];
    localStorage.setItem(SIGNED_KEY, JSON.stringify(next));
    setSignedClaims(next);
  };
  const markAllRead = () => {
    localStorage.setItem(READ_KEY, "1");
    setAllRead(true);
  };

  // Signature in the demo advances the Irish claim from "mandate" to "filed".
  const claims = DEMO_CLAIMS.map((claim) =>
    claim.currentStage === "mandate" && signedClaims.includes(claim.id)
      ? {
          ...claim,
          currentStage: "filed" as const,
          actionRequired: undefined,
          history: [
            ...claim.history,
            { stage: "mandate" as const, date: "2026-07-08" },
            { stage: "filed" as const, date: "2026-07-08" },
          ],
        }
      : claim,
  );

  const notifications = DEMO_NOTIFICATIONS.map((n) => (allRead ? { ...n, read: true } : n));

  // Server render + first client paint show the Gate (entered=false) so the
  // SSR HTML is never empty; localStorage state applies right after mount.
  void hydrated;

  return (
    <PortalCtx.Provider
      value={{
        entered,
        enter,
        exit,
        entityFilter,
        setEntityFilter,
        signedClaims,
        signClaim,
        notifications,
        markAllRead,
        claims,
      }}
    >
      {children}
    </PortalCtx.Provider>
  );
}

export function usePortal(): PortalState {
  const ctx = useContext(PortalCtx);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}

/** Claims visible under the current entity filter. */
export function filterByEntity<T extends { entityId: string }>(
  items: T[],
  filter: EntityFilter,
): T[] {
  return filter === "all" ? items : items.filter((i) => i.entityId === filter);
}
