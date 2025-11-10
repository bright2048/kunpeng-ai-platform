# VS Code 开发环境操作指导

## 一、环境准备

### 1.1 必需软件安装

在开始之前，请确保已安装以下软件：

```bash
# Node.js (推荐 v18 或更高版本)
node --version  # 应显示 v18.x.x 或更高

# pnpm 包管理器
npm install -g pnpm
pnpm --version  # 应显示 8.x.x 或更高

# Git
git --version
```

### 1.2 VS Code 推荐插件

打开 VS Code，安装以下插件（在扩展商店搜索安装）：

**必装插件**：
- **ESLint** - 代码检查
- **Prettier - Code formatter** - 代码格式化
- **Tailwind CSS IntelliSense** - Tailwind CSS 智能提示
- **TypeScript Vue Plugin (Volar)** - TypeScript 支持
- **Path Intellisense** - 路径智能提示

**推荐插件**：
- **GitLens** - Git 增强
- **Auto Rename Tag** - 自动重命名标签
- **Error Lens** - 行内错误提示
- **Console Ninja** - 控制台增强
- **Thunder Client** - API 测试工具

## 二、项目启动步骤

### 2.1 克隆项目（如果是新环境）

```bash
# 克隆项目到本地
git clone <项目仓库地址>
cd kunpeng-ai-platform
```

### 2.2 安装依赖

```bash
# 使用 pnpm 安装所有依赖
pnpm install
```

安装过程可能需要几分钟，请耐心等待。

### 2.3 启动开发服务器

```bash
# 启动开发服务器
pnpm run dev
```

成功启动后，你会看到类似输出：

```
VITE v7.1.9  ready in 350 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### 2.4 在浏览器中访问

打开浏览器，访问：`http://localhost:3000`

你应该能看到鲲鹏产业源头创新中心的首页。

## 三、VS Code 开发工作流

### 3.1 打开项目

```bash
# 在项目目录下，使用 VS Code 打开
code .
```

或者：
1. 打开 VS Code
2. 点击 "文件" → "打开文件夹"
3. 选择 `kunpeng-ai-platform` 文件夹

### 3.2 VS Code 工作区配置

项目根目录创建 `.vscode/settings.json`（如果不存在）：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 3.3 项目结构说明

```
kunpeng-ai-platform/
├── client/                 # 前端代码
│   ├── public/            # 静态资源
│   └── src/
│       ├── components/    # 可复用组件
│       │   ├── ui/       # shadcn/ui 组件
│       │   ├── Navbar.tsx
│       │   └── Footer.tsx
│       ├── pages/         # 页面组件
│       │   ├── Home.tsx
│       │   ├── Services.tsx
│       │   └── Industries.tsx
│       ├── contexts/      # React Context
│       ├── hooks/         # 自定义 Hooks
│       ├── lib/           # 工具函数
│       ├── App.tsx        # 路由配置
│       ├── main.tsx       # 入口文件
│       └── index.css      # 全局样式
├── server/                # 后端代码（预留）
├── drizzle/              # 数据库 Schema（预留）
├── shared/               # 共享代码
├── package.json          # 项目配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.ts    # Tailwind 配置
└── tsconfig.json         # TypeScript 配置
```

## 四、常见开发任务

### 4.1 创建新页面

**步骤**：

1. 在 `client/src/pages/` 创建新文件，例如 `About.tsx`：

```tsx
export default function About() {
  return (
    <div className="min-h-screen">
      <h1>关于我们</h1>
    </div>
  );
}
```

2. 在 `client/src/App.tsx` 中添加路由：

```tsx
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />  {/* 新增 */}
      {/* ... 其他路由 */}
    </Switch>
  );
}
```

3. 保存文件，浏览器会自动刷新显示新页面

### 4.2 创建新组件

**步骤**：

1. 在 `client/src/components/` 创建新文件，例如 `ServiceCard.tsx`：

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ServiceCard({ title, description, icon }: ServiceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}
```

2. 在页面中使用：

```tsx
import ServiceCard from "@/components/ServiceCard";
import { Cpu } from "lucide-react";

