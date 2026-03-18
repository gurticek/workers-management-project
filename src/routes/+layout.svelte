<script lang="ts">
	import '../app.css';
	import { dataStore } from '$lib/stores/data.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let mobileMenuOpen = $state(false);
	
	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/workers', label: 'Workers', icon: '👷' },
		{ href: '/projects', label: 'Projects', icon: '📁' },
		{ href: '/clients', label: 'Clients', icon: '🏢' },
		{ href: '/contracts/upload', label: 'Upload Contract', icon: '📄' }
	];

	onMount(() => {
		dataStore.init();
	});
</script>

<div class="flex h-screen overflow-hidden bg-surface-alt">
	<!-- Desktop Sidebar -->
	<aside class="hidden md:flex md:w-64 md:flex-col bg-surface border-r border-border">
		<div class="flex h-16 items-center px-6 border-b border-border">
			<h1 class="text-xl font-bold text-accent">⚡ WorkForce</h1>
		</div>
		<nav class="flex-1 px-4 py-4 space-y-1">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors font-medium"
				>
					<span class="text-lg">{item.icon}</span>
					{item.label}
				</a>
			{/each}
		</nav>
	</aside>

	<!-- Main content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top bar -->
		<header class="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
			<button class="md:hidden text-2xl" onclick={() => mobileMenuOpen = !mobileMenuOpen}>☰</button>
			<div class="text-sm text-text-muted">Workforce & Project Management</div>
		</header>
		
		<main class="flex-1 overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>

	<!-- Mobile overlay -->
	{#if mobileMenuOpen}
		<div class="fixed inset-0 z-50 md:hidden">
			<button class="absolute inset-0 bg-black/50" onclick={() => mobileMenuOpen = false}></button>
			<aside class="absolute left-0 top-0 bottom-0 w-64 bg-surface shadow-xl">
				<div class="flex h-16 items-center px-6 border-b border-border">
					<h1 class="text-xl font-bold text-accent">⚡ WorkForce</h1>
				</div>
				<nav class="px-4 py-4 space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors font-medium"
							onclick={() => mobileMenuOpen = false}
						>
							<span class="text-lg">{item.icon}</span>
							{item.label}
						</a>
					{/each}
				</nav>
			</aside>
		</div>
	{/if}
</div>
