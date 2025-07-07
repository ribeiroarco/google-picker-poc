import { useEffect, useRef } from 'react'

const App = () => {
  const apiKey = import.meta.env.VITE_API_KEY
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const tokenClientRef = useRef(null)
  const accessTokenRef = useRef(null)

  useEffect(() => {
    // Carrega a Picker API
    const loadPicker = () => {
      gapi.load('picker', () => {
        console.log('Picker API carregada')
      })
    }

    // Inicializa o cliente de token
    const initTokenClient = () => {
      tokenClientRef.current = google.accounts.oauth2.initTokenClient({
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

    gapi.load('client', () => {
      gapi.client.setApiKey(apiKey)
      initTokenClient()
      loadPicker()
    })
  }, [])

  const openPicker = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken()
    }
  }

  const createPicker = () => {
    if (!accessTokenRef.current) return

    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setOAuthToken(accessTokenRef.current)
      .setDeveloperKey(apiKey)
      .setCallback(pickerCallback)
      .build()
    picker.setVisible(true)
  }

  const pickerCallback = (data) => {
    if (data.action === google.picker.Action.PICKED) {
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
