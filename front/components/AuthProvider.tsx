"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { signOut, getUser } from "@/lib/auth/actions";
import Sidebar from "./Sidebar";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  handleSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  handleSignOut: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  }, []);

  useEffect(() => {
    // 初期認証状態の取得
    const checkAuth = async () => {
      try {
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (error) {
        console.error("認証確認エラー:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Supabaseの認証状態変更リスナーを設定
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ログインが必要な画面のパス（認証画面は除外）
  const protectedPaths = ["/chat", "/bookmarks", "/settings"];
  const authPaths = ["/auth"];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // サイドバーを表示する条件：ログイン済み かつ 保護されたページ
  const shouldShowSidebar = user && isProtectedPath;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, handleSignOut }}>
      <div className="flex min-h-screen bg-gray-50">
        {/* ログイン状態かつ保護されたページの場合のみサイドバーを表示 */}
        {shouldShowSidebar && <Sidebar />}

        {/* メインコンテンツ */}
        <main
          className={`flex-1 ${shouldShowSidebar ? "ml-64" : ""} ${
            !shouldShowSidebar && !isAuthPath ? "p-8" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </AuthContext.Provider>
  );
};
