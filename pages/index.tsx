import { GeistProvider, CssBaseline, Page, Text } from '@geist-ui/core'

import ErrorStackInput from '../components/ErrorStackInput'

function Home() {
  return (
   <GeistProvider>
    <CssBaseline />
      <Page>
        <Text h1>Error Stack GPT</Text>
        <Text>
          Paste error stack and get solution.
        </Text>

        <ErrorStackInput />
      </Page>
   </GeistProvider>
  )
}


export default Home
