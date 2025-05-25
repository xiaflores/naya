<template>
  <div class="categories-admin">
    <!-- Header de la sección -->
    <div class="section-header">
      <div class="header-left">
        <h2>Gestión de Categorías</h2>
        <p>Organiza tu catálogo por categorías</p>
      </div>
      <div class="header-right">
        <button @click="showCreateModal = true" class="btn-primary">➕ Nueva Categoría</button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <p>Cargando categorías...</p>
    </div>

    <!-- Grid de categorías -->
    <div v-else-if="categories.length > 0" class="categories-grid">
      <div v-for="category in categories" :key="category.id" class="category-card">
        <div class="category-header">
          <h3 class="category-name">{{ category.name }}</h3>
          <div class="category-actions">
            <button
              @click="editCategory(category)"
              class="action-btn edit"
              title="Editar categoría"
            >
              ✏️
            </button>
            <button
              @click="deleteCategory(category)"
              class="action-btn delete"
              title="Eliminar categoría"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="category-content">
          <p class="category-description">
            {{ category.description || 'Sin descripción' }}
          </p>

          <div class="category-stats">
            <span class="stat-item">
              <strong>{{ getProductCount(category.id) }}</strong>
              producto{{ getProductCount(category.id) !== 1 ? 's' : '' }}
            </span>
            <span class="stat-item"> Orden: {{ category.display_order }} </span>
          </div>

          <div class="category-footer">
            <router-link
              :to="{ name: 'category', params: { slug: category.slug } }"
              target="_blank"
              class="view-link"
            >
              Ver en tienda →
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <h3>No hay categorías</h3>
        <p>Comienza creando tu primera categoría para organizar los productos</p>
        <button @click="showCreateModal = true" class="btn-primary">Crear Primera Categoría</button>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="saveCategory" class="modal-body">
          <div class="form-group">
            <label for="categoryName">Nombre *</label>
            <input
              id="categoryName"
              type="text"
              v-model="categoryForm.name"
              required
              placeholder="Ej: Polleras"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="categorySlug">Slug (URL) *</label>
            <input
              id="categorySlug"
              type="text"
              v-model="categoryForm.slug"
              required
              placeholder="Ej: polleras"
              class="form-input"
            />
            <small class="input-help">
              Se usa en la URL. Solo letras minúsculas, números y guiones.
            </small>
          </div>

          <div class="form-group">
            <label for="categoryDescription">Descripción</label>
            <textarea
              id="categoryDescription"
              v-model="categoryForm.description"
              placeholder="Describe esta categoría..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="categoryOrder">Orden de visualización</label>
            <input
              id="categoryOrder"
              type="number"
              v-model="categoryForm.display_order"
              min="0"
              class="form-input"
            />
            <small class="input-help">
              Orden en que aparece en la tienda (menor número = primero).
            </small>
          </div>

          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" :disabled="saving" class="btn-primary">
              {{ saving ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getCategories } from '@/services/categories'
import { getProducts } from '@/services/products'
import { supabase } from '@/lib/supabase'

// Estados reactivos
const loading = ref(true)
const saving = ref(false)
const categories = ref([])
const products = ref([])
const showCreateModal = ref(false)
const editingCategory = ref(null)
const formError = ref('')

// Formulario de categoría
const categoryForm = ref({
  name: '',
  slug: '',
  description: '',
  display_order: 0,
})

// Computeds
const getProductCount = (categoryId) => {
  return products.value.filter((p) => p.category_id === categoryId).length
}

// Watchers
watch(
  () => categoryForm.value.name,
  (newName) => {
    if (newName && !editingCategory.value) {
      // Auto-generar slug si es nueva categoría
      categoryForm.value.slug = newName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }
  },
)

// Funciones
const loadData = async () => {
  try {
    loading.value = true
    const [categoriesData, productsData] = await Promise.all([
      getCategories(),
      getProducts(true), // incluir productos inactivos
    ])

    categories.value = categoriesData
    products.value = productsData
  } catch (error) {
    console.error('Error cargando datos:', error)
    alert('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    display_order: category.display_order || 0,
  }
  showCreateModal.value = true
}

const saveCategory = async () => {
  try {
    saving.value = true
    formError.value = ''

    // Validaciones
    if (!categoryForm.value.name.trim()) {
      throw new Error('El nombre es obligatorio')
    }

    if (!categoryForm.value.slug.trim()) {
      throw new Error('El slug es obligatorio')
    }

    // Verificar slug único
    const existingCategory = categories.value.find(
      (cat) => cat.slug === categoryForm.value.slug && cat.id !== editingCategory.value?.id,
    )

    if (existingCategory) {
      throw new Error('Ya existe una categoría con ese slug')
    }

    const categoryData = {
      name: categoryForm.value.name.trim(),
      slug: categoryForm.value.slug.trim(),
      description: categoryForm.value.description.trim() || null,
      display_order: categoryForm.value.display_order || 0,
    }

    if (editingCategory.value) {
      // Actualizar categoría existente
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.value.id)

      if (error) throw error

      // Actualizar en el estado local
      const index = categories.value.findIndex((cat) => cat.id === editingCategory.value.id)
      if (index !== -1) {
        categories.value[index] = { ...editingCategory.value, ...categoryData }
      }
    } else {
      // Crear nueva categoría
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single()

      if (error) throw error

      // Añadir al estado local
      categories.value.push(data)
    }

    closeModal()
  } catch (error) {
    console.error('Error guardando categoría:', error)
    formError.value = error.message
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (category) => {
  const productCount = getProductCount(category.id)

  if (productCount > 0) {
    alert(
      `No se puede eliminar la categoría "${category.name}" porque tiene ${productCount} producto${productCount !== 1 ? 's' : ''} asignado${productCount !== 1 ? 's' : ''}.`,
    )
    return
  }

  if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
    return
  }

  try {
    const { error } = await supabase.from('categories').delete().eq('id', category.id)

    if (error) throw error

    // Remover del estado local
    categories.value = categories.value.filter((cat) => cat.id !== category.id)
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    alert('Error al eliminar la categoría')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    slug: '',
    description: '',
    display_order: 0,
  }
  formError.value = ''
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.categories-admin {
  max-width: 1200px;
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

/* Grid de categorías */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--espaciado-lg);
}

.category-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--espaciado-lg);
  background: var(--crema);
  border-bottom: 1px solid var(--gris-claro);
}

