import { supabase } from '@/lib/supabase'

export async function getProducts(includeInactive = false) {
  let query = supabase
    .from('products')
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(*)
    `,
    )
    .order('display_order', { ascending: true })

  // Si no se incluyen inactivos, solo mostrar disponibles
  if (!includeInactive) {
    query = query.eq('available', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error en getProducts:', error)
    throw error
  }

  // Procesar los productos para añadir la imagen principal
  return data.map((product) => {
    const primaryImage =
      product.images.find((img) => img.is_primary) ||
      (product.images.length > 0 ? product.images[0] : null)

    return {
      ...product,
      primaryImage: primaryImage ? primaryImage.image_url : null,
      // Ordenar imágenes por display_order
      images: product.images.sort((a, b) => a.display_order - b.display_order),
    }
  })
}

export async function getProductBySlug(slug, isAdmin = false) {
  let query = supabase
    .from('products')
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(*),
      variants:product_variants(*)
    `,
    )
    .eq('slug', slug)
    .single()

  // Si no es admin, solo mostrar productos disponibles
  if (!isAdmin) {
    query = query.eq('available', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error en getProductBySlug:', error)
    throw error
  }

  // Ordenar imágenes por display_order
  if (data.images) {
    data.images.sort((a, b) => a.display_order - b.display_order)
  }

  return data
}
