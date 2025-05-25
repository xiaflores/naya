<template>
  <div class="dashboard">
    <!-- Tarjetas de estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon products">📦</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.totalProducts }}</h3>
          <p class="stat-label">Productos Total</p>
          <small class="stat-detail">{{ stats.activeProducts }} activos</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon categories">📂</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.totalCategories }}</h3>
          <p class="stat-label">Categorías</p>
          <small class="stat-detail">Organizadas</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon images">🖼️</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.totalImages }}</h3>
          <p class="stat-label">Imágenes</p>
          <small class="stat-detail">Subidas</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon recent">⏰</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.recentProducts }}</h3>
          <p class="stat-label">Recientes</p>
          <small class="stat-detail">Últimos 7 días</small>
        </div>
      </div>
    </div>

    <!-- Acciones rápidas -->
    <div class="quick-actions">
      <h2 class="section-title">Acciones Rápidas</h2>
      <div class="actions-grid">
        <router-link :to="{ name: 'admin-products' }" class="action-card">
          <div class="action-icon">➕</div>
          <div class="action-content">
            <h3>Nuevo Producto</h3>
            <p>Añadir producto al catálogo</p>
          </div>
        </router-link>

        <router-link :to="{ name: 'admin-categories' }" class="action-card">
          <div class="action-icon">📁</div>
          <div class="action-content">
            <h3>Gestionar Categorías</h3>
            <p>Organizar el catálogo</p>
          </div>
        </router-link>

        <router-link :to="{ name: 'admin-products' }" class="action-card">
          <div class="action-icon">📊</div>
          <div class="action-content">
            <h3>Ver Productos</h3>
            <p>Revisar inventario completo</p>
          </div>
        </router-link>

        <a href="/" target="_blank" class="action-card">
          <div class="action-icon">🌐</div>
          <div class="action-content">
            <h3>Ver Tienda</h3>
            <p>Sitio web público</p>
          </div>
        </a>
      </div>
    </div>

    <!-- Productos recientes -->
    <div class="recent-products" v-if="!loading && recentProducts.length > 0">
      <h2 class="section-title">Productos Recientes</h2>
      <div class="products-table">
        <div class="table-header">
          <div class="col-image">Imagen</div>
          <div class="col-name">Nombre</div>
          <div class="col-category">Categoría</div>
          <div class="col-price">Precio</div>
          <div class="col-status">Estado</div>
          <div class="col-actions">Acciones</div>
        </div>

        <div v-for="product in recentProducts" :key="product.id" class="table-row">
          <div class="col-image">
            <img
              v-if="product.primaryImage"
              :src="product.primaryImage"
              :alt="product.name"
              class="product-thumb"
            />
            <div v-else class="no-image">Sin imagen</div>
          </div>
          <div class="col-name">
            <strong>{{ product.name }}</strong>
            <small>{{ formatDate(product.created_at) }}</small>
          </div>
          <div class="col-category">
            <span class="category-tag">{{ product.category.name }}</span>
          </div>
          <div class="col-price">
            <strong>{{ formatPrice(product.price) }}</strong>
          </div>
          <div class="col-status">
            <span
              :class="{
                'status-active': product.available,
                'status-inactive': !product.available,
              }"
              class="status-badge"
            >
              {{ product.available ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="col-actions">
            <router-link
              :to="{ name: 'product-detail', params: { slug: product.slug } }"
              target="_blank"
              class="action-btn view"
              title="Ver producto"
            >
              👁️
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <p>Cargando datos del dashboard...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProducts } from '@/services/products'
import { getCategories } from '@/services/categories'

// Estados reactivos
const loading = ref(true)
const recentProducts = ref([])
const stats = ref({
  totalProducts: 0,
  activeProducts: 0,
  totalCategories: 0,
  totalImages: 0,
  recentProducts: 0,
})

// Funciones utilitarias
const formatPrice = (price) => {
  return (
    new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + ' Bs.'
  )
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Cargar datos
const loadDashboardData = async () => {
  try {
    // Cargar productos y categorías en paralelo
    const [products, categories] = await Promise.all([
      getProducts(true), // true para incluir productos inactivos
      getCategories(),
    ])

    // Calcular estadísticas
    stats.value = {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.available).length,
      totalCategories: categories.length,
      totalImages: products.reduce((total, product) => {
        return total + (product.images ? product.images.length : 0)
      }, 0),
      recentProducts: products.filter((p) => {
        const productDate = new Date(p.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return productDate > weekAgo
      }).length,
    }

    // Productos recientes (últimos 5)
    recentProducts.value = products
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--espaciado-lg);
  margin-bottom: var(--espaciado-xl);
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: var(--espaciado-lg);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: var(--espaciado-md);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.stat-icon.products {
  background: rgba(185, 28, 28, 0.1);
  color: var(--rojo-tradicional);
}

.stat-icon.categories {
  background: rgba(6, 95, 70, 0.1);
  color: var(--verde-oscuro);
}

.stat-icon.images {
  background: rgba(245, 158, 11, 0.1);
  color: var(--dorado);
}

.stat-icon.recent {
  background: rgba(234, 88, 12, 0.1);
  color: var(--terracota);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-xs);
}

.stat-label {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-xs);
  font-weight: 600;
}

.stat-detail {
  color: var(--gris-medio);
  font-size: 0.8rem;
}

/* Secciones */
.section-title {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-lg);
  font-size: 1.5rem;
}

/* Acciones rápidas */
.quick-actions {
  margin-bottom: var(--espaciado-xl);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--espaciado-lg);
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: var(--espaciado-lg);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: var(--espaciado-md);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 50px;
  height: 50px;
  background: var(--crema);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.action-content h3 {
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-xs);
  font-size: 1.1rem;
}

.action-content p {
  color: var(--gris-medio);
  font-size: 0.9rem;
  margin: 0;
}

/* Tabla de productos */
.products-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 100px 100px 80px;
  gap: var(--espaciado-sm);
  background: var(--gris-claro);
  padding: var(--espaciado-md);
  font-weight: 600;
  color: var(--gris-oscuro);
  font-size: 0.9rem;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 100px 100px 80px;
  gap: var(--espaciado-sm);
  padding: var(--espaciado-md);
  border-bottom: 1px solid var(--gris-claro);
  align-items: center;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: rgba(185, 28, 28, 0.02);
}

.table-row:last-child {
  border-bottom: none;
}

.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.no-image {
  width: 60px;
  height: 60px;
  background: var(--gris-claro);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--gris-medio);
}

.col-name strong {
  display: block;
  color: var(--gris-oscuro);
  margin-bottom: 2px;
}

.col-name small {
  color: var(--gris-medio);
  font-size: 0.8rem;
}

.category-tag {
  background: var(--verde-oscuro);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn.view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn.view:hover {
  background: #3b82f6;
  color: white;
}

/* Estados */
.loading-state {
  text-align: center;
  padding: var(--espaciado-xl);
  color: var(--gris-medio);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 80px 60px;
    gap: var(--espaciado-xs);
  }

  .col-category,
  .col-status {
    display: none;
  }
}
</style>
