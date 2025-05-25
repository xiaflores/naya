import { supabase } from '@/lib/supabase'

/**
 * Sube una imagen al bucket de productos
 * @param {File} file - Archivo de imagen
 * @param {string} productId - ID del producto (para organizar por carpetas)
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Datos de la imagen subida
 */
export async function uploadProductImage(file, productId, options = {}) {
  try {
    // Validar que es una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }

    // Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.')
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop().toLowerCase()
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `product-images/${fileName}`

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError)
      throw new Error(`Error al subir imagen: ${uploadError.message}`)
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('products').getPublicUrl(filePath)

    // Guardar referencia en la base de datos
    const imageData = {
      product_id: productId,
      image_url: publicUrl,
      alt_text: options.altText || file.name.split('.')[0],
      is_primary: options.isPrimary || false,
      display_order: options.displayOrder || 0,
    }

    const { data: dbData, error: dbError } = await supabase
      .from('product_images')
      .insert([imageData])
      .select()
      .single()

    if (dbError) {
      // Si falla la BD, eliminar la imagen del storage
      await deleteImageFromStorage(filePath)
      throw new Error(`Error guardando en base de datos: ${dbError.message}`)
    }

    return {
      ...dbData,
      filePath,
      fileName,
      fileSize: file.size,
    }
  } catch (error) {
    console.error('Error en uploadProductImage:', error)
    throw error
  }
}

/**
 * Sube múltiples imágenes para un producto
 * @param {FileList} files - Lista de archivos
 * @param {string} productId - ID del producto
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Array>} Array con los datos de las imágenes subidas
 */
export async function uploadMultipleProductImages(files, productId, options = {}) {
  const results = []
  const errors = []

  for (let i = 0; i < files.length; i++) {
    try {
      const imageOptions = {
        ...options,
        isPrimary: i === 0 && options.makeFirstPrimary, // Primera imagen como principal
        displayOrder: options.startOrder ? options.startOrder + i : i,
        altText: options.altText || `${files[i].name.split('.')[0]} - Imagen ${i + 1}`,
      }

      const result = await uploadProductImage(files[i], productId, imageOptions)
      results.push(result)
    } catch (error) {
      errors.push({
        file: files[i].name,
        error: error.message,
      })
    }
  }

  return {
    success: results,
    errors: errors,
    totalSuccess: results.length,
    totalErrors: errors.length,
  }
}

/**
 * Elimina una imagen del storage y de la base de datos
 * @param {string} imageId - ID de la imagen en la BD
 * @returns {Promise<void>}
 */
export async function deleteProductImage(imageId) {
  try {
    // Primero obtener la URL de la imagen para extraer el path
    const { data: imageData, error: fetchError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imageId)
      .single()

    if (fetchError) {
      throw new Error(`Error obteniendo imagen: ${fetchError.message}`)
    }

    // Extraer el path desde la URL
    const url = new URL(imageData.image_url)
    const pathParts = url.pathname.split('/storage/v1/object/public/products/')
    const filePath = pathParts[1]

    if (filePath) {
      // Eliminar del storage
      await deleteImageFromStorage(filePath)
    }

    // Eliminar de la base de datos
    const { error: deleteError } = await supabase.from('product_images').delete().eq('id', imageId)

    if (deleteError) {
      throw new Error(`Error eliminando de base de datos: ${deleteError.message}`)
    }
  } catch (error) {
    console.error('Error en deleteProductImage:', error)
    throw error
  }
}

/**
 * Función auxiliar para eliminar archivo del storage
 * @param {string} filePath - Ruta del archivo en storage
 */
async function deleteImageFromStorage(filePath) {
  const { error } = await supabase.storage.from('products').remove([filePath])

  if (error) {
    console.error('Error eliminando del storage:', error)
    // No lanzar error aquí para no interrumpir otros procesos
  }
}

/**
 * Actualiza el orden de las imágenes de un producto
 * @param {Array} imageUpdates - Array con {id, display_order, is_primary}
 * @returns {Promise<void>}
 */
export async function updateImageOrder(imageUpdates) {
  try {
    const promises = imageUpdates.map((update) =>
      supabase
        .from('product_images')
        .update({
          display_order: update.display_order,
          is_primary: update.is_primary || false,
        })
        .eq('id', update.id),
    )

    const results = await Promise.all(promises)

    // Verificar si hubo errores
    const errors = results.filter((result) => result.error)
    if (errors.length > 0) {
      throw new Error(
        `Errores actualizando orden: ${errors.map((e) => e.error.message).join(', ')}`,
      )
    }
  } catch (error) {
    console.error('Error en updateImageOrder:', error)
    throw error
  }
}

/**
 * Obtiene todas las imágenes de un producto
 * @param {string} productId - ID del producto
 * @returns {Promise<Array>} Array de imágenes ordenadas
 */
export async function getProductImages(productId) {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })

    if (error) {
      throw new Error(`Error obteniendo imágenes: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error en getProductImages:', error)
    throw error
  }
}

/**
 * Marca una imagen como principal y desmarca las demás
 * @param {string} imageId - ID de la imagen a marcar como principal
 * @param {string} productId - ID del producto
 * @returns {Promise<void>}
 */
export async function setPrimaryImage(imageId, productId) {
  try {
    // Primero desmarcar todas como principales
    const { error: updateAllError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    if (updateAllError) {
      throw new Error(`Error desmarcando imágenes: ${updateAllError.message}`)
    }

    // Luego marcar la seleccionada como principal
    const { error: setPrimaryError } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    if (setPrimaryError) {
      throw new Error(`Error marcando imagen principal: ${setPrimaryError.message}`)
    }
  } catch (error) {
    console.error('Error en setPrimaryImage:', error)
    throw error
  }
}
