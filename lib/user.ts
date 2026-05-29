import { 
  db 
} from "./firebase";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  limit
} from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  providerId: string | null;
  bio: string;
  theme: {
    bgColor: string;
    btnShape: string;
    backgroundType?: 'color' | 'gradient' | 'mesh';
    backgroundColors?: string[];
  };
  totalPageViews: number;
  createdAt: any;
}

/**
 * Display Name 중복 여부를 확인합니다.
 * @param displayName 확인하고 싶은 표시 이름
 * @param excludeUid 제외할 UID (현재 본인의 이름은 중복에서 제외)
 * @returns 중복 여부 (true: 중복됨, false: 사용 가능)
 */
export const checkDisplayNameDuplicate = async (displayName: string, excludeUid?: string) => {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef, 
    where("displayName", "==", displayName),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return false;
  
  // 검색된 결과가 본인의 데이터라면 중복이 아님
  if (excludeUid && querySnapshot.docs[0].id === excludeUid) {
    return false;
  }
  
  return true;
};

/**
 * Username 중복 여부를 확인합니다.
 * @param username 확인하고 싶은 유저네임
 * @param excludeUid 제외할 UID
 */
export const checkUsernameDuplicate = async (username: string, excludeUid?: string) => {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef, 
    where("username", "==", username),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return false;
  if (excludeUid && querySnapshot.docs[0].id === excludeUid) {
    return false;
  }
  
  return true;
};

/**
 * UID로 유저 프로필 정보를 가져옵니다.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { uid, ...userSnap.data() } as UserProfile;
  }
  
  return null;
};

/**
 * Username으로 유저 프로필 정보를 가져옵니다.
 */
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef, 
    where("username", "==", username),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
};

/**
 * 유저 프로필 정보를 업데이트합니다.
 */
export const updateUserProfile = async (uid: string, data: {
  displayName?: string;
  bio?: string;
  username?: string;
}) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};
