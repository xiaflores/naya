import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rutas públicas de la tienda
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomeView.vue'),
    },
    {
      path: '/productos',
      name: 'products',
      component: () => import('@/views/public/ProductsView.vue'),
    },
    {
      path: '/categoria/:slug',
      name: 'category',
      component: () => import('@/views/public/CategoryView.vue'),
      props: true,
    },
    {
      path: '/producto-detalle/:slug',
      name: 'product-detail', // ← CORREGIDO: "detail" no "datail"
      component: () => import('@/views/public/ProductDetailView.vue'),
      props: true,
    },
    {
      path: '/sobre-nosotros',
      name: 'about',
      component: () => import('@/views/public/AboutView.vue'),
    },

    // Rutas de administración
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/LoginView.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        {
          path: 'productos',
          name: 'admin-products',
          component: () => import('@/views/admin/ProductsView.vue'),
        },
        {
          path: 'categorias',
          name: 'admin-categories',
          component: () => import('@/views/admin/CategoriesView.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Siempre scroll al top en navegación nueva
    return { top: 0 }

    // O si quieres mantener posición en botón "atrás":
    // if (savedPosition) {
    //   return savedPosition
    // } else {
    //   return { top: 0 }
    // }
  },
})

// Guard para rutas protegidas (mantener igual)
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      next({ name: 'admin-login' })
    } else {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!adminUser) {
        next({ name: 'admin-login' })
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
