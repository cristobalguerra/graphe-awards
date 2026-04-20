import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

// ─── Config ──────────────────────────────────────────────────────────────────

export const PHOTO_DAYS = [
  { date: "2026-04-22", label: "Miércoles 22 de abril" },
  { date: "2026-04-23", label: "Jueves 23 de abril" },
  { date: "2026-04-24", label: "Viernes 24 de abril" },
];

// Generate slots from 12:00 PM to 8:30 PM in 15-min increments
export function generateSlots(): string[] {
  const slots: string[] = [];
  for (let h = 12; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      // stop at 8:30 PM
      if (h === 20 && m > 30) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function formatTime(t: string): string {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PhotoBooking {
  id?: string;
  nomineeId: string;
  projectName: string;
  categoryId: string;
  contactName: string;        // who reserved
  contactEmail?: string;
  contactPhone?: string;
  teamMembers: string[];
  date: string;               // 2026-04-22
  time: string;               // 14:30 (24h format)
  notes?: string;
  createdAt?: Timestamp;
}

// ─── Firestore ops ───────────────────────────────────────────────────────────

export async function getBookings(): Promise<PhotoBooking[]> {
  const snap = await getDocs(collection(db, "photo_bookings"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PhotoBooking));
}

export function subscribeBookings(cb: (list: PhotoBooking[]) => void) {
  return onSnapshot(collection(db, "photo_bookings"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PhotoBooking)));
  });
}

export async function createBooking(b: Omit<PhotoBooking, "id" | "createdAt">) {
  return addDoc(collection(db, "photo_bookings"), { ...b, createdAt: Timestamp.now() });
}

export async function deleteBooking(id: string) {
  return deleteDoc(doc(db, "photo_bookings", id));
}

// Check if a nominee has already booked
export async function getBookingByNominee(nomineeId: string): Promise<PhotoBooking | null> {
  const q = query(collection(db, "photo_bookings"), where("nomineeId", "==", nomineeId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as PhotoBooking;
}
