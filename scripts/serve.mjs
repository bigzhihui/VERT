import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

export async function startServer() {
	const root = resolve("build");
	const config = await readFile("deploy/Caddyfile", "utf8");
	const headers = Object.fromEntries(
		[...config.matchAll(/^\s{4}([\w-]+) "([^"\r\n]+)"$/gm)].map((m) => [
			m[1],
			m[2],
		]),
	);
	const types = {
		".html": "text/html; charset=utf-8",
		".js": "text/javascript",
		".json": "application/json",
		".css": "text/css",
		".svg": "image/svg+xml",
		".wasm": "application/wasm",
		".txt": "text/plain; charset=utf-8",
		".png": "image/png",
		".woff2": "font/woff2",
		".woff": "font/woff",
	};
	const server = createServer(async (req, res) => {
		for (const [key, value] of Object.entries(headers))
			res.setHeader(key, value);
		if (!["GET", "HEAD"].includes(req.method)) {
			res.writeHead(405).end();
			return;
		}
		try {
			const pathname = decodeURIComponent(
				new URL(req.url, "http://localhost").pathname,
			);
			let file = resolve(root, "." + pathname);
			if (file !== root && !file.startsWith(root + sep)) {
				res.writeHead(403).end();
				return;
			}
			if ((await stat(file)).isDirectory())
				file = resolve(file, "index.html");
			const data = await readFile(file);
			res.setHeader(
				"Content-Type",
				types[extname(file)] || "application/octet-stream",
			);
			res.setHeader("Content-Length", data.length);
			res.setHeader("Cache-Control", "no-cache");
			res.writeHead(200).end(req.method === "HEAD" ? undefined : data);
		} catch {
			res.writeHead(404).end("Not found");
		}
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	return {
		url: `http://127.0.0.1:${server.address().port}`,
		close: () => new Promise((resolve) => server.close(resolve)),
	};
}