.category-name {
  font-family: var(--fuente-titulo);
  color: var(--gris-oscuro);
  margin: 0;
  font-size: 1.2rem;
}

.category-actions {
  display: flex;
  gap: var(--espaciado-xs);
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn.edit {
  background: rgba(245, 158, 11, 0.1);
  color: var(--dorado);
}

.action-btn.edit:hover {
  background: var(--dorado);
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

.category-content {
  padding: var(--espaciado-lg);
}

.category-description {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-md);
  line-height: 1.5;
  font-style: italic;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-xs);
  margin-bottom: var(--espaciado-md);
}

.stat-item {
  font-size: 0.9rem;
  color: var(--gris-medio);
}

.category-footer {
  border-top: 1px solid var(--gris-claro);
  padding-top: var(--espaciado-md);
}

.view-link {
  color: var(--verde-oscuro);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.view-link:hover {
  color: var(--rojo-tradicional);
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
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
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

.modal-body {
  padding: var(--espaciado-lg);
}

.form-group {
  margin-bottom: var(--espaciado-lg);
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--espaciado-xs);
  color: var(--gris-oscuro);
}

.form-input,
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
.form-textarea:focus {
  outline: none;
  border-color: var(--rojo-tradicional);
}

.form-textarea {
  resize: vertical;
}

.input-help {
  display: block;
  margin-top: var(--espaciado-xs);
  font-size: 0.8rem;
  color: var(--gris-medio);
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: var(--espaciado-sm);
  border-radius: 6px;
  margin-bottom: var(--espaciado-md);
  font-size: 0.9rem;
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

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-header {
    flex-direction: column;
    gap: var(--espaciado-sm);
    align-items: flex-start;
  }
}
</style>
