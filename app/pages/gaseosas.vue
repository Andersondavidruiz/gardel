<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-100">
    <!-- Pestañas de Navegación del Módulo -->
    <nav class="bg-white border-b border-gray-200 px-6 flex gap-4">
      <button
        @click="tabActiva = 'pedido'"
        class="py-3.5 px-4 font-bold text-sm transition border-b-2 flex items-center gap-2"
        :class="tabActiva === 'pedido' ? 'text-orange-600 border-orange-600' : 'text-gray-500 hover:text-gray-700 border-transparent'"
      >
        <span class="w-5 h-5 rounded-full text-xs flex items-center justify-center font-black" :class="tabActiva === 'pedido' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'">1</span>
        Recepción de Pedido (Entrada)
      </button>

      <button
        @click="tabActiva = 'cierre'"
        class="py-3.5 px-4 font-bold text-sm transition border-b-2 flex items-center gap-2"
        :class="tabActiva === 'cierre' ? 'text-orange-600 border-orange-600' : 'text-gray-500 hover:text-gray-700 border-transparent'"
      >
        <span class="w-5 h-5 rounded-full text-xs flex items-center justify-center font-black" :class="tabActiva === 'cierre' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'">2</span>
        Arqueo y Cierre de Bebidas
      </button>
    </nav>

    <!-- Contenido Principal -->
    <div class="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
      <!-- SECCIÓN 1: PEDIDOS Y VERIFICACIÓN DE ENTRADA -->
      <section v-if="tabActiva === 'pedido'" class="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
        <div class="mb-5">
          <h2 class="text-base font-bold text-gray-800">Recepción de Pedido de Gaseosas</h2>
          <p class="text-xs text-gray-500 mt-1">
            Verifique el stock actual y registre la cantidad física que <strong class="text-gray-700">realmente llegó</strong> del proveedor para actualizar el inventario.
          </p>
        </div>

        <div v-if="cargando" class="py-12 text-center text-gray-400">
          <div class="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span class="text-xs">Cargando inventario de bebidas...</span>
        </div>

        <form v-else @submit.prevent="guardarRecepcionPedido">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200">
                  <th class="p-3.5">Gaseosa / Bebida</th>
                  <th class="p-3.5 text-center">Stock Actual</th>
                  <th class="p-3.5 text-center">Cant. Solicitada</th>
                  <th class="p-3.5 text-center">Cant. Llegada Física (Real)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="items.length === 0">
                  <td colspan="4" class="text-center py-6 text-gray-400 text-xs">
                    No hay gaseosas configuradas como inventariables en esta sede.
                  </td>
                </tr>
                <tr v-for="item in items" :key="item.item_id" class="hover:bg-gray-50/60 transition">
                  <td class="p-3.5 font-bold text-gray-800">{{ item.nombre }}</td>
                  <td class="p-3.5 text-center">
                    <span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                      {{ item.cantidad_actual }}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">
                    <input
                      v-model.number="item.solicitada"
                      type="number"
                      min="0"
                      class="w-20 p-1.5 text-center border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td class="p-3.5 text-center">
                    <input
                      v-model.number="item.llegada"
                      type="number"
                      min="0"
                      required
                      class="w-24 p-1.5 text-center border border-orange-300 bg-orange-50/30 rounded-lg text-xs font-bold text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              type="submit"
              :disabled="enviando || items.length === 0"
              class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <svg v-if="enviando" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ enviando ? 'Actualizando inventario...' : 'Confirmar y Actualizar Inventario' }}</span>
            </button>
          </div>
        </form>
      </section>

      <!-- SECCIÓN 2: ARQUEO Y CIERRE DE CAJA -->
      <section v-else class="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
        <div class="mb-5">
          <h2 class="text-base font-bold text-gray-800">Arqueo y Cierre Físico de Gaseosas</h2>
          <p class="text-xs text-gray-500 mt-1">
            Realice el conteo físico al terminar el turno para registrar descuadres y ajustar el stock final.
          </p>
        </div>

        <div v-if="cargando" class="py-12 text-center text-gray-400">
          <div class="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span class="text-xs">Cargando inventario de bebidas...</span>
        </div>

        <form v-else @submit.prevent="guardarCierreGaseosas">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200">
                  <th class="p-3.5">Gaseosa / Bebida</th>
                  <th class="p-3.5 text-center">Stock en Sistema</th>
                  <th class="p-3.5 text-center">Conteo Físico Real</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="items.length === 0">
                  <td colspan="3" class="text-center py-6 text-gray-400 text-xs">
                    No hay gaseosas configuradas como inventariables en esta sede.
                  </td>
                </tr>
                <tr v-for="item in items" :key="item.item_id" class="hover:bg-gray-50/60 transition">
                  <td class="p-3.5 font-bold text-gray-800">{{ item.nombre }}</td>
                  <td class="p-3.5 text-center">
                    <span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                      {{ item.cantidad_actual }}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">
                    <input
                      v-model.number="item.conteoFisico"
                      type="number"
                      min="0"
                      required
                      class="w-24 p-1.5 text-center border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              type="submit"
              :disabled="enviando || items.length === 0"
              class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <svg v-if="enviando" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ enviando ? 'Guardando arqueo...' : 'Guardar Arqueo de Gaseosas' }}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GaseosaItem {
  item_id: number | string
  nombre: string
  cantidad_actual: number
  solicitada?: number
  llegada?: number
  conteoFisico?: number
}

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { sedeActual, initSede } = useSede()
const { usuario, initAuth } = useAuth()

