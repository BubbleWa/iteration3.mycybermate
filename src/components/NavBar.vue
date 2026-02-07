<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <!-- Left: logo + brand -->
      <div class="navbar-left">
        <img src="/logo.png" alt="CyberMate logo" class="logo" />
        <span class="brand">MyCyberMate</span>
      </div>

      <!-- Navigation -->
      <nav class="navbar-nav pills-nav" :class="{ open: menuOpen }">
        <router-link to="/" :class="{ active: isActive('/') }">Home</router-link>
        <router-link to="/dashboard" :class="{ active: isActive('/dashboard') }">Dashboard</router-link>
        <router-link to="/scambot" :class="{ active: isActive('/scambot') }">ScamBot</router-link>
        <router-link to="/riskscore" :class="{ active: isActive('/riskscore') }">Risk Score</router-link>
        <router-link to="/investsafe" :class="{ active: isActive('/investsafe') }">Invest Safe</router-link>
      </nav>

      <!-- Mobile menu -->
      <button class="menu-btn" @click="menuOpen = !menuOpen">☰</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const menuOpen = ref(false);
const route = useRoute();

function isActive(path) {
  return route.path === path;
}
</script>

<style scoped>
.navbar-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #45C4B0;
  padding: 12px 20px;
  z-index: 50; /* 保证导航在最上层 */
  display: flex;
  justify-content: center;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  width: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 40px;
  height: 40px;
}

.brand {
  font-weight: bold;
  color: white;
  font-size: 1.2rem;
}

.navbar-nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

.navbar-nav a {
  color: white;
  text-decoration: none;
  transition: 0.2s;
}

.navbar-nav a.active {
  background: white;
  color: #45C4B0;
  border-radius: 8px;
  padding: 4px 12px;
}

.menu-btn {
  display: none;
}

/* 适配手机端 */
@media (max-width: 768px) {
  .navbar-nav {
    display: none;
  }
  .navbar-nav.open {
    display: flex;
    flex-direction: column;
    background: #45C4B0;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    padding: 10px 0;
  }
  .menu-btn {
    display: block;
    color: white;
    background: none;
    border: none;
    font-size: 24px;
  }
}
</style>
