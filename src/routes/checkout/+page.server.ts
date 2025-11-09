import { fetchCourseDetail } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
	const courseId = url.searchParams.get('courseId');

	if (!courseId) {
		throw redirect(302, '/courses');
	}

	const result = await fetchCourseDetail(fetch, courseId, {
		token: locals.accessToken ?? undefined
	});

	if (!result.data) {
		throw error(404, result.error?.message ?? '선택하신 강의를 찾을 수 없습니다.');
	}

	return {
		course: result.data,
		requiresAuth: !locals.user,
		error: result.error ?? null
	};
};
