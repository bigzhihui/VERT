# 十三月格式转换维护

- 公开地址：<https://convert.afeiii.com>。
- 本站源码：<https://github.com/bigzhihui/VERT>，生产分支 `brand/thirteen-month`。
- 上游：<https://github.com/VERT-sh/VERT>，基线 `f5ecdec90d52fa84d5204fb59bb8da7d31e3704a`。
- 保留 VERT 及其贡献者署名，沿用 AGPL-3.0。`LICENSE` 和第三方许可在站点可访问。

## 产品范围

无需账号；图片、音频、文档与浏览器支持的视频在访客设备上转换。没有文件上传或转换后端。视频受浏览器编码、设备和内存能力限制；格式列表不是逐项转换成功的保证。不承诺旧版 DOC、PDF、Office 文档任意互转。

公开定制版固定关闭外部服务：不实例化 vertd、不探测远程实例、不提供远程视频回退，不加载 Plausible、Stripe 或贡献者头像。FFmpeg 0.12.10 的脚本和 WASM 从锁定的 npm 包复制到本站；ImageMagick、Pandoc 和媒体编码器资源也由本站提供。

新会话默认简体中文，支持英语切换。补齐上游缺失的中文消息，补充本站关于、隐私、条款、联系页。浏览器存储用于设置、引擎缓存和部分视频临时文件；诊断报告可能包含文件名，分享前应检查。

## 构建和验证

使用 Bun 1.4.2、Node 24，首次构建需要下载依赖和国际化插件：

```sh
cp .env.example .env
bun install --frozen-lockfile
bun run build
bun run check
bun run lint
bunx playwright install --with-deps chromium
bun run test:smoke
```

Windows 测试默认使用本机 Google Chrome。Linux/CI 使用 Playwright Chromium；可通过 `BROWSER_EXECUTABLE` 指定浏览器。`BASE_URL` 可用于验证正式站；`SCREENSHOT_DIR` 指定验收截图目录。测试使用程序生成的虚拟文件，不上传用户文件。

`build-info.json` 记录源码版本和 `browser-only` 模式。`scripts/prepare-site.mjs` 复制引擎、生成资源 SHA256 清单及版本标记，不从 CDN 动态下载运行时引擎。

设置 `SMOKE_EXTENDED=1` 可执行 18 个常用格式组合的真实下载验收：图片 5 项、音频 4 项、文档 6 项、视频 3 项。2026-10-19 正式站桌面 Chrome 均通过，视频使用自制无音轨 H.264 样例；文档检查中文与结构，媒体检查尺寸、轨道和时长。默认 CI 保留基础四类转换及失败恢复检查。没有验证所有格式、大文件、Safari、Firefox 或手机视频编码。公开说明见 `/formats/`，五站互链见“十三月工具导航”。

## 静态部署

Oracle Phoenix 仅提供网页和引擎静态资源，转换不使用 Oracle CPU。独立目录 `/opt/apps/vert/releases/<revision>`，`/opt/apps/vert/current` 指向当前构建。Caddy 直接提供文件，无新应用容器、数据库或公网应用端口。

`deploy/Caddyfile` 是新站片段，不能覆盖服务器整份 Caddy 配置。发布前核对原配置 SHA256，备份、增量追加、`caddy validate`，然后热加载。后续发布先传入新版本目录，核对文件清单后原子切换 `current`；回退指向上一已验证版本。

HTTP 自动转 HTTPS。CSP 限制连接到本站与本地 blob，禁止外部上传、iframe 和表单；非 GET/HEAD 请求返回 405。COOP/COEP 支持隔离上下文中的本地引擎。HTML、Service Worker 和版本信息需要重新验证，带哈希静态资源可长期缓存。

Pandoc WASM 超过 Cloudflare Pages 的 25 MiB 单文件限制，当前采用 Caddy 静态托管。若迁移 Pages，需要另行设计大引擎资源交付，不能直接上传当前构建。

GitHub 仅启用 `Afeiii verification`，不启用上游镜像/Pages 发布，不自动部署或自动跟随上游更新。升级前检查源码差异、运行全部相关验证并保留上一版本。
