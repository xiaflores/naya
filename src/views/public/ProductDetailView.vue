<template>
  <div class="product-detail">
    <!-- Estado de carga -->
    <div v-if="loading" class="loading-container">
      <div class="container">
        <p>Cargando producto...</p>
      </div>
    </div>

    <!-- Error 404 -->
    <div v-else-if="!product" class="error-container">
      <div class="container">
        <h1>Producto no encontrado</h1>
        <p>El producto que buscas no existe o no está disponible.</p>
        <router-link to="/productos" class="btn-primary">Ver Todos los Productos</router-link>
      </div>
    </div>

    <!-- Contenido del producto -->
    <div v-else class="product-content">
      <div class="container">
        <!-- Breadcrumbs -->
        <nav class="breadcrumbs">
          <router-link to="/">Inicio</router-link>
          <span class="separator">→</span>
          <router-link to="/productos">Productos</router-link>
          <span class="separator">→</span>
          <router-link :to="{ name: 'category', params: { slug: product.category.slug } }">
            {{ product.category.name }}
          </router-link>
          <span class="separator">→</span>
          <span class="current">{{ product.name }}</span>
        </nav>

        <div class="product-layout">
          <!-- Galería de imágenes -->
          <div class="product-gallery">
            <div class="main-image">
              <img
                :src="selectedImage?.image_url || '/api/placeholder/600/600'"
                :alt="selectedImage?.alt_text || product.name"
                class="main-product-image"
              />
              <div v-if="!selectedImage" class="no-image-placeholder">
                <span>Sin imagen disponible</span>
              </div>
            </div>

            <!-- Thumbnails -->
            <div v-if="product.images && product.images.length > 1" class="thumbnails">
              <button
                v-for="(image, index) in product.images"
                :key="image.id"
                @click="selectImage(image)"
                :class="{ active: selectedImage?.id === image.id }"
                class="thumbnail-btn"
              >
                <img
                  :src="image.image_url"
                  :alt="image.alt_text || `${product.name} - Imagen ${index + 1}`"
                  class="thumbnail-image"
                />
              </button>
            </div>
          </div>

          <!-- Información del producto -->
          <div class="product-info">
            <!-- Encabezado -->
            <div class="product-header">
              <div class="product-category">
                <router-link :to="{ name: 'category', params: { slug: product.category.slug } }">
                  {{ product.category.name }}
                </router-link>
              </div>
              <h1 class="product-title">{{ product.name }}</h1>

              <div class="product-meta">
                <div v-if="product.origin" class="product-origin">
                  <span class="meta-icon">📍</span>
                  <span>Origen: {{ product.origin }}</span>
                </div>
                <div class="product-availability">
                  <span class="meta-icon">✨</span>
                  <span class="availability-status">Disponible</span>
                </div>
              </div>

              <div class="product-price">
                <span class="price-amount">{{ formatPrice(product.price) }}</span>
                <span class="price-currency">Bs.</span>
              </div>
            </div>

            <!-- Descripción -->
            <div class="product-description">
              <h3>Descripción</h3>
              <p>{{ product.description }}</p>
            </div>

            <!-- Información cultural -->
            <div v-if="product.cultural_notes" class="cultural-info">
              <h3>Significado Cultural</h3>
              <p>{{ product.cultural_notes }}</p>
            </div>

            <!-- Variantes -->
            <div v-if="product.variants && product.variants.length > 0" class="product-variants">
              <h3>Opciones Disponibles</h3>
              <div class="variants-list">
                <div v-for="variant in availableVariants" :key="variant.id" class="variant-item">
                  <label class="variant-label">
                    <input
                      type="checkbox"
                      v-model="selectedVariants"
                      :value="variant"
                      class="variant-checkbox"
                    />
                    <span class="variant-text">
                      <strong>{{ variant.name }}:</strong> {{ variant.description }}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Botón de WhatsApp -->
            <div class="purchase-section">
              <button @click="contactWhatsApp" class="whatsapp-btn">
                <span class="whatsapp-icon">💬</span>
                <span class="whatsapp-text">Comprar por WhatsApp</span>
              </button>

              <p class="purchase-note">
                Al hacer clic serás redirigido a WhatsApp para completar tu compra directamente con
                nosotros.
              </p>
            </div>

            <!-- Información adicional -->
          </div>
        </div>

        <!-- Productos relacionados -->
        <div v-if="relatedProducts.length > 0" class="related-products">
          <h2 class="section-title">Productos Relacionados</h2>
          <div class="related-grid">
            <router-link
              v-for="relatedProduct in relatedProducts"
              :key="relatedProduct.id"
              :to="{ name: 'product-detail', params: { slug: relatedProduct.slug } }"
              class="related-product-card"
            >
              <div class="related-image">
                <img
                  v-if="relatedProduct.primaryImage"
                  :src="relatedProduct.primaryImage"
                  :alt="relatedProduct.name"
                />
                <div v-else class="no-image">Sin imagen</div>
              </div>
              <div class="related-info">
                <h4>{{ relatedProduct.name }}</h4>
                <p class="related-price">{{ formatPrice(relatedProduct.price) }} Bs.</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProductBySlug, getProducts } from '@/services/products'
