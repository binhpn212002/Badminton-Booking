export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (import.meta.client) {
    auth.hydrate()
  }

  if (!auth.isLoggedIn) {
    return navigateTo('/?login=1')
  }

  if (!auth.canAccessDashboard) {
    return navigateTo('/')
  }
})
