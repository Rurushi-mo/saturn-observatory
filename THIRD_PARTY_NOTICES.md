# Third-party notices / 第三方素材与许可

本项目原创程序采用根目录 LICENSE 的 MIT 许可。该许可不替代第三方软件、NASA/JPL 数据、模型和纹理各自的使用条件，也不授予商标使用权。

## NASA models and textures

来源署名：NASA Visualization Technology Applications and Development (VTAD)。
使用了以下页面提供的 glTF 模型或从模型提取的贴图；具体原始下载地址与 SHA-256 见 assets/sources.json。
模型纹理经过缩小、JPEG/PNG 重编码；卡西尼、土星、米玛斯的模型经过重新打包。未声称拥有原始素材版权。

- cassini: https://science.nasa.gov/resource/cassini-3d-model/
- saturn: https://science.nasa.gov/resource/saturn-3d-model/
- enceladus: https://science.nasa.gov/resource/enceladus-3d-model/
- mimas: https://science.nasa.gov/resource/mimas-3d-model/
- titan: https://science.nasa.gov/resource/titan-3d-model/

使用条件：https://www.nasa.gov/nasa-brand-center/images-and-media/
NASA 素材通常可用于科普与信息展示，应保留来源署名；若个别资源另有第三方版权标识，则遵守其单独条款。NASA 标识及商标不包含在本项目 MIT 授权内。
本项目使用 AI 辅助开发。渲染结果与说明由本项目负责，不代表 NASA/JPL 的官方产品、审核、认可或背书。

## Ephemerides and scientific references

- NASA/JPL Horizons: https://ssd.jpl.nasa.gov/horizons/
- API documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- Saturn dimensions: https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html
- Saturn rings: https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html
- Cassini orbit insertion timeline: https://www.nasa.gov/wp-content/uploads/2015/01/61369main_soitimeline.pdf
- Visible aurora reference: https://arxiv.org/abs/1506.00664

原始星历响应保留在 assets/horizons/。位置转换结果位于 assets/ephemeris.json。
云形、银河、冰粒分布、部分卫星表面及光学曝光为程序重建；纪录片仅为构图参考，本仓库不包含纪录片截图或片段。

## Three.js 0.180.0 — MIT

https://github.com/mrdoob/three.js
包含 Three.js 核心与 GLTFLoader、RoomEnvironment 及其打包依赖。

The MIT License

Copyright © 2010-2025 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## esbuild 0.25.10 — MIT (build tool)

https://github.com/evanw/esbuild
构建依赖，不随网页执行。

MIT License

Copyright (c) 2020 Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
