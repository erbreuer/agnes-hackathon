import { useEffect, useState } from 'react'
import { getHealth } from './api.js'
import './App.css'

function App() {
  const [reply, setReply] = useState<string>('checking…')

  useEffect(() => {
    getHealth()
      .then((data) =>
        setReply(data.ok ? data.model_reply : `error: ${data.error}`)
      )
      .catch((err) => setReply(`error: ${err.message}`))
  }, [])

  return (
    <section id="center">
      <div>
        <h1>AI Interior Designer</h1>
        <p>Backend health check (agnes-2.0-flash):</p>
        <p>
          <code>{reply}</code>
        </p>
      </div>
    </section>
  )
}

export default App
