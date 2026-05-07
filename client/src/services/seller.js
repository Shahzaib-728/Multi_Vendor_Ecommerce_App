import api from './api'

export async function addProduct(p) {
  const { data } = await api.post('/seller/products', p)
  return data
}
export async function getSellerProducts() {
  const { data } = await api.get('/seller/products')
  return data
}
export async function deleteProduct(id) {
  const { data } = await api.delete(`/seller/products/${id}`)
  return data
}
export async function updateProduct(id, p) {
  const { data } = await api.put(`/seller/products/${id}`, p)
  return data
}
export async function getSellerOrders() {
  const { data } = await api.get('/seller/orders')
  return data
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.put(`/orders/${id}`, { status })
  return data
}

export async function requestProfileUpdate(profileData) {
  const { data } = await api.post('/seller/profile/request-update', profileData)
  return data
}

export async function getSellerStats() {
  const { data } = await api.get('/seller/stats')
  return data
}

