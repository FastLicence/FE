<script lang="ts">
	import type { CourseDetail } from '$lib/types';
	import { formatCurrency, formatDifficulty, formatDuration } from '$lib/utils/format';

let { data } = $props<{ data: { course: CourseDetail } }>();

	let previewModalOpen = $state(false);
	let previewLectureId = $state<string | null>(null);

	const ctaHref = () => {
		const firstLecture = data.course.lectures[0];
		if (data.course.hasAccess) {
			return firstLecture ? `/learning/${firstLecture.id}` : `/learning/${data.course.id}`;
		}
		return `/checkout?courseId=${data.course.id}`;
	};

	const ctaLabel = data.course.hasAccess ? '학습하러 가기' : '수강신청';

	const openPreview = (lectureId: string) => {
		previewLectureId = lectureId;
		previewModalOpen = true;
	};

	const closePreview = () => {
		previewModalOpen = false;
		previewLectureId = null;
	};

	const difficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'beginner':
				return 'badge-success';
			case 'intermediate':
				return 'badge-warning';
			case 'advanced':
				return 'badge-error';
			default:
				return 'badge-ghost';
		}
	};
</script>

<svelte:head>
	<title>{data.course.title} | FastLicense</title>
	<meta name="description" content={data.course.subtitle ?? data.course.description ?? ''} />
	<meta property="og:title" content={`${data.course.title} | FastLicense`} />
	<meta
		property="og:description"
		content={data.course.subtitle ?? data.course.description ?? 'FastLicense 인기 강의를 확인하세요.'}
	/>
	{#if data.course.thumbnailUrl}
		<meta property="og:image" content={data.course.thumbnailUrl} />
	{/if}
</svelte:head>

<article class="space-y-12 animate-fade-in">
	<!-- Hero Section -->
	<section class="grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-start">
		<div class="space-y-6">
			<!-- Breadcrumbs -->
			<nav class="flex items-center gap-2 text-sm text-base-content/60">
				<a href="/courses" class="hover:text-primary transition-colors">강의</a>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class={`badge ${difficultyColor(data.course.difficulty)} badge-sm`}>
					{formatDifficulty(data.course.difficulty)}
				</span>
			</nav>

			<!-- Title & Subtitle -->
			<div class="space-y-3">
				<h1 class="text-4xl font-bold leading-tight">{data.course.title}</h1>
				{#if data.course.subtitle}
					<p class="text-lg leading-relaxed text-base-content/70">{data.course.subtitle}</p>
				{/if}
			</div>

			<!-- Metadata -->
			<div class="flex flex-wrap items-center gap-4">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<span class="text-sm font-medium">{data.course.instructor}</span>
				</div>
				{#if data.course.lectureCount}
					<div class="flex items-center gap-2 text-sm text-base-content/60">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						<span>{data.course.lectureCount}개 강의</span>
					</div>
				{/if}
				{#if data.course.rating}
					<div class="flex items-center gap-1 text-sm">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-warning fill-warning" viewBox="0 0 20 20" fill="currentColor">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
						<span class="font-semibold">{data.course.rating.toFixed(1)}</span>
						{#if data.course.reviewCount}
							<span class="text-base-content/60">({data.course.reviewCount})</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- GPT Summary -->
			{#if data.course.gptPreviewSummary}
				<div class="card-modern overflow-hidden">
					<div class="bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b border-base-300">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
							<h2 class="text-lg font-bold">이 강의는 이런 분께 추천드려요</h2>
						</div>
					</div>
					<div class="p-6">
						<p class="text-base leading-relaxed text-base-content/70">{data.course.gptPreviewSummary}</p>
					</div>
				</div>
			{/if}

			<!-- About -->
			{#if data.course.about}
				<section class="space-y-4">
					<h2 class="text-2xl font-bold">강의 소개</h2>
					<p class="text-base leading-relaxed text-base-content/70 whitespace-pre-line">{data.course.about}</p>
				</section>
			{/if}
		</div>

		<!-- Sticky Sidebar -->
		<aside class="lg:sticky lg:top-24">
			<div class="card-modern overflow-hidden shadow-2xl">
				<div class="card-body gap-6">
					{#if !data.course.hasAccess && data.course.salePrice && data.course.salePrice < data.course.originalPrice}
						<span class="badge badge-secondary badge-lg font-bold shadow-md w-fit">
							{Math.round(((data.course.originalPrice - data.course.salePrice) / data.course.originalPrice) * 100)}% 할인
						</span>
					{/if}

					<!-- Pricing -->
					<div class="space-y-2">
						<p class="text-3xl font-bold text-primary">
							{formatCurrency(data.course.salePrice ?? data.course.originalPrice)}
						</p>
						{#if data.course.salePrice && data.course.salePrice < data.course.originalPrice}
							<p class="text-base text-base-content/50 line-through">
								{formatCurrency(data.course.originalPrice)}
							</p>
						{/if}
					</div>

					<!-- CTA Button -->
					<a
						href={ctaHref()}
						class="btn btn-lg w-full bg-gradient-to-r from-primary to-accent border-0 text-white hover:brightness-110 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							{#if data.course.hasAccess}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							{/if}
						</svg>
						{ctaLabel}
					</a>

					<div class="divider my-2"></div>

					<!-- Benefits -->
					<ul class="space-y-3">
						<li class="flex items-start gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-sm text-base-content/80">합격 전까지 무제한 수강</span>
						</li>
						<li class="flex items-start gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-sm text-base-content/80">실전 모의고사 & 오답 분석</span>
						</li>
						<li class="flex items-start gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-sm text-base-content/80">합격 기원 라이브 Q&A 커뮤니티</span>
						</li>
					</ul>

				</div>
			</div>
		</aside>
	</section>

	<!-- Curriculum Section -->
	<section class="space-y-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h2 class="text-2xl font-bold">커리큘럼</h2>
			</div>
			<span class="badge badge-ghost badge-lg font-semibold">총 {data.course.lectures.length}강</span>
		</div>

		<div class="card-modern p-4 space-y-3">
			{#each data.course.lectures as lecture, index}
				<div
					class="group rounded-xl border border-base-300 bg-base-100 p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
				>
					<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div class="flex items-start gap-4 flex-1">
							<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
								<span class="text-sm font-bold text-primary">{index + 1}</span>
							</div>
							<div class="space-y-1 flex-1">
								<h3 class="text-base font-semibold group-hover:text-primary transition-colors">{lecture.title}</h3>
								{#if lecture.durationMinutes}
									<div class="flex items-center gap-2 text-xs text-base-content/60">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<span>{formatDuration(lecture)}</span>
									</div>
								{/if}
							</div>
						</div>
						{#if lecture.previewAvailable}
							<button
								type="button"
								class="btn btn-sm btn-outline btn-primary gap-2 hover-scale"
								onclick={() => openPreview(lecture.id)}
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								미리보기
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
</article>

<!-- Preview Modal -->
{#if previewModalOpen && previewLectureId}
	<dialog class="modal modal-open">
		<div class="modal-box max-w-4xl">
			<h3 class="text-lg font-bold mb-4">강의 미리보기</h3>
			<div class="aspect-video bg-base-200 rounded-xl flex items-center justify-center">
				<div class="text-center space-y-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="text-sm text-base-content/60">미리보기 비디오를 준비 중입니다</p>
				</div>
			</div>
			<div class="modal-action">
				<button type="button" class="btn" onclick={closePreview}>닫기</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop" onsubmit={closePreview}>
			<button type="button">닫기</button>
		</form>
	</dialog>
{/if}
