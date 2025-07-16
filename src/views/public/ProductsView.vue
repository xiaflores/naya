<template>
  <div class="products-page">
    <!-- Header de la página -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Nuestros Productos</h1>
        <p class="page-subtitle">
          Descubre nuestra colección completa de ropas tradicionales bolivianas
        </p>
      </div>
    </div>

    <div class="container">
      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters">
          <button
            @click="selectedCategory = null"
            :class="{ active: selectedCategory === null }"
            class="filter-btn"
          >
            Todos los Productos
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="{ active: selectedCategory === category.id }"
            class="filter-btn"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading">
        <p>Cargando productos...</p>
      </div>

      <!-- Productos -->
      <div v-else-if="filteredProducts.length > 0" class="products-section">
        <div class="products-header">
          <p class="products-count">
            {{ filteredProducts.length }} producto{{ filteredProducts.length !== 1 ? 's' : '' }}
            {{ selectedCategory ? 'en esta categoría' : 'disponibles' }}
          </p>
        </div>

        <div class="products-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card">
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
              <div class="product-category">{{ product.category.name }}</div>
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
          <h3>No hay productos disponibles</h3>
          <p>
            {{
              selectedCategory
                ? 'No hay productos en esta categoría.'
                : 'Aún no tenemos productos en nuestro catálogo.'
            }}
          </p>
          <button v-if="selectedCategory" @click="selectedCategory = null" class="btn-secondary">
            Ver Todos los Productos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories } from '@/services/categories'
import { getProducts } from '@/services/products'

// Estados reactivos
const loading = ref(true)
const categories = ref([])
const products = ref([])
const selectedCategory = ref(null)

// Productos filtrados
const filteredProducts = computed(() => {
  if (!selectedCategory.value) {
    return products.value
  }
  return products.value.filter((product) => product.category_id === selectedCategory.value)
})

// Formatear precio
const formatPrice = (price) => {
  return (
    new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + ' Bs.'
  )
}

// Cargar datos al montar
onMounted(async () => {
  try {
    // Cargar categorías y productos en paralelo
    const [categoriesData, productsData] = await Promise.all([getCategories(), getProducts()])

    categories.value = categoriesData
    products.value = productsData
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.products-page {
  min-height: 100vh;
}

/* Header de la página */
.page-header {
  background: linear-gradient(135deg, var(--rojo-tradicional) 0%, var(--terracota) 100%);
  color: white;
  padding: var(--espaciado-md) 0;
  text-align: center;
}

.page-title {
  font-family: var(--fuente-titulo);
  font-size: 2.5rem;
  margin-bottom: var(--espaciado-sm);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  color: var(--title-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--espaciado-sm);
}

/* Filtros */
.filters-section {
  padding: var(--espaciado-md) 0 var(--espaciado-lg);
}

.filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--espaciado-sm);
}

.filter-btn {
  background: white;
  border: 2px solid var(--gris-claro);
  color: var(--gris-oscuro);
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  border-color: var(--rojo-tradicional);
  color: var(--rojo-tradicional);
}

.filter-btn.active {
  background: var(--rojo-tradicional);
  border-color: var(--rojo-tradicional);
  color: white;
}

/* Sección de productos */
.products-section {
  padding: var(--espaciado-lg) 0;
}

.products-header {
  margin-bottom: var(--espaciado-lg);
  text-align: center;
}

.products-count {
  color: var(--gris-medio);
  font-size: 1rem;
}

/* Grid de productos */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  height: 250px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

.product-category {
  font-size: 0.8rem;
  color: var(--terracota);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: var(--espaciado-xs);
}

.product-title {
  font-family: var(--fuente-titulo);
  font-size: 1.3rem;
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
  font-size: 1.4rem;
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
.loading {
  text-align: center;
  padding: var(--espaciado-xl);
}

.loading p {
  font-size: 1.1rem;
  color: var(--gris-medio);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
}

.empty-content h3 {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-sm);
}

.empty-content p {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-md);
}

.btn-secondary {
  background: transparent;
  color: var(--rojo-tradicional);
  border: 2px solid var(--rojo-tradicional);
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--rojo-tradicional);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--espaciado-md);
  }
  .products-section {
    padding: var(--espaciado-md) 0 5.6rem 0;
  }
  .filters-section {
    padding: var(--espaciado-sm);
  }

  .filters {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .filter-btn {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: var(--espaciado-xs);
  }
  .page-title {
    font-size: var(--h1-font-size);
  }
  .page-subtitle {
    font-size: 0.9rem;
    max-width: 100%;
  }
  .filters-section {
    padding: var(--espaciado-xs);
  }
  .filter-btn {
    padding: var(--espaciado-xs) var(--espaciado-sm);
    font-weight: 600;
    font-size: 0.7rem;
  }
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--espaciado-sm);
  }
  .product-category {
    font-size: var(--tiny-font-size);
  }
  .product-title {
    font-size: var(--normal-font-size);
    margin-bottom: var(--espaciado-xs);
  }
  .product-description {
    font-size: 0.7rem;
    margin-bottom: var(--espaciado-xs);
  }
  .product-info {
    padding: var(--espaciado-md);
  }
}
</style>
