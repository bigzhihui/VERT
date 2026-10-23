import { chromium, expect } from "@playwright/test";
import { readFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { unzipSync } from "fflate";
import { Input, BufferSource, MATROSKA, ALL_FORMATS } from "mediabunny";
import { startServer } from "./serve.mjs";
import { verifyDeferredImages } from "./smoke-deferred-images.mjs";

const local = process.env.BASE_URL ? null : await startServer();
const base = process.env.BASE_URL || local.url;
const downloads = await mkdtemp(join(tmpdir(), "afeiii-vert-smoke-"));
const browser = await chromium.launch({
	headless: true,
	...(process.env.BROWSER_EXECUTABLE
		? { executablePath: process.env.BROWSER_EXECUTABLE }
		: process.platform === "win32"
			? {
					executablePath:
						"C:/Program Files/Google/Chrome/Application/chrome.exe",
				}
			: {}),
});
const context = await browser.newContext({
	viewport: { width: 1440, height: 1000 },
	acceptDownloads: true,
});
const foreign = [],
	writes = [],
	analytics = [],
	violations = [],
	pageErrors = [];
context.on("request", (r) => {
	const u = new URL(r.url());
	const isAnalytics =
		u.protocol === "https:" &&
		((u.hostname === "static.cloudflareinsights.com" &&
			u.pathname.startsWith("/beacon.min.js")) ||
			(u.hostname === "cloudflareinsights.com" &&
				u.pathname === "/cdn-cgi/rum"));
	if (isAnalytics) {
		if (r.method() === "POST") analytics.push(r.postData() || "");
		return;
	}
	if (
		["http:", "https:"].includes(u.protocol) &&
		u.origin !== new URL(base).origin
	)
		foreign.push(r.url());
	if (!["GET", "HEAD"].includes(r.method()))
		writes.push({ method: r.method(), url: r.url() });
});
await context.addInitScript(() => {
	localStorage.setItem("effects", "false");
	document.addEventListener("securitypolicyviolation", (e) => {
		window.__cspViolations ??= [];
		window.__cspViolations.push({
			directive: e.violatedDirective,
			blocked: e.blockedURI,
		});
	});
});
const page = await context.newPage();
page.on("pageerror", (e) => pageErrors.push(e.message));
page.setDefaultTimeout(45000);
const results = [];
const logs = [];
page.on("console", (m) => {
	logs.push(m.text().slice(0, 700));
	if (logs.length > 50) logs.shift();
});
function wave() {
	const samples = 16000,
		out = Buffer.alloc(44 + samples * 2);
	out.write("RIFF");
	out.writeUInt32LE(out.length - 8, 4);
	out.write("WAVEfmt ", 8);
	out.writeUInt32LE(16, 16);
	out.writeUInt16LE(1, 20);
	out.writeUInt16LE(1, 22);
	out.writeUInt32LE(16000, 24);
	out.writeUInt32LE(32000, 28);
	out.writeUInt16LE(2, 32);
	out.writeUInt16LE(16, 34);
	out.write("data", 36);
	out.writeUInt32LE(samples * 2, 40);
	for (let i = 0; i < samples; i++)
		out.writeInt16LE(
			Math.round(Math.sin((i * Math.PI * 2 * 440) / 16000) * 5000),
			44 + i * 2,
		);
	return out;
}
async function home() {
	await page.goto(base + "/", { waitUntil: "networkidle" });
	await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hans");
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		"文件格式转换",
	);
	await expect(page.locator(".file-category-card")).toHaveCount(4);
	await expect(
		page.getByRole("navigation", { name: "十三月工具导航" }).locator("a"),
	).toHaveCount(6);
	await expect(
		page.locator(".file-category-card").filter({ hasText: "音频" }),
	).toContainText("就绪", { timeout: 90000 });
	expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
}
async function convert(file, to) {
	console.log("Converting", file.name, to);
	await home();
	await page.locator('input[type="file"]').first().setInputFiles(file);
	await expect(page).toHaveURL(/\/convert\/?$/);
	await page
		.getByRole("button", { name: "目标格式", exact: true })
		.last()
		.click();
	await page.locator("#format-search").fill(to);
	await page
		.locator("button[data-selected]")
		.filter({ hasText: new RegExp("^\\" + to + "$") })
		.click();
	await page.locator("body").click({ position: { x: 5, y: 160 } });
	await page.getByRole("button", { name: "全部转换", exact: true }).click();
	const downloadButton = page.getByRole("button", {
		name: "下载此文件",
		exact: true,
	});
	await expect(downloadButton).toBeEnabled({ timeout: 45000 });
	const event = page.waitForEvent("download");
	await downloadButton.click();
	const download = await event;
	expect(await download.failure()).toBe(null);
	const path = join(downloads, download.suggestedFilename());
	await download.saveAs(path);
	const data = await readFile(path);
	expect(data.length).toBeGreaterThan(30);
	expect(download.suggestedFilename()).toMatch(new RegExp("\\" + to + "$"));
	violations.push(
		...(await page.evaluate(() => window.__cspViolations || [])),
	);
	results.push({ name: file.name, to, bytes: data.length });
	console.log("Downloaded", file.name, to, data.length);
	return data;
}
try {
	await verifyDeferredImages(browser, base);
	await home();
	const html = await (await context.request.get(base + "/")).text();
	expect(html).toContain("文件格式转换");
	expect(
		await page.locator('link[rel="canonical"]').getAttribute("href"),
	).toBe("https://convert.afeiii.com/");
	if (!process.env.SMOKE_VIDEO_ONLY) {
		const image = await page.evaluate(async () => {
			const canvas = document.createElement("canvas");
			canvas.width = 120;
			canvas.height = 80;
			const ctx = canvas.getContext("2d");
			ctx.fillStyle = "#F2ABEE";
			ctx.fillRect(0, 0, 120, 80);
			ctx.fillStyle = "black";
			ctx.font = "18px sans-serif";
			ctx.fillText("十三月 TEST", 6, 40);
			return Array.from(
				new Uint8Array(
					await (
						await new Promise((r) => canvas.toBlob(r, "image/png"))
					).arrayBuffer(),
				),
			);
		});
		const webp = await convert(
			{
				name: "图片样例.png",
				mimeType: "image/png",
				buffer: Buffer.from(image),
			},
			".webp",
		);
		expect(webp.toString("ascii", 0, 4)).toBe("RIFF");
		expect(webp.toString("ascii", 8, 12)).toBe("WEBP");
		await page.evaluate(
			async (data) => {
				const bmp = await createImageBitmap(
					new Blob([new Uint8Array(data)], { type: "image/webp" }),
				);
				if (bmp.width !== 120 || bmp.height !== 80)
					throw Error("Image dimensions changed");
				bmp.close();
			},
			[...webp],
		);
		const mp3 = await convert(
			{ name: "音频样例.wav", mimeType: "audio/wav", buffer: wave() },
			".mp3",
		);
		await page.evaluate(
			async (data) => {
				const audio = new AudioContext();
				const decoded = await audio.decodeAudioData(
					new Uint8Array(data).buffer,
				);
				if (decoded.duration < 0.8 || decoded.duration > 1.3)
					throw Error("Audio duration incorrect");
				await audio.close();
			},
			[...mp3],
		);
		const docx = await convert(
			{
				name: "文档样例.md",
				mimeType: "text/markdown",
				buffer: Buffer.from(
					"# 十三月转换验证\n\n中文内容和 English sample.\n",
				),
			},
			".docx",
		);
		const zip = unzipSync(docx);
		expect(zip["word/document.xml"]).toBeTruthy();
		expect(new TextDecoder().decode(zip["word/document.xml"])).toContain(
			"十三月转换验证",
		);
		if (process.env.SMOKE_EXTENDED) {
			async function imageCheck(data, mimeType) {
				await page.evaluate(
					async ({ data, mimeType }) => {
						const bitmap = await createImageBitmap(
							new Blob([new Uint8Array(data)], {
								type: mimeType,
							}),
						);
						if (bitmap.width !== 120 || bitmap.height !== 80)
							throw Error("Image dimensions changed");
						bitmap.close();
					},
					{ data: [...data], mimeType },
				);
			}
			const jpeg = await convert(
				{
					name: "image.png",
					mimeType: "image/png",
					buffer: Buffer.from(image),
				},
				".jpg",
			);
			await imageCheck(jpeg, "image/jpeg");
			await imageCheck(
				await convert(
					{ name: "image.jpg", mimeType: "image/jpeg", buffer: jpeg },
					".png",
				),
				"image/png",
			);
			await imageCheck(
				await convert(
					{
						name: "image.webp",
						mimeType: "image/webp",
						buffer: webp,
					},
					".png",
				),
				"image/png",
			);
			const svg = Buffer.from(
				'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#F2ABEE"/></svg>',
			);
			await imageCheck(
				await convert(
					{
						name: "image.svg",
						mimeType: "image/svg+xml",
						buffer: svg,
					},
					".png",
				),
				"image/png",
			);
			async function audioCheck(data) {
				const media = new Input({
					source: new BufferSource(data),
					formats: ALL_FORMATS,
				});
				expect(await media.getPrimaryAudioTrack()).toBeTruthy();
				const duration = await media.computeDuration();
				expect(duration).toBeGreaterThan(0.8);
				expect(duration).toBeLessThan(1.3);
				media.dispose();
			}
			await audioCheck(
				await convert(
					{ name: "audio.mp3", mimeType: "audio/mpeg", buffer: mp3 },
					".wav",
				),
			);
			const flac = await convert(
				{ name: "audio.wav", mimeType: "audio/wav", buffer: wave() },
				".flac",
			);
			await audioCheck(flac);
			await audioCheck(
				await convert(
					{
						name: "audio.flac",
						mimeType: "audio/flac",
						buffer: flac,
					},
					".wav",
				),
			);
			const markdown = Buffer.from(
				"# 十三月转换验证\n\n中文内容和 English sample.\n",
			);
			const back = await convert(
				{
					name: "document.docx",
					mimeType:
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					buffer: docx,
				},
				".md",
			);
			expect(back.toString("utf8")).toContain("十三月转换验证");
			const htmlDoc = await convert(
				{
					name: "document.md",
					mimeType: "text/markdown",
					buffer: markdown,
				},
				".html",
			);
			expect(htmlDoc.toString("utf8")).toContain("十三月转换验证");
			const htmlBack = await convert(
				{
					name: "document.html",
					mimeType: "text/html",
					buffer: htmlDoc,
				},
				".md",
			);
			expect(htmlBack.toString("utf8")).toContain("十三月转换验证");
			const epub = await convert(
				{
					name: "document.md",
					mimeType: "text/markdown",
					buffer: markdown,
				},
				".epub",
			);
			expect(
				Object.keys(unzipSync(epub)).some((name) =>
					name.endsWith(".opf"),
				),
			).toBe(true);
			const epubBack = await convert(
				{
					name: "document.epub",
					mimeType: "application/epub+zip",
					buffer: epub,
				},
				".md",
			);
			expect(epubBack.toString("utf8")).toContain("十三月转换验证");
		}
	}
	const video = await readFile("tests/fixtures/color-1s.mp4");
	const mkv = await convert(
		{
			name: "视频样例.mp4",
			mimeType: "video/mp4",
			buffer: Buffer.from(video),
		},
		".mkv",
	);
	expect(mkv.subarray(0, 4).toString("hex")).toBe("1a45dfa3");
	const videoInput = new Input({
		source: new BufferSource(mkv),
		formats: [MATROSKA],
	});
	expect((await videoInput.getPrimaryVideoTrack())?.codec).toBe("avc");
	expect(await videoInput.computeDuration()).toBeGreaterThan(0.8);
	expect(await videoInput.computeDuration()).toBeLessThan(1.2);
	videoInput.dispose();
	if (process.env.SMOKE_EXTENDED) {
		for (const [name, buffer, to] of [
			["video.mkv", mkv, ".mp4"],
			["video.mp4", video, ".webm"],
		]) {
			const data = await convert(
				{ name, mimeType: "video/" + name.split(".").at(-1), buffer },
				to,
			);
			const media = new Input({
				source: new BufferSource(data),
				formats: ALL_FORMATS,
			});
			expect(await media.getPrimaryVideoTrack()).toBeTruthy();
			expect(await media.computeDuration()).toBeGreaterThan(0.8);
			expect(await media.computeDuration()).toBeLessThan(1.3);
			media.dispose();
		}
	}
	if (process.env.SCREENSHOT_DIR) {
		await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
		await page.screenshot({
			path: join(process.env.SCREENSHOT_DIR, "conversion.png"),
			fullPage: true,
		});
	}
	// Remove the track box from our synthetic MP4 to exercise an invalid media file.
	function withoutTracks(buffer) {
		const parts = [];
		for (let pos = 0; pos + 8 <= buffer.length;) {
			const size = buffer.readUInt32BE(pos);
			if (size < 8 || pos + size > buffer.length) break;
			const type = buffer.toString("ascii", pos + 4, pos + 8);
			if (type === "moov") {
				const body = withoutTracks(
					buffer.subarray(pos + 8, pos + size),
				);
				const header = Buffer.alloc(8);
				header.writeUInt32BE(body.length + 8);
				header.write("moov", 4);
				parts.push(header, body);
			} else if (type !== "trak")
				parts.push(buffer.subarray(pos, pos + size));
			pos += size;
		}
		return Buffer.concat(parts);
	}
	await home();
	await page
		.locator('input[type="file"]')
		.first()
		.setInputFiles({
			name: "无轨道样例.mp4",
			mimeType: "video/mp4",
			buffer: withoutTracks(video),
		});
	await expect(page).toHaveURL(/\/convert\/?$/);
	await page
		.getByRole("button", { name: "目标格式", exact: true })
		.last()
		.click();
	await page.locator("#format-search").fill(".mkv");
	await page
		.locator("button[data-selected]")
		.filter({ hasText: /^\.mkv$/ })
		.click();
	await page.locator("body").click({ position: { x: 5, y: 160 } });
	await page.getByRole("button", { name: "全部转换", exact: true }).click();
	await expect(
		page.getByText("文件中没有可处理的音视频轨道", { exact: false }),
	).toBeVisible({ timeout: 10000 });
	await expect(
		page.getByRole("button", { name: "全部转换", exact: true }),
	).toBeEnabled();
	console.log("Invalid media rejected without remote fallback");

	for (const path of [
		"/formats/",
		"/about/",
		"/privacy/",
		"/terms/",
		"/contact/",
		"/settings/",
		"/debug/",
	]) {
		const response = await page.goto(base + path, {
			waitUntil: "networkidle",
		});
		expect(response.status()).toBe(200);
		expect(await page.locator("body").innerText()).not.toContain(
			"视频通过超快速服务器转换",
		);
		violations.push(
			...(await page.evaluate(() => window.__cspViolations || [])),
		);
	}
	await page.goto(base + "/settings/", { waitUntil: "networkidle" });
	expect(await page.locator("body").innerText()).not.toContain("实例 URL");
	await home();
	if (process.env.SCREENSHOT_DIR) {
		await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
		await page.screenshot({
			path: join(process.env.SCREENSHOT_DIR, "desktop.png"),
			fullPage: true,
		});
	}
	await page.setViewportSize({ width: 375, height: 850 });
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true);
	if (process.env.SCREENSHOT_DIR)
		await page.screenshot({
			path: join(process.env.SCREENSHOT_DIR, "mobile.png"),
			fullPage: true,
		});
	expect(
		(
			await context.request.post(base + "/upload", { data: "test" })
		).status(),
	).toBe(405);
	expect(foreign, "Foreign network requests").toEqual([]);
	expect(writes, "Browser file uploads").toEqual([]);
	expect(violations, "Unexpected CSP violations").toEqual([]);
	expect(pageErrors, "Browser errors").toEqual([]);
	for (const payload of analytics) {
		for (const marker of [
			"图片样例.png",
			"音频样例.wav",
			"文档样例.md",
			"视频样例.mp4",
			"image.png",
			"audio.wav",
			"document.docx",
			"十三月转换验证",
		]) {
			expect(
				payload,
				"Analytics must not contain filenames or document content",
			).not.toContain(marker);
		}
	}
	console.log(
		JSON.stringify(
			{
				base,
				results,
				foreignRequests: foreign.length,
				fileUploads: writes.length,
				pageErrors: pageErrors.length,
				mobileOverflow: false,
			},
			null,
			2,
		),
	);
} catch (error) {
	console.error(
		JSON.stringify(
			{
				foreign,
				logs,
				writes,
				violations,
				pageErrors,
				body: await page
					.locator("body")
					.innerText()
					.catch(() => ""),
			},
			null,
			2,
		),
	);
	throw error;
} finally {
	await browser.close();
	await local?.close();
	await rm(downloads, { recursive: true, force: true });
}
