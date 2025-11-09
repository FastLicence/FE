import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CourseListResponse, CourseSummary, DifficultyLevel } from '$lib/types';
import { getSupabaseServerClient } from '$lib/server/supabaseClient';

const mapCourseSummary = (row: any): CourseSummary => ({
	id: row.id,
	title: row.title,
	subtitle: row.subtitle ?? null,
	description: row.description ?? null,
	publishedAt: row.published_at ?? null,
	thumbnailUrl: row.thumbnail_url ?? null,
	instructor: row.instructor,
	difficulty: row.difficulty,
	lectureCount: row.lecture_count ?? null,
	rating: row.rating ?? null,
	reviewCount: row.review_count ?? null,
	originalPrice: row.original_price,
	salePrice: row.sale_price ?? null,
	tags: Array.isArray(row.tags)
		? row.tags
		: row.tags
			? String(row.tags)
					.split(',')
					.map((tag) => tag.trim())
					.filter(Boolean)
			: []
});

const normalizeSortParam = (
	value: string | null
): 'popular' | 'latest' | 'priceAsc' | 'priceDesc' => {
	switch (value) {
		case 'latest':
		case 'newest':
			return 'latest';
		case 'priceAsc':
		case 'price_low':
			return 'priceAsc';
		case 'priceDesc':
		case 'price_high':
			return 'priceDesc';
		default:
			return 'popular';
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const supabase = getSupabaseServerClient();
		const search = url.searchParams.get('search');
		const difficulty = url.searchParams.get('difficulty') as DifficultyLevel | 'all' | null;
		const sort = url.searchParams.get('sort');
		const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);

		const sortParam = normalizeSortParam(sort);

		let query = supabase
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
					tags
				`
			)
			.eq('is_active', true)
			.limit(limit);

		if (search) {
			const pattern = `%${search}%`;
			query = query.or(`title.ilike.${pattern},instructor.ilike.${pattern}`);
		}

		if (difficulty && difficulty !== 'all') {
			query = query.eq('difficulty', difficulty);
		}

		if (sortParam === 'priceAsc') {
			query = query.order('sale_price', { ascending: true, nullsFirst: true });
		} else if (sortParam === 'priceDesc') {
			query = query.order('sale_price', { ascending: false });
		} else if (sortParam === 'latest') {
			query = query.order('published_at', { ascending: false });
		} else {
			query = query.order('review_count', { ascending: false });
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		const response: CourseListResponse = {
			items: (data ?? []).map(mapCourseSummary),
			nextCursor: null
		};

		return json(response);
	} catch (error) {
		console.error('Error fetching courses:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '강의 목록을 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
