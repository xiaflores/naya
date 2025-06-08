<template>
  <div class="landing" ref="header">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Bordados Flores</h1>
        <h1 class="hero-title">Tradicion y Cultura boliviana</h1>
        <p class="hero-description">
          Descubre bordados tradicionales hechos a mano por artesanos bolivianos; cada pieza captura
          la esencia cultural andina y sus colores vibrantes.
        </p>
        <div class="hero-buttons">
          <router-link to="/productos" class="btn-primary">Ver Productos</router-link>
          <router-link to="/sobre-nosotros" class="btn-secondary">Nuestra Historia</router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-placeholder">🇧🇴 Imagen Hero</div>
      </div>
    </section>

    <!-- Características Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">¿Por Qué Elegir Nuestros Textiles?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏺</div>
            <h3>Tradición Cultural</h3>
            <p>
              Técnicas de tejido transmitidas por generaciones, preservando la cultura boliviana.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏺</div>
            <h3>Hecho a Mano</h3>
            <p>Cada pieza es única, elaborada cuidadosamente por artesanos expertos.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌱</div>
            <h3>Materiales Naturales</h3>
            <p>Utilizamos lana de alpaca, algodón orgánico y tintes naturales de alta calidad.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h3>Comercio Justo</h3>
            <p>Apoyamos directamente a las comunidades artesanas bolivianas.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categorías Preview -->
    <section class="categories-preview">
      <div class="container">
        <h2 class="section-title">Nuestras Especialidades</h2>
        <div class="categories-showcase" v-if="categoriesWithImages.length > 0">
          <div
            v-for="category in categoriesWithImages.slice(0, 3)"
            :key="category.id"
            class="category-preview"
          >
            <div class="category-image">
              <!-- Mostrar imagen del producto si existe -->
              <img
                v-if="category.representativeImage"
                :src="category.representativeImage"
                :alt="category.name"
                class="category-product-image"
              />
              <!-- Placeholder si no hay imagen -->
              <div v-else class="category-placeholder">{{ category.name }}</div>

              <!-- Overlay con información -->
              <div class="category-overlay">
                <span class="category-count">
                  {{ category.productCount }} producto{{ category.productCount !== 1 ? 's' : '' }}
                </span>
              </div>
            </div>
            <div class="category-info">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
              <router-link
                :to="{ name: 'category', params: { slug: category.slug } }"
                class="category-link"
              >
                Explorar {{ category.name }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-else-if="loading" class="loading-categories">
          <p>Cargando categorías...</p>
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-categories">
          <p>No hay categorías disponibles en este momento.</p>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2>¿Listo para Descubrir Nuestros Textiles?</h2>
          <p>
            Explora nuestra colección completa de ropas tradicionales bolivianas y encuentra la
            pieza perfecta para ti.
          </p>
          <router-link to="/productos" class="btn-cta">Ver Todos los Productos</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories } from '@/services/categories'
import { getProducts } from '@/services/products'

// Estados reactivos
const categories = ref([])
const products = ref([])
const loading = ref(true)

// Computed para categorías con imágenes
const categoriesWithImages = computed(() => {
  return categories.value.map((category) => {
    // Filtrar productos de esta categoría
    const categoryProducts = products.value.filter((product) => product.category_id === category.id)

    // Encontrar una imagen representativa (preferir la que tenga imagen principal)
    let representativeImage = null
    if (categoryProducts.length > 0) {
      // Buscar un producto que tenga imagen principal
      const productWithPrimaryImage = categoryProducts.find(
        (product) => product.images && product.images.some((img) => img.is_primary),
      )

      if (productWithPrimaryImage) {
        const primaryImage = productWithPrimaryImage.images.find((img) => img.is_primary)
        representativeImage = primaryImage.image_url
      } else {
        // Si no hay imagen principal, tomar la primera imagen disponible
        const productWithImage = categoryProducts.find(
          (product) => product.primaryImage || (product.images && product.images.length > 0),
        )

        if (productWithImage) {
          representativeImage =
            productWithImage.primaryImage ||
            (productWithImage.images && productWithImage.images[0]?.image_url)
        }
      }
    }

    return {
      ...category,
      representativeImage,
      productCount: categoryProducts.length,
    }
  })
})

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    loading.value = true

    // Cargar categorías y productos en paralelo
    const [categoriesData, productsData] = await Promise.all([
      getCategories(),
      getProducts(), // Solo productos activos
    ])

    categories.value = categoriesData
    products.value = productsData
  } catch (error) {
    console.error('Error cargando datos para el home:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.landing {
  width: 100%;
}

/* Hero Section */
.hero {
  min-height: 80vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--espaciado-xl);
  padding: var(--espaciado-xl) var(--espaciado-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  padding-right: var(--espaciado-lg);
}

.hero-title {
  font-family: var(--fuente-titulo);
  font-size: 3.5rem;
  color: var(--rojo-tradicional);
  margin-bottom: var(--espaciado-sm);
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.4rem;
  color: var(--terracota);
  margin-bottom: var(--espaciado-md);
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--gris-medio);
  line-height: 1.7;
  margin-bottom: var(--espaciado-xl);
}

