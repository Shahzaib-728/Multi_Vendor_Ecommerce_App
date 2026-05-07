import api from './api'

export async function mergeCart(items) {
  const { data } = await api.post('/cart/merge', { items })
  return data
}
