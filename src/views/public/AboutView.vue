<template>
  <div class="about-page">
    <div class="container">
      <div class="about-header">
        <h1>Sobre Nosotros</h1>
        <p class="lead">Preservando las tradiciones textiles de Bolivia para el mundo</p>
      </div>

      <div class="main-content">
        <!-- Columna Izquierda: Contacto y Redes Sociales -->
        <div class="left-column">
          <div class="contact-section">
            <h2>Contáctanos</h2>
            <p>
              ¿Tienes preguntas sobre nuestros productos bolivianos? ¡Estamos aquí para ayudarte!
            </p>

            <!-- Árbol de Enlaces estilo Linktree -->
            <div class="social-links-tree">
              <div class="link-item whatsapp">
                <div class="link-icon"><i class="bx bxl-whatsapp"></i></div>
                <div class="link-content">
                  <strong>WhatsApp</strong>
                  <span>+591 75123456</span>
                </div>
              </div>

              <div class="link-item instagram">
                <div class="link-icon"><i class="bx bxl-instagram"></i></div>
                <div class="link-content">
                  <strong>Instagram</strong>
                  <span>@tejidosdebolivia</span>
                </div>
              </div>

              <div class="link-item facebook">
                <div class="link-icon"><i class="bx bxl-facebook"></i></div>
                <div class="link-content">
                  <strong>Facebook</strong>
                  <span>Tejidos de Bolivia</span>
                </div>
              </div>

              <div class="link-item tiktok">
                <div class="link-icon"><i class="bx bxl-tiktok"></i></div>
                <div class="link-content">
                  <strong>TikTok</strong>
                  <span>@tejidosdebolivia</span>
                </div>
              </div>

              <div class="link-item website">
                <div class="link-icon"><i class="bx bx-link"></i></div>
                <div class="link-content">
                  <strong>Sitio Web</strong>
                  <span>tejidosdebolivia.com</span>
                </div>
              </div>

              <div class="link-item contact-info-item">
                <div class="link-icon"><i class="bx bx-map"></i></div>
                <div class="link-content">
                  <strong>Ubicación</strong>
                  <span>Oruro, Bolivia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Información de la Empresa -->
        <div class="right-column">
          <div class="company-info">
            <div class="about-section">
              <h2>Nuestra Historia</h2>
              <p>
                Tejidos de Bolivia nace del profundo amor por nuestras tradiciones ancestrales y el
                deseo de preservar el rico patrimonio textil boliviano. Desde nuestros inicios,
                trabajamos directamente con artesanos y comunidades de diversas regiones de Bolivia,
                asegurando prácticas de comercio justo y apoyando la economía local.
              </p>
              <p>
                Cada prenda que ofrecemos cuenta una historia única, con símbolos y diseños que
                representan la cosmovisión andina y las tradiciones de nuestros pueblos originarios.
                Nos enorgullece ser un puente entre estos conocimientos ancestrales y el mundo
                contemporáneo.
              </p>
            </div>

            <div class="about-section">
              <h2>Nuestra Misión</h2>
              <p>
                Preservar, valorar y difundir las técnicas textiles tradicionales de Bolivia,
                ofreciendo productos auténticos de la más alta calidad mientras apoyamos
                directamente a las comunidades artesanas que mantienen vivas estas tradiciones.
              </p>
            </div>

            <div class="about-section">
              <h2>Nuestros Valores</h2>
              <div class="values-grid">
                <div class="value-item">
                  <h3>🏺 Tradición Ancestral</h3>
                  <p>
                    Respetamos y preservamos las técnicas de tejido transmitidas por generaciones.
                  </p>
                </div>
                <div class="value-item">
                  <h3>🤝 Comercio Justo</h3>
                  <p>
                    Trabajamos directamente con artesanos, asegurando precios justos y condiciones
                    dignas.
                  </p>
                </div>
                <div class="value-item">
                  <h3>🌱 Sostenibilidad</h3>
                  <p>Utilizamos materiales naturales y procesos que respetan el medio ambiente.</p>
                </div>
                <div class="value-item">
                  <h3>✋ Calidad Artesanal</h3>
                  <p>Cada pieza es única, elaborada a mano con la máxima dedicación y cuidado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Por Qué Elegirnos - Fila Completa -->
      <div class="full-width-section">
        <div class="why-choose-us">
          <h2>¿Por Qué Elegirnos?</h2>
          <ul class="benefits-list">
            <li>Productos 100% auténticos elaborados por artesanos bolivianos</li>
            <li>Apoyo directo a comunidades indígenas y rurales</li>
            <li>
              Materiales de la más alta calidad: lana de alpaca, algodón orgánico, tintes naturales
            </li>
            <li>Cada compra contribuye a preservar tradiciones ancestrales</li>
            <li>Atención personalizada y asesoramiento cultural</li>
            <li>Envíos seguros a toda Bolivia</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Esta página es estática, no necesita lógica adicional
</script>

<style scoped>
.about-page {
  padding: var(--espaciado-xl) 0;
}

