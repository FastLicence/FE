import { fetchCourseDetail } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, locals }) => {
	const { courseId } = params;
	const result = await fetchCourseDetail(fetch, courseId, {
		token: locals.accessToken ?? undefined
	});

	if (!result.data) {
		throw error(404, '요청하신 강의를 찾을 수 없습니다.');
	}

	return {
		course: result.data
	};
};
