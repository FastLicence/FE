import { fetchMyPage } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	if (!locals.user) {
		return {
			requiresAuth: true,
			profile: null,
			courses: []
		};
	}

	const result = await fetchMyPage(fetch, { token: locals.accessToken ?? undefined });

	return {
		requiresAuth: false,
		profile: result.data?.profile ?? null,
		courses: result.data?.courses ?? [],
		error: result.error ?? null
	};
};
