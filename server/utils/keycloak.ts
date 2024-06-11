import { keycloak } from '../services'

export const authenticateKeycloakClient = () =>
  keycloak.auth({
    clientId: 'app',
    clientSecret: '7JryN6EVIYtCwN4iHheacjp986Rfy5FJ',
    grantType: 'client_credentials',
  })