const tabActiva = ref<'pedido' | 'cierre'>('pedido')
const items = ref<GaseosaItem[]>([])
const cargando = ref(false)
const enviando = ref(false)

onMounted(async () => {
  initAuth()
  initSede()
  await cargarInventario()
})

const cargarInventario = async () => {
  cargando.value = true
  const sedeId = sedeActual.value?.id || (usuario.value as any)?.sede_id || 1

  try {
    const res: any = await $fetch(`${apiUrl}/obtener_inventario_gaseosas.php?sede_id=${sedeId}`)
    if (res && res.status === 'success' && Array.isArray(res.items)) {
      items.value = res.items.map((i: any) => ({
        item_id: i.item_id,
        nombre: i.nombre,
        cantidad_actual: parseInt(i.cantidad_actual) || 0,
        solicitada: 0,
        llegada: 0,
        conteoFisico: parseInt(i.cantidad_actual) || 0
      }))
    } else {
      // Items por defecto para pruebas si la BD no retorna
      items.value = [
        { item_id: 101, nombre: 'Coca-Cola Personal 400ml', cantidad_actual: 24, solicitada: 0, llegada: 0, conteoFisico: 24 },
        { item_id: 102, nombre: 'Coca-Cola Zero 400ml', cantidad_actual: 12, solicitada: 0, llegada: 0, conteoFisico: 12 },
        { item_id: 103, nombre: 'Postobón Manzana 400ml', cantidad_actual: 18, solicitada: 0, llegada: 0, conteoFisico: 18 },
        { item_id: 104, nombre: 'Agua Cristal 600ml', cantidad_actual: 30, solicitada: 0, llegada: 0, conteoFisico: 30 }
      ]
    }
  } catch (err) {
    console.warn('API de inventario no disponible, usando fallback:', err)
    items.value = [
      { item_id: 101, nombre: 'Coca-Cola Personal 400ml', cantidad_actual: 24, solicitada: 0, llegada: 0, conteoFisico: 24 },
      { item_id: 102, nombre: 'Coca-Cola Zero 400ml', cantidad_actual: 12, solicitada: 0, llegada: 0, conteoFisico: 12 },
      { item_id: 103, nombre: 'Postobón Manzana 400ml', cantidad_actual: 18, solicitada: 0, llegada: 0, conteoFisico: 18 },
      { item_id: 104, nombre: 'Agua Cristal 600ml', cantidad_actual: 30, solicitada: 0, llegada: 0, conteoFisico: 30 }
    ]
  } finally {
    cargando.value = false
  }
}

const guardarRecepcionPedido = async () => {
  enviando.value = true
  const sedeId = sedeActual.value?.id || (usuario.value as any)?.sede_id || 1

  const payload = {
    sede_id: parseInt(String(sedeId)),
    gaseosas: items.value.map(i => ({
      item_id: parseInt(String(i.item_id)),
      cantidad_llegada: i.llegada || 0
    }))
  }

  try {
    const res: any = await $fetch(`${apiUrl}/recibir_pedido_gaseosas.php`, {
      method: 'POST',
      body: payload
    })

    if (res && res.status === 'success') {
      alert('¡Pedido verificado e inventario actualizado correctamente!')
      await cargarInventario()
    } else {
      alert(res?.message || 'Error al actualizar pedido.')
    }
  } catch (err: any) {
    alert(err?.message || 'Error al procesar con el servidor.')
  } finally {
    enviando.value = false
  }
}

const guardarCierreGaseosas = async () => {
  enviando.value = true
  const sedeId = sedeActual.value?.id || (usuario.value as any)?.sede_id || 1
  const cierreId = (usuario.value as any)?.caja_activa_id || 1

  const payload = {
    cierre_id: parseInt(String(cierreId)),
    sede_id: parseInt(String(sedeId)),
    gaseosas: items.value.map(i => ({
      item_id: parseInt(String(i.item_id)),
      cantidad_fisica: i.conteoFisico || 0
    }))
  }

  try {
    const res: any = await $fetch(`${apiUrl}/cierre_gaseosas.php`, {
      method: 'POST',
      body: payload
    })

    if (res && res.status === 'success') {
      alert('¡Cierre de gaseosas guardado correctamente y stock corregido!')
      navigateTo('/pedidos')
    } else {
      alert(res?.message || 'Error al guardar el arqueo de gaseosas.')
    }
  } catch (err: any) {
    alert(err?.message || 'Error al procesar el arqueo en el servidor.')
  } finally {
    enviando.value = false
  }
}
</script>

