import { debug as coreDebug } from '@actions/core'

/**
 * Unified logging utilities for the application
 */
export class Logger {
  private static isDebugEnabled = false
  
  static configure(debugEnabled: boolean): void {
    Logger.isDebugEnabled = debugEnabled
  }
  
  static debug(message: string, data?: any): void {
    if (!Logger.isDebugEnabled) return
    
    const timestamp = new Date().toISOString()
    const prefix = `🤖 [DEBUG ${timestamp}]`
    
    if (data) {
      coreDebug(`${prefix} ${message}:`)
      coreDebug(JSON.stringify(data, null, 2))
    } else {
      coreDebug(`${prefix} ${message}`)
    }
  }
  
  static error(message: string, error?: any): void {
    if (!Logger.isDebugEnabled) return
    
    const timestamp = new Date().toISOString()
    const prefix = `❌ [ERROR ${timestamp}]`
    
    console.error(`${prefix} ${message}`)
    if (error) {
      console.error(error)
    }
  }
  
  static info(message: string): void {
    coreDebug(`ℹ️ ${message}`)
  }
}

/**
 * Simple dependency injection container for better testability
 */
export class DIContainer {
  private static services = new Map<string, any>()
  private static factories = new Map<string, () => any>()
  
  static register<T>(key: string, instance: T): void {
    DIContainer.services.set(key, instance)
  }
  
  static registerFactory<T>(key: string, factory: () => T): void {
    DIContainer.factories.set(key, factory)
  }
  
  static get<T>(key: string): T {
    // Check for direct instance first
    if (DIContainer.services.has(key)) {
      return DIContainer.services.get(key) as T
    }
    
    // Check for factory
    if (DIContainer.factories.has(key)) {
      const factory = DIContainer.factories.get(key)!
      const instance = factory()
      DIContainer.services.set(key, instance) // Cache the instance
      return instance as T
    }
    
    throw new Error(`Service not found: ${key}`)
  }
  
  static has(key: string): boolean {
    return DIContainer.services.has(key) || DIContainer.factories.has(key)
  }
  
  static clear(): void {
    DIContainer.services.clear()
    DIContainer.factories.clear()
  }
}

/**
 * Performance optimization utilities
 */
export class PerformanceCache {
  private static cache = new Map<string, any>()
  
  static get<T>(key: string): T | undefined {
    return PerformanceCache.cache.get(key)
  }
  
  static set<T>(key: string, value: T): void {
    PerformanceCache.cache.set(key, value)
  }
  
  static has(key: string): boolean {
    return PerformanceCache.cache.has(key)
  }
  
  static clear(): void {
    PerformanceCache.cache.clear()
  }
}

/**
 * Pre-compiled regex patterns for performance
 */
export const REGEX_PATTERNS = {
  CONVENTIONAL_COMMIT: /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.+\))?(!)?: .{1,}$/,
  SCOPE: /\(([^)]+)\)/,
  TYPE: /^([^(:!]+)/,
  CHINESE: /[\u4e00-\u9fff]/,
  // Add more patterns as needed
} as const

/**
 * Async retry utility with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        throw new Error(
          `Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`
        )
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, baseDelay * Math.pow(2, attempt))
      )
    }
  }
  
  throw lastError!
}