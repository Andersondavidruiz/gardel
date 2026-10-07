<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-100">
    <!-- Pestañas Internas -->
    <div class="bg-white border-b border-gray-200 px-6 flex gap-4">
      <button
        @click="vistaActiva = 'lista'"
        class="py-3.5 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2"
        :class="vistaActiva === 'lista' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        <span>📋</span>
        Bandeja de Pedidos y Traslados
      </button>

      <button
        @click="vistaActiva = 'solicitar'"
        class="py-3.5 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2"
        :class="vistaActiva === 'solicitar' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        <span>➕</span>
        Solicitar Insumos a otra Sede
      </button>
    </div>

    <!-- VISTA 1: BANDEJA DE TRASLADOS -->
    <div v-if="vistaActiva === 'lista'" class="flex-1 p-4 md:p-6 overflow-y-auto">
      <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-gray-800">Historial y Solicitudes de Inventario</h2>
            <p class="text-xs text-gray-500">Monitoree solicitudes entrantes como proveedor o salientes como solicitante</p>
          </div>
          <button
            @click="cargarTraslados"
            :disabled="cargando"
            class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" :class="{ 'animate-spin': cargando }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Actualizar</span>
          </button>
        </div>

        <div v-if="cargando" class="py-12 text-center text-gray-400">
          <div class="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span class="text-xs">Cargando traslados...</span>
        </div>

        <div v-else-if="traslados.length === 0" class="py-12 text-center text-gray-400 text-xs">
          No hay registros de traslados o solicitudes para esta sede.
        </div>

        <!-- Tarjetas de traslados -->
        <div v-else class="space-y-4">
          <div
            v-for="t in traslados"
            :key="t.id"
            class="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 shadow-xs"
          >
            <div class="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div class="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span>Origen (Proveedor): <span class="text-orange-600 font-extrabold">{{ t.origen_nombre || `Sede #${t.sede_origen_id}` }}</span></span>
                <span>➔</span>
                <span>Destino (Solicitante): <span class="text-blue-600 font-extrabold">{{ t.destino_nombre || `Sede #${t.sede_destino_id}` }}</span></span>
              </div>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                :class="obtenerBadgeClase(t.estado)"
              >
                {{ t.estado }}
              </span>
            </div>

            <p v-if="t.observacion" class="text-xs text-gray-500 mb-3 bg-white p-2 rounded-lg border border-gray-100">
              <strong class="text-gray-700">Nota:</strong> {{ t.observacion }}
            </p>

            <!-- Lista de items en el traslado -->
            <div class="space-y-1.5 mb-3 text-xs">
              <div
                v-for="d in t.detalles"
                :key="d.detalle_id"
                class="flex flex-wrap justify-between items-center bg-white p-2.5 rounded-xl border border-gray-200 gap-2"
              >
                <div>
                  <strong class="text-gray-800">{{ d.item_name || d.item_nombre }}</strong>
                  <span class="text-gray-400 text-[11px] ml-1.5">
                    (Solicitado: {{ d.cantidad_solicitada || d.cantidad_enviada }})
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 font-medium">
                    {{ t.estado === 'ACEPTADA' ? 'Cant. Recibida:' : 'Cant. Envío:' }}
                  </span>
                  <input
                    v-model.number="d.cantidad_enviada"
                    type="number"
                    step="0.001"
                    :readonly="!puedeEditarDetalle(t)"
                    class="w-20 p-1 border rounded-lg text-center font-bold text-xs"
                    :class="puedeEditarDetalle(t) ? 'bg-amber-50 border-amber-400 text-amber-900 focus:ring-2 focus:ring-amber-500' : 'bg-gray-50 text-gray-600 border-gray-200'"
                  />
                  <span class="text-gray-500 text-xs font-semibold">{{ d.unidad }}</span>
                </div>
              </div>
            </div>

            <!-- Botones de Acción según estado y rol -->
            <div v-if="t.estado === 'PENDIENTE'" class="flex gap-2 justify-end mt-3">
              <template v-if="esProveedor(t)">
                <button
                  @click="procesarRespuesta(t.id, 'RECHAZADA')"
                  class="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  Rechazar Pedido
                </button>
                <button
                  @click="aceptarYDespachar(t)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Aceptar y Enviar
                </button>
              </template>
              <template v-else-if="esSolicitante(t)">
                <button
                  @click="cancelarPedido(t.id)"
                  class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  Cancelar Pedido
                </button>
              </template>
            </div>

            <div v-else-if="t.estado === 'ACEPTADA'" class="flex justify-end mt-2">
              <template v-if="esSolicitante(t)">
                <button
                  @click="confirmarRecepcion(t)"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Confirmar y Guardar Cantidades Recibidas
                </button>
              </template>
              <template v-else>
                <p class="text-xs text-blue-600 font-semibold">
                  Pedido aceptado y despachado. Esperando confirmación y recepción en la sede destino.
                </p>
              </template>
            </div>

            <div v-else-if="t.estado === 'RECHAZADA'">
              <p class="text-xs text-red-600 font-semibold">
                Este pedido fue rechazado. Motivo: {{ t.motivo_rechazo || 'No especificado' }}
              </p>
            </div>

            <div v-else-if="t.estado === 'CANCELADA'">
              <p class="text-xs text-gray-500 font-semibold">Este pedido fue cancelado por el solicitante.</p>
            </div>

            <div v-else-if="t.estado === 'RECIBIDA'">
              <p class="text-xs text-emerald-600 font-semibold">✔ Proceso de traslado completado con éxito.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA 2: SOLICITAR INSUMOS A OTRA SEDE -->
    <div v-else class="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
      <!-- Buscador de Insumos -->
      <section class="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto border-r border-gray-200 flex flex-col gap-4">
        <div>
          <h2 class="text-base font-bold text-gray-800">Catálogo de Insumos Disponibles</h2>
          <p class="text-xs text-gray-500">Busca el insumo o producto que necesitas pedir a otra sede</p>
        </div>

        <div class="relative">
          <input
            v-model="filtroInsumos"
            type="text"
            placeholder="Escribe el nombre del insumo (ej: Queso, Harina)..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Resultados de búsqueda -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-1">
          <p v-if="!filtroInsumos.trim()" class="text-center text-gray-400 text-xs py-8">
            Escribe en el buscador para filtrar los ítems
          </p>
          <p v-else-if="insumosFiltrados.length === 0" class="text-center text-gray-500 text-xs py-8">
            No se encontraron insumos con ese nombre.
          </p>
          <div
            v-for="item in insumosFiltrados"
            :key="item.id"
            class="flex justify-between items-center p-3 hover:bg-orange-50/50 rounded-xl border border-gray-200 text-xs transition"
          >
            <div>
              <strong class="text-gray-800">{{ item.nombre }}</strong>
              <span class="text-gray-500 ml-1">({{ item.unidad_medida }})</span>
            </div>
            <button
              @click="agregarItemSolicitud(item)"
              class="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
            >
              Agregar
            </button>
          </div>
        </div>
      </section>

      <!-- Resumen del Pedido de Traslado -->
      <section class="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto flex flex-col justify-between bg-gray-50/50">
        <div>
          <h2 class="text-base font-bold text-gray-800 mb-1">Nueva Solicitud de Traslado</h2>
          <p class="text-xs text-gray-500 mb-4">Sede receptora actual: <strong>{{ sedeActual?.nombre || 'Sede Actual' }}</strong></p>

          <div class="mb-4">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Sede Proveedora (A quién le pides)
            </label>
            <select
              v-model="sedeDestinoSolicitud"
              class="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="" disabled>-- Seleccione sede proveedora --</option>
              <option
                v-for="s in sedesProveedorasDisponibles"
                :key="s.id"
                :value="s.id"
              >
                {{ s.nombre }}
              </option>
            </select>
          </div>

          <!-- Tabla de Insumos Agregados -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th class="p-2.5">Insumo</th>
                  <th class="p-2.5 text-center">Cant.</th>
                  <th class="p-2.5 text-center">Unidad</th>
                  <th class="p-2.5 text-center w-8"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="itemsSolicitud.length === 0">
                  <td colspan="4" class="py-6 text-center text-gray-400">
                    No has agregado insumos a esta solicitud.
                  </td>
                </tr>
                <tr v-for="item in itemsSolicitud" :key="item.item_id" class="hover:bg-gray-50">
                  <td class="p-2.5 font-bold text-gray-800">{{ item.nombre }}</td>
                  <td class="p-2.5 text-center">
                    <input
                      v-model.number="item.cantidad"
                      type="number"
                      step="0.001"
                      min="0.001"
                      class="w-16 p-1 border border-gray-300 rounded text-center text-xs font-bold focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td class="p-2.5 text-center text-gray-500 font-semibold">{{ item.unidad }}</td>
                  <td class="p-2.5 text-center">
                    <button
                      @click="eliminarItemSolicitud(item.item_id)"
                      class="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pt-6">
          <button
            @click="enviarSolicitud"
            :disabled="enviandoSolicitud || itemsSolicitud.length === 0 || !sedeDestinoSolicitud"
            class="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg v-if="enviandoSolicitud" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ enviandoSolicitud ? 'Enviando solicitud...' : 'Enviar Solicitud de Traslado' }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { sedeActual, initSede } = useSede()
