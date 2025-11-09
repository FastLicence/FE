// $lib/apiInvoke.ts
import { getSupabaseClient } from '$lib/supabaseClient';

type Method = 'GET' | 'POST';

export async function apiInvoke<T = any>(
  path: string,
  { method = 'GET', query, body }: { method?: Method; query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {}
): Promise<T> {
  const supabase = getSupabaseClient();

  const q = query
    ? new URLSearchParams(Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined) acc[k] = String(v);
        return acc;
      }, {})).toString()
    : '';

  const { data, error } = await supabase.functions.invoke('api', {
    headers: {
      'x-path': path,                // 라우팅 경로
      'x-method': method,            // 실제 메서드
      'x-query': q,                  // 쿼리 문자열
      'content-type': 'application/json'
    },
    body: body ?? {}                 // invoke는 POST 전송 방식이므로 빈 객체라도 전달
  });

  if (error) throw error;
  return data as T;
}
