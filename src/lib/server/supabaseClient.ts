import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

let supabaseServerClient: SupabaseClient | null = null;

export const getSupabaseServerClient = (): SupabaseClient => {
	if (!supabaseServerClient) {
		const supabaseUrl = env.PUBLIC_SUPABASE_URL;
		const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !serviceRoleKey) {
			throw new Error('Supabase server 환경 변수가 설정되지 않았습니다.');
		}

		supabaseServerClient = createClient(supabaseUrl, serviceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}

	return supabaseServerClient;
};
