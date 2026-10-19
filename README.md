# 十三月格式转换

[使用网站](https://convert.afeiii.com) · [隐私说明](https://convert.afeiii.com/privacy/) · [部署维护](docs/AFEIII-DEPLOYMENT.md)

基于 [VERT](https://github.com/VERT-sh/VERT) 定制的公开文件转换工具。无需注册，图片、音频、文档及支持的视频在浏览器本地处理。本站没有文件上传或转换后端。

![十三月格式转换](static/social.png)

## 本站改动

- 新会话默认简体中文，保留英语切换，补齐转换设置、诊断与错误提示中的中文。
- 固定关闭远程视频转换、远程回退、第三方统计、支付和自动反馈上传。
- 自托管 FFmpeg、ImageMagick、Pandoc 等引擎资源，避免运行时依赖外部 CDN。
- 本站品牌、页面元数据、分享图、关于、隐私、条款、联系与安全联系文件。
- Caddy 静态部署、同源连接策略、独立版本目录和构建版本标记。
- 实际浏览器转换、下载、手机布局及网络请求验证，GitHub 验证工作流不自动部署。

## 支持边界

格式列表来自引擎能力声明，不保证所有文件均成功。视频受浏览器编码、设备、分辨率和内存影响；本站不提供服务器回退。旧版 DOC、PDF 与 Office 格式之间的任意互转不在承诺范围。重要文件请保留原件并检查转换结果。

首次使用会下载转换引擎。引擎可在浏览器缓存；大文件可能超出设备内存。无需账号，文件不上传；访问网页和引擎资源仍需要正常的网络请求。

## 开发与验证

```sh
cp .env.example .env
bun install --frozen-lockfile
bun run build
bun run check
bun run lint
bunx playwright install --with-deps chromium
bun run test:smoke
```

使用 Bun 1.4.2、Node 24。详细部署步骤与验收范围见 [维护说明](docs/AFEIII-DEPLOYMENT.md)。生产分支为 `brand/thirteen-month`；升级和发布手动执行。

## 反馈与致谢

联系：support@afeiii.com。报告问题时请说明输入/输出格式、浏览器、设备与操作步骤，不要发送敏感文件。

感谢 VERT 及其贡献者，以及 ImageMagick、Pandoc、FFmpeg、Mediabunny 等开源项目。保留原项目版权与 [AGPL-3.0 许可证](LICENSE)，本站修改源码公开提供。第三方说明见 [THIRD-PARTY-NOTICES](static/THIRD-PARTY-NOTICES.txt)。
