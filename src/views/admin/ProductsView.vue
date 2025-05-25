<template>
  <div class="products-admin">
    <!-- Header de la sección -->
    <div class="section-header">
      <div class="header-left">
        <h2>Gestión de Productos</h2>
        <p>Administra tu catálogo de productos</p>
      </div>
      <div class="header-right">
        <button @click="showCreateModal = true" class="btn-primary">➕ Nuevo Producto</button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters">
        <select v-model="selectedCategoryFilter" class="filter-select">
          <option value="">Todas las categorías</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <select v-model="statusFilter" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar productos..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <p>Cargando productos...</p>
    </div>

    <!-- Tabla de productos -->
    <div v-else-if="filteredProducts.length > 0" class="products-table-container">
      <div class="table-info">
        <span
          >{{ filteredProducts.length }} producto{{
            filteredProducts.length !== 1 ? 's' : ''
          }}</span
        >
      </div>

      <div class="products-table">
        <div class="table-header">
          <div class="col-image">Imagen</div>
          <div class="col-name">Producto</div>
          <div class="col-category">Categoría</div>
          <div class="col-price">Precio</div>
          <div class="col-status">Estado</div>
          <div class="col-actions">Acciones</div>
        </div>

        <div v-for="product in filteredProducts" :key="product.id" class="table-row">
          <div class="col-image">
            <img
              v-if="product.primaryImage"
              :src="product.primaryImage"
              :alt="product.name"
              class="product-image"
            />
            <div v-else class="no-image">Sin imagen</div>
          </div>

          <div class="col-name">
            <div class="product-info">
              <strong class="product-title">{{ product.name }}</strong>
              <small class="product-date"> Creado: {{ formatDate(product.created_at) }} </small>
              <small v-if="product.origin" class="product-origin">
                Origen: {{ product.origin }}
              </small>
            </div>
          </div>

          <div class="col-category">
            <span class="category-badge">{{ product.category.name }}</span>
          </div>

          <div class="col-price">
            <strong class="price-value">{{ formatPrice(product.price) }}</strong>
          </div>

          <div class="col-status">
            <button
              @click="toggleProductStatus(product)"
              :class="{
                'status-active': product.available,
                'status-inactive': !product.available,
              }"
              class="status-toggle"
            >
              {{ product.available ? 'Activo' : 'Inactivo' }}
            </button>
          </div>

          <div class="col-actions">
            <div class="action-buttons">
              <button @click="editProduct(product)" class="action-btn edit" title="Editar producto">
                ✏️
              </button>

              <router-link
                :to="{ name: 'product-detail', params: { slug: product.slug } }"
                target="_blank"
                class="action-btn view"
                title="Ver en tienda"
              >
                👁️
              </router-link>

              <button
                @click="deleteProduct(product)"
                class="action-btn delete"
                title="Eliminar producto"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <h3>
          {{
            searchQuery || selectedCategoryFilter || statusFilter
              ? 'No se encontraron productos'
              : 'No hay productos'
          }}
        </h3>
        <p>
          {{
            searchQuery || selectedCategoryFilter || statusFilter
              ? 'Intenta ajustar los filtros'
              : 'Comienza creando tu primer producto'
          }}
        </p>
        <button
          v-if="!searchQuery && !selectedCategoryFilter && !statusFilter"
          @click="showCreateModal = true"
          class="btn-primary"
        >
          Crear Primer Producto
        </button>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content product-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="saveProduct" class="modal-body">
          <!-- Información básica -->
          <div class="form-section">
            <h4 class="section-title">Información Básica</h4>

            <div class="form-row">
              <div class="form-group">
                <label for="productName">Nombre del Producto *</label>
                <input
                  id="productName"
                  type="text"
                  v-model="productForm.name"
                  required
                  placeholder="Ej: Pollera Orureña Tradicional"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="productSlug">Slug (URL) *</label>
                <input
                  id="productSlug"
                  type="text"
                  v-model="productForm.slug"
                  required
                  placeholder="Ej: pollera-orurena-tradicional"
                  class="form-input"
                />
                <small class="input-help">Se usa en la URL del producto</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="productCategory">Categoría *</label>
                <select
                  id="productCategory"
                  v-model="productForm.category_id"
                  required
                  class="form-select"
                >
                  <option value="">Seleccionar categoría</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="productOrigin">Origen</label>
                <input
                  id="productOrigin"
                  type="text"
                  v-model="productForm.origin"
                  placeholder="Ej: Oruro, La Paz, Potosí"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="productPrice">Precio (Bs.) *</label>
                <input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  v-model="productForm.price"
                  required
                  placeholder="0.00"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="productOrder">Orden de Visualización</label>
                <input
                  id="productOrder"
                  type="number"
                  min="0"
                  v-model="productForm.display_order"
                  class="form-input"
                />
                <small class="input-help">Menor número = aparece primero</small>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="form-section">
            <h4 class="section-title">Descripción</h4>

            <div class="form-group">
              <label for="productDescription">Descripción del Producto *</label>
              <textarea
                id="productDescription"
                v-model="productForm.description"
                required
                placeholder="Describe las características principales del producto..."
                class="form-textarea"
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="productCultural">Información Cultural</label>
              <textarea
                id="productCultural"
                v-model="productForm.cultural_notes"
                placeholder="Historia, significado cultural, tradición, etc..."
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Mensaje WhatsApp -->
          <div class="form-section">
            <h4 class="section-title">WhatsApp</h4>

            <div class="form-group">
              <label for="whatsappMessage">Mensaje Personalizado WhatsApp</label>
              <textarea
                id="whatsappMessage"
                v-model="productForm.whatsapp_message"
                placeholder="Mensaje adicional que se incluirá al compartir por WhatsApp..."
                class="form-textarea"
                rows="2"
              ></textarea>
              <small class="input-help">
                Este mensaje se añadirá automáticamente cuando los clientes contacten por WhatsApp
              </small>
            </div>
          </div>

          <!-- Estado y configuración -->
          <div class="form-section">
            <h4 class="section-title">Configuración</h4>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="productForm.available" class="form-checkbox" />
                <span class="checkbox-text">Producto disponible para venta</span>
              </label>
            </div>
          </div>
          <!-- 👇 AÑADIR ESTA SECCIÓN DESPUÉS DE "Configuración" -->

          <!-- Sección de Imágenes (solo si el producto ya existe) -->
          <div v-if="editingProduct && editingProduct.id" class="form-section">
            <h4 class="section-title">Gestión de Imágenes</h4>

            <!-- Botón para mostrar/ocultar uploader -->
            <div class="images-header">
              <button type="button" @click="toggleImageUploader" class="btn-secondary">
                {{ showImageUploader ? 'Ocultar' : 'Gestionar Imágenes' }}
              </button>

              <span class="images-count" v-if="productImages.length > 0">
                {{ productImages.length }} imagen{{ productImages.length !== 1 ? 'es' : '' }}
              </span>
            </div>

            <!-- Componente de carga de imágenes -->
            <div v-if="showImageUploader" class="image-uploader-container">
              <ImageUploader
                :product-id="editingProduct.id"
                @upload-complete="handleImageUpload"
                @upload-error="handleUploadError"
              />
            </div>

            <!-- Imágenes existentes -->
            <div v-if="productImages.length > 0" class="existing-images">
              <h5>Imágenes Actuales</h5>
              <div class="images-grid">
                <div v-for="image in productImages" :key="image.id" class="image-item">
                  <div class="image-preview">
                    <img :src="image.image_url" :alt="image.alt_text" />

                    <!-- Badge de imagen principal -->
                    <div v-if="image.is_primary" class="primary-badge">Principal</div>

                    <!-- Overlay con acciones -->
                    <div class="image-actions">
                      <button
                        v-if="!image.is_primary"
                        @click="setPrimaryImage(image.id)"
                        class="action-btn primary"
                        title="Marcar como principal"
                      >
                        ⭐
                      </button>
                      <button
                        @click="deleteImage(image.id)"
                        class="action-btn delete"
                        title="Eliminar imagen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div class="image-info">
                    <span class="image-name">{{ image.alt_text || 'Sin nombre' }}</span>
                    <span class="image-order">Orden: {{ image.display_order }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estado de carga de imágenes -->
            <div v-if="loadingImages" class="loading-images">
              <div class="loading-spinner"></div>
              <span>Cargando imágenes...</span>
            </div>

            <!-- Mensaje si no hay imágenes -->
            <div v-if="!loadingImages && productImages.length === 0" class="no-images">
              <p>Este producto no tiene imágenes aún.</p>
              <button type="button" @click="showImageUploader = true" class="btn-primary">
                Subir Primera Imagen
              </button>
            </div>
          </div>

          <!-- Nota para productos nuevos -->
          <div v-if="!editingProduct" class="form-section">
            <h4 class="section-title">Imágenes del Producto</h4>
            <div class="info-note">
              <p>💡 <strong>Nota:</strong> Primero guarda el producto para poder subir imágenes.</p>
            </div>
          </div>

          <!-- Errores -->
          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>

          <!-- Botones del modal -->
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" :disabled="saving" class="btn-primary">
              {{
                saving ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getProducts } from '@/services/products'
import { getCategories } from '@/services/categories'
import { supabase } from '@/lib/supabase'
// 👇 AÑADIR ESTOS NUEVOS IMPORTS
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { getProductImages } from '@/services/storage'

// Estados para imágenes
const showImageUploader = ref(false)
const currentProductId = ref(null)
const productImages = ref([])
const loadingImages = ref(false)

// Estados reactivos
const loading = ref(true)
const saving = ref(false)
const products = ref([])
const categories = ref([])
const searchQuery = ref('')
const selectedCategoryFilter = ref('')
const statusFilter = ref('')
const showCreateModal = ref(false)
const editingProduct = ref(null)
const formError = ref('')

// Formulario de producto
const productForm = ref({
  name: '',
  slug: '',
  description: '',
  cultural_notes: '',
  origin: '',
  price: '',
  category_id: '',
  available: true,
  whatsapp_message: '',
  display_order: 0,
})

// Productos filtrados
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.origin && product.origin.toLowerCase().includes(query)),
    )
  }

  // Filtro por categoría
  if (selectedCategoryFilter.value) {
    filtered = filtered.filter((product) => product.category_id === selectedCategoryFilter.value)
  }

  // Filtro por estado
  if (statusFilter.value !== '') {
    const isActive = statusFilter.value === 'true'
    filtered = filtered.filter((product) => product.available === isActive)
  }

  return filtered
})