export default function Home() {
  return (
    <div>
      <ServiceCard 
        title="算力保障"
        description="提供强大的算力支持"
        icon={<Cpu className="h-8 w-8" />}
      />
    </div>
  );
}
```

### 4.3 修改样式

**全局样式**：编辑 `client/src/index.css`

**组件样式**：使用 Tailwind CSS 类名

```tsx
// 示例：修改按钮样式
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
  点击我
</button>
```

**Tailwind 常用类名**：
- 间距：`p-4` (padding), `m-4` (margin), `px-4` (左右padding), `py-4` (上下padding)
- 颜色：`bg-blue-600` (背景), `text-white` (文字), `border-gray-300` (边框)
- 布局：`flex`, `grid`, `container`, `max-w-7xl`, `mx-auto`
- 响应式：`md:text-lg` (中等屏幕), `lg:grid-cols-3` (大屏幕)

### 4.4 使用 shadcn/ui 组件

项目已集成 shadcn/ui，可以直接使用：

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>示例卡片</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" placeholder="输入邮箱" />
          </div>
          <Button>提交</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.5 添加图标

使用 lucide-react 图标库：

```tsx
import { 
  Sparkles, 
  Building2, 
  Cpu, 
  Database,
  ArrowRight,
  Check,
  X
} from "lucide-react";

export default function Example() {
  return (
    <div>
      <Sparkles className="h-6 w-6 text-blue-500" />
      <Cpu className="h-8 w-8 text-green-500" />
    </div>
  );
}
```

浏览图标：https://lucide.dev/icons/

## 五、调试技巧

### 5.1 浏览器开发者工具

**打开方式**：
- Chrome/Edge: 按 `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- 右键点击页面 → "检查"

**常用面板**：
- **Elements**: 查看和修改 HTML/CSS
- **Console**: 查看日志和错误
- **Network**: 查看网络请求
- **Sources**: 调试 JavaScript 代码

### 5.2 Console 调试

在代码中添加 console.log：

```tsx
export default function Home() {
  const data = { name: "测试", value: 123 };
  
  console.log("调试信息:", data);
  console.error("错误信息");
  console.warn("警告信息");
  
  return <div>首页</div>;
}
```

### 5.3 React DevTools

**安装**：
- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

**使用**：
1. 打开浏览器开发者工具
2. 切换到 "Components" 或 "Profiler" 标签
3. 查看组件树、Props、State

### 5.4 VS Code 调试

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/client/src"
    }
  ]
}
```

使用：
1. 在代码中设置断点（点击行号左侧）
2. 按 `F5` 启动调试
3. 在断点处暂停，查看变量值

## 六、常见问题解决

### 6.1 端口被占用

**错误信息**：
```
Port 3000 is already in use
```

**解决方案**：

**Windows**:
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 PID 为实际进程ID）
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
# 查找并结束进程
lsof -ti:3000 | xargs kill -9
```

或者修改端口：
```bash
# 使用其他端口
pnpm run dev -- --port 3001
```

### 6.2 依赖安装失败

**解决方案**：

```bash
# 清除缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 6.3 TypeScript 错误

**常见错误**：
- 类型不匹配
- 找不到模块

**解决方案**：

```bash
# 重启 TypeScript 服务器
# 在 VS Code 中：Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 或者重新安装类型定义
pnpm install --save-dev @types/node @types/react @types/react-dom
```

### 6.4 样式不生效

**检查清单**：
1. 确认 Tailwind CSS 类名拼写正确
2. 检查 `tailwind.config.ts` 配置
3. 确认 `index.css` 中包含 Tailwind 指令：
   ```css
   @import "tailwindcss";
   ```
4. 重启开发服务器

### 6.5 页面空白

**排查步骤**：

1. 打开浏览器控制台，查看错误信息
2. 检查路由配置是否正确
3. 检查组件是否正确导出/导入
4. 查看 VS Code 终端是否有编译错误

## 七、Git 版本控制

### 7.1 基本工作流

```bash
# 查看当前状态
git status

