import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
copyFileSync(join(root, "LICENSE"), join(root, "static/LICENSE"));
const engineDir = join(root, "static/engines/ffmpeg-0.12.10");
mkdirSync(engineDir, { recursive: true });
const assets = [];
for (const name of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
	const source = join(root, "node_modules/@ffmpeg/core/dist/esm", name);
	copyFileSync(source, join(engineDir, name));
	const data = readFileSync(source);
	assets.push({
		name,
		bytes: data.length,
		sha256: createHash("sha256").update(data).digest("hex"),
	});
}
writeFileSync(
	join(engineDir, "assets.json"),
	JSON.stringify({ version: "0.12.10", assets }, null, 2) + "\n",
);
let revision = process.env.SOURCE_COMMIT;
if (!revision)
	revision = execFileSync(
		"git",
		[
			"-c",
			`safe.directory=${root.replaceAll("\\", "/").replace(/^[a-z]:/, (drive) => drive.toUpperCase())}`,
			"rev-parse",
			"HEAD",
		],
		{
			cwd: root,
			encoding: "utf8",
		},
	).trim();
writeFileSync(
	join(root, "static/build-info.json"),
	JSON.stringify(
		{
			name: "十三月格式转换",
			revision,
			upstream: "f5ecdec90d52fa84d5204fb59bb8da7d31e3704a",
			processing: "browser-only",
			remoteConversion: false,
			builtAt: new Date().toISOString(),
		},
		null,
		2,
	) + "\n",
);
console.log("Prepared same-origin FFmpeg assets and build marker.");