const { usuario, initAuth } = useAuth()

const vistaActiva = ref<'lista' | 'solicitar'>('lista')
const cargando = ref(false)
const traslados = ref<any[]>([])

// Catálogo de Insumos
const catalogoItems = ref<any[]>([])
const filtroInsumos = ref('')
const sedeDestinoSolicitud = ref<number | string>('')
const itemsSolicitud = ref<any[]>([])
const enviandoSolicitud = ref(false)

const sedesLista = ref([
  { id: 1, nombre: 'Alamedas' },
  { id: 2, nombre: 'Nariño' },
  { id: 3, nombre: 'Urbina' },
  { id: 4, nombre: 'Bodega de Producción' }
])

onMounted(async () => {
  initAuth()
  initSede()
  await cargarCatalogo()
  await cargarTraslados()
})

const sedeIdActual = computed(() => {
  return Number(sedeActual.value?.id || (usuario.value as any)?.sede_id || 1)
})

const sedesProveedorasDisponibles = computed(() => {
  return sedesLista.value.filter(s => s.id !== sedeIdActual.value)
})

const insumosFiltrados = computed(() => {
  if (!filtroInsumos.value.trim()) return []
  return catalogoItems.value.filter(i =>
    i.nombre.toLowerCase().includes(filtroInsumos.value.toLowerCase().trim())
  )
})