import { useWhatsapp } from '@/composables/useWhatsapp'

// Props y rutas
const route = useRoute()
const { generateWhatsappLink } = useWhatsapp()

// Estados reactivos
const loading = ref(true)
const product = ref(null)
const selectedImage = ref(null)
const selectedVariants = ref([])
const relatedProducts = ref([])

// Computeds
const availableVariants = computed(() => {
  return product.value?.variants?.filter((variant) => variant.available) || []
})

// Funciones utilitarias
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

// Función para actualizar metaetiquetas
const updateMetaTags = (productData) => {
  if (!productData) return

  // Título
  document.title = `${productData.name} | Tejidos de Bolivia`

  // Meta description
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.name = 'description'
    document.head.appendChild(metaDescription)
  }
  metaDescription.content = productData.description.substring(0, 160) + '...'

  // Open Graph meta tags
  const ogTags = [
    { property: 'og:title', content: `${productData.name} | Tejidos de Bolivia` },
    { property: 'og:description', content: productData.description },
    {
      property: 'og:image',
      content: productData.images?.[0]?.image_url || '/api/placeholder/600/600',
    },
    { property: 'og:url', content: window.location.href },
    { property: 'og:type', content: 'product' },
    { property: 'product:price:amount', content: productData.price.toString() },
    { property: 'product:price:currency', content: 'BOB' },
  ]

  ogTags.forEach((tag) => {
    let metaTag = document.querySelector(`meta[property="${tag.property}"]`)
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.setAttribute('property', tag.property)
      document.head.appendChild(metaTag)
    }
    metaTag.content = tag.content
  })
}

