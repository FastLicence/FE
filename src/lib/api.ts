import type {
	ApiResponse,
	CourseDetail,
	CourseListResponse,
	CourseSummary,
	CreateOrderResponse,
	DifficultyLevel,
	LearningLectureData,
	LectureProgress,
	MyPageData,
	NoteEntry,
	NotePayload,
	PaymentConfirmation,
	PaymentProvider,
	UserProfile
} from '$lib/types';
type ApiFetchOptions = {
	token?: string;
	method?: string;
	body?: unknown;
	headers?: Record<string, string>;
};

export const apiFetch = async <T>(
	fetchFn: typeof fetch,
	path: string,
	{ token, method = 'GET', body, headers }: ApiFetchOptions = {}
): Promise<ApiResponse<T>> => {
	const requestInit: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(headers ?? {}),
			...(token ? { Authorization: `Bearer ${token}` } : {})
		}
	};

	if (body !== undefined) {
		requestInit.body = JSON.stringify(body);
	}

	try {
		const response = await fetchFn(path, requestInit);
		if (!response.ok) {
			const errorBody = await response.json().catch(() => null);
			return {
				data: null,
				error: {
					code: errorBody?.error?.code ?? `HTTP_${response.status}`,
					message: errorBody?.error?.message ?? '요청을 처리하는 중 오류가 발생했습니다.'
				}
			};
		}

		const result = (await response.json()) as T;
		return { data: result };
	} catch (error) {
		const message = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
		return {
			data: null,
			error: {
				code: 'NETWORK_ERROR',
				message
			}
		};
	}
};

type FetchCoursesParams = {
	search?: string | null;
	difficulty?: DifficultyLevel | 'all' | null;
	sort?: string | null;
	cursor?: string | null;
	limit?: number;
	token?: string;
};

export const fetchCourses = async (
	fetchFn: typeof fetch,
	params: FetchCoursesParams = {}
): Promise<ApiResponse<CourseListResponse>> => {
	const { search, difficulty, sort, cursor, limit, token } = params;
	const query = new URLSearchParams();

	if (search) query.set('search', search);
	if (difficulty && difficulty !== 'all') query.set('difficulty', difficulty);
	if (sort) query.set('sort', sort);
	if (cursor) query.set('cursor', cursor);
	if (limit) query.set('limit', String(limit));

	const path = query.toString() ? `/api/courses?${query.toString()}` : '/api/courses';
	return apiFetch<CourseListResponse>(fetchFn, path, { token });
};

export const fetchCourseDetail = async (
	fetchFn: typeof fetch,
	courseId: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<CourseDetail>> => {
	const path = `/api/courses/${courseId}`;
	return apiFetch<CourseDetail>(fetchFn, path, { token });
};

export const fetchMyPage = async (
	fetchFn: typeof fetch,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<MyPageData>> => {
	return apiFetch<MyPageData>(fetchFn, '/api/me', { token });
};

type UpdateProfilePayload = Partial<Pick<UserProfile, 'nickname' | 'address' | 'avatarUrl'>>;

export const updateProfile = async (
	fetchFn: typeof fetch,
	payload: UpdateProfilePayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<UserProfile>> => {
	return apiFetch<UserProfile>(fetchFn, '/api/me/profile', {
		method: 'PATCH',
		body: payload,
		token
	});
};

export const fetchLearningLecture = async (
	fetchFn: typeof fetch,
	lectureId: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<LearningLectureData>> => {
	return apiFetch<LearningLectureData>(fetchFn, `/api/learning/lecture/${lectureId}`, {
		token
	});
};

export const saveLearningProgress = async (
	fetchFn: typeof fetch,
	progress: LectureProgress,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<LectureProgress>> => {
	return apiFetch<LectureProgress>(fetchFn, '/api/learning/progress', {
		method: 'POST',
		body: progress,
		token
	});
};

export const saveLearningNote = async (
	fetchFn: typeof fetch,
	payload: NotePayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<NoteEntry>> => {
	return apiFetch<NoteEntry>(fetchFn, '/api/learning/notes', {
		method: 'POST',
		body: payload,
		token
	});
};

export const submitLearningQuestion = async (
	fetchFn: typeof fetch,
	lectureId: string,
	question: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<NoteEntry>> => {
	return apiFetch<NoteEntry>(
		fetchFn,
		'/functions/v1/learning/answerQuestion',
		{ method: 'POST', body: { lectureId, question }, token }
	);
};

type CreateOrderPayload = {
	courseId: string;
	provider: PaymentProvider;
};

export const createOrder = async (
	fetchFn: typeof fetch,
	payload: CreateOrderPayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<CreateOrderResponse>> => {
	return apiFetch<CreateOrderResponse>(
		fetchFn,
		'/functions/v1/payments/createOrder',
		{ method: 'POST', body: payload, token }
	);
};

type ConfirmPaymentPayload = {
	orderNumber: string;
};

export const confirmPayment = async (
	fetchFn: typeof fetch,
	payload: ConfirmPaymentPayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<PaymentConfirmation>> => {
	return apiFetch<PaymentConfirmation>(
		fetchFn,
		'/functions/v1/payments/confirmPayment',
		{ method: 'POST', body: payload, token }
	);
};
