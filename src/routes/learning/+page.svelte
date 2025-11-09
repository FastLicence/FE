<script lang="ts">
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

	const openAuthModal = () => authModalState.open();

	const learningLink = (course: UserCourseSummary) => {
		if (course.lastLectureId) {
			return `/learning/${course.lastLectureId}`;
		}
		return `/courses/${course.courseId}`;
	};

	const featuredCourse = $derived(data.courses[0]);
</script>

<svelte:head>
	<title>학습 홈 | FastLicense</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-6xl space-y-8 animate-fade-in">
	{#if data.requiresAuth}
		<div class="card-modern p-12 text-center shadow-2xl">
			<div class="space-y-4">
				<h1 class="text-3xl font-bold">학습을 이어가려면 로그인하세요</h1>
				<p class="text-base text-base-content/70">내 강의를 불러오고 이어서 학습하려면 로그인이 필요합니다.</p>
				<button type="button" class="btn btn-primary btn-lg gap-2" onclick={openAuthModal}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
					</svg>
					로그인하기
				</button>
			</div>
		</div>
	{:else}
		{#if data.error}
			<div role="alert" class="alert alert-warning shadow-md rounded-2xl">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				{data.error.message}
			</div>
		{/if}

		{#if !data.profile}
			<div class="alert alert-error shadow-lg">
				<span>프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</span>
			</div>
		{:else}
			<!-- Hero -->
			<div class="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0B1F4B] via-[#1E3A8A] to-[#0E7490] p-8 text-white shadow-2xl">
				<div class="grid gap-6 md:grid-cols-[2fr,1fr] items-center">
					<div class="space-y-4">
						<p class="text-sm uppercase tracking-wide text-white/80">나의 학습 공간</p>
						<h1 class="text-4xl font-bold leading-tight">
							{data.profile.nickname}님의<br />
							학습 여정을 이어가세요
						</h1>
						<p class="text-white/85">
							최근 학습한 강의를 확인하고 바로 이어서 시청할 수 있습니다. 학습 기록과 메모도 한 곳에서 관리해보세요.
						</p>
						<div class="flex flex-wrap gap-3">
							<a href="/courses" class="btn btn-outline btn-sm border-white text-white hover:bg-white/10 hover:border-white">
								새 강의 둘러보기
							</a>
							{#if featuredCourse}
								<a
									href={learningLink(featuredCourse)}
									class="btn btn-sm bg-white text-primary font-semibold border-none shadow-lg hover:bg-white/90 hover:text-primary"
								>
									바로 이어보기
								</a>
							{/if}
						</div>
					</div>
					<div class="card bg-white/15 text-white border border-white/30 shadow-inner backdrop-blur">
						<div class="card-body space-y-4">
							<p class="text-sm font-semibold text-white/90">학습 요약</p>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<p class="text-xs text-white/70">진행 중 강의</p>
									<p class="text-3xl font-bold">{data.courses.length}</p>
								</div>
								<div>
									<p class="text-xs text-white/70">완료 목표</p>
									<p class="text-3xl font-bold">100%</p>
								</div>
							</div>
							{#if featuredCourse}
								<div>
									<p class="text-xs text-white/80 mb-1">최근 학습</p>
									<p class="font-semibold leading-tight">{featuredCourse.title}</p>
									<p class="text-xs text-white/80">
										진행률 {featuredCourse.progressPercent}%
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			{#if data.courses.length === 0}
				<div class="card-modern p-10 text-center border border-dashed border-base-300">
					<div class="space-y-4">
						<h2 class="text-2xl font-bold">아직 수강 중인 강의가 없습니다</h2>
						<p class="text-base text-base-content/70">관심 있는 자격증 강의를 선택하고 학습을 시작해보세요.</p>
						<a href="/courses" class="btn btn-primary gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							강의 둘러보기
						</a>
					</div>
				</div>
			{:else}
				<div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
					{#if featuredCourse}
						<div class="card-modern p-6 bg-base-100 shadow-xl border border-base-200">
							<div class="flex items-center gap-3 mb-4">
								<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" />
									</svg>
								</div>
								<div>
									<p class="text-sm text-base-content/60">최근 학습</p>
									<h2 class="text-xl font-bold">{featuredCourse.title}</h2>
								</div>
							</div>
							{#if featuredCourse.lastLectureTitle}
								<p class="text-sm text-base-content/70 mb-4 flex items-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									마지막 학습: {featuredCourse.lastLectureTitle}
								</p>
							{/if}
							<div class="space-y-3">
								<div class="flex items-center justify-between text-sm text-base-content/70">
									<span>학습 진행률</span>
									<span class="font-semibold text-primary">{featuredCourse.progressPercent}%</span>
								</div>
								<progress class="progress progress-primary w-full" value={featuredCourse.progressPercent} max="100"></progress>
							</div>
							<div class="mt-6 flex flex-wrap gap-3">
								<a href={learningLink(featuredCourse)} class="btn btn-primary gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									이어보기
								</a>
								<a href={`/courses/${featuredCourse.courseId}`} class="btn btn-ghost gap-2">
									강의 상세보기
								</a>
							</div>
						</div>
					{/if}

					<div class="card-modern p-6 bg-base-100 shadow-xl border border-base-200">
						<h3 class="text-lg font-bold mb-4 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
							</svg>
							학습 체크리스트
						</h3>
						<ul class="space-y-3 text-sm text-base-content/80">
							<li class="flex items-start gap-3">
								<span class="badge badge-primary badge-sm mt-0.5">1</span>
								<div>
									<p class="font-semibold">진행 중 강의 확인</p>
									<p class="text-xs text-base-content/60">진행률이 가장 높은 강의부터 이어서 보세요.</p>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<span class="badge badge-primary badge-sm mt-0.5">2</span>
								<div>
									<p class="font-semibold">메모 & 질문 정리</p>
									<p class="text-xs text-base-content/60">강의 화면 우측에서 메모와 Q&A를 관리할 수 있습니다.</p>
								</div>
							</li>
							<li class="flex items-start gap-3">
								<span class="badge badge-primary badge-sm mt-0.5">3</span>
								<div>
									<p class="font-semibold">학습 목표 설정</p>
									<p class="text-xs text-base-content/60">이번 주 목표를 세우고 완료 여부를 확인해보세요.</p>
								</div>
							</li>
						</ul>
					</div>
				</div>

				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-2xl font-bold">진행 중인 강의</h2>
							<p class="text-sm text-base-content/60">최근 학습 순으로 정렬되었습니다.</p>
						</div>
						<a href="/courses" class="btn btn-sm btn-outline">다른 강의 보기</a>
					</div>

					<div class="grid gap-5 md:grid-cols-2">
						{#each data.courses as course}
							<div class="card-modern h-full border border-base-200 shadow-md hover:shadow-xl transition-all duration-300">
								<div class="card-body space-y-4">
									<div class="flex items-center gap-3">
										<div class="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center">
											<span class="text-lg font-bold">{course.title.slice(0, 1)}</span>
										</div>
										<div>
											<h3 class="text-lg font-semibold line-clamp-2">{course.title}</h3>
											{#if course.lastLectureTitle}
												<p class="text-xs text-base-content/60 mt-1">최근: {course.lastLectureTitle}</p>
											{/if}
										</div>
									</div>
									<div class="space-y-2">
										<div class="flex items-center justify-between text-xs">
											<span class="font-semibold text-base-content/70">학습 진행률</span>
											<span class="font-bold text-primary">{course.progressPercent}%</span>
										</div>
										<progress class="progress progress-primary w-full" value={course.progressPercent} max="100"></progress>
									</div>
									<div class="flex flex-wrap gap-2">
										<a href={learningLink(course)} class="btn btn-primary btn-sm flex-1">계속 학습</a>
										<a href={`/courses/${course.courseId}`} class="btn btn-outline btn-sm">강의 정보</a>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</section>
