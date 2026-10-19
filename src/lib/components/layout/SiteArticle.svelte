<script lang="ts">
	import { locale } from "$lib/store/index.svelte";
	import { siteContent } from "$lib/site-content";
	import { SITE_SOURCE, GITHUB_URL_VERT } from "$lib/util/consts";
	let { kind }: { kind: keyof typeof siteContent } = $props();
	let en = $derived($locale === "en");
	let content = $derived(siteContent[kind][en ? "en" : "zh"]);
</script>

<svelte:head><title>{content.title} · 十三月格式转换</title></svelte:head>
<article
	class="mx-auto w-full max-w-4xl rounded-2xl bg-panel p-6 md:p-10 shadow-panel font-normal"
>
	<h1 class="text-3xl font-bold mb-6">{content.title}</h1>
	<p class="leading-relaxed mb-8">{content.intro}</p>
	{#each content.sections as section}
		<section id={"id" in section ? section.id : undefined} class="mb-8">
			<h2 class="text-xl font-bold mb-3">{section.title}</h2>
			{#each section.paragraphs as paragraph}<p
					class="leading-relaxed mb-3"
				>
					{paragraph}
				</p>{/each}
		</section>
	{/each}
	<nav
		class="flex flex-wrap gap-4 border-t border-separator pt-5 text-sm"
		aria-label={en ? "Site information" : "网站信息"}
	>
		<a class="underline" href="/about/">{en ? "About" : "关于本站"}</a>
		<a class="underline" href="/privacy/">{en ? "Privacy" : "隐私说明"}</a>
		<a class="underline" href="/terms/">{en ? "Terms" : "使用条款"}</a>
		<a class="underline" href="/contact/">{en ? "Contact" : "联系反馈"}</a>
		<a class="underline" href={SITE_SOURCE} target="_blank" rel="noreferrer"
			>{en ? "Site source" : "本站源码"}</a
		>
		<a
			class="underline"
			href={GITHUB_URL_VERT}
			target="_blank"
			rel="noreferrer">VERT</a
		>
		<a class="underline" href="/LICENSE">AGPL-3.0</a>
		<a class="underline" href="/THIRD-PARTY-NOTICES.txt"
			>{en ? "Third-party notices" : "第三方许可"}</a
		>
	</nav>
</article>
