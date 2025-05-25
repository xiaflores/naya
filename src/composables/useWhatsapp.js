export function useWhatsapp() {
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER

  function generateWhatsappLink(product, selectedVariants = []) {
    let message = `¡Hola! Me interesa este producto:\n\n`
    message += `*${product.name}*\n`
    message += `💰 Precio: ${formatPrice(product.price)} Bs.\n`

    // Añadir origen si existe
    if (product.origin) {
      message += `📍 Origen: ${product.origin}\n`
    }

    // Añadir variantes seleccionadas si existen
    if (selectedVariants.length > 0) {
      message += `\n✨ Opciones seleccionadas:\n`
      selectedVariants.forEach((variant) => {
        message += `• ${variant.name}: ${variant.description}\n`
      })
    }

    // Añadir mensaje personalizado si existe
    if (product.whatsapp_message) {
      message += `\n📝 ${product.whatsapp_message}\n`
    }

    // Incluir URL del producto - CORREGIDA para usar la ruta correcta
    const productUrl = `${window.location.origin}/producto-detalle/${product.slug}`
    message += `\n🔗 Ver producto: ${productUrl}\n`

    message += `\n¿Está disponible para compra? ¿Cuáles son las opciones de envío?`

    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  }

  // Función auxiliar para formatear precio
  function formatPrice(price) {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return {
    generateWhatsappLink,
  }
}