const cargarCatalogo = async () => {
  try {
    const res: any = await $fetch(`${apiUrl}/traslados_controller.php?action=items`)
    if (Array.isArray(res)) {
      catalogoItems.value = res
    } else {
      // Fallback
      catalogoItems.value = [
        { id: 1, nombre: 'Queso Mozzarella Bloque', unidad_medida: 'Kg' },
        { id: 2, nombre: 'Harina de Trigo Especial', unidad_medida: 'Kg' },
        { id: 3, nombre: 'Pasta de Tomate Base', unidad_medida: 'Kg' },
        { id: 4, nombre: 'Cajas para Pizza Mediana', unidad_medida: 'Unid' },
        { id: 5, nombre: 'Jamón Tajado', unidad_medida: 'Kg' }
      ]
    }
  } catch (e) {
    console.warn('Usando catálogo fallback de insumos:', e)
    catalogoItems.value = [
      { id: 1, nombre: 'Queso Mozzarella Bloque', unidad_medida: 'Kg' },
      { id: 2, nombre: 'Harina de Trigo Especial', unidad_medida: 'Kg' },
      { id: 3, nombre: 'Pasta de Tomate Base', unidad_medida: 'Kg' },
      { id: 4, nombre: 'Cajas para Pizza Mediana', unidad_medida: 'Unid' },
      { id: 5, nombre: 'Jamón Tajado', unidad_medida: 'Kg' }
    ]
  }
}

const cargarTraslados = async () => {
  cargando.value = true
  try {
    const res: any = await $fetch(`${apiUrl}/traslados_controller.php?action=traslados&sede_id=${sedeIdActual.value}`)
    if (Array.isArray(res)) {
      traslados.value = res
    } else {
      traslados.value = []
    }
  } catch (e) {
    console.warn('Error cargando traslados:', e)
    traslados.value = []
  } finally {
    cargando.value = false
  }
}

const esProveedor = (t: any) => Number(t.sede_origen_id) === sedeIdActual.value
const esSolicitante = (t: any) => Number(t.sede_destino_id) === sedeIdActual.value

const puedeEditarDetalle = (t: any) => {
  return (t.estado === 'PENDIENTE' && esProveedor(t)) || (t.estado === 'ACEPTADA' && esSolicitante(t))
}

const obtenerBadgeClase = (estado: string) => {
  switch (estado) {
    case 'ACEPTADA': return 'bg-blue-100 text-blue-800'
    case 'RECHAZADA': return 'bg-red-100 text-red-800'
    case 'RECIBIDA': return 'bg-emerald-100 text-emerald-800'
    case 'CANCELADA': return 'bg-gray-200 text-gray-700'
    default: return 'bg-amber-100 text-amber-800'
  }
}

