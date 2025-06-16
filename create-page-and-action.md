# Next.js + Supabase アプリケーション開発テンプレート

## 概要

このテンプレートは、Next.js 15 + Supabase + TypeScript を使用したアプリケーション開発のためのプロンプトテンプレートです。Server Actions とクライアントコンポーネントの実装パターンを統一化します。

---

## 📄 Page コンポーネント作成テンプレート

### 基本構造

````
以下の要件に従って [機能名] のページコンポーネントを作成してください：

**技術仕様:**
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase (front/lib/supabase.ts のクライアント使用)

**ファイル構造:**
- パス: front/app/[ルートパス]/page.tsx
- "use client" ディレクティブを使用
- デフォルトエクスポート関数

**必須インポート:**
```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { [関連するServer Actions] } from "@/app/actions/[action-file]";
import type { Database } from "@/lib/supabase";
```

**型定義パターン:**
```typescript
type [EntityName] = Database["public"]["Tables"]["[table_name]"]["Row"];
type [EntityName]Insert = Database["public"]["Tables"]["[table_name]"]["Insert"];
```

**状態管理パターン:**
```typescript
const [data, setData] = useState<[Type][]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**認証パターン:**
```typescript
const { user } = useAuth();
```

**データ読み込みパターン:**
```typescript
useEffect(() => {
  const loadData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const result = await [serverAction](user.id);
      setData(result);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [user?.id]);
```

**レンダリングパターン:**
```typescript
if (isLoading) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    </div>
  );
}
```

**レイアウト構造:**
```typescript
return (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 ml-64 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">[ページタイトル]</h1>
        <p className="text-gray-600 text-sm mt-1">[サブタイトル]</p>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-6 py-4">{/* コンテンツ */}</div>
    </div>
  </div>
);
```

**特別な要件:**
- [具体的な機能要件を記述]
- [UI の特別な動作があれば記述]
- [API 連携の詳細があれば記述]

```

---

## 📄 動的ルート Page コンポーネント作成テンプレート

```
以下の要件に従って [機能名] の動的ルートページコンポーネントを作成してください：

**動的ルート仕様:**
- パス: front/app/[親ルート]/[パラメータ名]/page.tsx
- useParams() でルートパラメータを取得

**パラメータ取得パターン:**
```typescript
const params = useParams();
const [paramName] = params.[paramName]
  ? parseInt(params.[paramName] as string)
  : null;