// Watcher para auto-generar slug
watch(
  () => productForm.value.name,
  (newName) => {
    if (newName && !editingProduct.value) {
      productForm.value.slug = newName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/-+/g, '-') // Múltiples guiones a uno
        .trim()
    }
  },
)

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

// Funciones de productos
const loadProducts = async () => {
  try {
    loading.value = true
    const [productsData, categoriesData] = await Promise.all([
      getProducts(true), // true para incluir productos inactivos
      getCategories(),
    ])

    products.value = productsData
    categories.value = categoriesData
  } catch (error) {
    console.error('Error cargando productos:', error)
    alert('Error al cargar productos')
  } finally {
    loading.value = false
  }
}

const saveProduct = async () => {
  try {
    saving.value = true
    formError.value = ''

    // Validaciones
    if (!productForm.value.name.trim()) {
      throw new Error('El nombre es obligatorio')
    }

    if (!productForm.value.slug.trim()) {
      throw new Error('El slug es obligatorio')
    }

    if (!productForm.value.description.trim()) {
      throw new Error('La descripción es obligatoria')
    }

    if (!productForm.value.price || productForm.value.price <= 0) {
      throw new Error('El precio debe ser mayor a 0')
    }

    if (!productForm.value.category_id) {
      throw new Error('Debe seleccionar una categoría')
    }

    // Verificar slug único
    const existingProduct = products.value.find(
      (prod) => prod.slug === productForm.value.slug && prod.id !== editingProduct.value?.id,
    )

    if (existingProduct) {
      throw new Error('Ya existe un producto con ese slug')
    }

    const productData = {
      name: productForm.value.name.trim(),
      slug: productForm.value.slug.trim(),
      description: productForm.value.description.trim(),
      cultural_notes: productForm.value.cultural_notes?.trim() || null,
      origin: productForm.value.origin?.trim() || null,
      price: parseFloat(productForm.value.price),
      category_id: productForm.value.category_id,
      available: productForm.value.available,
      whatsapp_message: productForm.value.whatsapp_message?.trim() || null,
      display_order: productForm.value.display_order || 0,
    }

    if (editingProduct.value) {
      // Actualizar producto existente
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.value.id)

      if (error) throw error

      // Recargar los datos para obtener las relaciones actualizadas
      await loadProducts()
    } else {
      // Crear nuevo producto
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select(
          `
          *,
          category:categories(id, name, slug),
          images:product_images(*)
        `,
        )
        .single()

      if (error) throw error

      // Añadir al estado local
      const newProduct = {
        ...data,
        primaryImage: null, // Inicialmente sin imagen
      }
      products.value.unshift(newProduct)
    }

    closeModal()
  } catch (error) {
    console.error('Error guardando producto:', error)
    formError.value = error.message
  } finally {
    saving.value = false
  }
}

