import { db } from "./firebase";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

export type LinkItem = {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string | null;
  isActive: boolean;
  order: number;
  clickCount: number;
  highlightStyle?: 'none' | 'bounce' | 'glow';
  createdAt: string;
  updatedAt: string;
};

/**
 * 유저의 모든 링크를 가져옵니다.
 */
export const getLinks = async (uid: string): Promise<LinkItem[]> => {
  const q = query(collection(db, "users", uid, "links"), orderBy("order", "asc"));
  const querySnapshot = await getDocs(q);
  const links: LinkItem[] = [];
  querySnapshot.forEach((doc) => {
    links.push(doc.data() as LinkItem);
  });
  return links;
};

/**
 * 새로운 링크를 추가합니다.
 */
export const addLink = async (uid: string, link: LinkItem) => {
  const linkRef = doc(db, "users", uid, "links", link.id);
  await setDoc(linkRef, link);
};

/**
 * 기존 링크를 수정합니다.
 */
export const updateLink = async (uid: string, linkId: string, data: Partial<LinkItem>) => {
  const linkRef = doc(db, "users", uid, "links", linkId);
  await updateDoc(linkRef, data);
};

/**
 * 링크를 삭제합니다.
 */
export const deleteLink = async (uid: string, linkId: string) => {
  const linkRef = doc(db, "users", uid, "links", linkId);
  await deleteDoc(linkRef);
};
