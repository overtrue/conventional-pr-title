/**
 * Convert AI SDK prompt to Claude Code messages format
 */

export interface ConvertedMessages {
  messagesPrompt: string
  systemPrompt?: string
}

export interface GenerationMode {
  type: 'regular' | 'object-json' | 'object-tool'
}

export function convertToClaudeCodeMessages(
  prompt: any[], 
  mode?: GenerationMode
): ConvertedMessages {
  const messages: string[] = []
  let systemPrompt: string | undefined

  for (const message of prompt) {
    switch (message.role) {
      case 'system':
        systemPrompt = typeof message.content === 'string' 
          ? message.content 
          : message.content?.text || message.content
        break

      case 'user':
        if (typeof message.content === 'string') {
          messages.push(message.content)
        } else if (Array.isArray(message.content)) {
          // Handle multi-part content
          const textParts = message.content
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('\n')

          if (textParts) {
            messages.push(textParts)
          }

          // Note: Image parts are not supported by Claude Code CLI
          const imageParts = message.content.filter((part: any) => part.type === 'image')
          if (imageParts.length > 0) {
            console.warn('Claude Code CLI does not support image inputs. Images will be ignored.')
          }
        }
        break

      case 'assistant':
        if (typeof message.content === 'string') {
          messages.push(`Assistant: ${message.content}`)
        } else if (Array.isArray(message.content)) {
          const textParts = message.content
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('\n')

          if (textParts) {
            messages.push(`Assistant: ${textParts}`)
          }

          // Handle tool calls
          const toolCalls = message.content.filter((part: any) => part.type === 'tool-call')
          for (const toolCall of toolCalls) {
            messages.push(
              `Tool Call: ${toolCall.toolName}(${JSON.stringify(toolCall.args)})`
            )
          }
        }
        break

      case 'tool':
        messages.push(
          `Tool Result (${message.toolCallId}): ${JSON.stringify(message.result)}`
        )
        break

      default:
        console.warn(`Unknown message role: ${message.role}`)
        break
    }
  }

  let messagesPrompt = messages.join('\n\n')

  // Add JSON generation instruction if in JSON mode
  if (mode?.type === 'object-json') {
    const jsonInstruction = '\n\nPlease respond with valid JSON only, no additional text or formatting.'
    messagesPrompt += jsonInstruction
  }

  return {
    messagesPrompt,
    systemPrompt
  }
}