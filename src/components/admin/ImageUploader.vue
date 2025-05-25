<template>
  <div class="image-uploader">
    <div class="upload-area">
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        class="file-input"
      />

      <div
        @click="openFileDialog"
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        :class="{ 'drag-over': isDragOver }"
        class="drop-zone"
      >
        <div class="upload-icon">📁</div>
        <h3>Subir Imágenes</h3>
        <p>Arrastra las imágenes aquí o haz clic para seleccionar</p>
        <small>Formatos soportados: JPG, PNG, WebP (máx. 10MB c/u)</small>
      </div>
    </div>

    <!-- Preview de archivos seleccionados -->
    <div v-if="selectedFiles.length > 0" class="selected-files">
      <h4>Archivos seleccionados ({{ selectedFiles.length }})</h4>
      <div class="files-preview">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-preview">
          <img :src="getFilePreview(file)" :alt="file.name" class="preview-image" />
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button @click="removeFile(index)" class="remove-btn">✕</button>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div v-if="selectedFiles.length > 0" class="upload-actions">
      <label class="checkbox-label">
        <input type="checkbox" v-model="makeFirstPrimary" />
        <span>Hacer la primera imagen como principal</span>
      </label>

      <div class="action-buttons">
        <button @click="clearFiles" class="btn-secondary">Limpiar</button>
        <button @click="uploadFiles" :disabled="uploading" class="btn-primary">
          {{
            uploading
              ? 'Subiendo...'
              : `Subir ${selectedFiles.length} imagen${selectedFiles.length !== 1 ? 'es' : ''}`
          }}
        </button>
      </div>
    </div>

    <!-- Progreso de carga -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p>{{ uploadStatus }}</p>
    </div>

    <!-- Resultados -->
    <div v-if="uploadResults" class="upload-results">
      <div v-if="uploadResults.totalSuccess > 0" class="success-message">
        ✅ {{ uploadResults.totalSuccess }} imagen{{
          uploadResults.totalSuccess !== 1 ? 'es' : ''
        }}
        subida{{ uploadResults.totalSuccess !== 1 ? 's' : '' }} correctamente
      </div>

      <div v-if="uploadResults.totalErrors > 0" class="error-message">
        ❌ {{ uploadResults.totalErrors }} error{{ uploadResults.totalErrors !== 1 ? 'es' : '' }}:
        <ul>
          <li v-for="error in uploadResults.errors" :key="error.file">
            {{ error.file }}: {{ error.error }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { uploadMultipleProductImages } from '@/services/storage'

// Props
const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
})

// Emits
const emit = defineEmits(['upload-complete', 'upload-error'])

// Estados reactivos
const fileInput = ref(null)
const selectedFiles = ref([])
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadResults = ref(null)
const makeFirstPrimary = ref(true)

// Funciones
const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  // Filtrar solo imágenes
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length !== files.length) {
    alert('Solo se pueden subir archivos de imagen')
  }

  // Agregar archivos únicos
  imageFiles.forEach((file) => {
    const exists = selectedFiles.value.some(
      (existing) => existing.name === file.name && existing.size === file.size,
    )

    if (!exists) {
      selectedFiles.value.push(file)
    }
  })
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const clearFiles = () => {
  selectedFiles.value = []
  uploadResults.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getFilePreview = (file) => {
  return URL.createObjectURL(file)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return

  try {
    uploading.value = true
    uploadProgress.value = 0
    uploadStatus.value = 'Preparando archivos...'
    uploadResults.value = null

    const options = {
      makeFirstPrimary: makeFirstPrimary.value,
      startOrder: 0,
    }

    // Simular progreso
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
        uploadStatus.value = `Subiendo imagen ${Math.ceil(uploadProgress.value / (90 / selectedFiles.value.length))} de ${selectedFiles.value.length}...`
      }
    }, 200)

    const results = await uploadMultipleProductImages(selectedFiles.value, props.productId, options)

    clearInterval(progressInterval)
    uploadProgress.value = 100
    uploadStatus.value = 'Completado'

    uploadResults.value = results

    // Emitir evento
    emit('upload-complete', results)

    // Limpiar después de un éxito total
    if (results.totalErrors === 0) {
      setTimeout(() => {
        clearFiles()
      }, 2000)
    }
  } catch (error) {
    console.error('Error subiendo archivos:', error)
    uploadStatus.value = 'Error en la carga'
    emit('upload-error', error)
  } finally {
    uploading.value = false
  }
}

// Event listeners para drag and drop
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}
</script>

<style scoped>
.image-uploader {
  border: 2px solid var(--gris-claro);
  border-radius: 12px;
  padding: var(--espaciado-lg);
  background: white;
}

.file-input {
  display: none;
}

.drop-zone {
  border: 2px dashed var(--gris-claro);
  border-radius: 8px;
  padding: var(--espaciado-xl);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: var(--crema);
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--rojo-tradicional);
  background: rgba(185, 28, 28, 0.05);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: var(--espaciado-md);
}

.drop-zone h3 {
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-sm);
}

.drop-zone p {
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-sm);
}

.drop-zone small {
  color: var(--gris-medio);
  font-size: 0.8rem;
}

/* Archivos seleccionados */
.selected-files {
  margin-top: var(--espaciado-lg);
}

.selected-files h4 {
  color: var(--gris-oscuro);
  margin-bottom: var(--espaciado-md);
}

.files-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--espaciado-md);
  margin-bottom: var(--espaciado-lg);
}

.file-preview {
  position: relative;
  border: 1px solid var(--gris-claro);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.file-info {
  padding: var(--espaciado-sm);
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gris-oscuro);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.7rem;
  color: var(--gris-medio);
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #dc2626;
}

/* Acciones */
.upload-actions {
  border-top: 1px solid var(--gris-claro);
  padding-top: var(--espaciado-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--espaciado-sm);
  cursor: pointer;
}

.checkbox-label input {
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: var(--espaciado-sm);
}

.btn-primary,
.btn-secondary {
  padding: var(--espaciado-sm) var(--espaciado-md);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-primary {
  background: var(--rojo-tradicional);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--terracota);
}

.btn-primary:disabled {
  background: var(--gris-medio);
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: var(--gris-oscuro);
  border: 1px solid var(--gris-claro);
}

.btn-secondary:hover {
  background: var(--gris-claro);
}

/* Progreso */
.upload-progress {
  margin-top: var(--espaciado-md);
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gris-claro);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--espaciado-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--rojo-tradicional), var(--terracota));
  transition: width 0.3s ease;
}

/* Resultados */
.upload-results {
  margin-top: var(--espaciado-md);
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  padding: var(--espaciado-sm);
  border-radius: 6px;
  margin-bottom: var(--espaciado-sm);
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: var(--espaciado-sm);
  border-radius: 6px;
}

.error-message ul {
  margin-top: var(--espaciado-xs);
  padding-left: var(--espaciado-md);
}

/* Responsive */
@media (max-width: 768px) {
  .files-preview {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .upload-actions {
    flex-direction: column;
    gap: var(--espaciado-sm);
    align-items: stretch;
  }

  .action-buttons {
    justify-content: space-between;
  }
}
</style>
