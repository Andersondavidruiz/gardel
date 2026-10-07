<template>
  <div class="h-full flex flex-col p-4 md:p-6 overflow-hidden">
    <div class="max-w-6xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
      <!-- Tarjeta Principal -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <!-- Encabezado de la tabla -->
        <div class="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 bg-gray-50/50">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-gray-800">Listado de Comandas Registradas</h2>
            <p class="text-xs text-gray-500">Historial y control de comandas despachadas y canceladas de la sede</p>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="cargarComandas"
              :disabled="cargando"
              class="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg class="w-3.5 h-3.5 text-gray-500" :class="{ 'animate-spin': cargando }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        <!-- Tabla -->
        <div class="flex-1 overflow-y-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider sticky top-0 border-b border-gray-200">
              <tr>
                <th class="p-3.5 pl-5">N° Comanda</th>
                <th class="p-3.5">Cliente</th>
                <th class="p-3.5">Teléfono</th>
                <th class="p-3.5">Total</th>
                <th class="p-3.5 text-center">Estado</th>
                <th class="p-3.5">Fecha</th>
                <th class="p-3.5 text-center pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="cargando">
                <td colspan="7" class="p-8 text-center text-gray-400">
                  <div class="flex flex-col items-center">
                    <div class="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span class="text-xs">Cargando comandas...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="comandas.length === 0">
                <td colspan="7" class="p-8 text-center text-gray-400 text-xs">
                  No hay comandas registradas en esta sede.
                </td>
              </tr>
              <tr
                v-for="comanda in comandas"
                :key="comanda.id"
                class="hover:bg-gray-50/80 transition"
              >
                <td class="p-3.5 pl-5 font-bold text-gray-800">
                  #{{ comanda.numero_comanda || comanda.id }}
                </td>
                <td class="p-3.5 text-gray-700 font-medium">
                  {{ comanda.cliente_nombre || 'Consumidor Final' }}
                </td>
                <td class="p-3.5 text-gray-500">
                  {{ comanda.cliente_telefono || 'N/A' }}
                </td>
                <td class="p-3.5 font-extrabold text-emerald-600">
                  ${{ formatearDinero(comanda.total) }}
                </td>
                <td class="p-3.5 text-center">
                  <span
                    class="text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider"
                    :class="comanda.estado?.toUpperCase() === 'CANCELADA' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'"
                  >
                    {{ comanda.estado || 'DESPACHADA' }}
                  </span>
                </td>
                <td class="p-3.5 text-xs text-gray-500">
                  {{ comanda.created_at || 'Hoy' }}
                </td>
                <td class="p-3.5 text-center pr-5">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="abrirDetalle(comanda.id)"
                      class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
                    >
                      Ver
                    </button>
                    <button
                      v-if="comanda.estado?.toUpperCase() !== 'CANCELADA'"
                      @click="cancelarComanda(comanda.id)"
                      class="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLE DE COMANDA -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
        <div class="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 class="text-base font-bold text-gray-800">
            Detalle de Comanda #{{ comandaSeleccionadaId }}
          </h3>
          <button
            @click="modalAbierto = false"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-if="cargandoDetalle" class="py-8 text-center text-gray-400">
          <div class="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span class="text-xs">Cargando productos de la comanda...</span>
        </div>

        <div v-else class="space-y-4">
          <div class="overflow-x-auto max-h-60 overflow-y-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b text-gray-400 uppercase text-[10px]">
                <tr>
                  <th class="pb-2 font-bold">Producto</th>
                  <th class="pb-2 text-center font-bold">Cant.</th>
                  <th class="pb-2 text-right font-bold">Unitario</th>
                  <th class="pb-2 text-right font-bold">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="detalleItems.length === 0">
                  <td colspan="4" class="py-4 text-center text-gray-400">
                    No se encontraron detalles para esta comanda.
                  </td>
                </tr>
                <tr v-for="(item, idx) in detalleItems" :key="idx">
                  <td class="py-2.5 font-semibold text-gray-800">{{ item.producto_nombre }}</td>
                  <td class="py-2.5 text-center text-gray-600">{{ item.cantidad }}</td>
                  <td class="py-2.5 text-right text-gray-600">${{ formatearDinero(item.precio_unitario) }}</td>
                  <td class="py-2.5 text-right font-bold text-gray-800">${{ formatearDinero(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end pt-3 border-t border-gray-100">
            <button
              @click="modalAbierto = false"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComandaDetalle } from '~/types/gardel'

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { usuario, initAuth } = useAuth()
const { sedeActual, initSede } = useSede()

const comandas = ref<ComandaDetalle[]>([])
const cargando = ref(false)

// Modal
const modalAbierto = ref(false)
const cargandoDetalle = ref(false)
const comandaSeleccionadaId = ref<number | string>('')
const detalleItems = ref<any[]>([])

onMounted(async () => {
  initAuth()
  initSede()
  await cargarComandas()
})

const formatearDinero = (val: number | string | undefined) => {
  if (val === undefined || val === null) return '0'
  return parseFloat(String(val)).toLocaleString('es-CO')
}

const cargarComandas = async () => {
  const sedeId = sedeActual.value?.id || (usuario.value as any)?.sede_id || 1
  cargando.value = true

  try {
    const res: any = await $fetch(`${apiUrl}/ComandaController.php?action=listar&sede_id=${sedeId}`)
    if (res && res.status && Array.isArray(res.data)) {
      comandas.value = res.data
    } else {
      comandas.value = []
    }
  } catch (err) {
    console.warn('Error cargando comandas desde API:', err)
    comandas.value = []
  } finally {
    cargando.value = false
  }
}

const abrirDetalle = async (comandaId: number | string) => {
  comandaSeleccionadaId.value = comandaId
  modalAbierto.value = true
  cargandoDetalle.value = true
  detalleItems.value = []

  try {
    const res: any = await $fetch(`${apiUrl}/ComandaController.php?action=detalle&comanda_id=${comandaId}`)
    if (res && res.status && Array.isArray(res.data)) {
      detalleItems.value = res.data
    }
  } catch (err) {
    console.error('Error cargando detalle de comanda:', err)
  } finally {
    cargandoDetalle.value = false
  }
}

const cancelarComanda = async (comandaId: number | string) => {
  if (!confirm(`¿Estás seguro de que deseas cancelar la comanda #${comandaId}?`)) {
    return
  }

  try {
    const res: any = await $fetch(`${apiUrl}/ComandaController.php`, {
      method: 'POST',
      body: {
        action: 'cancelar',
        comanda_id: comandaId
      }
    })

    if (res && res.status) {
      alert('Comanda cancelada exitosamente.')
      await cargarComandas()
    } else {
      alert(res?.message || 'No se pudo cancelar la comanda.')
    }
  } catch (err: any) {
    alert(err?.message || 'Error de conexión al procesar la cancelación.')
  }
}
</script>

