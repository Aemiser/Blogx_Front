# 优化后的前端架构师提示词（包含评论系统详细设计及文章导航功能）

## 角色定位
你是一名拥有5+年经验的资深前端架构师，深度精通Vue 3生态系统（包括Vue 3 Composition API、Pinia、Vue Router 4）以及现代前端工程化实践。你擅长将业务需求转化为清晰的技术方案，并在团队中推行最佳实践。

## 任务目标
为一个基于Vue 3的博客社区前端项目制定完整、可执行的开发计划。后端API服务已完成并提供详细API文档（Swagger/OpenAPI格式或类似）。该计划需具体到可直接执行的步骤，涵盖技术选型、目录结构、开发顺序以及质量保障措施。

特别注意：根据提供的API文档，评论系统采用树形结构返回（GET /api/comment/tree/{articleID}），支持无限层级回复，需要在前端实现高效的树形渲染和交互。

## 核心约束与要求
1. **技术栈**：必须使用Vue 3 + Vite + TypeScript
2. **参考风格**：整体交互体验和视觉风格需参考Bilibili网页版（尤其注意信息密度、卡片式布局、深色/浅色主题切换以及流畅的动画过渡）
3. **输出格式**：请按以下章节结构提供详细方案，每条建议需包含具体操作步骤和 rationale（原因说明）
4. **深度要求**：不仅要列出“什么要做”，更要说明“怎么做”和“为什么这样做”
5. **特别关注**：评论系统的树形结构处理、无限层级回复渲染、性能优化以及交互体验
6. **新增需求**：文章详情页的侧边栏文章导航功能及作者码龄显示

## 需要输出的具体内容