// Función principal para cargar producto
const loadProduct = async (slug) => {
  try {
    loading.value = true

    // Cargar producto por slug
    const productData = await getProductBySlug(slug)
    product.value = productData

    // Actualizar metaetiquetas para WhatsApp
    updateMetaTags(productData)

    // Seleccionar primera imagen disponible
    if (productData.images && productData.images.length > 0) {
      const primaryImage = productData.images.find((img) => img.is_primary)
      selectedImage.value = primaryImage || productData.images[0]
    }

    // Cargar productos relacionados de la misma categoría
    await loadRelatedProducts()
  } catch (error) {
    console.error('Error cargando producto:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

const loadRelatedProducts = async () => {
  try {
    if (!product.value) return

    const allProducts = await getProducts()

    // Filtrar productos de la misma categoría, excluyendo el actual
    const related = allProducts
      .filter((p) => p.category_id === product.value.category_id && p.id !== product.value.id)
      .slice(0, 4) // Mostrar máximo 4 productos relacionados

    relatedProducts.value = related
  } catch (error) {
    console.error('Error cargando productos relacionados:', error)
  }
}

const selectImage = (image) => {
  selectedImage.value = image
}

const contactWhatsApp = () => {
  if (!product.value) return

  // Generar enlace de WhatsApp con información del producto
  const whatsappUrl = generateWhatsappLink(product.value, selectedVariants.value)

  // Abrir WhatsApp en nueva ventana
  window.open(whatsappUrl, '_blank')
}

// Watchers
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      // Resetear estado cuando cambia el producto
      selectedVariants.value = []
      selectedImage.value = null
      loadProduct(newSlug)
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  // Scroll al inicio cuando se carga la página
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  padding-top: var(--espaciado-lg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--espaciado-lg);
}

/* Estados de carga y error */
.loading-container,
.error-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.error-container h1 {
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-md);
}

.error-container p {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-lg);
}

/* Breadcrumbs */
.breadcrumbs {
  margin-bottom: var(--espaciado-xl);
  font-size: 0.9rem;
  color: var(--gris-medio);
}

.breadcrumbs a {
  color: var(--rojo-tradicional);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumbs a:hover {
  color: var(--terracota);
}

.separator {
  margin: 0 var(--espaciado-sm);
  color: var(--gris-medio);
}

.current {
  color: var(--gris-oscuro);
  font-weight: 600;
}

/* Layout principal */
.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaciado-xl);
  margin-bottom: var(--espaciado-xl);
}

/* Galería de imágenes */
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-md);
}

.main-image {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.main-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-product-image:hover {
  transform: scale(1.05);
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--crema), var(--gris-claro));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gris-medio);
  font-weight: 600;
  border: 2px dashed var(--gris-medio);
}

.thumbnails {
  display: flex;
  gap: var(--espaciado-sm);
  overflow-x: auto;
  padding: var(--espaciado-xs) 0;
}

.thumbnail-btn {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  padding: 0;
}

.thumbnail-btn:hover {
  border-color: var(--rojo-tradicional);
  transform: translateY(-2px);
}

.thumbnail-btn.active {
  border-color: var(--rojo-tradicional);
  box-shadow: 0 4px 15px rgba(185, 28, 28, 0.3);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Información del producto */
.product-info {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-lg);
}

.product-header {
  border-bottom: 2px solid var(--gris-claro);
  padding-bottom: var(--espaciado-lg);
}

.product-category {
  margin-bottom: var(--espaciado-sm);
}

.product-category a {
  background: var(--verde-oscuro);
  color: white;
  padding: var(--espaciado-xs) var(--espaciado-sm);
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: background-color 0.3s ease;
}

.product-category a:hover {
  background: var(--azul-andino);
}

.product-title {
  font-family: var(--fuente-titulo);
  font-size: 2.5rem;
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-md);
  line-height: 1.2;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-xs);
  margin-bottom: var(--espaciado-lg);
}

.product-origin,
.product-availability {
  display: flex;
  align-items: center;
  gap: var(--espaciado-xs);
  font-size: 0.9rem;
  color: var(--gris-medio);
}

.meta-icon {
  font-size: 1rem;
}

.availability-status {
  color: var(--verde-oscuro);
  font-weight: 600;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: var(--espaciado-xs);
}

.price-amount {
  font-family: var(--fuente-titulo);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--rojo-tradicional);
}

.price-currency {
  font-size: 1.2rem;
  color: var(--gris-medio);
  font-weight: 600;
}

/* Secciones de información */
.product-description,
.cultural-info {
  padding: var(--espaciado-lg);
  background: linear-gradient(135deg, var(--crema) 0%, white 100%);
  border-radius: 12px;
  border-left: 4px solid var(--dorado);
}

.product-description h3,
.cultural-info h3 {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-sm);
  font-size: 1.2rem;
}

