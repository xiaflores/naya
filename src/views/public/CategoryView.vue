<template>
  <div class="category-page">
    <!-- Header de la categoría -->
    <div class="category-header">
      <div class="container">
        <nav class="breadcrumbs">
          <router-link to="/">Inicio</router-link>
          <span class="separator">›</span>
          <router-link to="/productos">Productos</router-link>
          <span class="separator">›</span>
          <span class="current">{{ category?.name || 'Categoría' }}</span>
        </nav>

        <h1 class="category-title" v-if="category">{{ category.name }}</h1>
        <p class="category-description" v-if="category?.description">
          {{ category.description }}
        </p>
      </div>
    </div>

    <div class="container">
      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <p>Cargando productos...</p>
      </div>

      <!-- Error de categoría no encontrada -->
      <div v-else-if="error" class="error-state">
        <h2>Categoría no encontrada</h2>
        <p>Lo sentimos, no encontramos la categoría que buscas.</p>
        <router-link to="/productos" class="btn-primary">Ver Todos los Productos</router-link>
      </div>

      <!-- Productos de la categoría -->
      <div v-else-if="products.length > 0" class="category-content">
        <div class="products-header">
          <h2>
            {{ products.length }} producto{{ products.length !== 1 ? 's' : '' }} en
            {{ category.name }}
          </h2>
        </div>

        <div class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <!-- Imagen del producto -->
            <div class="product-image">
              <img v-if="product.primaryImage" :src="product.primaryImage" :alt="product.name" />
              <div v-else class="product-placeholder">Sin imagen</div>

              <!-- Overlay con acciones -->
              <div class="product-overlay">
                <router-link
                  :to="{ name: 'product-detail', params: { slug: product.slug } }"
                  class="view-product-btn"
                >
                  Ver Detalles
                </router-link>
              </div>
            </div>

            <!-- Información del producto -->
            <div class="product-info">
              <h3 class="product-title">{{ product.name }}</h3>

              <p class="product-description">
                {{ product.description.substring(0, 100)
                }}{{ product.description.length > 100 ? '...' : '' }}
              </p>

              <div class="product-footer">
                <div class="product-price">{{ formatPrice(product.price) }}</div>
                <router-link
                  :to="{ name: 'product-detail', params: { slug: product.slug } }"
                  class="product-link"
                >
                  Ver más →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <h3>No hay productos en esta categoría</h3>
          <p>Aún no tenemos productos disponibles en "{{ category?.name }}".</p>
          <router-link to="/productos" class="btn-primary">Ver Todos los Productos</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoryBySlug } from '@/services/categories'
import { getProducts } from '@/services/products'

// Props y composables
const route = useRoute()

// Estados reactivos
const loading = ref(true)
const error = ref(false)
const category = ref(null)
const products = ref([])

// Funciones utilitarias
const formatPrice = (price) => {
  return (
    new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + ' Bs.'
  )
}

// Cargar datos de la categoría
const loadCategoryData = async (slug) => {
  loading.value = true
  error.value = false

  try {
    // Cargar categoría
    const categoryData = await getCategoryBySlug(slug)
    category.value = categoryData

    // Cargar productos de esta categoría
    const allProducts = await getProducts()
    products.value = allProducts.filter((product) => product.category_id === categoryData.id)
  } catch (err) {
    console.error('Error cargando categoría:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Watchers
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      loadCategoryData(newSlug)
    }
  },
)

// Lifecycle
onMounted(() => {
  if (route.params.slug) {
    loadCategoryData(route.params.slug)
  }
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
}

/* Header de categoría */
.category-header {
  background: linear-gradient(135deg, var(--verde-oscuro) 0%, var(--azul-andino) 100%);
  color: white;
  padding: var(--espaciado-xl) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--espaciado-sm);
}

.breadcrumbs {
  margin-bottom: var(--espaciado-md);
  font-size: 0.9rem;
}

.breadcrumbs a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
}

.breadcrumbs a:hover {
  color: white;
  text-decoration: underline;
}

.separator {
  margin: 0 var(--espaciado-xs);
  color: rgba(255, 255, 255, 0.6);
}

.current {
  color: white;
}

.category-title {
  font-family: var(--fuente-titulo);
  font-size: 2.5rem;
  margin-bottom: var(--espaciado-sm);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.category-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
}

/* Contenido */
.category-content {
  padding: var(--espaciado-xl) 0;
}

.products-header {
  margin-bottom: var(--espaciado-lg);
  text-align: center;
}

.products-header h2 {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  font-size: 1.5rem;
}

/* Grid de productos */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--espaciado-lg);
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

/* Imagen del producto */
.product-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background: var(--gris-claro);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gris-medio);
  font-size: 1rem;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

/* Overlay */
.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.view-product-btn {
  background: white;
  color: var(--rojo-tradicional);
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-product-btn:hover {
  background: var(--rojo-tradicional);
  color: white;
}

/* Información del producto */
.product-info {
  padding: var(--espaciado-lg);
}

.product-title {
  font-family: var(--fuente-titulo);
  font-size: 1.2rem;
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-sm);
  line-height: 1.3;
}

.product-description {
  color: var(--gris-medio);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: var(--espaciado-md);
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-family: var(--fuente-titulo);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--rojo-tradicional);
}

.product-link {
  color: var(--terracota);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.product-link:hover {
  color: var(--rojo-tradicional);
}

/* Estados */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
  padding: var(--espaciado-xl);
}

.error-state h2,
.empty-content h3 {
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-sm);
}

.error-state p,
.empty-content p {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-lg);
}

.btn-primary {
  background: var(--rojo-tradicional);
  color: white;
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--terracota);
}

/* Responsive */
@media (max-width: 768px) {
  .category-title {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--espaciado-md);
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--espaciado-sm);
  }
}
</style>
