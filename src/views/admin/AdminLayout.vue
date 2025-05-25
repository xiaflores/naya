<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>Panel Admin</h2>
        <p>Tejidos de Bolivia</p>
      </div>

      <nav class="sidebar-nav">
        <router-link :to="{ name: 'admin-dashboard' }" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>
          Dashboard
        </router-link>

        <router-link :to="{ name: 'admin-products' }" class="nav-item" active-class="active">
          <span class="nav-icon">📦</span>
          Productos
        </router-link>

        <router-link :to="{ name: 'admin-categories' }" class="nav-item" active-class="active">
          <span class="nav-icon">📂</span>
          Categorías
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <span class="nav-icon">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-content">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="header-actions">
            <router-link to="/" target="_blank" class="view-site-btn"> Ver Sitio 🔗 </router-link>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()

// Título de página dinámico
const pageTitle = computed(() => {
  const titles = {
    'admin-dashboard': 'Dashboard',
    'admin-products': 'Gestión de Productos',
    'admin-categories': 'Gestión de Categorías',
  }
  return titles[route.name] || 'Panel de Administración'
})

// Función de logout
const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    router.push({ name: 'admin-login' })
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

/* Sidebar */
.admin-sidebar {
  background: var(--gris-oscuro);
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: var(--espaciado-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-family: var(--fuente-titulo);
  margin-bottom: var(--espaciado-xs);
}

.sidebar-header p {
  opacity: 0.7;
  font-size: 0.9rem;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: var(--espaciado-md) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
  padding: var(--espaciado-md) var(--espaciado-lg);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(185, 28, 28, 0.2);
  color: white;
  border-left-color: var(--rojo-tradicional);
}

.nav-icon {
  font-size: 1.2rem;
}

.sidebar-footer {
  padding: var(--espaciado-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
  width: 100%;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(185, 28, 28, 0.2);
  border-color: var(--rojo-tradicional);
  color: white;
}

/* Main content */
.admin-main {
  background: var(--gris-claro);
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: var(--espaciado-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--espaciado-sm);
}

.view-site-btn {
  background: var(--verde-oscuro);
  color: white;
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.view-site-btn:hover {
  background: var(--azul-andino);
}

.admin-content {
  flex: 1;
  padding: var(--espaciado-lg);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    display: none; /* Por ahora ocultar en móvil */
  }

  .header-content {
    flex-direction: column;
    gap: var(--espaciado-sm);
    align-items: flex-start;
  }
}
</style>
