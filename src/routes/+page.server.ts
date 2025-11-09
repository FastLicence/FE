import { fetchCourses } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const result = await fetchCourses(fetch, { limit: 4, token: locals.accessToken ?? undefined });

	return {
		featuredCourses: result.data?.items ?? [],
		error: result.error ?? null
	};
};
