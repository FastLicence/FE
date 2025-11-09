import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { UserProfile } from '$lib/types';
import { getSupabaseServerClient } from '$lib/server/supabaseClient';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;

		if (!user) {
			return json(
				{
					error: {
						code: 'UNAUTHORIZED',
						message: '로그인이 필요합니다.'
					}
				},
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { nickname, address, avatarUrl } = body as Partial<UserProfile>;

		if (nickname !== undefined && typeof nickname !== 'string') {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: '닉네임은 문자열이어야 합니다.'
					}
				},
				{ status: 400 }
			);
		}

		if (address !== undefined && typeof address !== 'string') {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: '주소는 문자열이어야 합니다.'
					}
				},
				{ status: 400 }
			);
		}

		const supabase = getSupabaseServerClient();
		const updates: Record<string, string | null> = {
			updated_at: new Date().toISOString()
		};

		if (nickname !== undefined) {
			updates.nickname = nickname;
		}

		if (address !== undefined) {
			updates.address_text = address;
		}

		if (avatarUrl !== undefined) {
			updates.avatar_url = avatarUrl;
		}

		const { data, error } = await supabase
			.from('users')
			.update(updates)
			.eq('id', user.id)
			.select('nickname, address_text, avatar_url')
			.single();

		if (error) {
			throw error;
		}

		const profile: UserProfile = {
			id: user.id,
			email: user.email,
			nickname: data.nickname ?? user.nickname ?? user.email.split('@')[0],
			avatarUrl: data.avatar_url ?? user.avatarUrl ?? null,
			address: data.address_text ?? null
		};

		return json(profile);
	} catch (error) {
		console.error('Error updating profile:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '프로필 업데이트 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
