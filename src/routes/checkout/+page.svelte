<script lang="ts">
	import CheckoutForm from '$lib/components/CheckoutForm.svelte';
	import { authModalState } from '$lib/stores/ui';
	import type { CourseDetail } from '$lib/types';

	let { data } = $props<{
		data: {
			course: CourseDetail;
			requiresAuth: boolean;
			error?: { message: string } | null;
		};
	}>();

	const openAuthModal = () => authModalState.open();
</script>

<svelte:head>
	<title>결제하기 | {data.course.title}</title>
	<meta name="description" content="선택한 강의를 결제하고 수강을 시작하세요." />
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-3xl space-y-8">
	<div class="space-y-2">
		<h1 class="text-3xl font-semibold">결제하기</h1>
		<p class="text-sm text-base-content/80">빠르고 안전한 결제 시스템으로 바로 학습을 시작하세요.</p>
	</div>

	{#if data.error}
		<div role="alert" class="alert alert-warning text-sm">
			{data.error.message}
		</div>
	{/if}

	{#if data.requiresAuth}
		<div role="alert" class="alert alert-info flex items-center justify-between gap-4 text-sm">
			<span>로그인이 필요합니다. SNS 계정으로 간편하게 로그인하고 결제를 진행하세요.</span>
			<button type="button" class="btn btn-primary btn-sm" onclick={openAuthModal}>
				로그인하기
			</button>
		</div>
	{/if}

	<CheckoutForm course={data.course} disabled={data.requiresAuth} />
</section>
