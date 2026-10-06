"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthResult = { ok: boolean; error?: string };

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  configured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const NO_CONFIG: AuthResult = {
  ok: false,
  error: "Firebase is not configured (missing NEXT_PUBLIC_FIREBASE_* env vars).",
};

function toAppUser(u: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): AppUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error — check your connection.";
    default:
      return (err as Error)?.message || "Something went wrong.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured || !auth) {
      setLoading(false);
      return;
    }
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    const unsub = onAuthStateChanged(auth, (fu) => {
      setUser(fu ? toAppUser(fu) : null);
      setLoading(false);
    });
    return unsub;
  }, [configured]);

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      if (!configured || !auth) return NO_CONFIG;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name }).catch(() => {});
        await sendEmailVerification(cred.user).catch(() => {});
        setUser(toAppUser({ ...cred.user, displayName: name }));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: friendlyError(e) };
      }
    },
    [configured]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!configured || !auth) return NO_CONFIG;
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setUser(toAppUser(cred.user));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: friendlyError(e) };
      }
    },
    [configured]
  );

  const loginWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!configured || !auth) return NO_CONFIG;
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      setUser(toAppUser(cred.user));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: friendlyError(e) };
    }
  }, [configured]);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!configured || !auth) return NO_CONFIG;
      try {
        await sendPasswordResetEmail(auth, email);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: friendlyError(e) };
      }
    },
    [configured]
  );

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      signUp,
      login,
      loginWithGoogle,
      sendPasswordReset,
      logout,
    }),
    [user, loading, configured, signUp, login, loginWithGoogle, sendPasswordReset, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}