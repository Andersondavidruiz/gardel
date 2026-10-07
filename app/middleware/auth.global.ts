export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const usuarioStr = localStorage.getItem('usuario_gardel')
    const sedeStr = localStorage.getItem('sede_actual_id') || localStorage.getItem('sede_id')

    // Si intenta acceder a páginas privadas sin usuario
    if (to.path !== '/' && !usuarioStr) {
      return navigateTo('/')
    }

    // Si ya está autenticado pero intenta ir a rutas operativas sin sede
    if (usuarioStr && !sedeStr && to.path !== '/sedes' && to.path !== '/') {
      return navigateTo('/sedes')
    }

    // Si ya está autenticado e intenta ir a login
    if (to.path === '/' && usuarioStr) {
      if (sedeStr) {
        return navigateTo('/pedidos')
      } else {
        return navigateTo('/sedes')
      }
    }
  }
})

