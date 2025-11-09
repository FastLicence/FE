<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import type { CourseDetail, PaymentConfirmation } from '$lib/types';
	import { formatCurrency } from '$lib/utils/format';

	let { data } = $props<{
		data: {
			orderNumber: string;
			confirmation: PaymentConfirmation;
			course: CourseDetail | null;
			error?: { message: string } | null;
		};
	}>();

	const isSuccess = data.confirmation.status === 'paid';
	const courseAmount = data.course ? formatCurrency(data.course.salePrice ?? data.course.originalPrice) : null;

	let heroHeading = $state<HTMLHeadingElement | null>(null);
	let isOrderNumberCopied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;

	const handleCopyOrderNumber = async () => {
		if (!browser || !navigator?.clipboard) return;

		try {
			await navigator.clipboard.writeText(data.orderNumber);
			isOrderNumberCopied = true;
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				isOrderNumberCopied = false;
			}, 2000);
		} catch (error) {
			console.error('order number copy failed', error);
		}
	};

	onMount(() => {
		if (heroHeading) heroHeading.focus();
	});

	onDestroy(() => {
		if (copyTimeout) clearTimeout(copyTimeout);
	});
</script>

<svelte:head>
	<title>결제 완료 | FastLicense</title>
	<meta name="description" content="결제가 완료되었습니다. 수강을 시작해보세요." />
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-3xl space-y-8 animate-fade-in">
	{#if data.error}
		<div role="status" class="alert alert-warning shadow-md rounded-2xl text-sm">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<span>{data.error.message}</span>
		</div>
	{/if}

	{#if isSuccess}
		<!-- Success State -->
		<div class="text-center space-y-6">
			<!-- Success Icon with Animation -->
			<div class="relative inline-block" aria-hidden="true">
				<div class="success-burst mx-auto">
					<div class="success-burst__circle">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<span class="success-burst__emoji">🎉</span>
					<span class="success-burst__emoji success-burst__emoji--delay150">🎊</span>
					<span class="success-burst__emoji success-burst__emoji--delay300">✨</span>
					<span class="success-burst__emoji success-burst__emoji--delay450">🎈</span>
				</div>
			</div>

			<!-- Success Message -->
			<div class="space-y-3" aria-live="polite">
				<h1
					class="text-4xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent focus:outline-none"
					tabindex="-1"
					bind:this={heroHeading}
				>
					결제가 완료되었습니다!
				</h1>
				<div class="flex flex-col items-center gap-2 text-lg text-base-content/80">
					<div class="flex flex-wrap items-center justify-center gap-2">
						<span>주문번호</span>
						<span class="font-mono font-bold text-primary">{data.orderNumber}</span>
						<button
							type="button"
							class="btn btn-ghost btn-xs border border-base-300 hover:border-primary/50"
							onclick={handleCopyOrderNumber}
							aria-live="polite"
						>
							복사
						</button>
					</div>
					{#if isOrderNumberCopied}
						<span class="text-sm text-success font-medium">클립보드에 복사되었습니다.</span>
					{/if}
				</div>
				<p class="text-base text-base-content/60">
					결제가 확인되었습니다. 이제 학습을 시작해보세요!
				</p>
			</div>

			<!-- CTA Button -->
			<div class="flex flex-col items-center gap-3">
				<a
					href="/mypage"
					class="btn btn-lg bg-gradient-to-r from-primary to-accent border-0 text-white hover:brightness-110 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 gap-2 inline-flex"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					마이페이지에서 학습 시작하기
				</a>
				<a href="/courses" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">내 강의실 바로가기 →</a>
			</div>
		</div>
	{:else}
		<!-- Error State -->
		<div class="text-center space-y-6" aria-live="polite">
			<div class="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mx-auto">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<div class="space-y-2">
				<h1 class="text-3xl font-bold">결제 상태 확인 실패</h1>
				<p class="text-base text-base-content/70">
					주문번호 <span class="font-mono font-semibold">{data.orderNumber}</span>에 대한 결제 정보를 불러오지 못했습니다.
				</p>
				<p class="text-sm text-base-content/60">
					잠시 후 다시 시도하거나 고객센터에 문의해주세요.
				</p>
			</div>
			<a href="/support" class="btn btn-outline btn-lg gap-2 inline-flex">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
				고객센터 문의하기
			</a>
		</div>
	{/if}

	<!-- Order Details Card -->
	{#if data.course}
		<div class="card-modern overflow-hidden shadow-xl">
			<div class="bg-gradient-to-r from-primary/5 to-accent/5 p-4 border-b border-base-300">
				<h2 class="text-lg font-bold flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					주문 정보
				</h2>
			</div>
			<div class="p-6 space-y-4">
				<div class="grid md:grid-cols-2 gap-6">
					<div class="space-y-2">
						<p class="text-xs font-semibold text-base-content/60 uppercase">수강 강의</p>
						<p class="text-lg font-bold">{data.course.title}</p>
						<div class="flex items-center gap-2 text-sm text-base-content/70">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							{data.course.instructor}
						</div>
					</div>
					<div class="space-y-2 text-right md:text-left">
						<p class="text-xs font-semibold text-base-content/60 uppercase">결제 금액</p>
						<p class="text-2xl font-bold text-primary">
							{courseAmount}
						</p>
						<p class="text-sm text-base-content/60">영수증은 이메일로 자동 발송되며, 마이페이지 &gt; 결제 내역에서도 확인할 수 있어요.</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Next Steps -->
	<div class="card-modern p-6 space-y-4">
		<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
			<h2 class="text-xl font-bold flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" />
				</svg>
				다음 단계 안내
			</h2>
			<span class="text-sm text-base-content/60">3분만 투자하면 학습 준비가 끝나요</span>
		</div>
		<div class="grid gap-3 sm:grid-cols-3">
			<article class="rounded-2xl border border-base-200 p-4 space-y-2">
				<div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 class="font-semibold">학습 목표 설정</h3>
				<p class="text-sm text-base-content/70">마이페이지에서 주차별 목표를 입력하고 AI 코칭을 받아보세요.</p>
			</article>
			<article class="rounded-2xl border border-base-200 p-4 space-y-2">
				<div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
				</div>
				<h3 class="font-semibold">학습 알림 켜기</h3>
				<p class="text-sm text-base-content/70">주 2회 진행 상황 알림을 받아 꾸준함을 지켜보세요.</p>
			</article>
			<article class="rounded-2xl border border-base-200 p-4 space-y-2">
				<div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
					</svg>
				</div>
				<h3 class="font-semibold">즐겨찾기 추가</h3>
				<p class="text-sm text-base-content/70">자주 보는 강의를 즐겨찾기에 추가해 빠르게 복습하세요.</p>
			</article>
		</div>
	</div>

	<div class="text-center text-sm text-base-content/70 space-y-2">
		<p>영수증 재발송 또는 환불 문의는 고객센터에서 도와드릴게요.</p>
		<a href="/support" class="btn btn-outline btn-sm gap-2 inline-flex">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			고객센터 바로가기
		</a>
	</div>
</section>

<style>
	@keyframes pop-in {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		60% {
			transform: scale(1.05);
			opacity: 1;
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes confetti-fade {
		0% {
			opacity: 0;
			transform: translateY(-6px);
		}
		30% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	.success-burst {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 8rem;
		height: 8rem;
	}

	.success-burst__circle {
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		background-image: linear-gradient(to bottom right, hsl(var(--su)), hsl(var(--su)) / 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 20px 45px rgba(34, 197, 94, 0.25);
		animation: pop-in 600ms ease-out both;
	}

	.success-burst__emoji {
		position: absolute;
		font-size: 2rem;
		animation: confetti-fade 1.6s ease forwards;
	}

	.success-burst__emoji:nth-child(2) {
		top: -0.75rem;
		left: -0.75rem;
	}

	.success-burst__emoji:nth-child(3) {
		top: -0.75rem;
		right: -0.75rem;
	}

	.success-burst__emoji:nth-child(4) {
		bottom: -0.5rem;
		left: -0.25rem;
	}

	.success-burst__emoji:nth-child(5) {
		bottom: -0.5rem;
		right: -0.25rem;
	}

	.success-burst__emoji--delay150 {
		animation-delay: 150ms;
	}

	.success-burst__emoji--delay300 {
		animation-delay: 300ms;
	}

	.success-burst__emoji--delay450 {
		animation-delay: 450ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.success-burst__circle,
		.success-burst__emoji {
			animation: none;
		}
	}
</style>