const agregarItemSolicitud = (item: any) => {
  const existe = itemsSolicitud.value.find(i => i.item_id === item.id)
  if (existe) {
    existe.cantidad += 1
  } else {
    itemsSolicitud.value.push({
      item_id: item.id,
      nombre: item.nombre,
      unidad: item.unidad_medida,
      cantidad: 1
    })
  }
}

const eliminarItemSolicitud = (id: number | string) => {
  itemsSolicitud.value = itemsSolicitud.value.filter(i => i.item_id !== id)
}

const enviarSolicitud = async () => {
  if (!sedeDestinoSolicitud.value) {
    alert('Seleccione la sede proveedora.')
    return
  }
  if (Number(sedeDestinoSolicitud.value) === sedeIdActual.value) {
    alert('La sede que solicita y la sede proveedora no pueden ser la misma.')
    return
  }
  if (itemsSolicitud.value.length === 0) {
    alert('Agregue al menos un insumo a la solicitud.')
    return
  }

  enviandoSolicitud.value = true

  const payload = {
    sede_origen_id: parseInt(String(sedeDestinoSolicitud.value)),
    sede_destino_id: sedeIdActual.value,
    solicitado_por: (usuario.value as any)?.id || 1,
    observacion: 'Petición de traslado inter-sedes desde Nuxt POS',
    items: itemsSolicitud.value
  }

  try {
    const res: any = await $fetch(`${apiUrl}/traslados_controller.php`, {
      method: 'POST',
      body: payload
    })

    if (res && res.success) {
      alert(res.message || '¡Solicitud de traslado enviada con éxito!')
      itemsSolicitud.value = []
      sedeDestinoSolicitud.value = ''
      vistaActiva.value = 'lista'
      await cargarTraslados()
    } else {
      alert(res?.message || 'Error al enviar la solicitud.')
    }
  } catch (err: any) {
    alert(err?.message || 'Error de conexión con el servidor.')
  } finally {
    enviandoSolicitud.value = false
  }
}

const aceptarYDespachar = async (t: any) => {
  if (!confirm('¿Confirma que acepta este pedido y desea despachar las cantidades ingresadas?')) return

  const detalles = t.detalles.map((d: any) => ({
    detalle_id: d.detalle_id,
    cantidad_enviada: parseFloat(d.cantidad_enviada) || 0
  }))

  await actualizarEstadoBackend(t.id, 'ACEPTADA', null, detalles)
}

const cancelarPedido = async (transId: number | string) => {
  if (!confirm('¿Está seguro de cancelar este pedido?')) return
  await actualizarEstadoBackend(transId, 'CANCELADA', 'Cancelado por el solicitante', [])
}

const confirmarRecepcion = async (t: any) => {
  const detalles = t.detalles.map((d: any) => ({
    detalle_id: d.detalle_id,
    cantidad_enviada: parseFloat(d.cantidad_enviada) || 0
  }))

  if (!confirm('¿Desea confirmar las cantidades recibidas y cerrar este traslado?')) return
  await actualizarEstadoBackend(t.id, 'RECIBIDA', null, detalles)
}

const procesarRespuesta = async (transId: number | string, nuevoEstado: string) => {
  let motivo: string | null = null
  if (nuevoEstado === 'RECHAZADA') {
    motivo = prompt('Indique el motivo del rechazo del pedido:')
    if (!motivo) return
  } else {
    if (!confirm('¿Confirma la acción para este traslado?')) return
  }

  await actualizarEstadoBackend(transId, nuevoEstado, motivo, [])
}

const actualizarEstadoBackend = async (transId: number | string, estado: string, motivo: string | null, detalles: any[]) => {
  try {
    const res: any = await $fetch(`${apiUrl}/traslados_controller.php?action=actualizar_estado`, {
      method: 'POST',
      body: {
        transferencia_id: transId,
        nuevo_estado: estado,
        motivo_rechazo: motivo,
        detalles
      }
    })

    if (res && res.success) {
      alert(res.message || 'Actualizado con éxito.')
      await cargarTraslados()
    } else {
      alert(res?.message || 'Error al actualizar estado.')
    }
  } catch (e: any) {
    alert(e?.message || 'Error de conexión con el servidor.')
  }
}
</script>

