# AGENTS.md

## 项目概述 (Project Overview)

This project to be a [StardewValley](https://www.stardewvalley.net/) style **study room** develop with Vue 3 in Vite.

Use Vue3 + Pinia + Unocss

星露谷主题的自习室（工具类网站），包含以下模块：TODO，番茄钟，备忘录。

## 项目需求 (Project Requirement)

- 支持中英切换，分别对应不同字体
- 支持两种主题切换（对应两套UI）
- 支持更换body背景图片和h1标题
- 支持背景音乐选择和开关

## 开发规则 (Development Rules)
- **命名规范**：组件用帕斯卡命名法，函数用驼峰命名法。
- **代码风格**：使用空格缩进（2格），优先使用函数式组件，不使用 `any` 类型。
- **文档**：所有新函数必须添加 JSDoc 注释。

## 数据存储

使用浏览器 localStorage 进行数据存储，保证存储的是一个完整的数据对象

## 设置与命令 (Setup & Commands)
- **安装依赖**：`pnpm install`
- **运行项目**：`pnpm run dev`
- **运行测试**：`pnpm test`

## 目录结构说明 (Directory Structure)
- `src/components`: 公共组件
- `src/pages`: 页面路由
- `src/utils`: 工具函数
- `src/assets`: 静态资源

## 安全与约束 (Safety & Constraints)
- 不要硬编码 API 密钥。
- 在修改 `config.json` 前务必询问。
