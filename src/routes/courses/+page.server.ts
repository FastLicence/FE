import { fetchCourses } from '$lib/api';
import type { DifficultyLevel } from '$lib/types';
import type { PageServerLoad } from './$types';

const isDifficulty = (value: string | null): value is DifficultyLevel | 'all' => {
	return value === 'beginner' || value === 'intermediate' || value === 'advanced' || value === 'all';
};

type SortOption = 'popular' | 'newest' | 'price_low' | 'price_high';

const isSortOption = (value: string | null): value is SortOption => {
	return value === 'popular' || value === 'newest' || value === 'price_low' || value === 'price_high';
};

const normalizeSortOption = (value: string | null): SortOption => {
	return isSortOption(value) ? value : 'popular';
};

const mapSortToApiParam = (value: SortOption): 'popular' | 'latest' | 'priceAsc' | 'priceDesc' => {
	switch (value) {
		case 'newest':
			return 'latest';
		case 'price_low':
			return 'priceAsc';
		case 'price_high':
			return 'priceDesc';
		default:
			return 'popular';
	}
};

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
	const search = url.searchParams.get('search') ?? '';
	const difficultyParam = url.searchParams.get('difficulty');
	const difficulty = isDifficulty(difficultyParam) ? difficultyParam : 'all';
	const sort = normalizeSortOption(url.searchParams.get('sort'));
	const cursor = url.searchParams.get('cursor');
	const limit = 9;

	const result = await fetchCourses(fetch, {
		search: search || null,
		difficulty,
		sort: mapSortToApiParam(sort),
		cursor,
		limit,
		token: locals.accessToken ?? undefined
	});

	return {
		courses: result.data?.items ?? [],
		nextCursor: result.data?.nextCursor ?? null,
		filters: {
			search,
			difficulty,
			sort
		},
		error: result.error ?? null
	};
};
