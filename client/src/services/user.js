import api from './api'

export async function getDeliveryPartners() {
    const { data } = await api.get('/users/delivery-partners')
    return data
}

export async function getAvailablePartners(params) {
    const { data } = await api.get('/users/available-partners', { params })
    return data
}

export async function getServiceCoverage() {
    const { data } = await api.get('/users/service-coverage')
    return data
}
