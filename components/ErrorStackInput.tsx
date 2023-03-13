import { Button, Card, Code, Display, Grid, Loading, Select, Spacer, Textarea } from "@geist-ui/core";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const COOKIE_NAME = 'error-stack-user'

export default function ErrorStackInput() {
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])
  const [language, setLanguage] = useState('javascript')

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, randomId)
    }
  }, [cookie, setCookie])

  const [errorStack, setErrorStack] = useState(`
    ./components/ErrorStackInput.tsx
    Error:
      x Unexpected token \`,\`. Expected identifier, string literal, numeric literal or [ for the computed key
        ,-[X:\code\error-stack-gpt\components\ErrorStackInput.tsx:1:1]
      1 | import { Textarea } from "@geist-ui/core";
      2 |
      3 | export default function ErrorStackInput() {
      4 |     let a = {,};
        :              ^
      5 |     return (
      6 |         <Textarea style={{ width: 400, height: 240 }} />
      6 |     );
        \`----

    Caused by:
        Syntax Error
  `);

  const [response, setResponse] = useState('');

  const sendMessage = useCallback(async () => {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        messages: [{ role: 'user', content: errorStack }],
        user: cookie[COOKIE_NAME],
      }),
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()

    let done = false

    let lastMessage = ''
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      lastMessage = lastMessage + chunkValue

      setLoading(false)
    }

    setResponse(lastMessage);

  }, [errorStack, language]);

  return (
    <>
      <Grid.Container gap={2} justify="center" height="100px">
        <Grid xs={12}>
          <Card shadow width="100%" >
            <Textarea
              width="100%"
              style={{ minHeight: 240 }}
              value={errorStack}
              onChange={e => setErrorStack(e.target.value)}
            />
          </Card>
        </Grid>

        <Grid xs={12}>
          <Display width="100%" caption="Explain from chatGPT">
            {loading ? <Loading /> : <Code block style={{ whiteSpace: 'break-spaces' }}>{response}</Code>}
          </Display>
        </Grid>

        <Grid xs={24}>
          <Select value={language} onChange={value => setLanguage(value as string)}>
            <Select.Option value="javascript">javascript</Select.Option>
            <Select.Option value="typescript">typescript</Select.Option>
          </Select>
          <Spacer w={5}/>
          <Button onClick={sendMessage}>
            Ask
          </Button>
        </Grid>
      </Grid.Container>
    </>
  );
}