.product-description p,
.cultural-info p {
  color: var(--gris-medio);
  line-height: 1.7;
  margin: 0;
}

.cultural-info {
  border-left-color: var(--verde-oscuro);
}

/* Variantes */
.product-variants {
  background: white;
  border: 2px solid var(--gris-claro);
  border-radius: 12px;
  padding: var(--espaciado-lg);
}

.product-variants h3 {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-md);
  font-size: 1.2rem;
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-sm);
}

.variant-item {
  border: 1px solid var(--gris-claro);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.variant-item:hover {
  border-color: var(--rojo-tradicional);
  background: rgba(185, 28, 28, 0.02);
}

.variant-label {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
  padding: var(--espaciado-sm);
  cursor: pointer;
  width: 100%;
}

.variant-checkbox {
  width: 18px;
  height: 18px;
  margin: 0;
}

.variant-text {
  color: var(--gris-oscuro);
  line-height: 1.4;
}

/* Botón de WhatsApp */
.purchase-section {
  background: linear-gradient(135deg, var(--rojo-tradicional), var(--terracota));
  color: white;
  padding: var(--espaciado-xl);
  border-radius: 12px;
  text-align: center;
}

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--espaciado-sm);
  background: #25d366;
  color: white;
  border: none;
  padding: var(--espaciado-md) var(--espaciado-xl);
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.whatsapp-btn:hover {
  background: #128c7e;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
}

.whatsapp-icon {
  font-size: 1.3rem;
}

.purchase-note {
  margin-top: var(--espaciado-md);
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0;
}

/* Información adicional */
.additional-info {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-md);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--espaciado-md);
  padding: var(--espaciado-md);
  background: white;
  border-radius: 8px;
  border: 1px solid var(--gris-claro);
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content strong {
  display: block;
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-xs);
  font-size: 0.9rem;
}

.info-content p {
  color: var(--gris-medio);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

/* Productos relacionados */
.related-products {
  margin-top: var(--espaciado-xl);
  padding-top: var(--espaciado-xl);
  border-top: 2px solid var(--gris-claro);
}

.section-title {
  font-family: var(--fuente-titulo);
  font-size: 2rem;
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

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--espaciado-lg);
}

.related-product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.related-product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.related-image {
  height: 200px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.related-product-card:hover .related-image img {
  transform: scale(1.1);
}

.related-image .no-image {
  width: 100%;
  height: 100%;
  background: var(--gris-claro);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gris-medio);
  font-size: 0.9rem;
}

.related-info {
  padding: var(--espaciado-lg);
}

.related-info h4 {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-sm);
  font-size: 1.1rem;
  line-height: 1.3;
}

.related-price {
  font-weight: 700;
  color: var(--rojo-tradicional);
  font-size: 1.1rem;
  margin: 0;
}

.btn-primary {
  display: inline-block;
  background: linear-gradient(135deg, var(--rojo-tradicional), var(--terracota));
  color: white;
  padding: var(--espaciado-md) var(--espaciado-xl);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(185, 28, 28, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: var(--espaciado-lg);
  }

  .product-title {
    font-size: 2rem;
  }

  .price-amount {
    font-size: 1.8rem;
  }

  .main-image {
    height: 350px;
  }

  .thumbnails {
    justify-content: center;
  }

  .thumbnail-btn {
    width: 60px;
    height: 60px;
  }

  .additional-info {
    gap: var(--espaciado-sm);
  }

  .info-item {
    padding: var(--espaciado-sm);
  }

  .related-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--espaciado-md);
  }
}

@media (max-width: 480px) {
  .breadcrumbs {
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: var(--espaciado-xs);
  }

  .product-meta {
    gap: var(--espaciado-xs);
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  .whatsapp-btn {
    font-size: 1rem;
    padding: var(--espaciado-sm) var(--espaciado-lg);
  }
}
</style>
