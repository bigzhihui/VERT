<script lang="ts">
	import { locale } from "$lib/store/index.svelte";
	let en = $derived($locale === "en");
	const groups = [
		{
			zh: "图片",
			en: "Images",
			pairs: "PNG → WebP / JPG；JPG → PNG；WebP → PNG；SVG → PNG",
			zhCheck: "下载后可解码，尺寸保持 120 × 80",
			enCheck: "Downloaded images decode at 120 × 80",
		},
		{
			zh: "音频",
			en: "Audio",
			pairs: "WAV → MP3 / FLAC；MP3 → WAV；FLAC → WAV",
			zhCheck: "输出包含音轨，自制 1 秒样例时长正确",
			enCheck:
				"Output contains an audio track; one-second sample duration verified",
		},
		{
			zh: "文档",
			en: "Documents",
			pairs: "Markdown ↔ DOCX；Markdown ↔ HTML；Markdown ↔ EPUB",
			zhCheck: "检查文档结构并确认中文内容保留",
			enCheck: "Document structure and Chinese text verified",
		},
		{
			zh: "视频",
			en: "Video",
			pairs: "MP4（H.264）→ MKV / WebM；MKV（H.264）→ MP4",
			zhCheck: "检查输出视频轨道与 1 秒时长；样例不含音轨",
			enCheck:
				"Video track and one-second duration verified; samples contain no audio",
		},
	];
</script>

<svelte:head
	><title
		>{en ? "Formats and limitations" : "支持范围与实测结果"} · 十三月格式转换</title
	></svelte:head
>
<article
	class="mx-auto w-full max-w-4xl rounded-2xl bg-panel p-6 md:p-10 shadow-panel font-normal"
>
	<h1 class="text-3xl font-bold mb-5">
		{en ? "Formats and limitations" : "支持范围与实测结果"}
	</h1>
	<p class="leading-relaxed mb-5">
		{en
			? "Files stay in your browser. Choose a target format, convert and check the downloaded output. The engine format list describes capabilities; it does not guarantee every file or format pair."
			: "文件在浏览器中处理。选择目标格式、转换并下载后，请检查输出内容。引擎格式列表表示可识别的格式，不代表所有文件或每一种组合都已验证。"}
	</p>
	<h2 class="text-xl font-bold mb-3">
		{en
			? "18 sample conversions verified · 2026-10-19"
			: "已实测 18 个转换组合 · 2026-10-19"}
	</h2>
	<p class="text-sm mb-5">
		{en
			? "Tested on the live HTTPS site using desktop Google Chrome and small synthetic files. These results do not establish compatibility with other browsers, mobile codecs, large files or complex document layouts."
			: "在正式 HTTPS 站点使用桌面 Google Chrome 和自制小文件完成。结果不代表 Safari、Firefox、手机编码、大文件或复杂文档排版均兼容。"}
	</p>
	<div class="space-y-4 mb-8">
		{#each groups as group}
			<section class="border border-separator rounded-xl p-4">
				<h3 class="font-bold mb-2">{en ? group.en : group.zh}</h3>
				<p class="break-words mb-2">{group.pairs}</p>
				<p class="text-sm">{en ? group.enCheck : group.zhCheck}</p>
			</section>
		{/each}
	</div>
	<h2 class="text-xl font-bold mb-3">
		{en ? "Currently unavailable" : "当前未开放的能力"}
	</h2>
	<p class="mb-4">
		{en
			? "This deployment does not support PDF, XLS/XLSX, PPT/PPTX or legacy DOC conversion. It has no server conversion or remote video fallback. RTF is input-only; JSON means Pandoc document JSON, not arbitrary application data."
			: "当前文档引擎不支持 PDF、XLS/XLSX、PPT/PPTX 或老版 DOC 转换。本站没有服务器转换或远程视频回退。RTF 仅支持作为输入；JSON 指 Pandoc 文档结构，不是任意业务数据。"}
	</p>
	<p class="mb-6">
		<a
			class="underline"
			href="https://pdf.afeiii.com/"
			target="_blank"
			rel="noopener noreferrer"
			>{en
				? "For PDF merging, splitting and image conversion, visit Thirteen Month PDF."
				: "PDF 合并、拆分及图片转换，请前往十三月 PDF 工具。"}</a
		>
	</p>
	<h2 class="text-xl font-bold mb-3">
		{en ? "When a conversion fails" : "转换失败时如何处理"}
	</h2>
	<ol class="list-decimal pl-5 space-y-2 mb-6">
		<li>
			{en
				? "Try a smaller, non-sensitive file in a current desktop Chromium browser. Initial engine downloads may take time."
				: "先用较小的非敏感文件，在新版桌面 Chrome 或 Edge 中尝试。首次加载引擎可能需要等待。"}
		</li>
		<li>
			{en
				? "A container extension does not identify its codecs. Some video codecs may not be available on your device; this site will not upload the file for fallback."
				: "视频扩展名不等于编码格式；同为 MP4 的文件也可能兼容性不同。设备不支持时，本站不会上传文件作为回退。"}
		</li>
		<li>
			{en
				? "Keep the original. Check text, layout, dimensions, tracks and duration after downloading. Report formats, browser and steps without sharing sensitive originals."
				: "保留原文件，下载后核对文字、排版、尺寸、音视频轨道与时长。反馈时提供格式、浏览器和操作步骤，不发送敏感原文件。"}
		</li>
	</ol>
	<a class="underline" href="/">{en ? "Start converting" : "返回开始转换"}</a>
</article>
