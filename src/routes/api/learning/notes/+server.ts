import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NoteEntry, NotePayload } from '$lib/types';
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

		const body = (await request.json()) as NotePayload;
		const { lectureId, noteType, content, question } = body;

		if (!lectureId || !noteType || !content) {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: 'lectureId, noteType, content가 필요합니다.'
					}
				},
				{ status: 400 }
			);
		}

		if (!['user_memo', 'auto_summary', 'qa_answer'].includes(noteType)) {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: 'noteType은 user_memo, auto_summary, qa_answer 중 하나여야 합니다.'
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

		const { data, error: insertError } = await supabase
			.from('notes')
			.insert({
				user_id: user.id,
				lecture_id: lectureId,
				note_type: noteType,
				content,
				question: question ?? null
			})
			.select('id, lecture_id, note_type, content, question, created_at')
			.single();

		if (insertError) {
			throw insertError;
		}

		const note: NoteEntry = {
			noteId: data.id,
			lectureId: data.lecture_id,
			noteType: data.note_type,
			content: data.content,
			question: data.question ?? null,
			createdAt: data.created_at
		};

		return json(note);
	} catch (error) {
		console.error('Error saving note:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '노트 저장 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
