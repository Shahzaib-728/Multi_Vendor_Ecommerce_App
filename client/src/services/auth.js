import api from './api'

export async function register(data) {
  const res = await api.post('/auth/register', data)
  return res.data
}

export async function login(data) {
  const res = await api.post('/auth/login', data)
  return res.data
}
export async function updateProfile(data) {
  const res = await api.put('/auth/profile', data)
  return res.data
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data
}
