<script lang="ts">
	import {
		saveLearningNote,
		saveLearningProgress,
		submitLearningQuestion
	} from '$lib/api';
	import { authModalState } from '$lib/stores/ui';
	import type { LearningLectureData, NoteEntry } from '$lib/types';
	import { formatDuration } from '$lib/utils/format';
	import { onMount } from 'svelte';

let { data } = $props<{
	data: {
		requiresAuth?: boolean;
		forbidden?: boolean;
		error?: { message: string } | null;
		courseId?: string;
		lesson?: LearningLectureData;
		lectureId: string;
	};
}>();

	let notes = $state<NoteEntry[]>(data.lesson?.notes ?? []);
	let memoContent = $state('');
	let questionContent = $state('');
	let memoStatus = $state('');
	let questionStatus = $state('');
	let activeTab = $state<'summary' | 'memo' | 'qa'>('summary');

	let videoElement = $state<HTMLVideoElement | null>(null);
	let lastProgressSent = 0;

	const openAuthModal = () => authModalState.open();

	const summaryNotes = $derived(notes.filter((note) => note.noteType === 'auto_summary'));
	const memoNotes = $derived(notes.filter((note) => note.noteType === 'user_memo'));
	const questionNotes = $derived(notes.filter((note) => note.noteType === 'qa_answer'));

	onMount(() => {
		if (videoElement && data.lesson?.progress?.secondsWatched) {
			videoElement.currentTime = data.lesson.progress.secondsWatched;
		}
	});

	const handleProgress = async () => {
		if (!data.lesson || !videoElement || Number.isNaN(videoElement.duration) || videoElement.duration === 0) {
			return;
		}
		const now = Date.now();
		if (now - lastProgressSent < 5000) return;
		lastProgressSent = now;
		const percent = Math.min(100, Math.round((videoElement.currentTime / videoElement.duration) * 100));
		await saveLearningProgress(fetch, {
			lectureId: data.lesson.lecture.id,
			secondsWatched: Math.floor(videoElement.currentTime),
			percent
		});
	};

	const submitMemo = async () => {
		if (!memoContent.trim()) return;
		memoStatus = '';
		const result = await saveLearningNote(fetch, {
			lectureId: data.lesson!.lecture.id,
			noteType: 'user_memo',
			content: memoContent.trim()
		});
		if (!result.data) {
			memoStatus = result.error?.message ?? '메모를 저장할 수 없습니다.';
			return;
		}
		notes = [result.data, ...notes];
		memoContent = '';
		memoStatus = '메모를 저장했습니다.';
	};

	const submitQuestion = async () => {
		if (!questionContent.trim()) return;
		questionStatus = '';
		const result = await submitLearningQuestion(
			fetch,
			data.lesson!.lecture.id,
			questionContent.trim()
		);
		if (!result.data) {
			questionStatus = result.error?.message ?? '질문을 전송할 수 없습니다.';
			return;
		}
		notes = [result.data, ...notes];
		questionContent = '';
		questionStatus = '질문을 전송했습니다. 답변을 기다려주세요!';
	};
</script>

