import type { UsuarioGardel } from '~/types/gardel'

export const useAuth = () => {
  const usuario = useState<UsuarioGardel | null>('auth_usuario', () => null)

  const initAuth = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('usuario_gardel')
      if (stored) {
        try {
          usuario.value = JSON.parse(stored)
        } catch (e) {
          console.error('Error parseando usuario_gardel de localStorage', e)
        }
      }
    }
  }

  const setUsuario = (data: UsuarioGardel) => {
    usuario.value = data
    if (import.meta.client) {
      localStorage.setItem('usuario_gardel', JSON.stringify(data))
    }
  }

  const logout = () => {
    usuario.value = null
    if (import.meta.client) {
      localStorage.removeItem('usuario_gardel')
      localStorage.removeItem('sede_actual_id')
      localStorage.removeItem('sede_nombre')
      localStorage.removeItem('cierre_id')
    }
    navigateTo('/')
  }

  const estaAutenticado = computed(() => !!usuario.value)

  return {
    usuario,
    initAuth,
    setUsuario,
    logout,
    estaAutenticado
  }
}

