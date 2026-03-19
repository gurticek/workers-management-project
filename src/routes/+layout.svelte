<script lang="ts">
	import '../app.css';
	import { dataStore } from '$lib/stores/data.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { children } = $props();
	let mobileMenuOpen = $state(false);
	
	const navItems = [
		{ href: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
		{ href: '/workers', label: 'Workers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
		{ href: '/projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
		{ href: '/clients', label: 'Clients', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
		{ href: '/contracts/upload', label: 'Contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
	];

	const currentPath = $derived(page.url?.pathname || '/');

	function isActive(href: string): boolean {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}

	onMount(() => {
		dataStore.init();
	});
</script>

<div class="flex h-screen overflow-hidden">
	<!-- Desktop Sidebar -->
	<aside class="hidden md:flex md:w-56 md:flex-col bg-sidebar shrink-0">
		<div class="flex h-14 items-center px-5 border-b border-white/8">
			<span class="font-heading text-lg font-800 text-sidebar-text-active tracking-tight">▬ WorkForce</span>
		</div>
		<nav class="flex-1 px-3 py-4 space-y-0.5">
			{#each navItems as item}
				{@const active = isActive(item.href)}
				<a
					href={item.href}
					class="flex items-center gap-2.5 px-3 py-2 rounded-md text-[0.8125rem] font-medium transition-colors duration-150
						{active ? 'bg-sidebar-hover text-sidebar-text-active' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'}"
				>
					<svg class="w-[18px] h-[18px] shrink-0 {active ? 'text-primary' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d={item.icon}/>
					</svg>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="px-3 py-4 border-t border-white/8">
			<p class="text-[0.6875rem] text-sidebar-text/50 px-3">WorkForce v1.0</p>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top bar -->
		<header class="flex h-14 items-center justify-between border-b border-border bg-surface-raised px-4 md:px-6 shrink-0">
			<button class="md:hidden p-2 -ml-2 text-ink-secondary hover:text-ink transition-colors" onclick={() => mobileMenuOpen = !mobileMenuOpen}>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
				</svg>
			</button>
			<div class="flex-1"></div>
			<span class="text-xs text-ink-muted font-medium tracking-wide uppercase">Workforce & Projects</span>
		</header>
		
		<main class="flex-1 overflow-y-auto p-4 md:p-8">
			{@render children()}
		</main>
	</div>

	<!-- Mobile overlay -->
	{#if mobileMenuOpen}
		<div class="fixed inset-0 z-50 md:hidden">
			<button class="absolute inset-0 bg-ink/40" onclick={() => mobileMenuOpen = false} aria-label="Close menu"></button>
			<aside class="absolute left-0 top-0 bottom-0 w-56 bg-sidebar shadow-2xl">
				<div class="flex h-14 items-center px-5 border-b border-white/8">
					<span class="font-heading text-lg font-800 text-sidebar-text-active tracking-tight">▬ WorkForce</span>
				</div>
				<nav class="px-3 py-4 space-y-0.5">
					{#each navItems as item}
						{@const active = isActive(item.href)}
						<a
							href={item.href}
							class="flex items-center gap-2.5 px-3 py-2 rounded-md text-[0.8125rem] font-medium transition-colors duration-150
								{active ? 'bg-sidebar-hover text-sidebar-text-active' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'}"
							onclick={() => mobileMenuOpen = false}
						>
							<svg class="w-[18px] h-[18px] shrink-0 {active ? 'text-primary' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon}/>
							</svg>
							{item.label}
						</a>
					{/each}
				</nav>
			</aside>
		</div>
	{/if}
</div>
