import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CustomerOrders from './pages/dashboards/customer/Orders'
import CustomerOrderDetails from './pages/dashboards/customer/OrderDetails'
import CustomerProfile from './pages/dashboards/customer/Profile'
import CustomerRefundDetails from './pages/dashboards/customer/RefundDetails'
import SellerAddProduct from './pages/dashboards/seller/AddProduct'
import SellerManageProducts from './pages/dashboards/seller/ManageProducts'
import SellerOrders from './pages/dashboards/seller/Orders'
import SellerRevenue from './pages/dashboards/seller/Revenue'
import SellerProfile from './pages/dashboards/seller/Profile'
import SellerWallet from './pages/dashboards/seller/Wallet'

import SupportTickets from './pages/dashboards/support/Tickets'
import SupportTicketView from './pages/dashboards/support/TicketView'
import AdminSellers from './pages/dashboards/admin/Sellers'
import AdminUsers from './pages/dashboards/admin/Users'

import AdminPayouts from './pages/dashboards/admin/Payouts'
import AdminAnalytics from './pages/dashboards/admin/Analytics'
import AdminSellerProfile from './pages/dashboards/admin/SellerProfile'
import AdminDeliveryPartners from './pages/dashboards/admin/DeliveryPartners'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import { useAuthStore } from './store/auth'
import Toast from './components/Toast'

import CustomerOnlyRoute from './components/CustomerOnlyRoute'
import PublicLayout from './components/PublicLayout'

import DeliveryAssigned from './pages/dashboards/delivery/AssignedOrders'
import DeliveryRevenue from './pages/dashboards/delivery/Revenue'
import DeliveryProfile from './pages/dashboards/delivery/Profile'
import DeliveryWallet from './pages/dashboards/delivery/Wallet'
import AdminFinance from './pages/dashboards/admin/Finance'
import Refunds from './pages/dashboards/shared/Refunds'

export default function App() {
  const user = useAuthStore(s => s.user)
  const checkAuth = useAuthStore(s => s.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <>
      <Toast />
      <Routes>
        {/* Public Routes - Only for Guests/Customers */}
        <Route element={<CustomerOnlyRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track-order" element={<OrderTracking />} />

            {/* Authenticated Customer Routes */}
            <Route element={<ProtectedRoute roles={["Customer"]} />}>
              <Route path="/orders" element={<CustomerOrders />} />
              <Route path="/orders/:id" element={<CustomerOrderDetails />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/refunds/:id" element={<CustomerRefundDetails />} />
              <Route path="/profile" element={<CustomerProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Protected Dashboard Routes (No Navbar, Full Sidebar) */}


        <Route element={<ProtectedRoute roles={["Seller"]} />}>
          <Route path="/seller" element={<DashboardLayout role="Seller" />}>
            <Route index element={<SellerRevenue />} />
            <Route path="add-product" element={<SellerAddProduct />} />
            <Route path="products" element={<SellerManageProducts />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="revenue" element={<SellerRevenue />} />
            <Route path="wallet" element={<SellerWallet />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="profile" element={<SellerProfile />} />
          </Route>
        </Route>



        <Route element={<ProtectedRoute roles={["Delivery"]} />}>
          <Route path="/delivery" element={<DashboardLayout role="Delivery" />}>
            <Route index element={<DeliveryAssigned />} />
            <Route path="assigned" element={<DeliveryAssigned />} />
            <Route path="revenue" element={<DeliveryRevenue />} />
            <Route path="wallet" element={<DeliveryWallet />} />
            <Route path="profile" element={<DeliveryProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["Support"]} />}>
          <Route path="/support" element={<DashboardLayout role="Support" />}>
            <Route index element={<SupportTickets />} />
            <Route path="tickets" element={<SupportTickets />} />
            <Route path="tickets/:id" element={<SupportTicketView />} />
            <Route path="refunds" element={<Refunds />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["Admin"]} />}>
          <Route path="/admin" element={<DashboardLayout role="Admin" />}>
            <Route index element={<AdminAnalytics />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="analytics" element={<AdminAnalytics />} />

            <Route path="payouts" element={<AdminPayouts />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="seller/:id" element={<AdminSellerProfile />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
          </Route>
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
