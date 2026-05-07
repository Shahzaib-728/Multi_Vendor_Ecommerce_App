import api from './api'

export async function getAssignedOrders() {
  const { data } = await api.get('/delivery/orders')
  return data
}

export async function updateDeliveryStatus(id, status) {
  const { data } = await api.put(`/delivery/orders/${id}`, { status })
  return data
}

export async function searchOrder(id) {
  const { data } = await api.get(`/delivery/orders/${id}`)
  return data
}

export async function getDeliveryRevenue() {
  const { data } = await api.get('/delivery/revenue')
  return data
}