const toggleProductStatus = async (product) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ available: !product.available })
      .eq('id', product.id)

    if (error) throw error

    product.available = !product.available
  } catch (error) {
    console.error('Error actualizando estado:', error)
    alert('Error al actualizar el estado del producto')
  }
}

const editProduct = async (product) => {
  editingProduct.value = product
  productForm.value = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    cultural_notes: product.cultural_notes || '',
    origin: product.origin || '',
    price: product.price,
    category_id: product.category_id,
    available: product.available,
    whatsapp_message: product.whatsapp_message || '',
    display_order: product.display_order || 0,
  }

  // 👇 AÑADIR ESTAS LÍNEAS
  // Limpiar estados de imágenes
  showImageUploader.value = false
  productImages.value = []

  showCreateModal.value = true

  // Cargar imágenes del producto
  if (product.id) {
    await loadProductImages(product.id)
  }
}

const deleteProduct = async (product) => {
  if (!confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
    return
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', product.id)

    if (error) throw error

    products.value = products.value.filter((p) => p.id !== product.id)
  } catch (error) {
    console.error('Error eliminando producto:', error)
    alert('Error al eliminar el producto')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    slug: '',
    description: '',
    cultural_notes: '',
    origin: '',
    price: '',
    category_id: '',
    available: true,
    whatsapp_message: '',
    display_order: 0,
  }
  formError.value = ''
}