.about-header {
  text-align: center;
  margin-bottom: var(--espaciado-xl);
}

.about-header h1 {
  color: var(--rojo-tradicional);
  margin-bottom: var(--espaciado-md);
}

.lead {
  font-size: 1.25rem;
  color: var(--gris-medio);
  max-width: 600px;
  margin: 0 auto;
}

/* Layout principal de dos columnas */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--espaciado-xl);
  margin-bottom: var(--espaciado-xl);
}

/* Columna Izquierda - Contacto */
.left-column {
  display: flex;
  flex-direction: column;
}

.contact-section {
  background: linear-gradient(135deg, var(--crema), white);
  padding: var(--espaciado-xl);
  border-radius: 12px;
  border-left: 4px solid var(--rojo-tradicional);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.contact-section h2 {
  color: var(--rojo-tradicional);
  margin-bottom: var(--espaciado-md);
  border-bottom: none;
}

.contact-section p {
  margin-bottom: var(--espaciado-lg);
  line-height: 1.6;
  color: var(--gris-medio);
}

/* Árbol de Enlaces estilo Linktree */
.social-links-tree {
  display: flex;
  flex-direction: column;
  gap: var(--espaciado-sm);
}

.link-item,
.contact-info-item {
  display: flex;
  align-items: center;
  gap: var(--espaciado-md);
  padding: var(--espaciado-md);
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.link-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.whatsapp:hover,
.bxl-whatsapp:hover {
  border-color: #25d366;
  color: #25d366;
}
.instagram:hover,
bxl-instagram:hover {
  border-color: #e4405f;
  color: #e4405f;
}
.facebook:hover,
bxl-facebook:hover {
  border-color: #1877f2;
  color: #1877f2;
}
.tiktok:hover,
bxl-tiktok {
  border-color: #000000;
  color: #000000;
}
.website:hover,
bx-link:hover {
  border-color: var(--rojo-tradicional);
  color: var(--rojo-tradicional);
}
.contact-info-item:hover,
bx-map:hover {
  border-color: #a71be8;
  color: #a71be8;
}

.link-icon {
  font-size: 3rem;
  min-width: 40px;
  text-align: center;
}

.link-content {
  flex: 1;
}

.link-content strong {
  display: block;
  color: var(--gris-oscuro);
  font-weight: 600;
  margin-bottom: 2px;
}

.link-content span {
  color: var(--gris-medio);
  font-size: 0.9rem;
}

/* Columna Derecha - Información de la empresa */
.right-column {
  display: flex;
  flex-direction: column;
}

.company-info {
  background: white;
  padding: var(--espaciado-xl);
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.about-section {
  margin-bottom: var(--espaciado-xl);
}

.about-section:last-child {
  margin-bottom: 0;
}

.about-section h2 {
  color: var(--verde-oscuro);
  margin-bottom: var(--espaciado-md);
  border-bottom: 2px solid var(--crema);
  padding-bottom: var(--espaciado-sm);
}

.about-section p {
  line-height: 1.7;
  color: var(--gris-medio);
  margin-bottom: var(--espaciado-md);
}

.about-section p:last-child {
  margin-bottom: 0;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--espaciado-md);
  margin-top: var(--espaciado-lg);
}

.value-item {
  background: var(--crema);
  padding: var(--espaciado-lg);
  border-radius: var(--border-radius);
  text-align: center;
}

.value-item h3 {
  color: var(--rojo-tradicional);
  margin-bottom: var(--espaciado-sm);
  font-size: 1rem;
}

.value-item p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
}

/* Sección de fila completa */
.full-width-section {
  width: 100%;
  margin-top: var(--espaciado-xl);
}

.why-choose-us {
  background: linear-gradient(135deg, var(--verde-oscuro), #2d5a27);
  padding: var(--espaciado-xl);
  border-radius: 12px;
  color: white;
}

.why-choose-us h2 {
  color: white;
  margin-bottom: var(--espaciado-lg);
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  padding-bottom: var(--espaciado-md);
}

.benefits-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--espaciado-md);
  max-width: 1000px;
  margin: 0 auto;
}

.benefits-list li {
  padding: var(--espaciado-sm) 0;
  padding-left: var(--espaciado-lg);
  position: relative;
  line-height: 1.6;
  color: white;
}

.benefits-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--crema);
  font-weight: bold;
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .contact-section {
    position: static;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .benefits-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .about-page {
    padding: var(--espaciado-lg) 0;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: var(--espaciado-md);
  }

  .contact-section,
  .company-info,
  .why-choose-us {
    padding: var(--espaciado-lg);
  }

  .social-links-tree {
    gap: var(--espaciado-xs);
  }

  .link-item,
  .contact-info-item {
    padding: var(--espaciado-sm);
  }

  .link-content strong {
    font-size: 0.9rem;
  }

  .link-content span {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .about-header h1 {
    font-size: 2rem;
  }

  .lead {
    font-size: 1.1rem;
  }

  .link-item {
    padding: var(--espaciado-sm);
  }

  .link-icon {
    font-size: 1.3rem;
  }
}
</style>
