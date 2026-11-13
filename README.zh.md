# dsh-panel-nav-fold（面板导航折叠）

给 DeepSeek Harness 左侧边栏加一个可折叠的「面板导航栏」标题：把全局面板行（插件、自动化任务、更多，以及其他已注册面板）和所有插件侧边栏入口收成一行，点击后在原位展开。

它不打开浮层、不把入口塞进「更多」菜单，也不改变面板的 pin 状态；展开后原生面板行就在原来的位置。不修改宿主文件。

## 截图

收起（默认）：

![收起状态](assets/screenshot-1.png)

展开：

![展开状态](assets/screenshot-2.png)

## 行为

- 在「新会话」下方、第一个插件侧边栏入口之前，插入一个占满整行的「面板导航栏」按钮。
- 默认收起：隐藏原生 `nav[aria-label="全局面板"]` / `nav[aria-label="Global panels"]` 面板列表，以及所有遵循 `data-dsh-part="sidebar-entry"` 约定的插件侧边栏入口。
- 点击整行展开，再点收起；状态存在 `localStorage` 的 `dsh.panel-nav-fold.folded` 键下。
- 整个侧边栏收到 56px 图标栏（rail）时，自动变成 36×36 的纯图标按钮。
- 去掉 shell 在面板列表上下预留的空档，让「工作区」紧跟面板组，间距与原生一致。
- React 重渲染后由 `MutationObserver` 自动把按钮补回原位。

## 安装

从 DSH 插件市场（dshmarket）安装，或直接指定 GitHub 仓库：

```sh
dsh plugin --profile <profile> add github:naofu233/dsh-panel-nav-fold
```

把 `<profile>` 换成实际使用的 profile（桌面端通常是 `tauri` 或 `desktop`）。之后按插件管理器的提示重启或刷新。

本地开发：用 **插件 → 添加插件** 选择本目录。

## 兼容性

- 在 Windows 的 DeepSeek Harness `0.2.2-rc.2` 上测试过，Tauri 桌面端和 Web UI 都验证过。
- `package.json` 声明 `engines.dsh: ^0.2.2-rc.2`。
- 这是 DOM/CSS 层的视觉增强，不是官方 shell 扩展点。它读取当前侧边栏结构（`nav[aria-label="全局面板"]`、`[data-dsh-part="sidebar-entry"]`，以及 shell 的 `_panelList` / `_scrollArea` 模块类）。未来 shell 改结构可能导致位置或折叠失效；标题行本身仍在，插件可以安全禁用。
- 不修改宿主文件，也不修改其他插件。

## 隐私

- 无网络请求、无遥测、无凭据，不读取也不上传任何工作区或会话数据。
- 唯一持久化的状态是 `localStorage` 里的折叠标志（`dsh.panel-nav-fold.folded`）。
- 所有渲染都在本地页面内完成。

## 卸载

在 **插件** 中禁用或移除即可。`localStorage` 键可以手动清除，留着也无害。

## 文件

- `client.js` — 客户端半部：标题行、状态、自愈、样式。
- `index.js` — Host 半部（无宿主行为）。
- `cordis.patch.yml` — bundle 补丁。
- `locale/` — 插件管理器的标题和描述。
- `screenshots.json` — 市场截图列表。
- `icon.svg` — 插件图标。

## 许可证

MIT