if (![paramName]) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">無効な[パラメータ名]です</p>
        </div>
      </div>
    </div>
  );
}
```

**データ読み込みパターン (複数データ):**
```typescript
useEffect(() => {
  const loadData = async () => {
    if (![paramName] || !user?.id) return;

    try {
      setIsLoadingData(true);
      const [data1, data2] = await Promise.all([
        [serverAction1]([paramName], user.id),
        [serverAction2]([paramName], user.id),
      ]);

      setData1(data1);
      setData2(data2);
    } catch (err) {
      console.error("データ読み込みエラー:", err);
      setError(
        err instanceof Error ? err.message : "データの読み込みに失敗しました"
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  loadData();
}, [[paramName], user?.id]);
```

**その他は基本構造と同様**
```

---

## 🔧 Server Actions 作成テンプレート

### 基本構造
```

以下の要件に従って [機能名] の Server Actions を作成してください：

**技術仕様:**
- ファイルパス: front/app/actions/[機能名].ts
- "use server" ディレクティブ
- Supabase クライアント使用 (front/utils/supabase/server)

**必須インポート:**
```typescript
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase";
```

**型定義パターン:**
```typescript
type [EntityName] = Database["public"]["Tables"]["[table_name]"]["Row"];
type [EntityName]Insert = Database["public"]["Tables"]["[table_name]"]["Insert"];
```

**認証チェックパターン:**
```typescript
const supabase = await createClient();

const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  throw new Error("認証が必要です");
}
```

**権限チェックパターン (所有権確認):**
```typescript
// リソースの所有権を確認
const { data: resource, error: resourceError } = await supabase
  .from("[table_name]")
  .select("user_id")
  .eq("id", [resourceId])
  .single();

if (resourceError || !resource || resource.user_id !== userId) {
  throw new Error("Unauthorized or resource not found");
}
```

**CRUD 操作パターン:**

**CREATE:**
```typescript
export async function create[EntityName](
  [params]: [types]
) {
  try {
    const supabase = await createClient();

    // 認証チェック
    [認証チェックコード]

    const insertData: [EntityName]Insert = {
      [データ構造]
    };

    const { data, error } = await supabase
      .from("[table_name]")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    revalidatePath("[関連パス]");
    return { success: true, data };
  } catch (error) {
    console.error("[操作名]エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "[エラーメッセージ]",
    };
  }
}
```

**READ (単体):**
```typescript
export async function get[EntityName]([id]: [type], userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("[table_name]")
    .select("*")
    .eq("id", [id])
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[操作名]エラー:", error);
    return null;
  }

  return data;
}
```

**READ (リスト):**
```typescript
export async function get[EntityName]List(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("[table_name]")
    .select("*")
    .eq("user_id", userId)
    .order("[sort_column]", { ascending: [true/false] });

  if (error) {
    console.error("[操作名]エラー:", error);
    throw new Error("[エラーメッセージ]");
  }

  return data || [];
}
```

**UPDATE:**
```typescript
export async function update[EntityName](
  [id]: [type],
  [updateData]: [type],
  userId: string
) {
  const supabase = await createClient();

  // 権限チェック
  [権限チェックコード]

  const { data, error } = await supabase
    .from("[table_name]")
    .update({
      [更新フィールド],
      updated_at: new Date().toISOString(),
    })
    .eq("id", [id])
    .select()
    .single();

  if (error) {
    console.error("[操作名]エラー:", error);
    throw new Error("[エラーメッセージ]");
  }

  revalidatePath("[関連パス]");
  return data;
}
```

**DELETE:**
```typescript
export async function delete[EntityName]([id]: [type], userId: string) {
  const supabase = await createClient();

  // 権限チェック
  [権限チェックコード]

  // 関連データの削除（外部キー制約がある場合）
  const { error: relatedError } = await supabase
    .from("[related_table]")
    .delete()
    .eq("[foreign_key]", [id]);

  if (relatedError) {
    console.error("関連データ削除エラー:", relatedError);
    throw new Error("関連データの削除に失敗しました");
  }

  // メインデータの削除
  const { error: deleteError } = await supabase
    .from("[table_name]")
    .delete()
    .eq("id", [id]);

  if (deleteError) {
    console.error("[操作名]エラー:", deleteError);
    throw new Error("[エラーメッセージ]");
  }

  revalidatePath("[関連パス]");
}
```

**複雑なクエリ (JOIN):**
```typescript
export async function get[EntityName]WithRelations(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("[main_table]")
      .select(`
        *,
        [related_table] (
          [related_fields]
        )
      `)
      .eq("user_id", userId)
      .order("[sort_field]", { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("[操作名]エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "[エラーメッセージ]",
    };
  }
}
```

**ページネーション付きクエリ:**
```typescript
export async function get[EntityName]WithPagination(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const supabase = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 総件数を取得
    const { count, error: countError } = await supabase
      .from("[table_name]")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw countError;
    }

    // ページネーション付きでデータを取得
    const { data, error } = await supabase
      .from("[table_name]")
      .select("[fields]")
      .eq("user_id", userId)
      .order("[sort_field]", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("[操作名]エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "[エラーメッセージ]",
    };
  }
}
```

**特別な要件:**
- [具体的なビジネスロジック要件]
- [データ検証ルール]
- [関連テーブルの更新処理]
```

---

## 🎯 使用方法

### Page コンポーネント作成時
1. 上記の「Page コンポーネント作成テンプレート」をコピー
2. [機能名]、[ルートパス]、[関連するServer Actions] などを具体的な値に置換
3. 特別な要件セクションに具体的な機能要件を記述
4. プロンプトとして使用

### Server Actions作成時
1. 上記の「Server Actions作成テンプレート」をコピー
2. [機能名]、[table_name]、[EntityName] などを具体的な値に置換
3. 必要なCRUD操作のパターンを選択・組み合わせ
4. 特別な要件セクションにビジネスロジック要件を記述
5. プロンプトとして使用

### カスタマイズポイント
- 認証方式の変更
- エラーハンドリングの詳細化
- UIコンポーネントの差し替え
- データ構造の複雑化対応
- パフォーマンス最適化要件

---

## 📝 注意事項

- **必ずSupabaseクライアントは `front/lib/supabase.ts` を使用**
- yarn を使用（npm ではない）
- 日本語でのレスポンス
- TypeScript の型安全性を重視
- エラーハンドリングを必須実装
- セキュリティ（認証・認可）チェックを必須実装
- revalidatePath によるキャッシュ管理を適切に実行
```
````
