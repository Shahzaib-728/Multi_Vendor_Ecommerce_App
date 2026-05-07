import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

const DASHBOARD_ROUTES = {
    Seller: '/seller/revenue',
    Delivery: '/delivery/assigned',
    Support: '/support/tickets',
    Admin: '/admin'
}

export default function CustomerOnlyRoute() {
    const user = useAuthStore(s => s.user)

    if (user && user.role !== 'Customer') {
        const dest = DASHBOARD_ROUTES[user.role] || '/'
        return <Navigate to={dest} replace />
    }

    return <Outlet />
}
