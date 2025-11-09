<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let status = $state<string | null>(null);
	let loading = $state(false);
	let hasSession = $state(false);

	const mockLinkGroups = [
		{
			title: '공개 페이지',
			description: '로그인 없이 목업 데이터가 바로 보이는 경로',
			items: [
				{ href: '/', label: '홈(랜딩)', note: '히어로 + 대표 강의 카드' },
				{ href: '/courses', label: '강의 목록', note: '검색/필터 포함' },
				{ href: '/courses/course-ai-accelerator', label: '강의 상세', note: 'mockCourses[0]' }
			]
		},
		{
			title: '로그인 필요 페이지',
			description: '아래 경로는 sb-access-token 쿠키가 있어야 전체 UI가 보입니다.',
			items: [
				{ href: '/mypage', label: '마이페이지', note: '프로필 + 진행 강의' },
				{ href: '/learning', label: '학습 홈', note: '마이페이지 데이터 재사용' },
				{ href: '/learning/mock-lecture-1', label: '학습 플레이어', note: '진행률/노트 목업' },
				{ href: '/checkout?courseId=course-ai-accelerator', label: '결제 페이지', note: '수강권 확인' },
				{ href: '/checkout/success?orderNumber=MOCK-ORDER', label: '결제 완료', note: '주문 요약' }
			]
		}
	];

	const hasMockSession = () => {
		if (!browser) return false;
		return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('sb-access-token='));
	};

	const syncSessionState = () => {
		hasSession = hasMockSession();
	};

	onMount(() => {
		syncSessionState();
	});

	const callAction = async (action: 'set' | 'clear') => {
		loading = true;
		status = null;
		try {
			const response = await fetch('/dev/mock-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action })
			});
			const result = (await response.json()) as { message?: string };
			status = result.message ?? (action === 'set' ? '세션이 설정되었습니다.' : '세션이 삭제되었습니다.');
			syncSessionState();
		} catch (error) {
			status =
				error instanceof Error ? error.message : '요청을 처리할 수 없습니다. 콘솔을 확인해주세요.';
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Mock Session Helper | FastLicense</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-base-300 bg-base-100 p-8 shadow-lg">
	<header class="space-y-3">
		<h1 class="text-3xl font-semibold">Mock Session Helper</h1>
		<p class="text-sm text-base-content/70 leading-relaxed">
			백엔드가 준비되지 않은 상태에서도 보호 페이지를 테스트할 수 있도록
			<code class="badge badge-sm badge-outline">sb-access-token</code> 쿠키를 설정하거나 제거합니다.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<button
			type="button"
			class="btn btn-primary btn-lg"
			onclick={() => callAction('set')}
			disabled={loading}
			class:loading={loading}
		>
			모의 로그인 쿠키 설정
		</button>
		<button
			type="button"
			class="btn btn-outline btn-error btn-lg"
			onclick={() => callAction('clear')}
			disabled={loading}
			class:loading={loading}
		>
			쿠키 제거
		</button>
	</div>

	{#if status}
		<div role="status" class="alert alert-info text-sm">
			{status}
		</div>
	{/if}

	<div class="rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-4 text-sm flex items-center gap-3">
		<span class={`badge ${hasSession ? 'badge-success' : 'badge-ghost'} badge-lg`}>
			{hasSession ? '세션 활성화됨' : '세션 없음'}
		</span>
		<p class="text-base-content/70">
			{hasSession
				? '보호 페이지에서 목업 데이터가 바로 표시됩니다.'
				: '로그인 필요한 경로에 접근하기 전에 모의 로그인 쿠키를 먼저 설정하세요.'}
		</p>
	</div>

	<section class="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-6">
		<h2 class="text-xl font-semibold">현재 목업 데이터가 붙어 있는 페이지</h2>
		<p class="text-sm text-base-content/70">
			모든 경로는 Supabase 백엔드 연동 전까지 목업 JSON으로 동작합니다. 로그인 필요 페이지는 모의 세션이 설정된
			상태에서 확인하세요.
		</p>
		<div class="space-y-6">
			{#each mockLinkGroups as group}
				<div class="space-y-3">
					<div class="flex items-center justify-between gap-3">
						<div>
							<h3 class="text-lg font-semibold">{group.title}</h3>
							<p class="text-xs text-base-content/60">{group.description}</p>
						</div>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each group.items as item}
							<a class="card border border-base-200 p-3 hover:border-primary/40 transition-colors" href={item.href}>
								<div class="flex flex-col gap-1.5">
									<div class="flex items-center justify-between gap-2">
										<span class="text-sm font-semibold text-base-content">{item.label}</span>
										{#if group.title === '로그인 필요 페이지'}
											<span class="badge badge-ghost badge-xs text-[10px]">로그인 필요</span>
										{/if}
									</div>
									<span class="text-xs text-base-content/60">{item.href}</span>
									{#if item.note}
										<span class="text-[11px] text-base-content/50">{item.note}</span>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="space-y-3 rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-sm text-base-content/70">
		<h2 class="text-lg font-semibold text-base-content">추가 참고</h2>
		<ul class="list-disc space-y-2 pl-5">
			<li>
				모의 세션은 HTTP-only가 아니므로 브라우저 개발자 도구에서 <code>sb-access-token</code>을 바로 확인하고
				삭제할 수 있습니다.
			</li>
			<li>
				실제 백엔드가 붙으면 이 페이지 대신 Supabase 로그인 흐름으로 쿠키가 발급될 예정입니다.
			</li>
			<li>
				테마나 UI 점검 시 라이트/다크 전환을 함께 확인하면 대비가 올바르게 적용되었는지 빠르게 검증할 수 있습니다.
			</li>
		</ul>
	</section>
</section>
