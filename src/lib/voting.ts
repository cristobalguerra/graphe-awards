import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JuryAccess {
  id?: string;
  pin: string;           // 4-digit PIN
  name: string;          // Juror's display name
  hasVoted: boolean;
  votedAt?: Timestamp | null;
}

export interface VoteScores {
  concepto: number;      // 1–5
  ejecucion: number;
  innovacion: number;
  impacto: number;
}

export interface Vote {
  id?: string;
  juryAccessId: string;
  nomineeId: string;
  categoryId: string;
  scores: VoteScores;
  createdAt?: Timestamp;
}

// ─── Jury Access (PINs) ──────────────────────────────────────────────────────

export async function getJuryAccess(): Promise<JuryAccess[]> {
  const q = query(collection(db, "jury_access"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JuryAccess));
}

export function subscribeJuryAccess(cb: (list: JuryAccess[]) => void) {
  const q = query(collection(db, "jury_access"), orderBy("name"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as JuryAccess)));
  });
}

export async function addJuryAccess(data: Omit<JuryAccess, "id">) {
  return addDoc(collection(db, "jury_access"), data);
}

export async function deleteJuryAccess(id: string) {
  return deleteDoc(doc(db, "jury_access", id));
}

export async function resetJuryVote(id: string) {
  return updateDoc(doc(db, "jury_access", id), { hasVoted: false, votedAt: null });
}

// ─── PIN Validation ──────────────────────────────────────────────────────────

export async function validatePin(pin: string): Promise<JuryAccess | null> {
  const q = query(collection(db, "jury_access"), where("pin", "==", pin));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as JuryAccess;
}

// ─── Votes ───────────────────────────────────────────────────────────────────

export async function submitVotes(
  juryAccessId: string,
  votes: Omit<Vote, "id" | "juryAccessId" | "createdAt">[]
) {
  const batch = votes.map((v) =>
    addDoc(collection(db, "votes"), {
      ...v,
      juryAccessId,
      createdAt: Timestamp.now(),
    })
  );
  await Promise.all(batch);
  await updateDoc(doc(db, "jury_access", juryAccessId), {
    hasVoted: true,
    votedAt: Timestamp.now(),
  });
}

export async function getVotesByJuror(juryAccessId: string): Promise<Vote[]> {
  const q = query(collection(db, "votes"), where("juryAccessId", "==", juryAccessId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vote));
}

export function subscribeVotes(cb: (votes: Vote[]) => void) {
  return onSnapshot(collection(db, "votes"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vote)));
  });
}

// ─── Results aggregation ─────────────────────────────────────────────────────

export interface NomineeResult {
  nomineeId: string;
  categoryId: string;
  nomineeName: string;
  project: string;
  avgConcepto: number;
  avgEjecucion: number;
  avgInnovacion: number;
  avgImpacto: number;
  avgTotal: number;
  voteCount: number;
}

export function aggregateResults(votes: Vote[], nominees: { id?: string; name: string; project: string; categoryId: string }[]): NomineeResult[] {
  const map: Record<string, Vote[]> = {};
  for (const v of votes) {
    if (!map[v.nomineeId]) map[v.nomineeId] = [];
    map[v.nomineeId].push(v);
  }

  return nominees.map((n) => {
    const nVotes = map[n.id ?? ""] ?? [];
    const count = nVotes.length;
    if (count === 0) {
      return { nomineeId: n.id ?? "", categoryId: n.categoryId, nomineeName: n.name, project: n.project, avgConcepto: 0, avgEjecucion: 0, avgInnovacion: 0, avgImpacto: 0, avgTotal: 0, voteCount: 0 };
    }
    const avg = (key: keyof VoteScores) => nVotes.reduce((s, v) => s + (v.scores[key] ?? 0), 0) / count;
    const c = avg("concepto");
    const e = avg("ejecucion");
    const i = avg("innovacion");
    const im = avg("impacto");
    return { nomineeId: n.id ?? "", categoryId: n.categoryId, nomineeName: n.name, project: n.project, avgConcepto: c, avgEjecucion: e, avgInnovacion: i, avgImpacto: im, avgTotal: (c + e + i + im) / 4, voteCount: count };
  }).sort((a, b) => b.avgTotal - a.avgTotal);
}
