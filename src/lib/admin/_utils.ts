// Supabase JS 2.x + TypeScript 5.9: insert/update/rpc arg types evaluate to
// never when PostgrestQueryBuilder resolves against GenericTable|GenericView.
// This helper preserves the value at runtime while satisfying the type checker.
export function m<T>(v: T): never { return v as never }
