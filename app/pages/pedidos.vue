<template>
  <div class="h-full flex flex-col md:flex-row overflow-hidden bg-gray-100">
    <!-- PANEL IZQUIERDO: CATÁLOGO DE PRODUCTOS -->
    <section class="flex-1 flex flex-col p-4 md:p-6 overflow-hidden border-r border-gray-200">
      <!-- Buscador y Filtros -->
      <div class="mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div class="relative w-full sm:w-96">
          <input
            v-model="filtroBusqueda"
            type="text"
            placeholder="Buscar producto por nombre..."
            class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
          />
          <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Categorías activas -->
        <div class="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            @click="categoriaSeleccionada = 'TODOS'"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition"
            :class="categoriaSeleccionada === 'TODOS' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
          >
            Todos
          </button>
          <button
            v-for="cat in categorias"
            :key="cat"
            @click="categoriaSeleccionada = cat"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition"
            :class="categoriaSeleccionada === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Estado de carga / Error -->
      <div v-if="cargandoProductos" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-sm">Cargando catálogo...</p>
        </div>
      </div>

      <!-- Grid de Productos -->
      <div v-else-if="productosFiltrados.length > 0" class="flex-1 overflow-y-auto pr-1">
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4">
          <div
            v-for="prod in productosFiltrados"
            :key="prod.id"
            @click="agregarAlCarrito(prod)"
            class="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
          >
            <div>
              <span class="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {{ prod.categoria || 'General' }}
              </span>
              <h3 class="font-bold text-gray-800 mt-2 text-sm group-hover:text-orange-600 transition line-clamp-2">
                {{ prod.nombre }}
              </h3>
            </div>
            <div class="mt-3.5 flex justify-between items-center pt-2 border-t border-gray-100">
              <span class="text-emerald-600 font-extrabold text-base">
                ${{ formatearDinero(prod.precio) }}
              </span>
              <span class="bg-orange-500 text-white p-1.5 rounded-lg group-hover:bg-orange-600 transition shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center py-12">
          <p class="text-sm font-medium">No se encontraron productos disponibles.</p>
        </div>
      </div>
    </section>

    <!-- PANEL DERECHO: DETALLE DE LA COMANDA Y CHECKOUT -->
    <aside class="w-full md:w-96 lg:w-[420px] bg-white border-l border-gray-200 flex flex-col justify-between shadow-lg">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-gray-800">Detalle de la Comanda</h2>
          <p class="text-xs text-gray-500">{{ itemsCarrito.length }} productos seleccionados</p>
        </div>
        <button
          v-if="itemsCarrito.length > 0"
          @click="vaciarCarrito"
          class="text-xs text-red-500 hover:text-red-700 font-semibold transition"
        >
          Vaciar
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Datos del Cliente -->
        <div class="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cliente</label>
              <input
                v-model="clienteNombre"
                type="text"
                placeholder="Nombre cliente"
                class="w-full p-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Teléfono</label>
              <input
                v-model="clienteTelefono"
                type="text"
                placeholder="300 000 0000"
                class="w-full p-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Observaciones</label>
            <input
              v-model="pedidoComentario"
              type="text"
              placeholder="Ej: Mesa 2, sin cebolla, para llevar"
              class="w-full p-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <!-- Tabla del Carrito -->
        <div class="overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="border-b text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th class="pb-2">Producto</th>
                <th class="pb-2 text-center">Cant.</th>
                <th class="pb-2 text-right">Subtotal</th>
                <th class="pb-2 text-center w-8"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="itemsCarrito.length === 0">
                <td colspan="4" class="py-8 text-center text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg class="w-8 h-8 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    <span>Sin productos seleccionados</span>
                  </div>
                </td>
              </tr>
              <tr v-for="item in itemsCarrito" :key="item.id" class="hover:bg-gray-50 transition">
                <td class="py-2.5 pr-1">
                  <p class="font-bold text-gray-800 line-clamp-1">{{ item.nombre }}</p>
                  <p class="text-[10px] text-gray-500">${{ formatearDinero(item.precio) }}</p>
                </td>
                <td class="py-2.5 text-center">
                  <div class="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                    <button
                      type="button"
                      @click="cambiarCantidad(item.id, -1)"
                      class="w-5 h-5 flex items-center justify-center bg-white hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition"
                    >
                      -
                    </button>
                    <span class="font-bold text-xs px-1 min-w-[16px] text-center">{{ item.cantidad }}</span>
                    <button
                      type="button"
                      @click="cambiarCantidad(item.id, 1)"
                      class="w-5 h-5 flex items-center justify-center bg-white hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td class="py-2.5 text-right font-extrabold text-gray-700">
                  ${{ formatearDinero(item.subtotal) }}
                </td>
                <td class="py-2.5 text-center">
                  <button
                    type="button"
                    @click="eliminarDelCarrito(item.id)"
                    class="text-gray-400 hover:text-red-600 transition p-1"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pie del Pedido y Cobro -->
      <div class="p-4 border-t border-gray-200 bg-gray-50/50 space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-sm font-bold text-gray-600">Total a Pagar:</span>
          <span class="text-2xl font-black text-emerald-600">${{ formatearDinero(totalGeneral) }}</span>
        </div>

        <button
          @click="generarComanda"
          :disabled="guardandoComanda || itemsCarrito.length === 0"
          class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <svg v-if="guardandoComanda" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ guardandoComanda ? 'Guardando comanda...' : 'Generar Comanda' }}
        </button>

        <button
          @click="mostrarModalCierre = true"
          class="w-full py-2 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          Cerrar Turno de Caja
        </button>
      </div>
    </aside>

    <!-- MODAL CIERRE DE CAJA -->
    <div
      v-if="mostrarModalCierre"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-1">Cierre de Caja</h3>
        <p class="text-xs text-gray-500 mb-4">Ingresa el dinero físico en efectivo para cerrar tu turno.</p>

        <div v-if="cargandoResumen" class="py-8 text-center text-gray-400">
          <div class="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span class="text-xs">Consultando balance de caja...</span>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-200 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-500">Base Inicial:</span>
              <span class="font-bold text-gray-700">${{ formatearDinero(resumenCaja.monto_inicial) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Ventas en Sistema:</span>
              <span class="font-bold text-emerald-600">${{ formatearDinero(resumenCaja.total_ventas) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Comandas Procesadas:</span>
              <span class="font-bold text-gray-700">{{ resumenCaja.cantidad_comandas }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-sm">
              <span class="text-gray-800">Total Esperado:</span>
              <span class="text-orange-600">${{ formatearDinero(resumenCaja.monto_teorico) }}</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Monto Físico Real en Caja
            </label>
            <input
              v-model.number="montoFisicoCierre"
              type="number"
              step="any"
              placeholder="0.00"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div v-if="montoFisicoCierre !== null && montoFisicoCierre !== undefined" class="p-2.5 rounded-lg text-xs" :class="diferenciaCierre >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'">
            <span class="font-bold">{{ diferenciaCierre >= 0 ? 'Sobrante / Cuadrado:' : 'Faltante:' }}</span>
            ${{ formatearDinero(Math.abs(diferenciaCierre)) }}
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Observaciones
            </label>
            <textarea
              v-model="observacionesCierre"
              rows="2"
              placeholder="Notas del cierre..."
              class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              @click="mostrarModalCierre = false"
              type="button"
              class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarCierreCaja"
              :disabled="cerrandoCaja"
              type="button"
              class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
            >
              <span v-if="cerrandoCaja">Cerrando...</span>
              <span v-else>Confirmar Cierre</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Producto, ItemCarrito } from '~/types/gardel'

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { usuario, initAuth } = useAuth()
const { sedeActual, initSede } = useSede()

const catalogo = ref<Producto[]>([])
const cargandoProductos = ref(false)
const filtroBusqueda = ref('')
const categoriaSeleccionada = ref('TODOS')

const itemsCarrito = ref<ItemCarrito[]>([])
const clienteNombre = ref('')
const clienteTelefono = ref('')
const pedidoComentario = ref('')
const guardandoComanda = ref(false)

// Modal Cierre
const mostrarModalCierre = ref(false)
const cargandoResumen = ref(false)
const cerrandoCaja = ref(false)
const montoFisicoCierre = ref<number | null>(null)
const observacionesCierre = ref('')
const resumenCaja = ref({
  monto_inicial: 0,
  total_ventas: 0,
  monto_teorico: 0,
  cantidad_comandas: 0
})

onMounted(async () => {
  initAuth()
  initSede()
  await cargarProductos()
})

const formatearDinero = (val: number | string | undefined) => {
  if (val === undefined || val === null) return '0'
  return parseFloat(String(val)).toLocaleString('es-CO')
}

const categorias = computed(() => {
  const set = new Set<string>()
  catalogo.value.forEach(p => {
    if (p.categoria) set.add(p.categoria)
  })
  return Array.from(set)
})

const productosFiltrados = computed(() => {
  return catalogo.value.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(filtroBusqueda.value.toLowerCase().trim())
    const coincideCat = categoriaSeleccionada.value === 'TODOS' || p.categoria === categoriaSeleccionada.value
    return coincideTexto && coincideCat
  })
})

const totalGeneral = computed(() => {
  return itemsCarrito.value.reduce((acc, item) => acc + item.subtotal, 0)
})

const diferenciaCierre = computed(() => {
  const fisico = montoFisicoCierre.value || 0
  return fisico - resumenCaja.value.monto_teorico
})

const cargarProductos = async () => {
  cargandoProductos.value = true
  const sedeId = sedeActual.value?.id || (usuario.value as any)?.sede_id || 1

  try {
    const res: any = await $fetch(`${apiUrl}/ProductoController.php?action=listar&sede_id=${sedeId}`)
    if (res && res.status && Array.isArray(res.data)) {
      catalogo.value = res.data
    } else {
      // Catálogo de respaldo para pruebas si la BD no retorna datos
      catalogo.value = [
        { id: 1, nombre: 'Pizza Jamón y Queso Mediana', precio: 22000, categoria: 'Pizzas' },
        { id: 2, nombre: 'Pizza Carnes Especial', precio: 28000, categoria: 'Pizzas' },
        { id: 3, nombre: 'Gaseosa Coca-Cola 400ml', precio: 3500, categoria: 'Bebidas' },
        { id: 4, nombre: 'Gaseosa Postobón Manzana', precio: 3000, categoria: 'Bebidas' },
        { id: 5, nombre: 'Limonada Natural', precio: 5000, categoria: 'Bebidas' },
        { id: 6, nombre: 'Porción Papas a la Francesa', precio: 7000, categoria: 'Entradas' }
      ]
    }
  } catch (err) {
    console.warn('Error cargando productos, aplicando fallback:', err)
    catalogo.value = [
      { id: 1, nombre: 'Pizza Jamón y Queso Mediana', precio: 22000, categoria: 'Pizzas' },
      { id: 2, nombre: 'Pizza Carnes Especial', precio: 28000, categoria: 'Pizzas' },
      { id: 3, nombre: 'Gaseosa Coca-Cola 400ml', precio: 3500, categoria: 'Bebidas' },
      { id: 4, nombre: 'Gaseosa Postobón Manzana', precio: 3000, categoria: 'Bebidas' },
      { id: 5, nombre: 'Limonada Natural', precio: 5000, categoria: 'Bebidas' },
      { id: 6, nombre: 'Porción Papas a la Francesa', precio: 7000, categoria: 'Entradas' }
    ]
  } finally {
    cargandoProductos.value = false
  }
}

const agregarAlCarrito = (producto: Producto) => {
  const prodId = Number(producto.id)
  const index = itemsCarrito.value.findIndex(item => Number(item.id) === prodId)

  if (index !== -1) {
    itemsCarrito.value[index].cantidad += 1
    itemsCarrito.value[index].subtotal = itemsCarrito.value[index].cantidad * itemsCarrito.value[index].precio
  } else {
    const precioNum = parseFloat(String(producto.precio))
    itemsCarrito.value.push({
      id: prodId,
      nombre: producto.nombre,
      precio: precioNum,
      cantidad: 1,
      subtotal: precioNum
    })
  }
}

const cambiarCantidad = (id: number | string, cambio: number) => {
  const index = itemsCarrito.value.findIndex(item => Number(item.id) === Number(id))
  if (index !== -1) {
    itemsCarrito.value[index].cantidad += cambio
    if (itemsCarrito.value[index].cantidad <= 0) {
      itemsCarrito.value.splice(index, 1)
    } else {
      itemsCarrito.value[index].subtotal = itemsCarrito.value[index].cantidad * itemsCarrito.value[index].precio
    }
  }
}

const eliminarDelCarrito = (id: number | string) => {
  itemsCarrito.value = itemsCarrito.value.filter(item => Number(item.id) !== Number(id))
}

const vaciarCarrito = () => {
  if (confirm('¿Vaciar los productos del pedido actual?')) {
    itemsCarrito.value = []
  }
}

const generarComanda = async () => {
  if (itemsCarrito.value.length === 0) {
    alert('Agrega al menos un producto para generar la comanda.')
    return
  }

  const u = (usuario.value as any) || {}
  const cajaActivaId = u.caja_activa_id || (import.meta.client ? localStorage.getItem('caja_activa_id') : 1) || 1
  const sedeId = sedeActual.value?.id || u.sede_id || 1

  guardandoComanda.value = true

  const payload = {
    datos_comanda: {
      sede_id: sedeId,
      usuario_id: u.id || 1,
      cierre_caja_id: cajaActivaId,
      estado: 'DESPACHADA',
      cliente_nombre: clienteNombre.value.trim() || 'Consumidor Final',
      cliente_telefono: clienteTelefono.value.trim() || null,
      cliente_direccion: null,
      comentario: pedidoComentario.value.trim() || null,
      total: totalGeneral.value
    },
    items_comanda: itemsCarrito.value.map(item => ({
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      subtotal: item.subtotal,
      comentario: null
    }))
  }

  try {
    const res: any = await $fetch(`${apiUrl}/ComandaController.php`, {
      method: 'POST',
      body: payload
    })

    if (res && res.status) {
      alert(`¡Comanda #${res.numero_comanda || ''} guardada exitosamente!`)
      itemsCarrito.value = []
      clienteNombre.value = ''
      clienteTelefono.value = ''
      pedidoComentario.value = ''
    } else {
      alert(res?.message || 'Error al guardar la comanda.')
    }
  } catch (err: any) {
    console.error('Error guardando comanda:', err)
    alert(err?.message || 'Error al procesar la comanda con el servidor.')
  } finally {
    guardandoComanda.value = false
  }
}

// Cierre de caja
watch(mostrarModalCierre, async (abierto) => {
  if (abierto) {
    cargandoResumen.value = true
    const u = (usuario.value as any) || {}
    const cajaActivaId = u.caja_activa_id || (import.meta.client ? localStorage.getItem('caja_activa_id') : 1) || 1

    try {
      const res: any = await $fetch(`${apiUrl}/CajaController.php?action=obtener_resumen_cierre&cierre_id=${cajaActivaId}`)
      if (res && res.status) {
        resumenCaja.value = {
          monto_inicial: parseFloat(res.monto_inicial || 0),
          total_ventas: parseFloat(res.total_ventas || 0),
          monto_teorico: parseFloat(res.monto_teorico || 0),
          cantidad_comandas: parseInt(res.cantidad_comandas || 0)
        }
      }
    } catch (e) {
      console.warn('No se pudo obtener resumen de caja:', e)
    } finally {
      cargandoResumen.value = false
    }
  }
})

const ejecutarCierreCaja = async () => {
  if (montoFisicoCierre.value === null || isNaN(montoFisicoCierre.value)) {
    alert('Por favor ingresa el monto físico real contado.')
    return
  }

  const u = (usuario.value as any) || {}
  const cajaActivaId = u.caja_activa_id || (import.meta.client ? localStorage.getItem('caja_activa_id') : 1) || 1

  cerrandoCaja.value = true

  try {
    const res: any = await $fetch(`${apiUrl}/CajaController.php`, {
      method: 'POST',
      body: {
        action: 'cerrar_caja',
        cierre_id: cajaActivaId,
        monto_final: montoFisicoCierre.value,
        cantidad_comandas_fisicas: resumenCaja.value.cantidad_comandas,
        observaciones: observacionesCierre.value.trim() || 'Cierre de turno normal'
      }
    })

    if (res && res.status === true) {
      alert('¡Caja cerrada correctamente!')
      mostrarModalCierre.value = false
      if (import.meta.client) {
        localStorage.removeItem('caja_activa_id')
      }
      navigateTo('/sedes')
    } else {
      alert(res?.message || 'Error al cerrar caja.')
    }
  } catch (err: any) {
    alert(err?.message || 'Error cerrando caja en el servidor.')
  } finally {
    cerrandoCaja.value = false
  }
}
</script>

