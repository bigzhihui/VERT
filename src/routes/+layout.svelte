<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { goto, beforeNavigate, afterNavigate } from "$app/navigation";

	import {
		DISABLE_ALL_EXTERNAL_REQUESTS,
		VERT_NAME,
		SITE_URL,
	} from "$lib/util/consts";
	import * as Layout from "$lib/components/layout";
	import * as Navbar from "$lib/components/layout/Navbar";
	import { Settings } from "$lib/sections/settings/index.svelte";
	import {
		files,
		isMobile,
		effects,
		theme,
		dropping,
		vertdLoaded,
		locale,
		updateLocale,
	} from "$lib/store/index.svelte";
	import "$lib/css/app.scss";
	import { initStores } from "$lib/util/animation";
	import { useVertdSizeLimit } from "$lib/sections/settings/vertdSettings.svelte";
	import { converters } from "$lib/converters";
	import { ToastManager } from "$lib/util/toast.svelte";
	import { m } from "$lib/paraglide/messages";
	import { siteContent } from "$lib/site-content";
	import {
		addLog,
		installConsoleCapture,
		log,
	} from "$lib/util/logger.svelte";

	let { children } = $props();

	const description = $derived.by(() => {
		const route = page.url.pathname.replace(/\/+$/, "").slice(1);
		const language = $locale === "en" ? "en" : "zh";
		if (route in siteContent) {
			return siteContent[route as keyof typeof siteContent][language]
				.intro;
		}
		if (route === "formats") {
			return language === "en"
				? "Supported image, audio, document and video formats, tested conversion examples, browser requirements and limits for Thirteen Months Converter."
				: "查看十三月格式转换支持的图片、音频、文档与视频格式、已实测的转换组合、浏览器要求及不支持的格式。";
		}
		return "免注册的浏览器本地格式转换工具。图片、音频、文档及支持的视频在你的设备上处理，不上传文件。实际支持范围受格式、浏览器与设备能力限制。";
	});

	let isAprilFools = $state(false);

	let scrollPositions = new Map<string, number>();

	beforeNavigate((nav) => {
		if (!nav.from || !$isMobile) return;
		scrollPositions.set(nav.from.url.pathname, window.scrollY);
	});

	afterNavigate((nav) => {
		if (!$isMobile) return;
		const scrollY = nav.to
			? scrollPositions.get(nav.to.url.pathname) || 0
			: 0;
		window.scrollTo(0, scrollY);
	});

	const dropFiles = async (e: DragEvent) => {
		e.preventDefault();
		dropping.set(false);
		const oldLength = files.files.length;
		await files.addAsync(e.dataTransfer?.files);
		if (files.files.length !== oldLength) goto("/convert");
	};

	const handleDrag = (e: DragEvent, drag: boolean) => {
		e.preventDefault();
		dropping.set(drag);
	};

	const handlePaste = async (e: ClipboardEvent) => {
		const clipboardData = e.clipboardData;
		if (!clipboardData || !clipboardData.files.length) return;
		e.preventDefault();
		const oldLength = files.files.length;
		await files.addAsync(clipboardData.files);
		if (files.files.length !== oldLength) goto("/convert");
	};

	onMount(() => {
		// captures console output for debugging page
		installConsoleCapture();

		// catch global errors and unhandled promise rejections for debugging page
		const handleGlobalError = (event: ErrorEvent) =>
			addLog("error", ["window"], event.message);
		const handleUnhandledRejection = (event: PromiseRejectionEvent) =>
			addLog("error", ["window", "unhandledrejection"], event.reason);
		window.addEventListener("error", handleGlobalError);
		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		const now = new Date();
		isAprilFools = now.getDate() === 1 && now.getMonth() === 3;

		initStores();

		const handleResize = () => {
			isMobile.set(window.innerWidth <= 768);
		};

		isMobile.set(window.innerWidth <= 768); // initial page load
		window.addEventListener("resize", handleResize); // handle window resize
		window.addEventListener("paste", handlePaste);

		effects.set(localStorage.getItem("effects") !== "false"); // defaults to true if not set
		theme.set(
			(localStorage.getItem("theme") as "light" | "dark") || "light",
		);
		const storedLocale = localStorage.getItem("locale");
		if (storedLocale) updateLocale(storedLocale);

		Settings.instance.load();

		// detect if insecure context
		if (!window.isSecureContext) {
			log(
				["layout"],
				'Insecure context (HTTP) detected, some features may not work as expected -- you may want to enable "PUB_DISABLE_FAILURE_BLOCKS" on local deployments.',
			);
			ToastManager.add({
				type: "warning",
				message: m["toast.insecure_context"](),
				disappearing: false,
			});
		}

		return () => {
			window.removeEventListener("paste", handlePaste);
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("error", handleGlobalError);
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection,
			);
		};
	});

	$effect(() => {
		if (DISABLE_ALL_EXTERNAL_REQUESTS) return;
		let cancelled = false;
		const vertd = converters.find(
			(converter) => converter.name === "vertd",
		);
		if (!vertd) return;

		void vertd
			.valid()
			.then((valid) => {
				if (cancelled) return;
				vertdLoaded.set(valid);
				vertd.status = valid ? "ready" : "error";
				if (!valid) log(["layout", "vertd"], "health check failed");
			})
			.catch((error) => {
				if (cancelled) return;
				vertdLoaded.set(false);
				vertd.status = "error";
				log(["layout", "vertd"], `health check failed: ${error}`);
			});

		return () => {
			cancelled = true;
		};
	});

	onMount(() => {
		// query vertd server for size limit on mount and on settings change
		useVertdSizeLimit();
	});
