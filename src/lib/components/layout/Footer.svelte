<script lang="ts">
	import { SITE_SOURCE, GITHUB_URL_VERT } from "$lib/util/consts";
	import { locale } from "$lib/store/index.svelte";
	let en = $derived($locale === "en");
</script>

<footer
	class="hidden md:block w-full border-t border-separator fixed bottom-0 bg-panel py-4 text-sm"
>
	<div class="flex flex-wrap items-center justify-center gap-4 text-muted">
		<span>© {new Date().getFullYear()} 十三月</span>
		<a
			class="hover:underline"
			href={GITHUB_URL_VERT}
			target="_blank"
			rel="noreferrer">{en ? "Built with VERT" : "基于 VERT"}</a
		>
		<a
			class="hover:underline"
			href={SITE_SOURCE}
			target="_blank"
			rel="noreferrer">{en ? "Site source" : "本站源码"}</a
		>
		<a class="hover:underline" href="/privacy/"
			>{en ? "Privacy" : "隐私说明"}</a
		>
		<a class="hover:underline" href="/terms/">{en ? "Terms" : "使用条款"}</a
		>
		<a class="hover:underline" href="/contact/"
			>{en ? "Contact" : "联系反馈"}</a
		>
	</div>
</footer>