.hero-buttons {
  display: flex;
  gap: var(--espaciado-md);
}

.btn-primary,
.btn-secondary {
  padding: var(--espaciado-md) var(--espaciado-lg);
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--rojo-tradicional), var(--terracota));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(185, 28, 28, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--rojo-tradicional);
  border: 2px solid var(--rojo-tradicional);
}

.btn-secondary:hover {
  background: var(--rojo-tradicional);
  color: white;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-placeholder {
  width: 400px;
  height: 300px;
  background: linear-gradient(135deg, var(--crema), var(--gris-claro));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--gris-medio);
  border: 2px dashed var(--gris-medio);
}

/* Features Section */
.features {
  padding: var(--espaciado-xl) 0;
  background: linear-gradient(135deg, var(--crema) 0%, white 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--espaciado-lg);
}

.section-title {
  font-family: var(--fuente-titulo);
  font-size: 2.5rem;
  color: var(--verde-oscuro);
  text-align: center;
  margin-bottom: var(--espaciado-xl);
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--dorado), var(--terracota));
  margin: var(--espaciado-sm) auto 0;
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--espaciado-lg);
}

.feature-card {
  background: white;
  padding: var(--espaciado-xl);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--espaciado-md);
}

.feature-card h3 {
  font-family: var(--fuente-titulo);
  font-size: 1.3rem;
  color: var(--rojo-tradicional);
  margin-bottom: var(--espaciado-sm);
}

.feature-card p {
  color: var(--gris-medio);
  line-height: 1.6;
}

/* Categories Preview */
.categories-preview {
  padding: var(--espaciado-xl) 0;
}

.categories-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--espaciado-xl);
}

.category-preview {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.category-preview:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.category-image {
  height: 250px;
  position: relative;
  overflow: hidden;
}

/* Nueva imagen del producto */
.category-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-preview:hover .category-product-image {
  transform: scale(1.1);
}

/* Placeholder mejorado */
.category-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--crema), var(--gris-claro));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--gris-medio);
  font-weight: 600;
}

/* Overlay con información */
.category-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: var(--espaciado-md);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.category-preview:hover .category-overlay {
  transform: translateY(0);
}

.category-count {
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: var(--espaciado-xs) var(--espaciado-sm);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.category-info {
  padding: var(--espaciado-lg);
}

.category-info h3 {
  font-family: var(--fuente-titulo);
  font-size: 1.4rem;
  color: var(--rojo-tradicional);
  margin-bottom: var(--espaciado-sm);
}

.category-info p {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-md);
  line-height: 1.6;
}

.category-link {
  color: var(--terracota);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.category-link:hover {
  color: var(--rojo-tradicional);
}

/* Estados de carga y vacío */
.loading-categories,
.empty-categories {
  text-align: center;
  padding: var(--espaciado-xl);
  color: var(--gris-medio);
}

.loading-categories p,
.empty-categories p {
  font-size: 1.1rem;
}

/* Call to Action */
.cta {
  background: linear-gradient(135deg, var(--rojo-tradicional), var(--terracota));
  color: white;
  padding: var(--espaciado-xl) 0;
  text-align: center;
}

.cta-content h2 {
  font-family: var(--fuente-titulo);
  font-size: 2.2rem;
  margin-bottom: var(--espaciado-md);
}

.cta-content p {
  font-size: 1.1rem;
  margin-bottom: var(--espaciado-xl);
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  color: var(--title-color);
}

.btn-cta {
  background: white;
  color: var(--rojo-tradicional);
  padding: var(--espaciado-md) var(--espaciado-xl);
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
}

@media screen and (max-width: 900px) {
  .cta {
    padding: 3rem 0 5.62rem 0;
  }
}

@media screen and (max-width: 900px) {
  .hero {
    min-height: 400px;
  }
  .hero-placeholder {
    width: 250px;
    height: 300px;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    min-height: 60vh;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-placeholder {
    width: 300px;
    height: 200px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .categories-showcase {
    grid-template-columns: 1fr;
  }

  .cta {
    padding: 3rem 0 5.62rem 0;
  }

  .category-image {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    margin-bottom: var(--espaciado-sm);
  }

  .hero-description {
    font-size: 0.9rem;
    margin-bottom: var(--espaciado-md);
  }

  .btn-primary,
  .btn-secondary {
    padding: var(--espaciado-sm) var(--espaciado-md);
    font-size: 0.9rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .feature-card h3 {
    font-size: 1.2rem;
  }
}
</style>
