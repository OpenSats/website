import { keycloak } from '../services'
import { env } from '../../env.mjs'

export const authenticateKeycloakClient = () =>
  keycloak.auth({
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    grantType: 'client_credentials',
  })