</script>

<svelte:head>
	<title>{VERT_NAME} · 图片、音频、文档与视频格式转换</title>
	<meta name="theme-color" content="#F2ABEE" />
	<meta name="description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={VERT_NAME} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={SITE_URL + page.url.pathname} />
	<meta property="og:image" content={SITE_URL + "/social.png"} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={VERT_NAME} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={SITE_URL + "/social.png"} />
	<link rel="manifest" href="/manifest.json" />
	<link rel="canonical" href={SITE_URL + page.url.pathname} />
	{#if isAprilFools}
		<style>
			* {
				font-family: "Comic Sans MS", "Comic Sans", cursive !important;
			}
		</style>
	{/if}
</svelte:head>

<!-- FIXME: if user resizes between desktop/mobile, highlight of page disappears (only shows on original size) -->
{#key $locale}
	<div
		class="flex flex-col min-h-screen h-full w-full overflow-x-hidden"
		ondrop={dropFiles}
		ondragenter={(e) => handleDrag(e, true)}
		ondragover={(e) => handleDrag(e, true)}
		ondragleave={(e) => handleDrag(e, false)}
		role="region"
	>
		<Layout.UploadRegion />

		<div>
			<Layout.MobileLogo />
			<Navbar.Desktop />
		</div>

		<nav
			aria-label="十三月工具导航"
			class="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-x-5 gap-y-2 px-6 pb-6 text-xs font-normal"
		>
			<a
				href="https://afeiii.com/"
				target="_blank"
				rel="noopener noreferrer">十三月主站</a
			><a
				href="https://tools.afeiii.com/"
				target="_blank"
				rel="noopener noreferrer">开发工具</a
			><a
				href="https://pdf.afeiii.com/"
				target="_blank"
				rel="noopener noreferrer">PDF 工具</a
			><a
				href="https://resume.afeiii.com/"
				target="_blank"
				rel="noopener noreferrer">在线简历</a
			><a
				href="https://check.afeiii.com/"
				target="_blank"
				rel="noopener noreferrer">网站检测</a
			><a
				href="https://convert.afeiii.com/"
				target="_blank"
				rel="noopener noreferrer">格式转换</a
			>
		</nav>

		<!-- 
		SvelteKit throws the following warning when developing - safe to ignore as we render the children in this component:
		`<slot />` or `{@render ...}` tag missing — inner content will not be rendered
		-->
		<Layout.PageContent {children} />

		<Layout.Toasts />
		<Layout.Dialogs />

		<div>
			<Layout.Footer />
			<Navbar.Mobile />
		</div>
	</div>
{/key}

<!-- Gradients placed here to prevent it overlapping in transitions -->
<Layout.Gradients />
