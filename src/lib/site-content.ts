export const siteContent = {
	about: {
		zh: {
			title: "关于十三月格式转换",
			intro: "免注册的浏览器本地文件转换工具，基于开源项目 VERT 定制。",
			sections: [
				{
					title: "如何使用",
					paragraphs: [
						"选择或拖入文件，选择目标格式，点击转换，完成后下载。首次使用需要下载转换引擎；后续访问可使用浏览器缓存。",
						"图片、音频、文档和支持的视频都在你的设备上处理，本站没有文件上传或转换后端。",
					],
				},
				{
					id: "video",
					title: "视频与格式支持范围",
					paragraphs: [
						"本站仅启用浏览器本地视频引擎，不连接 VERT 官方服务器，不提供远程转换回退。可处理的容器、编码和分辨率取决于当前浏览器与设备。",
						"格式列表表示引擎声明的支持范围，不保证每个文件都成功。旧版 DOC、PDF 与 Office 文档之间的任意互转不在承诺范围；请先用非敏感样例测试并检查结果。",
						"大文件可能耗时较长或超出浏览器内存。手机或兼容性不足的浏览器可能无法处理部分视频。",
					],
				},
				{
					title: "开源与联系",
					paragraphs: [
						"上游 VERT 及其贡献者提供核心转换能力，本站补充中文默认界面、本站说明和本地转换部署。保留 AGPL-3.0 许可证及原作者署名。",
						"问题反馈请联系 support@afeiii.com。请提供格式、浏览器和操作步骤；不要直接发送含隐私的原文件。",
					],
				},
			],
		},
		en: {
			title: "About Thirteen Month Converter",
			intro: "An account-free, browser-based file converter built with VERT.",
			sections: [
				{
					title: "Using the converter",
					paragraphs: [
						"Choose files, select an output format, convert and download. Conversion engines download on first use and may be cached by your browser.",
						"Images, audio, documents and supported videos are processed on your device. This site has no file upload or conversion backend.",
					],
				},
				{
					id: "video",
					title: "Video and format limitations",
					paragraphs: [
						"Only local browser video conversion is enabled. There is no official VERT server connection or remote fallback. Codec, container and resolution support depends on your browser and device.",
						"The format list describes engine capabilities, not a guarantee for every file. Arbitrary conversion between legacy DOC, PDF and Office formats is not promised. Test a non-sensitive sample and check the result.",
						"Large files may exceed browser memory or take considerable time. Mobile and unsupported browsers may have limited video support.",
					],
				},
				{
					title: "Open source and contact",
					paragraphs: [
						"Core conversion is provided by VERT and its contributors. This deployment adds a Chinese default interface, site information and a local-only configuration. The AGPL-3.0 license and upstream attribution are retained.",
						"Contact support@afeiii.com with formats, browser details and reproduction steps. Do not send sensitive source files.",
					],
				},
			],
		},
	},
	privacy: {
		zh: {
			title: "隐私说明",
			intro: "更新日期：2026-10-19。此说明适用于 convert.afeiii.com。",
			sections: [
				{
					title: "文件处理",
					paragraphs: [
						"文件内容在浏览器的内存或临时存储中处理。本站不提供文件上传接口，不将文件发给 Oracle 服务器、VERT 官方服务或第三方转换服务。",
						"部分视频转换可能在浏览器的站点私有存储中建立临时文件；转换结束后应用尝试清理。关闭页面会释放内存，你也可以在浏览器设置中清除此站点数据。",
					],
				},
				{
					title: "设置、缓存与诊断",
					paragraphs: [
						"浏览器本地存储保存语言、主题和转换设置。资源缓存用于保存转换引擎，不缓存你的待转换文件。可在设置页或浏览器中清除。",
						"诊断页面在本机记录错误和转换过程，可能包含文件名、格式及设备信息。复制或下载报告不会自动发送；分享前请移除敏感信息。",
					],
				},
				{
					title: "网站访问数据",
					paragraphs: [
						"访问网页和下载转换引擎时，托管及网络服务需要处理 IP 地址、请求路径和浏览器信息，用于传输内容与安全防护。文件内容不会随这些静态资源请求上传。",
						"本站公开说明页接入 Cloudflare Web Analytics，了解页面访问和加载性能，不使用统计 Cookie，不采集文件内容或文件名；不在转换、设置和诊断页直接加载统计。转换引擎资源由本站提供。主动打开外部链接后，对方适用自己的隐私政策。",
					],
				},
				{
					title: "联系",
					paragraphs: ["隐私问题请发邮件至 support@afeiii.com。"],
				},
			],
		},
		en: {
			title: "Privacy",
			intro: "Updated 2026-10-19. Applies to convert.afeiii.com.",
			sections: [
				{
					title: "File processing",
					paragraphs: [
						"Files are processed in browser memory or local temporary storage. There is no upload API, and files are not sent to Oracle, official VERT servers or third-party converters.",
						"Some video conversions may use temporary origin-private browser storage. The app attempts cleanup after conversion. Closing the page releases memory; site data can also be cleared in browser settings.",
					],
				},
				{
					title: "Preferences, cache and diagnostics",
					paragraphs: [
						"Local storage saves language, theme and conversion preferences. The engine cache stores software assets, not your input files. Clear it in settings or in your browser.",
						"Local diagnostic logs may include filenames, formats and device information. Copying or downloading a report does not send it automatically. Review and remove sensitive information before sharing.",
					],
				},
				{
					title: "Website requests",
					paragraphs: [
						"Hosting and network services process IP addresses, requested paths and browser information to deliver pages and engine assets and provide security. File contents are not uploaded with these static requests.",
						"Public information pages use Cloudflare Web Analytics for page views and performance without analytics cookies, file contents or filenames. Analytics is not loaded directly on conversion, settings or diagnostic pages. Engines are served by this site. External links follow their own privacy policies.",
					],
				},
				{
					title: "Contact",
					paragraphs: [
						"Send privacy questions to support@afeiii.com.",
					],
				},
			],
		},
	},
	terms: {
		zh: {
			title: "使用条款",
			intro: "更新日期：2026-10-19。使用前请保留原文件并检查下载结果。",
			sections: [
				{
					title: "服务范围",
					paragraphs: [
						"本站提供浏览器本地格式转换，按现状提供，不承诺全部格式、设备或文件均兼容。转换可能改变排版、颜色、元数据或媒体轨道。重要文件请保留原件并核对结果。",
					],
				},
				{
					title: "使用责任",
					paragraphs: [
						"仅处理你有权使用的内容。请勿利用本站从事违法活动、攻击网站或干扰其他服务。大文件与批量转换可能使你的设备卡顿，可随时取消或关闭页面。",
					],
				},
				{
					title: "开源与反馈",
					paragraphs: [
						"本站基于 VERT，沿用 AGPL-3.0 许可证并提供本站源代码。问题反馈联系 support@afeiii.com。",
					],
				},
			],
		},
		en: {
			title: "Terms",
			intro: "Updated 2026-10-19. Keep original files and check downloaded results.",
			sections: [
				{
					title: "Service scope",
					paragraphs: [
						"Browser-local conversion is provided as-is. Not every format, file or device is supported. Conversion may alter layout, color, metadata or media tracks. Keep originals and verify important results.",
					],
				},
				{
					title: "Use",
					paragraphs: [
						"Only process content you are entitled to use. Do not use this site for unlawful activity or to attack or disrupt services. Large or batch conversions may slow your device; cancel or close the page if necessary.",
					],
				},
				{
					title: "Open source and feedback",
					paragraphs: [
						"This site is based on VERT under AGPL-3.0 and publishes its modified source. Contact support@afeiii.com.",
					],
				},
			],
		},
	},
	contact: {
		zh: {
			title: "联系与反馈",
			intro: "邮箱：support@afeiii.com",
			sections: [
				{
					title: "报告转换问题",
					paragraphs: [
						"请说明输入格式、目标格式、浏览器与设备，以及具体操作步骤和错误提示。优先使用不含个人或业务信息的样例。",
						"若附上本地诊断报告，请先检查其中的文件名、设备信息及日志。不要直接发送敏感文件或账号密码。",
					],
				},
			],
		},
		en: {
			title: "Contact",
			intro: "Email: support@afeiii.com",
			sections: [
				{
					title: "Reporting an issue",
					paragraphs: [
						"Include input and output formats, browser, device, reproduction steps and the error message. Use a non-sensitive sample whenever possible.",
						"Review filenames, device details and logs before attaching diagnostic reports. Do not send sensitive files or passwords.",
					],
				},
			],
		},
	},
} as const;
