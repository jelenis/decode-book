import { useState } from 'react'
import Home from './components/Home'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
const DEBUG_MODE = import.meta.env.DEBUG_MODE;
const queryClient = new QueryClient()

function App() {


  return (
    <QueryClientProvider client={queryClient}>
      <Home/>
    </QueryClientProvider>

  )
}

export default App
