export interface UsuarioGardel {
  id?: number | string
  identificacion: string
  nombre?: string
  rol?: string
  sede_id?: number | string
  sede_nombre?: string
}

export interface Sede {
  id: number | string
  nombre: string
  estado?: string
}

export interface Producto {
  id: number | string
  nombre: string
  precio: number | string
  categoria?: string
  stock?: number
}

export interface ItemCarrito {
  id: number | string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

export interface ComandaDetalle {
  id: number | string
  numero_comanda?: string | number
  cliente_nombre?: string
  cliente_telefono?: string
  total: number | string
  estado: string
  metodo_pago?: string
  created_at?: string
  detalles?: Array<{
    producto_nombre: string
    cantidad: number
    precio_unitario: number
    subtotal: number
  }>
}

export interface TrasladoItem {
  id: number | string
  numero_traslado?: string
  origen_sede_id?: number | string
  origen_nombre?: string
  destino_sede_id?: number | string
  destino_nombre?: string
  estado: string
  created_at?: string
  items?: any[]
}

