import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { toast } from 'react-hot-toast';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with experimentalForceLongPolling to be more resilient in iframes/Vercel
// We only pass the databaseId if it is explicitly different from "(default)"
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)")
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Validates connection to Firestore on boot
 */
export async function testFirestoreConnection() {
  console.log("Testing Firestore connectivity...");
  try {
    // We use a random path to avoid cache and test the real server connection
    const testDoc = doc(db, '_health_check', 'ping-' + Math.random().toString(36).substring(7));
    await getDocFromServer(testDoc);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      // Permission denied is GOOD news here - it means we successfully talked to the server!
      console.log("✅ Firestore connected successfully (Handshake OK).");
      return;
    }
    
    if (error.message && error.message.includes('client is offline')) {
      console.error("❌ CRcritical: Firestore is offline.");
      toast.error("Không thể kết nối đến Firebase. Bạn đã bấm 'Tạo cơ sở dữ liệu' trong Console chưa?", { duration: 6000 });
      
      console.warn("💡 HƯỚNG DẪN:");
      console.warn("1. Vào Firebase Console -> Firestore Database.");
      console.warn("2. Đảm bảo bạn đã nhấn 'Tạo cơ sở dữ liệu' (Create Database).");
      console.warn("3. Đảm bảo bạn đã chọn một Vị trí (Location) như asia-southeast1.");
    } else {
      console.error("Firestore connection unexpected error:", error);
    }
  }
}

/**
 * Standard Firestore error interface for reporting
 */
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

/**
 * Centralized Firestore error handler
 */
export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null) {
  console.error(`Firestore ${operation} error at ${path}:`, error);
  
  const authInfo = {
    userId: auth.currentUser?.uid || 'anonymous',
    email: auth.currentUser?.email || 'none',
    emailVerified: auth.currentUser?.emailVerified || false,
    isAnonymous: auth.currentUser?.isAnonymous || true,
    providerInfo: auth.currentUser?.providerData || []
  };

  const errorInfo: FirestoreErrorInfo = {
    error: error.message,
    operationType: operation,
    path: path,
    authInfo: authInfo
  };

  if (error.code === 'permission-denied') {
    toast.error("Bạn không có quyền thực hiện thao tác này.");
    throw JSON.stringify(errorInfo);
  } else if (error.message.includes('client is offline')) {
    toast.error("Lỗi: Không có kết nối mạng hoặc Firebase bị chặn.");
  } else {
    toast.error("Có lỗi xảy ra với dữ liệu: " + (error.message || "Lỗi không xác định"));
  }
  
  throw error;
}
