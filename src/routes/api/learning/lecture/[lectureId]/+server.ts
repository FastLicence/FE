import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { LearningLectureData, LectureProgress, LectureSummary, NoteEntry } from '$lib/types';
import { getSupabaseServerClient } from '$lib/server/supabaseClient';

const mapLectureSummary = (row: any): LectureSummary => ({
	id: row.id,
	title: row.title,
	durationMinutes: row.duration_minutes ?? null,
	previewAvailable: row.preview_available ?? false
});

const mapNoteEntry = (row: any): NoteEntry => ({
	noteId: row.id,
	lectureId: row.lecture_id,
	noteType: row.note_type,
	content: row.content,
	question: row.question ?? null,
	createdAt: row.created_at
});

const mapProgress = (row: any): LectureProgress => ({
	lectureId: row.lecture_id,
	secondsWatched: row.last_watched_second ?? 0,
	percent: row.percent ?? 0
});

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { lectureId } = params;
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

		const { data: lectureRow, error: lectureError } = await supabase
			.from('lectures')
			.select(
				`
					id,
					title,
					description,
					video_url,
					duration_minutes,
					preview_available,
					course_id,
					courses (
						id,
						title
					)
				`
			)
			.eq('id', lectureId)
			.maybeSingle();

		if (lectureError) {
			throw lectureError;
		}

		if (!lectureRow) {
			return json(
				{
					error: {
						code: 'NOT_FOUND',
						message: '강의를 찾을 수 없습니다.'
					}
				},
				{ status: 404 }
			);
		}

		const { data: access } = await supabase
			.from('user_course_access')
			.select('id')
			.eq('user_id', user.id)
			.eq('course_id', lectureRow.course_id)
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

		const courseInfo = Array.isArray(lectureRow.courses)
			? lectureRow.courses[0]
			: lectureRow.courses;

		const [{ data: notes, error: notesError }, { data: progressRow, error: progressError }, { data: siblings, error: siblingsError }] =
			await Promise.all([
				supabase
					.from('notes')
					.select('id, lecture_id, note_type, content, question, created_at')
					.eq('user_id', user.id)
					.eq('lecture_id', lectureId)
					.order('created_at', { ascending: false }),
				supabase
					.from('lecture_progress')
					.select('lecture_id, last_watched_second, percent')
					.eq('user_id', user.id)
					.eq('lecture_id', lectureId)
					.maybeSingle(),
				supabase
					.from('lectures')
					.select('id, title, duration_minutes, preview_available')
					.eq('course_id', lectureRow.course_id)
					.order('order_index', { ascending: true })
			]);

		if (notesError || progressError || siblingsError) {
			throw notesError ?? progressError ?? siblingsError;
		}

		const learningData: LearningLectureData = {
			lecture: {
				id: lectureRow.id,
				title: lectureRow.title,
				durationMinutes: lectureRow.duration_minutes ?? null,
				previewAvailable: lectureRow.preview_available ?? false,
				videoUrl: lectureRow.video_url ?? '',
				description: lectureRow.description ?? null
			},
			course: {
				id: courseInfo?.id ?? lectureRow.course_id,
				title: courseInfo?.title ?? ''
			},
			notes: (notes ?? []).map(mapNoteEntry),
			progress: progressRow ? mapProgress(progressRow) : null,
			siblings: (siblings ?? []).map(mapLectureSummary),
			hasAccess: true
		};

		return json(learningData);
	} catch (error) {
		console.error('Error fetching learning lecture:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '학습 데이터를 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
