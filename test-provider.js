// test-provider.js
// Test AI SDK v5 provider/model usage
// Usage: API_KEY=sk-xxx node test-provider.js [model] [prompt]

const { generateText } = require('ai')
const { createModel, getProviderEnvVars } = require('./dist/providers')

async function main() {
  const modelString = process.argv[2] || 'openai/gpt-4o-mini'
  const prompt = process.argv[3] || 'Say hello in Chinese.'

  try {
    console.log('Model:', modelString)
    console.log('Prompt:', prompt)

    const providerName = modelString.split('/')[0]
    const envVars = getProviderEnvVars(providerName)
    console.log(`Environment variables: ${envVars.apiKey}, ${envVars.baseURL}`)
    console.log('Generating...')

    const model = await createModel(modelString)
    const { text } = await generateText({ model, prompt, temperature: 0.3 })

    console.log('AI Output:', text)
  } catch (err) {
    console.error('Error:', err.message || err)

    if (err.message?.includes('API key')) {
      console.log('\n🔑 Set your API key as an environment variable.')
    }

    console.log('\n📖 Examples:')
    console.log('OPENAI_API_KEY=sk-xxx node test-provider.js "openai/gpt-4o-mini" "Hello world"')
    console.log('ANTHROPIC_API_KEY=sk-xxx node test-provider.js "anthropic" "Hello world"')
    console.log('GOOGLE_API_KEY=sk-xxx node test-provider.js "google/gemini-1.5-flash" "Hello world"')
  }
}

main()
