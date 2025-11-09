import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { MyPageData, UserCourseSummary, UserProfile } from '$lib/types';
import { getSupabaseServerClient } from '$lib/server/supabaseClient';

const mapUserCourse = (row: any): UserCourseSummary | null => {
	const course = row.courses;
	if (!course) return null;

	return {
		courseId: course.id,
		title: course.title,
		thumbnailUrl: course.thumbnail_url ?? null,
		progressPercent: row.progress_percent ?? 0,
		lastLectureId: row.last_lecture_id ?? null,
		lastLectureTitle: row.last_lecture_title ?? null
	};
};

export const GET: RequestHandler = async ({ locals }) => {
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

		const supabase = getSupabaseServerClient();

		const profilePromise = supabase
			.from('users')
			.select('nickname, address_text, avatar_url')
			.eq('id', user.id)
			.maybeSingle();

		const coursesPromise = supabase
			.from('user_course_access')
			.select(
				`
					course_id,
					progress_percent,
					last_lecture_id,
					last_lecture_title,
					courses (
						id,
						title,
						thumbnail_url
					)
				`
			)
			.eq('user_id', user.id)
			.eq('status', 'active');

		const [{ data: profileRow, error: profileError }, { data: courseRows, error: courseError }] =
			await Promise.all([profilePromise, coursesPromise]);

		if (profileError) {
			throw profileError;
		}

		if (courseError) {
			throw courseError;
		}

		const profile: UserProfile = {
			id: user.id,
			email: user.email,
			nickname: profileRow?.nickname ?? user.nickname ?? user.email.split('@')[0],
			avatarUrl: profileRow?.avatar_url ?? user.avatarUrl ?? null,
			address: profileRow?.address_text ?? null
		};

		const courses = (courseRows ?? [])
			.map(mapUserCourse)
			.filter((course): course is UserCourseSummary => course !== null);

		const myPage: MyPageData = {
			profile,
			courses
		};

		return json(myPage);
	} catch (error) {
		console.error('Error fetching my page data:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '마이페이지 데이터를 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
