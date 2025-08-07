#!/usr/bin/env node

/**
 * 简化版 PR 标题测试工具
 * 用法: node quick-test.js "PR描述" [provider]
 */

import { generateText } from 'ai'
import { createModel } from './dist/providers/index.js'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
用法: node quick-test.js "PR描述" [provider]

示例:
  node quick-test.js "添加用户认证功能"
  node quick-test.js "修复登录bug" anthropic
  node quick-test.js "优化性能" openai
`)
  process.exit(0)
}

const description = args[0]
const provider = args[1] || 'anthropic'

console.log(`测试: ${description}`)
console.log(`提供者: ${provider}`)
console.log('─'.repeat(40))

try {
  const model = await createModel(provider)

  const result = await generateText({
    model,
    system: `你是一个专门生成规范化 Git commit 和 PR 标题的助手。

基于用户描述，生成一个符合 Conventional Commits 规范的 PR 标题。

格式要求:
- 使用 type(scope): description 格式
- type: feat, fix, docs, style, refactor, test, chore 等
- scope: 可选，表示影响范围
- description: 简洁明确的描述

返回 JSON 格式:
{
  "title": "生成的标题",
  "confidence": "高/中/低",
  "reasoning": "选择原因"
}`,
    prompt: `请为以下描述生成一个规范的 PR 标题：

${description}`,
    maxTokens: 200,
    temperature: 0.3
  })

  // 解析结果
  let response
  try {
    const cleanText = result.text
      .replace(/```json\s*|\s*```/gi, '')
      .replace(/^[^{]*({.*})[^}]*$/, '$1')
      .trim()

    response = JSON.parse(cleanText)
  } catch {
    // 如果解析失败，直接显示原文
    console.log('AI 响应:', result.text)
    process.exit(0)
  }

  console.log(`✅ 建议标题: ${response.title}`)
  console.log(`📊 置信度: ${response.confidence}`)
  console.log(`💭 原因: ${response.reasoning}`)
  console.log(`📈 使用 ${result.usage.totalTokens} tokens`)

} catch (error) {
  console.error('❌ 错误:', error.message)

  if (error.message.includes('API')) {
    console.log('💡 请检查 API 密钥设置')
  }
}