# 添加修改的文件
git add .

# 提交更改
git commit -m "描述你的修改"

# 推送到远程仓库
git push origin main
```

### 7.2 分支管理

```bash
# 创建新分支
git checkout -b feature/new-feature

# 切换分支
git checkout main

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

### 7.3 VS Code Git 集成

**使用 VS Code 内置 Git**：
1. 点击左侧 "源代码管理" 图标
2. 查看修改的文件
3. 点击 "+" 暂存更改
4. 输入提交信息
5. 点击 "✓" 提交

## 八、测试流程

### 8.1 本地测试清单

在提交代码前，请确保：

- [ ] 开发服务器正常启动
- [ ] 所有页面可以正常访问
- [ ] 没有 TypeScript 错误
- [ ] 没有控制台错误
- [ ] 响应式设计正常（测试不同屏幕尺寸）
- [ ] 所有链接和按钮可以点击
- [ ] 表单验证正常工作

### 8.2 浏览器兼容性测试

测试以下浏览器：
- Chrome（最新版本）
- Firefox（最新版本）
- Safari（Mac）
- Edge（最新版本）

### 8.3 响应式测试

**在浏览器中测试**：
1. 打开开发者工具（F12）
2. 点击设备工具栏图标（Ctrl+Shift+M）
3. 选择不同设备预设：
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**或使用 VS Code 插件**：
- Browser Preview

## 九、性能优化建议

### 9.1 图片优化

```tsx
// 使用 WebP 格式
<img src="/images/logo.webp" alt="Logo" />

// 添加 loading="lazy" 懒加载
<img src="/images/banner.jpg" alt="Banner" loading="lazy" />
```

### 9.2 代码分割

```tsx
// 使用动态导入
import { lazy, Suspense } from "react";

const About = lazy(() => import("./pages/About"));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <About />
    </Suspense>
  );
}
```

### 9.3 构建优化

```bash
# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview
```

## 十、快捷键参考

### VS Code 常用快捷键

**Windows/Linux**:
- `Ctrl+P`: 快速打开文件
- `Ctrl+Shift+P`: 命令面板
- `Ctrl+B`: 切换侧边栏
- `Ctrl+``: 切换终端
- `Ctrl+/`: 注释/取消注释
- `Alt+↑/↓`: 移动行
- `Shift+Alt+↑/↓`: 复制行
- `Ctrl+D`: 选择下一个相同内容
- `Ctrl+Shift+L`: 选择所有相同内容
- `F2`: 重命名符号

**Mac**:
- `Cmd+P`: 快速打开文件
- `Cmd+Shift+P`: 命令面板
- `Cmd+B`: 切换侧边栏
- `Cmd+``: 切换终端
- `Cmd+/`: 注释/取消注释
- `Option+↑/↓`: 移动行
- `Shift+Option+↑/↓`: 复制行
- `Cmd+D`: 选择下一个相同内容
- `Cmd+Shift+L`: 选择所有相同内容
- `F2`: 重命名符号

## 十一、学习资源

### 官方文档
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/
- Vite: https://vitejs.dev/
- shadcn/ui: https://ui.shadcn.com/

### 推荐教程
- React 中文文档: https://zh-hans.react.dev/
- TypeScript 入门教程: https://ts.xcatliu.com/
- Tailwind CSS 中文文档: https://www.tailwindcss.cn/

### 社区资源
- Stack Overflow: https://stackoverflow.com/
- GitHub Discussions: 项目仓库的 Discussions 标签
- React 中文社区: https://react.nodejs.cn/

## 十二、联系与支持

如果遇到问题：
1. 查看本文档的"常见问题解决"部分
2. 搜索 GitHub Issues
3. 在项目仓库创建新 Issue
4. 联系项目维护者

---

**祝开发顺利！** 🚀
