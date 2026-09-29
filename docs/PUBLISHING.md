# GitHub 存档与 Pages 发布

仓库：https://github.com/Rurushi-mo/saturn-observatory

在线体验：https://rurushi-mo.github.io/saturn-observatory/

项目所有者已确认公开发布及原创代码的 MIT 授权。以下保留首次发布与后续维护步骤。

1. 在自己的 GitHub 账户下创建空的公开仓库，不另外自动生成 README 或 LICENSE。
2. 使用 GitHub Desktop 添加本项目文件夹，检查待提交清单后提交并发布；或使用 Git 命令行。
3. 确保 node_modules、个人配置与 .env 未列入提交。根目录 index.html 必须包含在提交内。
4. 在仓库 Settings → Pages，选择 Deploy from a branch，选择 main 分支与 /(root)，保存。
5. 等部署完成，使用 Pages 页面显示的 Visit site 地址验证。项目网址通常为 https://账户名.github.io/saturn-observatory/。
6. 分别分享仓库地址（源码与存档）和 Pages 地址（直接体验）。

本项目含 .nojekyll，无需 Jekyll，也无需配置 GitHub Actions 或构建密钥。
历史快照保留在 archive/，首次提交后可将真实的首个发布提交标记为 v3.0.0，切勿将旧快照冒充过去的 Git 提交。

更新方法：修改 src/ → npm test → npm run build → npm run verify → 提交 src/ 与 index.html → 推送 main。
仅修改源码、不重新生成 index.html 时，Pages 不会自动反映程序修改。

GitHub 官方文档：
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

若浏览器无法显示三维画面，检查 WebGL/硬件加速；GitHub 代码预览页不是运行入口。
