import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  increment,
  setDoc,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Faq, FaqInput, SearchStat } from '../types'

const FAQ_COL = 'faqs'
const SEARCH_STAT_COL = 'searchStats'
const PAGE_SIZE = 10

function toFaq(d: QueryDocumentSnapshot<DocumentData>): Faq {
  const data = d.data()
  return {
    id: d.id,
    question: data.question,
    answer: data.answer,
    category: data.category ?? '',
    viewCount: data.viewCount ?? 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt ?? 0,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt ?? 0,
    createdBy: data.createdBy ?? '',
  }
}

// ----- FAQ CRUD -----

export async function createFaq(input: FaqInput, uid: string) {
  await addDoc(collection(db, FAQ_COL), {
    ...input,
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
  })
}

export async function updateFaq(id: string, input: FaqInput) {
  await updateDoc(doc(db, FAQ_COL, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteFaq(id: string) {
  await deleteDoc(doc(db, FAQ_COL, id))
}

export async function getFaq(id: string): Promise<Faq | null> {
  const snap = await getDoc(doc(db, FAQ_COL, id))
  if (!snap.exists()) return null
  return toFaq(snap as QueryDocumentSnapshot<DocumentData>)
}

export async function incrementViewCount(id: string) {
  await updateDoc(doc(db, FAQ_COL, id), { viewCount: increment(1) })
}

// Lấy danh sách FAQ phân trang (dùng cho trang admin), sắp xếp theo mới nhất
export async function listFaqsPaginated(cursor?: QueryDocumentSnapshot<DocumentData>) {
  const base = query(collection(db, FAQ_COL), orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
  const q = cursor ? query(collection(db, FAQ_COL), orderBy('createdAt', 'desc'), startAfter(cursor), limit(PAGE_SIZE)) : base
  const snap = await getDocs(q)
  return {
    items: snap.docs.map(toFaq),
    lastDoc: snap.docs[snap.docs.length - 1],
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

// Lấy toàn bộ FAQ cho trang frontend (số lượng FAQ nội bộ thường không lớn,
// nên tải hết rồi search/lọc phía client để có UX tức thời).
// Nếu dữ liệu lớn hơn vài nghìn dòng, nên chuyển sang Algolia/Typesense.
export async function listAllFaqs(): Promise<Faq[]> {
  const snap = await getDocs(query(collection(db, FAQ_COL), orderBy('createdAt', 'desc')))
  return snap.docs.map(toFaq)
}

export async function listMostViewed(top = 5): Promise<Faq[]> {
  const snap = await getDocs(query(collection(db, FAQ_COL), orderBy('viewCount', 'desc'), limit(top)))
  return snap.docs.map(toFaq)
}

// ----- Search stats (câu tìm kiếm nhiều nhất) -----

function normalizeTerm(term: string) {
  return term.trim().toLowerCase()
}

export async function logSearchTerm(term: string) {
  const normalized = normalizeTerm(term)
  if (!normalized) return
  const ref = doc(db, SEARCH_STAT_COL, normalized)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { count: increment(1), updatedAt: Date.now() })
  } else {
    await setDoc(ref, { term: normalized, count: 1, updatedAt: Date.now() })
  }
}

export async function listMostSearched(top = 5): Promise<SearchStat[]> {
  const snap = await getDocs(query(collection(db, SEARCH_STAT_COL), orderBy('count', 'desc'), limit(top)))
  return snap.docs.map((d) => d.data() as SearchStat)
}

export type { QueryDocumentSnapshot, DocumentData }
