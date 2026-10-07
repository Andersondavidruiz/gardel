import type { Sede } from '~/types/gardel'

export const useSede = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl

  const sedeActual = useState<Sede | null>('sede_actual', () => null)
  const sedesDisponibles = useState<Sede[]>('sedes_disponibles', () => [])
  const cierreId = useState<number | string | null>('cierre_id', () => null)

  const initSede = () => {
    if (import.meta.client) {
      const storedSedeId = localStorage.getItem('sede_actual_id') || localStorage.getItem('sede_id')
      const storedSedeNombre = localStorage.getItem('sede_nombre')
      const storedCierreId = localStorage.getItem('cierre_id')

      if (storedSedeId) {
        sedeActual.value = {
          id: storedSedeId,
          nombre: storedSedeNombre || `Sede #${storedSedeId}`
        }
      }
      if (storedCierreId) {
        cierreId.value = storedCierreId
      }
    }
  }

  const setSedeActiva = (sede: Sede, nuevoCierreId?: number | string) => {
    sedeActual.value = sede
    if (import.meta.client) {
      localStorage.setItem('sede_actual_id', String(sede.id))
      localStorage.setItem('sede_id', String(sede.id))
      localStorage.setItem('sede_nombre', sede.nombre)
      if (nuevoCierreId) {
        cierreId.value = nuevoCierreId
        localStorage.setItem('cierre_id', String(nuevoCierreId))
      }
    }
  }

  const obtenerSedes = async (): Promise<Sede[]> => {
    try {
      const res: any = await $fetch(`${apiUrl}/SedesController.php`)
      if (res && res.status === true && Array.isArray(res.data)) {
        sedesDisponibles.value = res.data
        return res.data
      }
      return []
    } catch (err) {
      console.error('Error obteniendo sedes:', err)
      return []
    }
  }

  return {
    sedeActual,
    sedesDisponibles,
    cierreId,
    initSede,
    setSedeActiva,
    obtenerSedes
  }
}