<svelte:head>
	<title>학습하기 | {data.lesson?.course.title ?? 'FastLicense'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if data.requiresAuth}
	<section class="rounded-box border border-base-200 bg-base-200 p-10 text-center shadow-sm">
		<p class="mb-4 text-base">로그인 후 학습을 시작할 수 있습니다.</p>
		<button type="button" class="btn btn-primary" onclick={openAuthModal}>
			로그인하기
		</button>
	</section>
{:else if data.forbidden}
	<section class="rounded-box border border-base-200 bg-base-200 p-10 text-center shadow-sm">
		<p class="mb-4 text-base">수강권이 없는 강의입니다. 강의 페이지에서 수강 신청 후 다시 시도해주세요.</p>
		<a href={`/courses/${data.courseId ?? ''}`} class="btn btn-primary">강의 페이지로 이동</a>
	</section>
{:else if data.error}
	<section class="alert alert-error flex items-center justify-between">
		<span>{data.error.message}</span>
		<a href="/courses" class="btn btn-outline btn-sm">강의 목록</a>
	</section>
{:else if data.lesson}
	<section class="space-y-8 animate-fade-in">
		<!-- Header -->
		<header class="space-y-3">
			<nav class="flex items-center gap-2 text-sm text-base-content/60">
				<a href="/mypage" class="hover:text-primary transition-colors">마이페이지</a>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span>{data.lesson.course.title}</span>
			</nav>
			<div>
				<h1 class="text-3xl font-bold">{data.lesson.lecture.title}</h1>
				<p class="text-base text-base-content/60 mt-1">{data.lesson.course.title}</p>
			</div>
		</header>

		<div class="grid gap-8 lg:grid-cols-[2fr,1fr]">
			<!-- Video Player -->
			<div class="space-y-6">
				<div class="card-modern overflow-hidden shadow-2xl">
					<video
						bind:this={videoElement}
						src={data.lesson.lecture.videoUrl}
						controls
						class="w-full aspect-video bg-black"
						ontimeupdate={handleProgress}
					>
						<track kind="captions" srclang="ko" label="한국어 자막" src="data:text/vtt,WEBVTT" default />
					</video>
				</div>
				{#if data.lesson.lecture.description}
					<div class="card-modern p-6">
						<h3 class="text-lg font-bold mb-3 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							강의 설명
						</h3>
						<p class="text-sm leading-relaxed text-base-content/70">{data.lesson.lecture.description}</p>
					</div>
				{/if}
			</div>

			<!-- Sidebar: Other Lectures -->
			<aside class="space-y-4">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
						</svg>
					</div>
					<h3 class="text-lg font-bold">강의 목록</h3>
				</div>
				<div class="card-modern p-3 max-h-[600px] overflow-y-auto">
					<ul class="space-y-2">
						{#each data.lesson.siblings as sibling, index}
							<li>
								<a
									href={`/learning/${sibling.id}`}
									class={`block rounded-xl p-3 transition-all duration-300 ${
										sibling.id === data.lesson.lecture.id
											? 'bg-primary/10 border-2 border-primary shadow-md'
											: 'border border-base-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
									}`}
								>
									<div class="flex items-start gap-3">
										<div class={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
											sibling.id === data.lesson.lecture.id
												? 'bg-primary text-white'
												: 'bg-base-200 text-base-content'
										}`}>
											<span class="text-xs font-bold">{index + 1}</span>
										</div>
										<div class="flex-1 min-w-0">
											<p class={`text-sm font-semibold line-clamp-2 ${
												sibling.id === data.lesson.lecture.id ? 'text-primary' : ''
											}`}>
												{sibling.title}
											</p>
											{#if sibling.durationMinutes}
												<div class="flex items-center gap-1.5 text-xs text-base-content/60 mt-1">
													<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													{formatDuration(sibling)}
												</div>
											{/if}
										</div>
										{#if sibling.id === data.lesson.lecture.id}
											<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										{/if}
									</div>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</aside>
		</div>

		<!-- Notes & Q&A Tabs -->
		<div class="card-modern overflow-hidden">
			<div class="tabs tabs-boxed bg-base-200/50 border-b border-base-300 p-2">
				<button
					type="button"
					class={`tab gap-2 ${activeTab === 'summary' ? 'tab-active' : ''}`}
					onclick={() => (activeTab = 'summary')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					요점 노트
				</button>
				<button
					type="button"
					class={`tab gap-2 ${activeTab === 'memo' ? 'tab-active' : ''}`}
					onclick={() => (activeTab = 'memo')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
					내 메모
				</button>
				<button
					type="button"
					class={`tab gap-2 ${activeTab === 'qa' ? 'tab-active' : ''}`}
					onclick={() => (activeTab = 'qa')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Q&A
				</button>
			</div>

			<div class="p-6">
				{#if activeTab === 'summary'}
					<div class="space-y-4">
						{#if summaryNotes.length > 0}
							{#each summaryNotes as note}
								<article class="rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 p-6 border border-base-300 shadow-sm">
									<div class="prose prose-sm max-w-none">
										<p class="leading-relaxed">{note.content}</p>
									</div>
									<p class="mt-3 text-xs text-base-content/50 flex items-center gap-1.5">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{new Date(note.createdAt).toLocaleString()}
									</p>
								</article>
							{/each}
						{:else}
							<div class="text-center py-12">
								<div class="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<p class="text-sm text-base-content/60">아직 자동 요약이 생성되지 않았습니다</p>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'memo'}
					<div class="space-y-6">
						<div class="space-y-3">
							<textarea
								class="textarea textarea-bordered w-full min-h-32"
								placeholder="학습하면서 기억하고 싶은 내용을 메모하세요"
								bind:value={memoContent}
							></textarea>
							<div class="flex items-center gap-3">
								<button type="button" class="btn btn-primary gap-2" onclick={submitMemo}>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									메모 저장
								</button>
								{#if memoStatus}
									<span class="text-sm text-success font-medium">{memoStatus}</span>
								{/if}
							</div>
						</div>
						<div class="divider">저장된 메모</div>
						<div class="space-y-3">
							{#each memoNotes as note}
								<article class="rounded-xl border border-base-300 bg-base-100 p-4 hover:shadow-md transition-shadow">
									<p class="text-sm leading-relaxed whitespace-pre-line">{note.content}</p>
									<p class="mt-3 text-xs text-base-content/50 flex items-center gap-1.5">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{new Date(note.createdAt).toLocaleString()}
									</p>
								</article>
							{/each}
							{#if memoNotes.length === 0}
								<div class="text-center py-8">
									<p class="text-sm text-base-content/60">저장된 메모가 없습니다</p>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="space-y-6">
						<div class="space-y-3">
							<textarea
								class="textarea textarea-bordered w-full min-h-32"
								placeholder="궁금한 내용을 질문해보세요"
								bind:value={questionContent}
							></textarea>
							<div class="flex items-center gap-3">
								<button type="button" class="btn btn-primary gap-2" onclick={submitQuestion}>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									질문 전송
								</button>
								{#if questionStatus}
									<span class="text-sm text-success font-medium">{questionStatus}</span>
								{/if}
							</div>
						</div>
						<div class="divider">질문 & 답변</div>
						<div class="space-y-4">
							{#each questionNotes as note}
								<article class="rounded-xl border border-base-300 bg-base-100 p-5 hover:shadow-md transition-shadow">
									{#if note.question}
										<div class="flex items-start gap-3 mb-3">
											<div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
												<span class="text-xs font-bold text-primary">Q</span>
											</div>
											<p class="font-semibold text-base-content flex-1">{note.question}</p>
										</div>
									{/if}
									<div class="flex items-start gap-3">
										<div class="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
											<span class="text-xs font-bold text-accent">A</span>
										</div>
										<p class="text-sm leading-relaxed text-base-content/80 flex-1 whitespace-pre-line">{note.content}</p>
									</div>
									<p class="mt-3 text-xs text-base-content/50 flex items-center gap-1.5 ml-9">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{new Date(note.createdAt).toLocaleString()}
									</p>
								</article>
							{/each}
							{#if questionNotes.length === 0}
								<div class="text-center py-8">
									<p class="text-sm text-base-content/60">등록된 Q&A가 없습니다</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}
