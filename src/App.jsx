import { useEffect, useRef } from 'react'

// Função utilitária para aguardar o carregamento dos scripts
function waitForGlobal(name) {
  return new Promise((resolve) => {
    if (window[name]) {
      resolve(window[name])
    } else {
      const interval = setInterval(() => {
        if (window[name]) {
          clearInterval(interval)
          resolve(window[name])
        }
      }, 50)
    }
  })
}

const App = () => {
  const apiKey = import.meta.env.VITE_API_KEY
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const tokenClientRef = useRef(null)
  const accessTokenRef = useRef(null)

  useEffect(() => {
    // Aguarda os scripts 'gapi' e 'google' serem carregados
    Promise.all([
      waitForGlobal('gapi'),
      waitForGlobal('google'),
    ]).then(() => {
      // Carrega a Picker API
      const loadPicker = () => {
        window.gapi.load('picker', () => {
          console.log('Picker API carregada')
        })
      }

      // Inicializa o cliente de token
      const initTokenClient = () => {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          callback: (response) => {
            if (response.access_token) {
              accessTokenRef.current = response.access_token
              createPicker()
            } else {
              console.error('Erro ao obter token:', response)
            }
          },
        })
      }

      window.gapi.load('client', () => {
        window.gapi.client.setApiKey(apiKey)
        initTokenClient()
        loadPicker()
      })
    })
  }, [])

  const openPicker = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken()
    }
  }

  const createPicker = () => {
    if (!accessTokenRef.current) return

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(accessTokenRef.current)
      .setDeveloperKey(apiKey)
      .setCallback(pickerCallback)
      .build()
    picker.setVisible(true)
  }

  const pickerCallback = (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const file = data.docs[0]
      alert(`Arquivo selecionado: ${file.name}\nID: ${file.id}`)
    }
  }

  return (
    <div>
      <button onClick={openPicker}>Abrir Google Drive Picker</button>
    </div>
  )
}

export default App
