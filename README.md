# Stardew Library

This project to be a [StardewValley](https://www.stardewvalley.net/) style **study room** develop with Vue 3 in Vite.

## 项目设计

以《星露谷物语》温馨、像素田园风格为基调，打造一个沉浸式的线上自习工具。页面融合农场元素，核心模块（TODO、番茄钟、备忘录）分区清晰，支持语言、背景、音乐控制，帮助用户保持专注并提升效率。

### 页面整体布局 （桌面端优先，响应式适配）

- Header（顶栏）标题+（音乐、设置、全屏三个按钮）
- Main Panel
    - PC端 默认三列布局（1:1.1:1）
    - 灵活式布局，提供按钮 供用户选择哪个模块显示在页面上
- Footer（底部栏）素材说明，正在播放：xx音乐

### 交互与切换逻辑

- 语言切换（i18n）
    - 语言配置在 `src/locales` 目录下
    - 影响范围：所有静态文本（模块标题、按钮文字、季节名称、提示语等）、日期格式等
- 季节主题切换
    - 对应更新全局背景图（背景图预加载，避免切换时闪烁。）
- 背景音乐
    - 音乐开关/音效开关/季节特效开关
    - 音乐选择

### 性能与存储

- 所有用户偏好（季节、语言、音乐状态/音量/曲目、TODO数据、备忘录数据、番茄钟设置）均存于 localStorage。
- 提供“导出数据”为 JSON 文件，方便备份或迁移。


### 补充功能 （可能要接入登录？）

- 番茄钟与 TODO 联动
    - 每个任务旁增加一个“🍅 开始专注”按钮，点击后自动将番茄钟设定为 25 分钟，并在计时结束时提示“是否完成任务？”。
    - 完成任务后自动勾选 TODO，并播放收获音效。
- 成就 / 统计
    - 累计完成番茄数达到 5/20/50 时，弹出成就
    - 今日专注时长统计（分钟），TODO 完成率图表（简单柱状图）。
- 音效反馈
    - 添加任务、删除任务、完成任务、番茄钟结束、切换季节等均播放轻量像素风音效（可独立开关）。
- 快捷键支持（提升效率）
    - Ctrl/Cmd + Enter：快速添加当前 TODO 输入框内容。
    - Space：番茄钟开始/暂停（当未聚焦输入框时）。
    - S：切换音乐播放/暂停。


## Thanks

The assets source: https://stardewvalleywiki.com/

### Fonts
- [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font)
- [KNMaiyuan Fonts](https://github.com/maoken-fonts/KNMaiyuan/tree/main)