// Lifecycle
onMounted(() => {
  loadProducts()
})
// 👇 AÑADIR ESTAS FUNCIONES AL FINAL DE TU SCRIPT

// Funciones para gestión de imágenes
const toggleImageUploader = async () => {
  showImageUploader.value = !showImageUploader.value

  if (showImageUploader.value && editingProduct.value) {
    await loadProductImages(editingProduct.value.id)
  }
}

const loadProductImages = async (productId) => {
  try {
    loadingImages.value = true
    const images = await getProductImages(productId)
    productImages.value = images
  } catch (error) {
    console.error('Error cargando imágenes:', error)
    alert('Error al cargar las imágenes del producto')
  } finally {
    loadingImages.value = false
  }
}

const handleImageUpload = async (results) => {
  console.log('Imágenes subidas:', results)

  // Mostrar mensaje de éxito
  if (results.totalSuccess > 0) {
    alert(
      `${results.totalSuccess} imagen${results.totalSuccess !== 1 ? 'es' : ''} subida${results.totalSuccess !== 1 ? 's' : ''} correctamente`,
    )
  }

  // Mostrar errores si los hay
  if (results.totalErrors > 0) {
    alert(`${results.totalErrors} error${results.totalErrors !== 1 ? 'es' : ''} al subir imágenes`)
  }

  // Recargar imágenes
  if (editingProduct.value) {
    await loadProductImages(editingProduct.value.id)

    // Recargar también la lista de productos para actualizar las imágenes principales
    await loadProducts()
  }
}

