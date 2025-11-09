<script lang="ts">
	import CourseSearch from '$lib/components/mypage/CourseSearch.svelte';
	import { updateProfile } from '$lib/api';
	import { authModalState } from '$lib/stores/ui';
	import type { UserCourseSummary, UserProfile } from '$lib/types';

	let { data } = $props<{
		data: {
			requiresAuth: boolean;
			profile: UserProfile | null;
			courses: UserCourseSummary[];
			error?: { message: string } | null;
		};
	}>();

	let nickname = $state(data.profile?.nickname ?? '');
	let address = $state(data.profile?.address ?? '');
	let isSaving = $state(false);
	let message = $state('');
	let isEditingProfile = $state(false);
	let searchQuery = $state('');
	let filteredCourses = $state<UserCourseSummary[]>(data.courses);

	const openAuthModal = () => authModalState.open();

	const resetProfileFields = () => {
		if (!data.profile) return;
		nickname = data.profile.nickname ?? '';
		address = data.profile.address ?? '';
	};

	const startEditingProfile = () => {
		if (!data.profile) return;
		resetProfileFields();
		message = '';
		isEditingProfile = true;
	};

	const cancelEditingProfile = () => {
		resetProfileFields();
		message = '';
		isEditingProfile = false;
		isSaving = false;
	};

	const saveProfile = async () => {
		if (!data.profile) return;
		isSaving = true;
		message = '';
		const result = await updateProfile(fetch, { nickname, address });
		isSaving = false;
		if (!result.data) {
			message = result.error?.message ?? '프로필을 저장할 수 없습니다.';
			return;
		}
		data = { ...data, profile: result.data };
		message = '프로필이 업데이트되었습니다.';
		isEditingProfile = false;
	};

	const learningLink = (course: UserCourseSummary) => {
		if (course.lastLectureId) {
			return `/learning/${course.lastLectureId}`;
		}
		return `/courses/${course.courseId}`;
	};

	$effect(() => {
		const query = searchQuery.trim().toLowerCase();
		const courses = data.courses;

		if (!query) {
			filteredCourses = courses;
			return;
		}

		filteredCourses = courses.filter((course: UserCourseSummary) => course.title.toLowerCase().includes(query));
	});
</script>

