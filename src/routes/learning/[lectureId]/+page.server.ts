import { fetchLearningLecture } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const { lectureId } = params;

	if (!locals.user) {
		return {
			requiresAuth: true,
			lectureId
		};
	}

	const result = await fetchLearningLecture(fetch, lectureId, {
		token: locals.accessToken ?? undefined
	});

	if (!result.data) {
		return {
			requiresAuth: false,
			error: result.error,
			lectureId
		};
	}

	if (!result.data.hasAccess) {
		return {
			requiresAuth: false,
			forbidden: true,
			courseId: result.data.course.id,
			lectureId
		};
	}

	return {
		requiresAuth: false,
		lesson: result.data
	};
};