const handleUploadError = (error) => {
  console.error('Error subiendo imágenes:', error)
  alert('Error al subir imágenes: ' + error.message)
}

const setPrimaryImage = async (imageId) => {
  try {
    const { setPrimaryImage } = await import('@/services/storage')
    await setPrimaryImage(imageId, editingProduct.value.id)

    // Recargar imágenes para mostrar el cambio
    await loadProductImages(editingProduct.value.id)
    await loadProducts()

    alert('Imagen marcada como principal')
  } catch (error) {
    console.error('Error marcando imagen como principal:', error)
    alert('Error al marcar imagen como principal')
  }
}

const deleteImage = async (imageId) => {
  if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
    return
  }

  try {
    const { deleteProductImage } = await import('@/services/storage')
    await deleteProductImage(imageId)

    // Recargar imágenes
    await loadProductImages(editingProduct.value.id)
    await loadProducts()

    alert('Imagen eliminada correctamente')
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    alert('Error al eliminar la imagen')
  }
}
</script>

<style scoped>
.products-admin {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--espaciado-xl);
  padding-bottom: var(--espaciado-lg);
  border-bottom: 2px solid var(--gris-claro);
}

.header-left h2 {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-xs);
}

.header-left p {
  color: var(--gris-medio);
  margin: 0;
}

.btn-primary {
  background: var(--rojo-tradicional);
  color: white;
  border: none;
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--espaciado-xs);
}

.btn-primary:hover {
  background: var(--terracota);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: var(--gris-medio);
  cursor: not-allowed;
  transform: none;
}

/* Filtros */
.filters-section {
  background: white;
  padding: var(--espaciado-lg);
  border-radius: 12px;
  margin-bottom: var(--espaciado-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters {
  display: grid;
  grid-template-columns: 200px 150px 1fr;
  gap: var(--espaciado-md);
  align-items: center;
}

.filter-select,
.search-input {
  padding: var(--espaciado-sm);
  border: 2px solid var(--gris-claro);
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: var(--rojo-tradicional);
}

/* Tabla */
.products-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.table-info {
  padding: var(--espaciado-md) var(--espaciado-lg);
  background: var(--gris-claro);
  font-size: 0.9rem;
  color: var(--gris-medio);
  font-weight: 600;
}

.products-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 2fr 150px 120px 120px 150px;
  gap: var(--espaciado-sm);
  padding: var(--espaciado-md) var(--espaciado-lg);
  background: var(--gris-claro);
  font-weight: 600;
  color: var(--gris-oscuro);
  font-size: 0.9rem;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 2fr 150px 120px 120px 150px;
  gap: var(--espaciado-sm);
  padding: var(--espaciado-lg);
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

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-image {
  width: 80px;
  height: 80px;
  background: var(--gris-claro);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--gris-medio);
  border: 2px dashed var(--gris-medio);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-title {
  color: var(--gris-oscuro);
  font-size: 1rem;
  line-height: 1.3;
}

.product-date,
.product-origin {
  color: var(--gris-medio);
  font-size: 0.8rem;
}

.category-badge {
  background: var(--verde-oscuro);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.price-value {
  color: var(--rojo-tradicional);
  font-size: 1.1rem;
  font-weight: 700;
}

.status-toggle {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-active:hover {
  background: #16a34a;
  color: white;
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-inactive:hover {
  background: #dc2626;
  color: white;
}

.action-buttons {
  display: flex;
  gap: var(--espaciado-xs);
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  text-decoration: none;
}

.action-btn.edit {
  background: rgba(245, 158, 11, 0.1);
  color: var(--dorado);
}

.action-btn.edit:hover {
  background: var(--dorado);
  color: white;
}

.action-btn.view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn.view:hover {
  background: #3b82f6;
  color: white;
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #dc2626;
  color: white;
}

/* Estados */
.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.empty-content h3 {
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-sm);
}

.empty-content p {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-lg);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
}

/* Modal de producto específico */
.product-modal {
  max-width: 800px;
  max-height: 95vh;
  overflow-y: auto;
}

.product-modal .modal-body {
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--espaciado-lg);
  border-bottom: 1px solid var(--gris-claro);
}

.modal-header h3 {
  margin: 0;
  color: var(--gris-oscuro);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gris-medio);
  padding: 4px;
}

.close-btn:hover {
  color: var(--gris-oscuro);
}

/* Secciones del formulario */
.form-section {
  padding: var(--espaciado-lg);
  border-bottom: 1px solid var(--gris-claro);
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-md);
  font-size: 1.1rem;
  padding-bottom: var(--espaciado-xs);
  border-bottom: 2px solid var(--crema);
}

