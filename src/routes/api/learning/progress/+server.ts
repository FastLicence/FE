import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { LectureProgress } from '$lib/types';
import { getSupabaseServerClient } from '$lib/server/supabaseClient';

export const POST: RequestHandler = async ({ request, locals }) => {
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

		const payload = (await request.json()) as LectureProgress;
		const { lectureId, secondsWatched, percent } = payload;

		if (!lectureId || typeof secondsWatched !== 'number' || typeof percent !== 'number') {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: 'lectureId, secondsWatched, percent가 필요합니다.'
					}
				},
				{ status: 400 }
			);
		}

		const supabase = getSupabaseServerClient();

		const { data: lecture, error: lectureError } = await supabase
			.from('lectures')
			.select('course_id')
			.eq('id', lectureId)
			.single();

		if (lectureError) {
			throw lectureError;
		}

		const { data: access } = await supabase
			.from('user_course_access')
			.select('id')
			.eq('user_id', user.id)
			.eq('course_id', lecture.course_id)
			.eq('status', 'active')
			.maybeSingle();

		if (!access) {
			return json(
				{
					error: {
						code: 'FORBIDDEN',
						message: '해당 강의에 대한 수강권이 없습니다.'
					}
				},
				{ status: 403 }
			);
		}

		const { data, error: progressError } = await supabase
			.from('lecture_progress')
			.upsert(
				{
					user_id: user.id,
					lecture_id: lectureId,
					last_watched_second: secondsWatched,
					percent,
					completed: percent >= 90,
					updated_at: new Date().toISOString()
				},
				{
					onConflict: 'user_id,lecture_id'
				}
			)
			.select('lecture_id, last_watched_second, percent')
			.single();

		if (progressError) {
			throw progressError;
		}

		const progress: LectureProgress = {
			lectureId,
			secondsWatched: data?.last_watched_second ?? secondsWatched,
			percent: data?.percent ?? percent
		};

		return json(progress);
	} catch (error) {
		console.error('Error saving progress:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '진행률 저장 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
