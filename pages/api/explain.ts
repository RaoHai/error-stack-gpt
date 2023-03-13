import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream'

type ChatGPTAgent = 'user' | 'system' | 'assistant'

export interface ChatGPTMessage {
    role: ChatGPTAgent
    content: string
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json();
  const { messages: bodyMessages, language = 'javascript' } = body;

  const messages: ChatGPTMessage[] = [{
      role: 'user',
      content: `
        I want you to act as a code improver. Base on a ${language} error message and error stack, send me resolution sample code.
      `,
  }];

  messages.push(...bodyMessages);

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }
  console.log('payload', payload);
  const stream = await OpenAIStream(payload)
  return new Response(stream)
}

export default handler
