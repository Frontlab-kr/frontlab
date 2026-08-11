import { createApp } from 'vue'
import App from './App.vue'
import 'lenis/dist/lenis.css'
import './style.css'
import { initAnalytics } from './analytics'

initAnalytics()
createApp(App).mount('#app')
