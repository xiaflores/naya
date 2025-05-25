<template>
  <div id="app">
    <header class="main-header">
      <nav>
        <router-link to="/" class="logo">Tejidos de Bolivia</router-link>
        <div class="nav-links">
          <router-link to="/">Inicio</router-link>
          <router-link to="/productos">Productos</router-link>
          <router-link to="/sobre-nosotros">Sobre Nosotros</router-link>
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="main-footer">
      <p>&copy; 2024 Tejidos de Bolivia - Ropas Tradicionales Auténticas</p>
    </footer>
  </div>
</template>
<style>
/* Importar todos los archivos CSS */
@import './styles/main.css';
@import './styles/layout.css';
@import './styles/utilities.css';
/*@import './styles/components.css';*/
</style>
