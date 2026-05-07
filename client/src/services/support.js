import api from './api'

export async function getTickets() {
  const { data } = await api.get('/support/tickets')
  return data
}

export async function getTicketById(id) {
  const { data } = await api.get(`/support/tickets/${id}`)
  return data
}
export async function createTicket(data) {
  // data = { subject, category, message }
  const { data: res } = await api.post('/support/tickets', data)
  return res
}

export async function getActiveTicket() {
  const { data } = await api.get('/support/active')
  return data
}

export async function replyTicket(id, message) {
  const { data } = await api.post(`/support/tickets/${id}/reply`, { message })
  return data
}
