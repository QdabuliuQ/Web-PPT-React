import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import '@/assets/icon/iconfont.css';
import { ConfigProvider, type ThemeConfig } from 'antd'

import App from './App.tsx'

const config: ThemeConfig = {
  token: {
    colorPrimary: '#c05316'
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={config}>
      <App />
    </ConfigProvider>
  </StrictMode>
)
