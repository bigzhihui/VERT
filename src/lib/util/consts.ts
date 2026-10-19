export const GITHUB_URL_VERT = "https://github.com/VERT-sh/VERT";
export const SITE_SOURCE = "https://github.com/bigzhihui/VERT";
export const SITE_URL = "https://convert.afeiii.com";
export const GITHUB_URL_VERTD = "https://github.com/VERT-sh/vertd";
export const GITHUB_API_URL = "https://api.github.com/repos/VERT-sh/VERT";
export const DISCORD_URL = "https://discord.gg/kqevGxYPak";
export const VERT_NAME = "十三月格式转换";
export const CONTACT_EMAIL = "support@afeiii.com";

// This public deployment only registers on-device converters. Environment flags
// and saved browser settings cannot enable remote processing.
export const DISABLE_ALL_EXTERNAL_REQUESTS = true;
export const GB = 1024 * 1024 * 1024;

export function conversionConcurrency(): number {
	const cores =
		typeof navigator !== "undefined"
			? navigator.hardwareConcurrency || 4
			: 4;
	return Math.min(2, Math.max(1, cores - 1));
}
