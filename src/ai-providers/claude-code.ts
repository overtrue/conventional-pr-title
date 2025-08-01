/**
 * Claude Code Provider
 * Uses Claude Code CLI for enhanced AI interactions
 */

import { BaseAIProvider, AIProviderConfig } from './base-provider'
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types'
import { ClaudeCodeLanguageModel } from './custom-sdk/claude-code/language-model'

export class ClaudeCodeProvider extends BaseAIProvider {
  private languageModel: ClaudeCodeLanguageModel

  constructor(config: AIProviderConfig) {
    super(config, 'ClaudeCode')
    
    this.languageModel = new ClaudeCodeLanguageModel({
      ...config,
      settings: {
        executable: 'npx',
        verbose: config.debug || false,
        cwd: process.cwd()
      }
    })
  }

  getRequiredApiKeyName(): string {
    return 'CLAUDE_CODE_API_KEY'
  }

  protected isRequiredApiKey(): boolean {
    return false // Claude Code CLI can work without API key
  }

  getClient(): any {
    return this.languageModel
  }

  async generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse> {
    this.validateParams()
    
    try {
      return await this.languageModel.generateTitle(request)
    } catch (error) {
      this.handleError(error, 'generateTitle')
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      return await this.languageModel.isHealthy()
    } catch {
      return false
    }
  }
}