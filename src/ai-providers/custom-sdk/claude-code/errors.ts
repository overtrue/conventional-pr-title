/**
 * Error handling utilities for Claude Code provider
 */

export class ClaudeCodeAPIError extends Error {
  public readonly isRetryable: boolean
  public readonly code?: string
  public readonly exitCode?: number
  public readonly stderr?: string
  public readonly data?: any
  public readonly cause?: Error

  constructor(options: {
    message: string
    cause?: Error
    code?: string
    exitCode?: number
    stderr?: string
    isRetryable?: boolean
    data?: any
  }) {
    super(options.message)
    this.name = 'ClaudeCodeAPIError'
    this.cause = options.cause
    this.code = options.code
    this.exitCode = options.exitCode
    this.stderr = options.stderr
    this.isRetryable = options.isRetryable ?? true
    this.data = options.data
  }
}

export class ClaudeCodeAuthenticationError extends Error {
  public readonly cause?: Error
  
  constructor(message: string, cause?: Error) {
    super(`Claude Code authentication failed: ${message}`)
    this.name = 'ClaudeCodeAuthenticationError'
    this.cause = cause
  }
}

export class ClaudeCodeTimeoutError extends ClaudeCodeAPIError {
  constructor(message: string, timeout: number) {
    super({
      message: `Request timed out after ${timeout}ms: ${message}`,
      code: 'timeout_error',
      isRetryable: true
    })
    this.name = 'ClaudeCodeTimeoutError'
  }
}

export function createAPICallError(options: {
  message: string
  cause?: Error
  data?: any
}): ClaudeCodeAPIError {
  return new ClaudeCodeAPIError({
    message: options.message,
    cause: options.cause,
    data: {
      ...options.data,
      isRetryable: options.data?.code !== 'authentication_error'
    }
  })
}

export function createAuthenticationError(options: {
  message: string
  cause?: Error
}): ClaudeCodeAuthenticationError {
  return new ClaudeCodeAuthenticationError(options.message, options.cause)
}

export function createTimeoutError(options: {
  message: string
  timeout: number
}): ClaudeCodeTimeoutError {
  return new ClaudeCodeTimeoutError(options.message, options.timeout)
}

export function isAuthenticationError(error: Error): error is ClaudeCodeAuthenticationError {
  return error instanceof ClaudeCodeAuthenticationError ||
         (error instanceof ClaudeCodeAPIError && error.code === 'authentication_error')
}

export function isTimeoutError(error: Error): error is ClaudeCodeTimeoutError {
  return error instanceof ClaudeCodeTimeoutError ||
         (error instanceof ClaudeCodeAPIError && error.code === 'timeout_error')
}

export function getErrorMetadata(error: any): any {
  const metadata: any = {}

  if (error.code) metadata.code = error.code
  if (error.exitCode !== undefined) metadata.exitCode = error.exitCode
  if (error.stderr) metadata.stderr = error.stderr
  if (error.stdout) metadata.promptExcerpt = error.stdout.substring(0, 500)
  if (error.message) metadata.promptExcerpt = error.message.substring(0, 500)

  return metadata
}