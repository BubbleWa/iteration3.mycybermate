import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import router from './router'
import '@lottiefiles/lottie-player'
import AOS from 'aos'
import 'aos/dist/aos.css'

// --- create and mount Vue app FIRST ---
const app = createApp(App)

// ✅ Force enable Vue DevTools in development
app.config.devtools = true
app.config.performance = true

// ✅ Register custom element
app.config.compilerOptions.isCustomElement = (tag) => tag === 'lottie-player'

// ✅ Initialize AOS animations
AOS.init()

// ✅ Mount router
app.use(router)
app.mount('#app')

// --- Password check AFTER Vue mounts (avoid blocking app load) ---
console.log('🔑 Password check running...')

if (sessionStorage.getItem('authenticated') !== 'true') {
  const currentPath = window.location.pathname
  console.log('⛔ Not authenticated, current path:', currentPath)

  // Only redirect if not on login.html
  if (!currentPath.endsWith('login.html')) {
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1)
    console.log('➡ Redirecting to:', basePath + 'login.html')
    window.location.href = basePath + 'login.html'
  }
}