/* Filas del formulario */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaciado-md);
}

.form-group {
  margin-bottom: var(--espaciado-md);
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--espaciado-xs);
  color: var(--gris-oscuro);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--espaciado-sm);
  border: 2px solid var(--gris-claro);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--rojo-tradicional);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.input-help {
  display: block;
  margin-top: var(--espaciado-xs);
  font-size: 0.8rem;
  color: var(--gris-medio);
  font-style: italic;
}

/* Checkbox personalizado */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
  cursor: pointer;
  padding: var(--espaciado-sm);
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.checkbox-label:hover {
  background: var(--gris-claro);
}

.form-checkbox {
  width: 18px;
  height: 18px;
  margin: 0;
}

.checkbox-text {
  font-weight: 500;
  color: var(--gris-oscuro);
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: var(--espaciado-sm);
  border-radius: 6px;
  margin: var(--espaciado-md);
  font-size: 0.9rem;
  border-left: 4px solid #c53030;
}

.modal-footer {
  padding: var(--espaciado-lg);
  border-top: 1px solid var(--gris-claro);
  display: flex;
  justify-content: flex-end;
  gap: var(--espaciado-sm);
}

.btn-secondary {
  background: var(--gris-claro);
  color: var(--gris-oscuro);
  border: none;
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--gris-medio);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: var(--espaciado-md);
    align-items: stretch;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: var(--espaciado-sm);
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 80px 100px;
    gap: var(--espaciado-xs);
  }

  .col-category,
  .col-actions {
    display: none;
  }

  .action-buttons {
    flex-direction: column;
  }

  /* Responsive para formulario */
  .product-modal {
    width: 95%;
    margin: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: var(--espaciado-sm);
  }

  .form-section {
    padding: var(--espaciado-md);
  }
}
/* 👇 AÑADIR AL FINAL DE TU <style scoped> EXISTENTE */

/* Estilos para gestión de imágenes */
.images-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--espaciado-md);
}

.images-count {
  font-size: 0.9rem;
  color: var(--gris-medio);
  font-weight: 600;
}

.image-uploader-container {
  margin: var(--espaciado-lg) 0;
  border: 1px solid var(--gris-claro);
  border-radius: 8px;
  padding: var(--espaciado-md);
  background: var(--crema);
}

.existing-images h5 {
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-md);
  font-size: 1rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--espaciado-md);
}

.image-item {
  border: 1px solid var(--gris-claro);
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: var(--transition);
}

.image-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.image-preview {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.primary-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--rojo-tradicional);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-actions .action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.action-btn.primary {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.action-btn.primary:hover {
  background: var(--dorado);
}

.action-btn.delete {
  background: rgba(220, 38, 38, 0.9);
  color: white;
}

.action-btn.delete:hover {
  background: #dc2626;
}

.image-info {
  padding: var(--espaciado-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.image-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gris-oscuro);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-order {
  font-size: 0.7rem;
  color: var(--gris-medio);
}

.loading-images {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
  padding: var(--espaciado-lg);
  justify-content: center;
  color: var(--gris-medio);
}

.no-images {
  text-align: center;
  padding: var(--espaciado-lg);
  color: var(--gris-medio);
}

.no-images p {
  margin-bottom: var(--espaciado-md);
}

.info-note {
  background: #e0f2fe;
  border: 1px solid #81d4fa;
  border-radius: 6px;
  padding: var(--espaciado-md);
  color: #01579b;
}

.info-note p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
