import api from './api'

export async function getPendingSellers() {
  const { data } = await api.get('/admin/pending-sellers')
  return data
}
export async function approveSeller(id) {
  const { data } = await api.post(`/admin/approve-seller/${id}`)
  return data
}
export async function getUsers() {
  const { data } = await api.get('/admin/users')
  return data
}
export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`)
  return data
}
export async function addDeliveryPartner(p) {
  const { data } = await api.post('/admin/delivery-partners', p)
  return data
}

export async function getAnalytics() {
  const { data } = await api.get('/admin/analytics')
  return data
}

export async function getOrders() {
  const { data } = await api.get('/admin/orders')
  return data
}

export async function getPayouts() {
  const { data } = await api.get('/admin/payouts')
  return data
}

export async function settlePayout(sellerId) {
  const { data } = await api.post(`/admin/payouts/${sellerId}/settle`)
  return data
}

export async function assignOrder(orderId, deliveryPartnerId) {
  const { data } = await api.put(`/admin/orders/${orderId}/assign`, { deliveryPartnerId })
  return data
}
