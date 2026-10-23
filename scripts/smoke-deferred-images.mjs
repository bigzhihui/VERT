import { expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { zipSync, unzipSync } from "fflate";

// Exercise real downloads, including the first load, concurrent files, ZIP and retry.
export async function verifyDeferredImages(browser, base) {
	const results = [];
	for (const scenario of ["batch", "retry", "zip"]) {
		const context = await browser.newContext({
			acceptDownloads: true,
			serviceWorkers: "block",
		});
		await context.addInitScript(() =>
			localStorage.setItem("effects", "false"),
		);
		const page = await context.newPage();
		page.setDefaultTimeout(45000);
		expect(
			await page.evaluate(() =>
				CSS.supports(
					"transition",
					"linear(0,0.006,0.025 2.8%,0.101 6.1%,0.539 18.9%,0.721 25.3%,0.849 31.5%,0.937 38.1%,0.968 41.8%,0.991 45.7%,1.006 50.1%,1.015 55%,1.017 63.9%,1.001)",
				),
			),
		).toBe(true);
		let requests = 0;
		await page.route(/\/magick[^/]*\.wasm(?:\?|$)/, async (route) => {
			requests++;
			if (scenario === "retry" && requests === 1) {
				await route.fulfill({
					status: 503,
					body: "test engine failure",
				});
			} else {
				await route.continue();
			}
		});
		try {
			for (const path of ["/", "/formats/"]) {
				await page.goto(base + path, { waitUntil: "networkidle" });
				expect(
					requests,
					"Reading public pages must not fetch ImageMagick",
				).toBe(0);
				await expect(page.locator("main")).toHaveCount(1);
				await expect(
					page.locator('meta[name="description"]'),
				).toHaveCount(1);
			}
			await page.goto(base + "/", { waitUntil: "networkidle" });
			const png = Buffer.from(
				await page.evaluate(async () => {
					const canvas = document.createElement("canvas");
					canvas.width = 40;
					canvas.height = 30;
					canvas.getContext("2d").fillRect(0, 0, 40, 30);
					const blob = await new Promise((r) =>
						canvas.toBlob(r, "image/png"),
					);
					return [...new Uint8Array(await blob.arrayBuffer())];
				}),
			);
			const inputs =
				scenario === "zip"
					? [
							{
								name: "images.zip",
								mimeType: "application/zip",
								buffer: Buffer.from(
									zipSync({ "a.png": png, "b.png": png }),
								),
							},
						]
					: (scenario === "batch"
							? ["a.png", "b.png"]
							: ["retry.png"]
						).map((name) => ({
							name,
							mimeType: "image/png",
							buffer: png,
						}));
			await page
				.locator('input[type="file"]')
				.first()
				.setInputFiles(inputs);
			await expect(page).toHaveURL(/\/convert\/?$/);
			const formats = page.getByRole("button", {
				name: "目标格式",
				exact: true,
			});
			await expect(formats).toHaveCount(inputs.length + 1);
			for (let i = 0; i < inputs.length; i++) {
				await formats.nth(i + 1).click();
				await page.locator("#format-search").fill(".webp");
				await page
					.locator("button[data-selected]")
					.filter({ hasText: /^\.webp$/ })
					.click();
			}
			await page.locator("body").click({ position: { x: 5, y: 160 } });
			expect(
				requests,
				"Adding files and selecting formats must not fetch the engine",
			).toBe(0);
			const convert = page.getByRole("button", {
				name: "全部转换",
				exact: true,
			});
			await convert.click();
			if (scenario === "retry") {
				await expect.poll(() => requests).toBe(1);
				await expect(convert).toBeEnabled();
				await convert.click();
			}
			const downloads = page.getByRole("button", {
				name: "下载此文件",
				exact: true,
			});
			await expect(downloads).toHaveCount(inputs.length);
			for (let i = 0; i < inputs.length; i++) {
				await expect(downloads.nth(i)).toBeEnabled({ timeout: 60000 });
				const event = page.waitForEvent("download");
				await downloads.nth(i).click();
				const download = await event;
				expect(await download.failure()).toBe(null);
				const data = await readFile(await download.path());
				if (scenario === "zip")
					expect(download.suggestedFilename()).toMatch(/\.zip$/);
				else expect(download.suggestedFilename()).toMatch(/\.webp$/);
				const images =
					scenario === "zip"
						? Object.values(unzipSync(data))
						: [data];
				expect(images).toHaveLength(scenario === "zip" ? 2 : 1);
				for (const image of images) {
					expect(Buffer.from(image).toString("ascii", 0, 4)).toBe(
						"RIFF",
					);
					expect(Buffer.from(image).toString("ascii", 8, 12)).toBe(
						"WEBP",
					);
					await page.evaluate(
						async (data) => {
							const bitmap = await createImageBitmap(
								new Blob([new Uint8Array(data)]),
							);
							if (bitmap.width !== 40 || bitmap.height !== 30)
								throw Error(
									"Downloaded image dimensions changed",
								);
							bitmap.close();
						},
						[...image],
					);
				}
			}
			expect(
				requests,
				"Concurrent files must share one engine download; retry must refetch",
			).toBe(scenario === "retry" ? 2 : 1);
			console.log("Deferred image scenario passed:", scenario, requests);
			results.push({
				scenario,
				engineRequests: requests,
				outputs: scenario === "retry" ? 1 : 2,
			});
		} finally {
			await context.close();
		}
	}
	console.log("Deferred image engine:", JSON.stringify(results));
}
