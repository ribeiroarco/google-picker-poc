import React, { useEffect } from 'react';
import { gapi } from 'gapi-script';

const App = () => {
  const CLIENT_ID = 'SUA_CLIENT_ID.apps.googleusercontent.com';
  const DEVELOPER_KEY = 'SUA_API_KEY';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  let oauthToken = null;

  useEffect(() => {
    const initGapi = () => {
      gapi.load('client:auth2', () => {
        gapi.auth2.init({
          client_id: CLIENT_ID,
          scope: SCOPES,
        });
      });
    };
    initGapi();
  }, []);

  const handleAuth = async () => {
    const authInstance = gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn();
    oauthToken = user.getAuthResponse().access_token;
    createPicker();
  };

  const createPicker = () => {
    if (!window.google || !window.google.picker) {
      // Carrega a API Picker se ainda não estiver disponível
      window.gapi.load('picker', { callback: createPicker });
      return;
    }

    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(DEVELOPER_KEY)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  const pickerCallback = async (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const file = data.docs[0]; // contém id, name, url etc.
      console.log('Arquivo selecionado:', file);

      const fileContent = await fetchFileFromDrive(file.id);
      await uploadToBackend(file.name, fileContent);
    }
  };

  const fetchFileFromDrive = async (fileId) => {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${oauthToken}`,
      },
    });
    return await res.blob();
  };

  const uploadToBackend = async (filename, blob) => {
    const formData = new FormData();
    formData.append('file', blob, filename);

    const res = await fetch('https://seu-backend.com/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      console.log('Upload feito com sucesso');
    } else {
      console.error('Erro no upload');
    }
  };

  return <button onClick={handleAuth}>Selecionar Arquivo do Google Drive</button>;
};

export default App;