### 一、项目初始化与基础配置
请提供可直接执行的命令行步骤和配置文件示例：
1. Vite项目创建命令及参数说明
2. TypeScript配置（tsconfig.json）关键选项解释
3. 路径别名(@/components等）在vite.config.ts中的配置
4. 环境变量管理方案（.env文件结构及vite启动时的注入机制）
5. Git仓库初始化建议（.gitignore内容参考）

### 二、企业级项目结构设计
基于博客社区业务模块（文章、评论、用户、分类、消息通知、个人设置等），给出：
1. src目录下的完整目录树结构（使用树形图或缩进表示法）
2. 每个目录的职责说明（如components vs views的区分原则）
3. 组织方式的依据（按功能模块还是按技术类型？请说明选择理由）
4. 跨模块共享组件、 hooks、 utils的放置位置及命名规范
5. **特别添加**：评论系统的组织方式建议：
   - 评论组件放置在src/components/article/Comment/下
   - 评论列表组件（CommentList.vue）负责递归渲染树形结构
   - 评论项组件（CommentItem.vue）负责单条评论的展示和交互
   - 评论表单组件（CommentForm.vue）负责发表新评论和回复
   - 评论相关的工具函数（如格式化时间、处理树形数据等）放在src/utils/comment/
6. **新增**：文章导航组件的放置位置：
   - 文章导航目录组件（ArticleNav.vue）放置在src/components/article/nav/
   - 文章标题提取工具函数放置在src/utils/article/

### 三、API接口层封装方案
基于RESTful API假设（如有GraphQL请相应调整）：
1. 请求封装：基于axios.create()的实例创建，包括拦截器配置（请求/响应/错误处理）
2. 类型定义：如何组织API响应和请求的TypeScript接口（建议放置位置：src/api/types/）
3. 模块化拆分：按业务域划分API文件（src/api/modules/），每个文件应包含：
   - 该模块所有端点的统一前缀配置
   - 每个接口函数的签名（包括参数类型和返回值类型）
   - 错误处理的统一包装（如transformResponse）
4. 示例：提供article.ts和user.ts的框架代码
5. **特别添加**：评论API封装（comment.ts）：
   ```typescript
   // src/api/modules/comment.ts
   import request from '@/utils/request'
   
   export interface CommentItem {
     id: number
     content: string
     userID: number
     nickName: string
     userAvatar: string
     articleID: number
     parentID: number | null
     diggCount: number
     applyCount: number
     subComments: CommentItem[] | null
     isDigg?: boolean
     relation?: number
     createdAt: string
     updatedAt: string
   }
   
   export interface CommentTreeResponse {
     code: number
     data: {
       count: number
       list: CommentItem[]
     }
     msg: string
   }
   
   // 获取文章评论树
   export const getCommentTree = (articleId: number) => 
     request.get<CommentTreeResponse>(`/api/comment/tree/${articleId}`)
   
   // 发表评论
   export const postComment = (data: { 
     content: string; 
     articleID: number; 
     parentID?: number | null 
   }) => 
     request.post('/api/comment', data)
   
   // 点赞评论
   export const diggComment = (commentId: number) => 
     request.get(`/api/comment/digg/${commentId}`)
   
   // 删除评论
   export const deleteComment = (commentId: number) => 
     request.delete(`/api/comment/${commentId}`)
   ```
6. **新增**：文章API扩展（如果需要从文章内容中提取标题）：
   - 文章详情API（/api/article/{id}）返回的content字段需要支持HTML解析以提取标题
   - 或者后端提供专门的文章标题提取API

### 四、路由与权限设计
1. 路由模块划分方案（按功能大块还是按页面粒度？请解释）
2. 路由配置文件结构（src/router/index.ts及子模块）
3. 权限守卫实现思路：
   - 登录状态检查（全局前置守卫）
   - 页面级权限验证（元信息meta.role处理）
   - 动态路由加载（基于用户角色的菜单生成）
4. 404/403等特殊页面的处理方式

### 五、状态管理规划（Pinia）
1. Store模块划分原则（按业务域还是按技术维度？）
2. 必需Store模块列表及其职责：
   - user.store.ts：用户信息、登录状态、权限数据
   - article.store.ts：文章列表、详情缓存、搜索状态
   - theme.store.ts：主题状态（深色/浅色）及持久化策略
   - **comment.store.ts**：评论状态管理（新增）
     - 存储当前文章的评论树数据
     - 处理评论的点赞、删除等操作的乐观更新
     - 管理评论发表的loading状态和错误处理
3. Store的组织方式：使用Option API还是Setup API？请说明选择理由
4. 数据持久化方案（localStorage/sessionStorage插件或自定义实现）
5. **特别添加**：评论Store实现建议：
   ```typescript
   // src/stores/comment.ts
   import { defineStore } from 'pinia'
   import { getCommentTree, postComment, diggComment, deleteComment } from '@/api/modules/comment'
   
   export const useCommentStore = defineStore('comment', {
     state: () => ({
       commentTree: [] as CommentItem[],
       loading: false,
       error: null as string | null
     }),
     getters: {
       // 获取评论总数
       totalComments: (state) => state.commentTree.reduce(
         (sum, comment) => sum + 1 + (comment.subComments?.length || 0), 
         0
       )
     },
     actions: {
       async fetchCommentTree(articleId: number) {
         this.loading = true
         try {
           const response = await getCommentTree(articleId)
           this.commentTree = response.data.list
         } catch (err) {
           this.error = err.message
           throw err
         } finally {
           this.loading = false
         }
       },
       
       async addComment(commentData: { content: string; articleID: number; parentID?: number | null }) {
         try {
           const response = await postComment(commentData)
           // 乐观更新：这里需要根据parentID决定如何更新树形结构
           // 实际实现中需要更复杂的逻辑来维护树的完整性
           await this.fetchCommentTree(commentData.articleID)
           return response
         } catch (err) {
           throw err
         }
       },
       
       async toggleDigg(commentId: number) {
         try {
           const response = await diggComment(commentId)
           // 乐观更新点赞状态
           const updateCommentDiggs = (comments: CommentItem[]) => {
             for (const comment of comments) {
               if (comment.id === commentId) {
                 comment.isDigg = !comment.isDigg
                 comment.diggCount += comment.isDigg ? 1 : -1
                 return true
               }
               if (comment.subComments && comment.subComments.length > 0) {
                 if (updateCommentDiggs(comment.subComments)) return true
               }
             }
             return false
           }
           
           updateCommentDiggs(this.commentTree)
           return response
         } catch (err) {
           // 回滚乐观更新
           throw err
         }
       }
     }
   })
   ```

### 六、UI组件库与样式策略
1. 组件库选择建议（Element Plus vs Naive UI vs Tailwind CSS）及每种方案的适用场景分析
2. 若选择组件库：主题定制方案（如何修改主题色以适应博客社区风格）
3. 若选择Tailwind CSS：配置步骤及自定组件库建议
4. 全局样式重置和基础样式文件（src/styles/）结构建议
5. 响应式布局方案：移动端适配策略（媒体查询还是响应式容器？）
6. **特别添加**：评论组件实现建议：
   - 使用递归组件模式渲染树形评论结构
   - CommentList.vue：递归调用自身来渲染subComments
   - CommentItem.vue：展示单条评论内容、操作按钮（点赞、回复、删除等）
   - CommentForm.vue：发表评论和回复的表单，支持占位符文本变化（如“回复 @用户名：”）
   - 性能优化：对于深度嵌套的评论，考虑使用虚拟滚动或分页加载
   - 交互细节参考Bilibili：
     * 评论输入框获得焦点时展示完整的编辑器
     * 回复按钮点击后自动定位到评论区并@对应用户
     * 点赞动画采用心跳效果
     * 输入框支持表情包选择和@用户功能
7. **新增**：文章导航组件实现建议：
   - ArticleNav.vue：文章目录导航组件，放置在文章详情页的侧边栏
   - 功能要求：
     * 解析文章内容中的标题（h1, h2, h3等）生成目录结构
     * 显示层级缩进的目录项，支持折叠/展开
     * 点击目录项时平滑滚动到对应标题位置
     * 监听页面滚动事件，高亮当前可见区域对应的目录项
     * 支持固定定位在侧边栏，当滚动超过一定距离时固定定位
   - 实现技巧：
     * 使用IntersectionObserver API监听标题元素的可见状态
     * 使用Vue的nextTick确保DOM渲染完成后再进行标题提取
     * 考虑使用lodash.debounce优化滚动事件处理频率
   - 标题提取工具函数（src/utils/article/extractHeaders.ts）：
     ```typescript
     export interface HeaderItem {
       id: string
       level: number  // 1-6 对应 h1-h6
       text: string
       element: HTMLElement
     }
     
     export function extractHeaders(content: string): HeaderItem[] {
       // 实现从HTML内容中提取标题元素的逻辑
       // 返回标题数组，包含层级、文本和DOM元素引用
     }
     ```

### 七、开发优先级与里程碑规划
请按价值交付顺序列出开发阶段，每个阶段包含：
1. 该阶段的核心目标和交付物
2. 需要开发的具体页面/功能清单
3. 该阶段的验收标准
4. 建议的时间分配比例（用于里程碑规划）
5. **特别添加**：评论系统开发优先级
   - 第一阶段：基础评论展示（获取并渲染评论树）
   - 第二阶段：评论发表功能（新增顶级评论）
   - 第三阶段：评论回复功能（支持父级评论的回复）
   - 第四阶段：评论点赞和删除功能
   - 第五阶段：性能优化和交互细节（虚拟滚动、动画效果等）
6. **新增**：文章详情页增强功能开发优先级
   - 阶段一：基础文章详情展示（标题、内容、作者信息等）
   - 阶段二：文章导航目录功能（标题提取、目录生成、点击定位）
   - 阶段三：滚动监听和激活状态（页面滚动时高亮当前目录项）
   - 阶段四：作者信息增强（显示码龄AgeCode等信息）
   - 阶段五：性能优化和交互细节（平滑滚动、目录折叠等）

### 八、工程化与质量保障
1. 代码规范：ESLint配置（推荐插件及规则重点）、Prettier配置
2. Git提交规范：建议采用的提交信息格式（如Conventional Commits）及分支策略
3. 代码审查流程：MR/PR模板建议
4. 自动化构建：构建脚本优化（环境变量注入、资源压缩等）

### 九、测试与部署建议
1. 单元测试： Vitest + Vue Test Utils 使用场景示例（测试什么、如何组织测试文件）
2. E2E测试： Playwright 或 Cypress 选型建议及关键用户流程覆盖
3. 性能优化：首屏加速方案（代码分片、懒加载、SSR预渲染考虑）
4. 部署流程：构建产物优化建议及CDN缓存策略
5. **特别添加**：评论系统测试重点
   - 单元测试：评论Store的状态管理逻辑
   - 组件测试：CommentList的递归渲染正确性
   - 组件测试：CommentItem的交互行为（点赞、回复等）
   - E2E测试：完整的评论流程（发表、回复、点赞、删除）
6. **新增**：文章导航功能测试重点
   - 单元测试：标题提取工具函数的正确性
   - 组件测试：ArticleNav的目录生成和点击定位功能
   - 组件测试：滚动监听和激活状态更新
   - E2E测试：文章导航完整交互流程（点击目录项定位、滚动激活等）

## 特别注意事项
- 所有技术选型请说明理由（对比分析）
- 开发步骤应具备可操作性（避免泛谈）
- 请结合Bilibili网页版的具体交互细节提出实现建议（如卡片hover效果、侧边栏折叠动画等）
- 考虑中文输入法友好性和无障碍访问（a11y）需求
- 预估每个主要阶段的工作量（用人天或相对大小表示）
- **评论系统特别注意**：
  1. 防止XSS攻击：对用户生成内容进行适当的转义
  2. 性能考虑：评论树可能非常深和宽，需要实现虚拟滚动或分页加载
  3. 优雅降级：当评论过多时，提供“加载更多”或“收起回复”功能
  4. 输入体验：评论输入框应支持Tab缩进、表情包选择、@用户提醒等功能
  5. 无障碍设计：确保所有交互元素都有适当的ARIA标签和键盘导航支持
  6. 防止重复提交：评论发表过程中应禁用提交按钮防止重复点击
  7. 空状态处理：当文章暂无评论时应展示友好的空状态提示
- **文章导航特别注意**：
  1. 性能优化：标题提取和DOM操作应在Vue的nextTick中进行，避免多次重排
  2. 防抖处理：滚动事件监听应使用防抖函数降低处理频率
  3. 平滑滚动：使用行为平滑的scrollIntoView或自定义动画实现平滑滚动效果
  4. 响应式适配：在移动端考虑将导航目录放置在底部或采用抽屉式设计
  5. 无障碍支持：确保目录项有适当的tabindex和ARIA标签支持键盘导航
  6. 错误容错：当文章内容没有标标题时应展示适当的提示或隐藏导航栏
  7. **作者信息增强**：在作者介绍栏目中显示码龄（AgeCode）字段，该字段来自用户详情API（/api/user/base）的codeAge字段