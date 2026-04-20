import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

// ─── Config ──────────────────────────────────────────────────────────────────

export const ATTENDEE_TYPES = [
  { id: "alumno_ldg", label: "Alumno LDG", color: "#FFB3AB" },
  { id: "prepa_udem", label: "Prepa UDEM", color: "#DB6B30" },
  { id: "invitado", label: "Invitado", color: "#7C6992" },
  { id: "profesor", label: "Profesor", color: "#008755" },
  { id: "egresado", label: "Egresado", color: "#305379" },
] as const;

export type AttendeeTypeId = (typeof ATTENDEE_TYPES)[number]["id"];

export const TOTAL_KITS = 5;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Registration {
  id?: string;
  name: string;
  email: string;
  type: AttendeeTypeId;
  guests: string[];
  totalAttendees: number;      // 1 + guests.length
  isWinner?: boolean;
  kitPickedUp?: boolean;
  createdAt?: Timestamp;
}

// ─── Firestore ops ───────────────────────────────────────────────────────────

export async function getRegistrations(): Promise<Registration[]> {
  const snap = await getDocs(collection(db, "registrations"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
}

export function subscribeRegistrations(cb: (list: Registration[]) => void) {
  return onSnapshot(collection(db, "registrations"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration)));
  });
}

export async function createRegistration(r: Omit<Registration, "id" | "createdAt" | "totalAttendees">) {
  return addDoc(collection(db, "registrations"), {
    ...r,
    totalAttendees: 1 + r.guests.length,
    createdAt: Timestamp.now(),
  });
}

export async function deleteRegistration(id: string) {
  return deleteDoc(doc(db, "registrations", id));
}

export async function updateRegistration(id: string, data: Partial<Registration>) {
  return updateDoc(doc(db, "registrations", id), data);
}

// Pick N random winners, mark them as winners, clear any previous winners
export async function drawWinners(registrations: Registration[], count: number) {
  // Clear previous winners
  const clearPromises = registrations.filter((r) => r.isWinner).map((r) =>
    updateDoc(doc(db, "registrations", r.id!), { isWinner: false })
  );
  await Promise.all(clearPromises);

  // Shuffle and pick N
  const shuffled = [...registrations].sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, count);

  const markPromises = winners.map((w) =>
    updateDoc(doc(db, "registrations", w.id!), { isWinner: true })
  );
  await Promise.all(markPromises);

  return winners;
}
