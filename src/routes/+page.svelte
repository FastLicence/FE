<script lang="ts">
	import CourseCard from '$lib/components/CourseCard.svelte';
	import { authModalState } from '$lib/stores/ui';
	import type { CourseSummary } from '$lib/types';

	let { data } = $props<{
		data: { featuredCourses: CourseSummary[]; error: { message: string } | null };
	}>();

	const openAuthModal = () => {
		authModalState.open();
	};
</script>

<svelte:head>
	<title>FastLicense | 자격증 합격을 위한 빠른 학습 플랫폼</title>
	<meta
		name="description"
		content="FastLicense에서 인기 강의를 만나보세요. 맞춤 커리큘럼과 실전 대비 콘텐츠로 자격증 합격을 빠르게 준비합니다."
	/>
	<meta property="og:title" content="FastLicense | 자격증 합격을 위한 빠른 학습 플랫폼" />
	<meta property="og:description" content="실전 대비 커리큘럼과 AI 학습 리포트로 합격을 앞당기세요." />
	<meta property="og:type" content="website" />
</svelte:head>

<section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-base-100 border border-base-300 shadow-2xl">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-30">
		<div class="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
		<div class="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
	</div>

	<div class="hero relative px-6 py-16 md:py-24">
		<div class="hero-content flex-col gap-12 lg:flex-row lg:gap-16">
			<div class="max-w-2xl space-y-8 animate-fade-in">
				<div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 shadow-md border border-primary/20">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					<span class="text-sm font-bold text-primary uppercase tracking-wide">#자격증 합격 메이커</span>
				</div>

				<h1 class="text-5xl md:text-6xl font-black leading-tight">
					<span class="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
						AI 기반 커리큘럼
					</span>으로
					<br />합격까지 빠르게 가세요
				</h1>

				<p class="text-lg md:text-xl leading-relaxed text-base-content/70">
					실전 CBT 데이터와 합격생 노트를 분석한 커리큘럼으로<br class="hidden sm:block" />
					필요한 부분만 빠르게 학습하세요.
					<span class="font-semibold text-primary">개인 맞춤형 학습 리포트</span>까지 모두 제공됩니다.
				</p>

				<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
					<!-- Primary CTA with Gradient - Always white text -->
					<a
						href="/courses"
						class="group relative btn btn-lg bg-gradient-to-r from-primary via-primary to-accent border-0 text-white hover:text-white shadow-2xl hover:shadow-[0_20px_50px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 px-8 gap-3 font-bold text-base overflow-hidden"
					>
						<span class="relative z-10">인기 강의 살펴보기</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</a>

				</div>

				<!-- Stats Grid -->
				<div class="grid grid-cols-3 gap-4 pt-6">
					<div class="space-y-1 text-center">
						<div class="text-3xl md:text-4xl font-bold text-primary">92%</div>
						<div class="text-xs md:text-sm text-base-content/60">최근 30일<br />합격률</div>
					</div>
					<div class="space-y-1 text-center border-x border-base-300">
						<div class="text-3xl md:text-4xl font-bold text-accent">3,240+</div>
						<div class="text-xs md:text-sm text-base-content/60">학습 중인<br />수강생</div>
					</div>
					<div class="space-y-1 text-center">
						<div class="text-3xl md:text-4xl font-bold text-secondary">8,540+</div>
						<div class="text-xs md:text-sm text-base-content/60">강의 누적<br />후기</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="mt-20 space-y-8">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-2">
			<h2 class="text-3xl md:text-4xl font-bold">추천 강의</h2>
			<p class="text-base text-base-content/60">합격생들이 선택한 인기 커리큘럼을 모았어요</p>
		</div>
		<a href="/courses" class="btn btn-outline btn-primary gap-2 hover-scale group">
			전체 강의 보기
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
				<path
					d="M12.293 4.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 1 1-1.414-1.414L14.586 10H3a1 1 0 1 1 0-2h11.586l-2.293-2.293a1 1 0 0 1 0-1.414"
				/>
			</svg>
		</a>
	</div>

	{#if data.error}
		<div role="alert" class="alert alert-warning shadow-md rounded-2xl">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<span>{data.error.message}</span>
		</div>
	{/if}

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each data.featuredCourses as course, index}
			<div style="animation-delay: {index * 100}ms" class="animate-fade-in">
				<CourseCard {course} />
			</div>
		{/each}
	</div>
</section>

<!-- Features Section -->
<section class="mt-24 card-modern overflow-hidden p-0">
	<div class="bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12 text-center">
		<h2 class="text-3xl md:text-4xl font-bold mb-3">왜 FastLicense를 선택해야 할까요?</h2>
		<p class="text-base text-base-content/60 max-w-2xl mx-auto">
			단순한 강의 플랫폼을 넘어, AI 기반 맞춤 학습 시스템으로<br class="hidden sm:block" />
			여러분의 합격을 완벽하게 지원합니다
		</p>
	</div>

	<div class="grid gap-0 md:grid-cols-3">
		<article class="group p-8 space-y-4 hover:bg-primary/5 transition-all duration-300 border-r border-b border-base-300">
			<div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
				</svg>
			</div>
			<h3 class="text-xl font-bold">CBT 실전 모의고사</h3>
			<p class="text-sm text-base-content/70 leading-relaxed">
				실제 시험 난이도에 맞춘 모의고사를 <span class="font-semibold text-primary">무제한으로</span> 응시하고,
				AI가 취약 영역을 정확하게 분석해 드립니다.
			</p>
		</article>

		<article class="group p-8 space-y-4 hover:bg-accent/5 transition-all duration-300 border-r md:border-r-0 lg:border-r border-b border-base-300">
			<div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
			</div>
			<h3 class="text-xl font-bold">합격생 요약노트</h3>
			<p class="text-sm text-base-content/70 leading-relaxed">
				자주 틀리는 개념과 핵심 암기 포인트를 <span class="font-semibold text-accent">단권화 노트</span>로 제공해
				단기 학습에 최적화했습니다.
			</p>
		</article>

		<article class="group p-8 space-y-4 hover:bg-secondary/5 transition-all duration-300 border-b md:border-b-0 border-base-300">
			<div class="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
			</div>
			<h3 class="text-xl font-bold">학습 리마인더</h3>
			<p class="text-sm text-base-content/70 leading-relaxed">
				일정에 맞춰 학습 리마인더를 전송하고,
				진도율에 따라 <span class="font-semibold text-secondary">맞춤형 복습 가이드</span>를 추천해 드립니다.
			</p>
		</article>
	</div>
</section>
