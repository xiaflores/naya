<template>
  <div class="landing">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Tejidos de Bolivia</h1>
        <p class="hero-subtitle">Ropas Tradicionales Auténticas</p>
        <p class="hero-description">
          Descubre la riqueza cultural de Bolivia a través de nuestros textiles tradicionales,
          elaborados a mano por artesanos locales con técnicas ancestrales transmitidas de
          generación en generación.
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
            <h3>Tradición Ancestral</h3>
            <p>
              Técnicas de tejido transmitidas por generaciones, preservando la cultura boliviana.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✋</div>
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
        <div class="categories-showcase" v-if="categories.length > 0">
          <div
            v-for="category in categories.slice(0, 3)"
            :key="category.id"
            class="category-preview"
          >
            <div class="category-image">
              <div class="category-placeholder">{{ category.name }}</div>
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
import { ref, onMounted } from 'vue'
import { getCategories } from '@/services/categories'

const categories = ref([])

onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.error('Error cargando categorías:', error)
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
  padding: var(--espaciado-md) var(--espaciado-xl);
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
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--crema), var(--gris-claro));
}

.category-placeholder {
  font-size: 1.2rem;
  color: var(--gris-medio);
  font-weight: 600;
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
}
</style>