<svelte:head>
	<title>마이페이지 | FastLicense</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-7xl space-y-8 animate-fade-in">
	<!-- Header -->
	<div class="space-y-3">
		<div class="flex items-center gap-3">
			<div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			</div>
			<div>
				<h1 class="text-4xl font-bold">마이페이지</h1>
				<p class="text-base text-base-content/60 mt-1">나의 학습 현황과 프로필 정보를 확인하세요</p>
			</div>
		</div>
	</div>

	{#if data.error}
		<div role="alert" class="alert alert-warning text-sm">
			{data.error.message}
		</div>
	{/if}

	{#if data.requiresAuth}
		<div class="card-modern p-12 text-center shadow-2xl">
			<div class="flex flex-col items-center gap-6">
				<div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				</div>
				<div class="space-y-2">
					<p class="text-lg font-semibold">로그인이 필요합니다</p>
					<p class="text-sm text-base-content/60">마이페이지를 이용하려면 로그인해주세요</p>
				</div>
				<button type="button" class="btn btn-primary btn-lg gap-2" onclick={openAuthModal}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
					</svg>
					로그인하기
				</button>
			</div>
		</div>
	{:else if data.profile}
		<!-- Profile Card -->
		<div class="card-modern overflow-hidden shadow-xl">
			<div class="bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b border-base-300">
				<div class="flex items-center gap-4">
					<div class="avatar">
						<div class="w-20 h-20 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100">
							{#if data.profile.avatarUrl}
								<img src={data.profile.avatarUrl} alt={`${data.profile.nickname} 프로필 이미지`} />
							{:else}
								<div class="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
									<span class="text-2xl font-bold text-white">
										{data.profile.nickname.slice(0, 1).toUpperCase()}
									</span>
								</div>
							{/if}
						</div>
					</div>
					<div>
						<h2 class="text-2xl font-bold">{data.profile.nickname}</h2>
						<p class="text-sm text-base-content/60 mt-1">{data.profile.email}</p>
					</div>
				</div>
			</div>
			<div class="p-6 grid gap-6 md:grid-cols-2">
				{#if isEditingProfile}
					<label class="form-control gap-2.5">
						<span class="text-base font-semibold text-base-content/80">닉네임</span>
						<input
							type="text"
							class="input input-bordered h-12 text-base placeholder:text-base placeholder:text-base-content/60"
							bind:value={nickname}
							placeholder="닉네임을 입력하세요"
						/>
					</label>
				{:else}
					<div class="surface-panel border-black/20 p-5 min-h-[112px] flex flex-col justify-between">
						<span class="text-base font-semibold text-base-content/80">닉네임</span>
						<p class="text-lg font-semibold text-base-content mt-2">{data.profile.nickname}</p>
					</div>
				{/if}

				{#if isEditingProfile}
					<label class="form-control gap-2.5">
						<span class="text-base font-semibold text-base-content/80">주소</span>
						<input
							type="text"
							class="input input-bordered h-12 text-base placeholder:text-base placeholder:text-base-content/60"
							bind:value={address}
							placeholder="주소를 입력하세요"
						/>
					</label>
				{:else}
					<div class="surface-panel border-black/20 p-5 min-h-[112px] flex flex-col justify-between">
						<span class="text-base font-semibold text-base-content/80">주소</span>
						<p class="text-base text-base-content mt-2">
							{data.profile.address ?? '등록된 주소가 없습니다'}
						</p>
					</div>
				{/if}

				<div class="md:col-span-2 flex flex-wrap items-center gap-4">
					{#if isEditingProfile}
						<button
							type="button"
							class="btn btn-lg gap-2 px-10 rounded-2xl border-none bg-gradient-to-r from-primary to-accent text-primary-content shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
							onclick={saveProfile}
							disabled={isSaving}
							class:loading={isSaving}
						>
							{#if !isSaving}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							{/if}
							프로필 저장
						</button>
						<button
							type="button"
							class="btn btn-outline btn-lg rounded-2xl border-base-300 text-base-content"
							onclick={cancelEditingProfile}
							disabled={isSaving}
						>
							취소
						</button>
					{:else}
						<button
							type="button"
							class="btn btn-lg px-12 rounded-2xl border-2 border-black/30 bg-base-100 text-base-content hover:border-primary hover:text-primary"
							onclick={startEditingProfile}
						>
							프로필 수정
						</button>
					{/if}
					{#if message}
						<span class="text-sm text-success font-medium">{message}</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- My Courses Section -->
		<div class="space-y-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
					</div>
					<div>
						<h2 class="text-2xl font-bold">나의 강의</h2>
						<p class="text-sm text-base-content/60">
							수강 중인 강의를 검색하거나 계속 학습하세요
						</p>
					</div>
				</div>
				<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
					<div class="w-full md:w-auto">
						<CourseSearch bind:value={searchQuery} courses={data.courses} placeholder="강의명, 최근 학습 강의를 검색하세요" />
					</div>
					{#if filteredCourses.length > 0}
						<span class="badge badge-primary badge-lg font-semibold self-start md:self-auto">
							{filteredCourses.length}개
						</span>
					{/if}
				</div>
			</div>

			{#if data.courses.length === 0}
				<div class="card-modern p-16 text-center">
					<div class="flex flex-col items-center gap-4">
						<div class="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<div class="space-y-2">
							<p class="text-lg font-semibold">아직 수강 중인 강의가 없습니다</p>
							<p class="text-sm text-base-content/60">인기 강의를 살펴보고 학습을 시작하세요</p>
						</div>
						<a href="/courses" class="btn btn-primary gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							강의 둘러보기
						</a>
					</div>
				</div>
			{:else if filteredCourses.length === 0}
				<div class="card-modern border border-dashed border-base-300 p-10 text-center space-y-4">
					<div class="flex flex-col items-center gap-3">
						<div class="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<div>
							<p class="text-lg font-semibold">검색 결과가 없습니다</p>
							<p class="text-sm text-base-content/60 mt-1">
								‘{searchQuery}’와 일치하는 강의를 찾지 못했습니다. 다른 키워드를 입력해보세요.
							</p>
						</div>
					</div>
					<button type="button" class="btn btn-outline btn-sm gap-2" onclick={() => (searchQuery = '')}>
						검색어 초기화
					</button>
				</div>
			{:else}
				<!-- Horizontal Scroll Carousel -->
				<div class="relative">
					<div class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
						{#each filteredCourses as course, index}
							<div
								style="animation-delay: {index * 50}ms"
								class="flex-shrink-0 w-80 snap-start animate-fade-in"
							>
								<div class="card-modern h-full overflow-hidden group hover:shadow-2xl transition-all duration-300">
									{#if course.thumbnailUrl}
										<figure class="aspect-video overflow-hidden bg-base-200">
											<img
												src={course.thumbnailUrl}
												alt={course.title}
												class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
											/>
										</figure>
									{/if}
									<div class="card-body">
										<h3 class="card-title text-lg line-clamp-2">{course.title}</h3>
										{#if course.lastLectureTitle}
											<p class="text-xs text-base-content/60 flex items-center gap-1.5">
												<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												최근: {course.lastLectureTitle}
											</p>
										{/if}

										<!-- Progress Bar -->
										<div class="space-y-2 mt-4">
											<div class="flex items-center justify-between text-xs">
												<span class="font-semibold text-base-content/80">학습 진행률</span>
												<span class="font-bold text-primary">{course.progressPercent}%</span>
											</div>
											<progress
												class="progress progress-primary w-full"
												value={course.progressPercent}
												max="100"
											></progress>
										</div>

										<div class="card-actions mt-4">
											<a
												href={learningLink(course)}
												class="btn btn-primary btn-sm w-full gap-2 hover-scale text-primary-content"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												계속 학습하기
											</a>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
