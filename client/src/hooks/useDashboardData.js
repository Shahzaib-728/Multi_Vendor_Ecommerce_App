import { useQueries } from '@tanstack/react-query'
import { getMe } from '../services/auth'
import { getAllProducts } from '../services/products'
import { getSellerProducts } from '../services/seller'
import { useAuthStore } from '../store/auth'

export const QUERY_KEYS = {
  auth: {
    me: () => ['auth', 'me']
  },
  products: {
    all: () => ['products', 'all', 'list'],
    seller: () => ['products', 'seller', 'list']
  }
}

/**
 * @typedef {'Customer'|'Seller'|'Delivery'|'Support'|'Admin'} UserRole
 * @typedef {{ _id?: string, id?: string, name: string, email: string, role: UserRole }} AuthMeResponse
 * @typedef {{ _id?: string, id?: string, name?: string, description?: string, image?: string, price?: number, stock?: number, category?: string }} Product
 */

/**
 * Fetches the current user's role data and product data in parallel using TanStack Query.
 *
 * Query Keys:
 * - ['auth', 'me']
 * - ['products', 'all', 'list']
 * - ['products', 'seller', 'list']
 *
 * @param {{ productsScope?: 'seller'|'all' }} [options]
 * @returns {{
 *   user: AuthMeResponse | undefined,
 *   products: Product[] | undefined,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   isError: boolean,
 *   error: unknown,
 *   userQuery: import('@tanstack/react-query').UseQueryResult<AuthMeResponse, unknown>,
 *   productsQuery: import('@tanstack/react-query').UseQueryResult<Product[], unknown>,
 *   refetch: () => Promise<[unknown, unknown]>
 * }}
 */
export function useDashboardData(options = {}) {
  const { productsScope = 'seller' } = options
  const token = useAuthStore(s => s.token)

  const productsQueryKey = productsScope === 'all' ? QUERY_KEYS.products.all() : QUERY_KEYS.products.seller()
  const productsQueryFn = productsScope === 'all' ? getAllProducts : getSellerProducts
  const productsEnabled = productsScope === 'all' ? true : Boolean(token)

  const results = useQueries({
    queries: [
      {
        queryKey: QUERY_KEYS.auth.me(),
        queryFn: getMe,
        enabled: Boolean(token)
      },
      {
        queryKey: productsQueryKey,
        queryFn: productsQueryFn,
        enabled: productsEnabled
      }
    ]
  })

  const userQuery = results[0]
  const productsQuery = results[1]

  const isLoading = Boolean(userQuery.isLoading || productsQuery.isLoading)
  const isFetching = Boolean(userQuery.isFetching || productsQuery.isFetching)
  const isError = Boolean(userQuery.isError || productsQuery.isError)
  const error = userQuery.error || productsQuery.error

  return {
    user: userQuery.data,
    products: productsQuery.data,
    isLoading,
    isFetching,
    isError,
    error,
    userQuery,
    productsQuery,
    refetch: () => Promise.all([userQuery.refetch(), productsQuery.refetch()])
  }
}
