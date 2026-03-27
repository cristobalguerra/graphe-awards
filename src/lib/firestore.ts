import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JuryMember {
  id?: string;
  name: string;
  role: string;
  photo: string;
  linkedin?: string;
  order: number;
}

export interface NomineeImage {
  url: string;
  caption?: string;
}

export interface NomineeDoc {
  id?: string;
  name: string;
  project: string;
  semester: string;
  categoryId: string;
  images: NomineeImage[]; // 3 images 16:9
  description?: string;
  order: number;
}

// ─── Jury ────────────────────────────────────────────────────────────────────

export async function getJury(): Promise<JuryMember[]> {
  const q = query(collection(db, "jury"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JuryMember));
}

export function subscribeJury(cb: (members: JuryMember[]) => void) {
  const q = query(collection(db, "jury"), orderBy("order"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as JuryMember)));
  });
}

export async function addJuryMember(member: Omit<JuryMember, "id">) {
  return addDoc(collection(db, "jury"), member);
}

export async function updateJuryMember(id: string, data: Partial<JuryMember>) {
  return updateDoc(doc(db, "jury", id), data);
}

export async function deleteJuryMember(id: string) {
  return deleteDoc(doc(db, "jury", id));
}

// ─── Nominees ────────────────────────────────────────────────────────────────

export async function getNominees(): Promise<NomineeDoc[]> {
  const q = query(collection(db, "nominees"), orderBy("categoryId"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NomineeDoc));
}

export function subscribeNominees(cb: (nominees: NomineeDoc[]) => void) {
  const q = query(collection(db, "nominees"), orderBy("categoryId"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NomineeDoc)));
  });
}

export async function addNominee(nominee: Omit<NomineeDoc, "id">) {
  return addDoc(collection(db, "nominees"), nominee);
}

export async function updateNominee(id: string, data: Partial<NomineeDoc>) {
  return updateDoc(doc(db, "nominees", id), data);
}

export async function deleteNominee(id: string) {
  return deleteDoc(doc(db, "nominees", id));
}
