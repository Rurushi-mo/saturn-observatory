# 土星观测站 · Saturn Observatory

[在线体验](https://rurushi-mo.github.io/saturn-observatory/) · [下载离线 HTML](https://github.com/Rurushi-mo/saturn-observatory/raw/refs/heads/main/index.html) · [历史版本](archive/README.md)

基于 Three.js / WebGL 的交互式三维土星观测网页。围绕同一空间中的土星、星环、19 颗主要卫星与卡西尼探测器，平滑切换观测位置。

![土星观测站](docs/images/live.png)

## 打开与分享

直接用 Edge 或 Chrome 打开根目录 **index.html**，无需安装依赖、联网或解压。模型、纹理和运行库已内嵌，网页约 15 MB。需要浏览器启用 WebGL；高画质较依赖 GPU，较慢设备可选择“标准画质”。

也可启用 GitHub Pages，让访客通过 HTTPS 链接访问。具体步骤见 [发布说明](docs/PUBLISHING.md)。仓库代码页本身不会运行 HTML，分享体验时请使用 Pages 地址。

## 内容与操作

- 三种画风：写实、平面、辉光素描。
- 经典、全景、云层近景、冰粒特写、掠过环面、大气仰望、逆光日冕。
- 北极六边形、泰坦、土卫二喷流、米玛斯、极光和卡西尼，以及其他卫星入口。
- 拖动环绕，滚轮缩放，双击复位；H 隐藏菜单，Esc 恢复菜单。
- 卫星、探测器和星环冰粒特写可自由环绕，距离有安全边界；星环特写可转身看到土星本体。大气视角围绕当地竖直方向，云层近景与掠环视角仍有角度限制。
- 银河、卫星标记可开关；接近星环时出现结构标注。

![星环冰粒之间回望土星](docs/images/ring-density-saturn.png)

![潘的赤道山脊](docs/images/pan-v3.1.png)

## 科学数据与表现范围

这是科普与视觉探索项目，并非任务规划或精密星历模拟器。
土星尺度、主环半径及天体尺寸参考公开资料；19 颗卫星与卡西尼使用 JPL Horizons 的 **2004-07-01 02:39 UTC** 位置快照。
时间控制云层自转、环粒差速和气体现象，不推进卫星与探测器星历。太阳采用构图照明方向，未与该历史历元对齐。
云形、银河、局部冰粒、11 颗小卫星表面和大气散射为可视化近似；探测器姿态未重建历史遥测。
8 颗主要卫星分别使用其独立 NASA 模型与贴图，其余 11 颗小卫星按 JPL 三轴尺寸和各自形态重建。立体冰粒覆盖横向宽度约 16 km，外围颗粒层横向宽度约 128 km。局部细节采用连续半径的圆形面积取样，以小冰粒为主，厚度约 10 m；取样密度未精确标定 A 环光学深度。
本项目由 AI 辅助开发，未经 NASA/JPL 审核或背书。资料来源与素材加工记录见 [第三方说明](THIRD_PARTY_NOTICES.md)。

## 开发与验证

使用 Node.js 22 或更新版本。在项目根目录运行：

```sh
npm ci
npm test
npm run build
npm run verify
npm run preview
```

本地预览默认地址为 http://127.0.0.1:8766/ 。`npm ci` 首次需要网络；之后使用现有依赖构建无需下载素材。
`npm run build` 只生成根目录 index.html，不改动历史档案。已有网页可直接使用，不需要构建。
镜头检查覆盖 900 组转换、障碍物避让、端点连续性、圆锥边界、米级目标接近与中途改选；另检查 19 颗卫星资源互异、冰粒区域覆盖、自由环绕、着色器兼容性，以及粒径、层厚、中心密度与长时差速分布。
早期发布记录见 [3.1 检测报告](docs/VALIDATION-v3.1.md)，星环边界修正过程见 [3.1.1 检测报告](docs/VALIDATION-v3.1.1.md)。
最新版本 **3.1.2** 合并星环边界与大气遮挡两次修正，检测及浏览器对照见 [3.1.2 检测报告](docs/VALIDATION-v3.1.2.md)。

可选图形检查：在环境中已有 Playwright 和其 Chromium 浏览器时，运行 `npm run test:gpu`。也可通过 `SATURN_PLAYWRIGHT_MODULE` 指定 Playwright 模块 URL、`SATURN_BROWSER_PATH` 指定独立测试浏览器路径。此检查使用临时独立浏览器，不读取现有浏览器窗口；常规 `npm test` 不需要浏览器依赖。

## 文件结构

```text
index.html                 最新离线网页 / Pages 入口
src/                       可编辑程序、导航算法、界面模板
scripts/                   构建、完整性检查、本地预览
tests/                     镜头回归检查
assets/                    内嵌素材、星历、来源清单
archive/                   原有全部文件及 SHA-256 清单
docs/                      截图、发布说明、检测记录
licenses/                  第三方软件许可原文
```

历史版本见 [版本档案](archive/README.md)，更新内容见 [CHANGELOG](CHANGELOG.md)。

## 许可

本项目原创代码按 [MIT License](LICENSE) 发布；该许可允许他人在保留声明的前提下使用、修改和分发，包括商业使用。
NASA/JPL 模型、纹理、数据和第三方软件仍按 [各自条件](THIRD_PARTY_NOTICES.md) 使用，不因本仓库的 MIT 许可改变。
