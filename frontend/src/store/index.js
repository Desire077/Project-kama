import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
  }
})

// Export named + default for compatibilité avec différents imports
export { store }
export default store
