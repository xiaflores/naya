<template>
  <div id="app">
    <header class="header" :class="{ 'scroll-header': isScrolled }">
      <nav class="nav container">
        <router-link to="/" class="nav__logo">Flores</router-link>
        <div class="nav__menu">
          <ul class="nav__list">
            <li class="nav__item">
              <router-link
                to="/"
                class="nav__link"
                :class="{ 'active-link': $route.name === 'home' }"
              >
                <i class="bx bxs-home-alt-2 nav__icon"></i>
                <span class="nav__name">Inicio</span>
              </router-link>
            </li>
            <li class="nav__item">
              <router-link
                to="/productos"
                class="nav__link"
                :class="{
                  'active-link':
                    $route.name === 'products' ||
                    $route.name === 'category' ||
                    $route.name === 'product-detail',
                }"
              >
                <i class="bx bxs-shopping-bag nav__icon"></i>
                <span class="nav__name">Productos</span>
              </router-link>
            </li>
            <li class="nav__item">
              <router-link
                to="/sobre-nosotros"
                class="nav__link"
                :class="{ 'active-link': $route.name === 'about' }"
              >
                <i class="bx bxs-info-circle nav__icon"></i>
                <span class="nav__name">Nosotros</span>
              </router-link>
            </li>
          </ul>
        </div>
        <img :src="logo2" alt="logo-naya" class="nav__img" />
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import logo2 from '@/assets/img/floress.svg'

const isScrolled = ref(false)

// Función para manejar scroll del header
const handleScroll = () => {
  isScrolled.value = window.scrollY >= 80
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* Importar archivos CSS organizados */
@import './styles/main.css';
@import './styles/layout.css';
@import './styles/utilities.css';

/* Solo fuentes externas aquí */
@import url('https://unpkg.com/boxicons@2.1.2/css/boxicons.min.css');
</style>
