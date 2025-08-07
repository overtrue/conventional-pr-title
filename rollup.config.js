// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = [
  // 主入口文件 (GitHub Action)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json'
      }),
      nodeResolve({
        preferBuiltins: true,
        exportConditions: ['node']
      }),
      commonjs()
    ],
    external: [
      '@actions/core',
      '@actions/github',
      'ai',
      // 外部化所有 AI SDK 提供者包
      '@ai-sdk/anthropic',
      '@ai-sdk/openai',
      '@ai-sdk/google',
      '@ai-sdk/google-vertex',
      '@ai-sdk/azure',
      '@ai-sdk/mistral',
      '@ai-sdk/cohere',
      '@ai-sdk/xai',
      '@ai-sdk/amazon-bedrock',
      'ai-sdk-provider-claude-code',
      'ai-sdk-provider-togetherai',
      'ai-sdk-provider-fireworks',
      'ai-sdk-provider-deepinfra',
      'ai-sdk-provider-deepseek',
      'ai-sdk-provider-cerebras',
      'ai-sdk-provider-groq',
      'ai-sdk-provider-perplexity',
      'ai-sdk-provider-openrouter'
    ]
  },
  // Providers 模块 (用于测试)
  {
    input: 'src/providers/index.ts',
    output: {
      file: 'dist/providers/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json'
      }),
      nodeResolve({
        preferBuiltins: true,
        exportConditions: ['node']
      }),
      commonjs()
    ],
    external: [
      'ai',
      // 外部化所有 AI SDK 提供者包
      '@ai-sdk/anthropic',
      '@ai-sdk/openai',
      '@ai-sdk/google',
      '@ai-sdk/google-vertex',
      '@ai-sdk/azure',
      '@ai-sdk/mistral',
      '@ai-sdk/cohere',
      '@ai-sdk/xai',
      '@ai-sdk/amazon-bedrock',
      'ai-sdk-provider-claude-code',
      'ai-sdk-provider-togetherai',
      'ai-sdk-provider-fireworks',
      'ai-sdk-provider-deepinfra',
      'ai-sdk-provider-deepseek',
      'ai-sdk-provider-cerebras',
      'ai-sdk-provider-groq',
      'ai-sdk-provider-perplexity',
      'ai-sdk-provider-openrouter'
    ]
  }
]

export default config
