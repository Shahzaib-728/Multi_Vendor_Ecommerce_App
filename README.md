# WTPROJ

## Client data fetching (TanStack Query v4)

TanStack Query is configured in [main.jsx](file:///c:/Users/lenovo/Desktop/WT/WTPROJ/client/src/main.jsx) and wraps the app with `QueryClientProvider`.

Default query behavior:
- `staleTime`: 5 minutes
- `refetchOnWindowFocus`: enabled
- `retry`: 3 with exponential backoff

### Query keys

Central keys live in [useDashboardData.js](file:///c:/Users/lenovo/Desktop/WT/WTPROJ/client/src/hooks/useDashboardData.js) under `QUERY_KEYS`:
- `['auth', 'me']`
- `['products', 'all', 'list']`
- `['products', 'seller', 'list']`

### Usage

`useDashboardData` fetches current-user data (when authenticated) and products in parallel:

```js
import { useDashboardData } from '../hooks/useDashboardData'

const { products, productsQuery } = useDashboardData({ productsScope: 'all' })

if (productsQuery.isLoading) return null
```

## Commands

From `client/`:
- `npm run dev`
- `npm test`
- `npm run build`

