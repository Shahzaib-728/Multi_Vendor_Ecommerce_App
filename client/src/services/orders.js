import api from './api'

export async function getOrders() {
  const { data } = await api.get('/orders')
  return data
}

export async function createOrder(data) {
  // data = { items, deliveryPartnerId, address }
  const res = await api.post('/orders', data)
  return res.data
}

export async function cancelOrder(id) {
  const res = await api.post(`/orders/${id}/cancel`)
  return res.data
}

export async function getOrderById(id) {
  const { data } = await api.get(`/orders/${id}`)
  return data
}
