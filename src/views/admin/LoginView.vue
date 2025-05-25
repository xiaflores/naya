<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Panel de Administración</h1>
          <p>Tejidos de Bolivia</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              v-model="credentials.email"
              required
              :disabled="loading"
              placeholder="admin@tejidosdebolivia.com"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              v-model="credentials.password"
              required
              :disabled="loading"
              placeholder="••••••••"
              class="form-input"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading" class="login-btn">
            {{ loading ? 'Iniciando Sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="login-footer">
          <router-link to="/" class="back-link">← Volver a la Tienda</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()

// Estados reactivos
const loading = ref(false)
const error = ref('')
const credentials = ref({
  email: '',
  password: '',
})

// Función de login
const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Intentar iniciar sesión
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: credentials.value.email,
      password: credentials.value.password,
    })

    if (signInError) {
      throw signInError
    }

    // Verificar si es administrador
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    if (adminError || !adminUser) {
      // Cerrar sesión si no es administrador
      await supabase.auth.signOut()
      throw new Error('No tienes permisos de administrador')
    }

    // Redirigir al dashboard
    router.push({ name: 'admin-dashboard' })
  } catch (err) {
    console.error('Error de login:', err)
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--rojo-tradicional) 0%, var(--terracota) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--espaciado-lg);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.login-header {
  background: var(--gris-oscuro);
  color: white;
  padding: var(--espaciado-xl);
  text-align: center;
}

.login-header h1 {
  font-family: var(--fuente-titulo);
  font-size: 1.8rem;
  margin-bottom: var(--espaciado-xs);
}

.login-header p {
  opacity: 0.8;
  margin: 0;
}

.login-form {
  padding: var(--espaciado-xl);
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

.form-input {
  width: 100%;
  padding: var(--espaciado-md);
  border: 2px solid var(--gris-claro);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--rojo-tradicional);
}

.form-input:disabled {
  background: var(--gris-claro);
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: var(--espaciado-sm);
  border-radius: 6px;
  margin-bottom: var(--espaciado-md);
  font-size: 0.9rem;
}

.login-btn {
  width: 100%;
  background: var(--rojo-tradicional);
  color: white;
  border: none;
  padding: var(--espaciado-md);
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background: var(--terracota);
}

.login-btn:disabled {
  background: var(--gris-medio);
  cursor: not-allowed;
}

.login-footer {
  padding: var(--espaciado-lg);
  text-align: center;
  background: var(--gris-claro);
}

.back-link {
  color: var(--gris-medio);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: var(--rojo-tradicional);
}

/* Responsive */
@media (max-width: 480px) {
  .admin-login {
    padding: var(--espaciado-md);
  }

  .login-form {
    padding: var(--espaciado-lg);
  }
}
</style>
