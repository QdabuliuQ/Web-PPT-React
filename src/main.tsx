import { createRoot } from 'react-dom/client'
import { ConfigProvider, type ThemeConfig } from 'antd'

import App from './App.tsx'

const config: ThemeConfig = {
  token: {
    colorPrimary: '#e5834b'
  }
}

createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={config}>
    <App />
  </ConfigProvider>
)
