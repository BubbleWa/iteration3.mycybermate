import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import ScamBot from '../views/ScamBot.vue'
import RiskScore from '../views/RiskScore.vue'
import InvestSafe from '../views/InvestSafe.vue' // ✅ 新页

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/scambot', name: 'ScamBot', component: ScamBot },
  { path: '/riskscore', name: 'RiskScore', component: RiskScore },
  { path: '/investsafe', name: 'InvestSafe', component: InvestSafe } // ✅
]

// ✅ 调试日志
console.log('🔥 Router file loaded successfully')
console.log('🧭 ROUTER DEBUG: Routes registered:', routes)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
