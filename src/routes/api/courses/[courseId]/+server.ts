import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CourseDetail, LectureSummary } from '$lib/types';
import { getSupabaseServerClient } from '$lib/server/supabaseClient';

const mapLectureSummary = (row: any): LectureSummary => ({
	id: row.id,
	title: row.title,
	durationMinutes: row.duration_minutes ?? null,
	previewAvailable: row.preview_available ?? false
});

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { courseId } = params;
		const supabase = getSupabaseServerClient();

		const { data: courseRow, error } = await supabase
			.from('courses')
			.select(
				`
					id,
					title,
					subtitle,
					description,
					published_at,
					thumbnail_url,
					instructor,
					difficulty,
					lecture_count,
					rating,
					review_count,
					original_price,
					sale_price,
					tags,
					about,
					gpt_preview_summary
				`
			)
			.eq('id', courseId)
			.maybeSingle();

		if (error) {
			throw error;
		}

		if (!courseRow) {
			return json(
				{
					error: {
						code: 'NOT_FOUND',
						message: '요청하신 강의를 찾을 수 없습니다.'
					}
				},
				{ status: 404 }
			);
		}

		const { data: lectureRows, error: lecturesError } = await supabase
			.from('lectures')
			.select('id, title, duration_minutes, preview_available')
			.eq('course_id', courseId)
			.order('order_index', { ascending: true });

		if (lecturesError) {
			throw lecturesError;
		}

		let hasAccess = false;
		if (locals.user) {
			const { data: access } = await supabase
				.from('user_course_access')
				.select('id')
				.eq('user_id', locals.user.id)
				.eq('course_id', courseId)
				.eq('status', 'active')
				.maybeSingle();

			hasAccess = Boolean(access);
		}

		const courseDetail: CourseDetail = {
			id: courseRow.id,
			title: courseRow.title,
			subtitle: courseRow.subtitle ?? null,
			description: courseRow.description ?? null,
			publishedAt: courseRow.published_at ?? null,
			thumbnailUrl: courseRow.thumbnail_url ?? null,
			instructor: courseRow.instructor,
			difficulty: courseRow.difficulty,
			lectureCount: courseRow.lecture_count ?? null,
			rating: courseRow.rating ?? null,
			reviewCount: courseRow.review_count ?? null,
			originalPrice: courseRow.original_price,
			salePrice: courseRow.sale_price ?? null,
			tags: Array.isArray(courseRow.tags)
				? courseRow.tags
				: courseRow.tags
					? String(courseRow.tags)
							.split(',')
							.map((tag) => tag.trim())
							.filter(Boolean)
					: [],
			gptPreviewSummary: courseRow.gpt_preview_summary ?? null,
			about: courseRow.about ?? null,
			lectures: (lectureRows ?? []).map(mapLectureSummary),
			hasAccess
		};

		return json(courseDetail);
	} catch (error) {
		console.error('Error fetching course detail:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '강의 정보를 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
