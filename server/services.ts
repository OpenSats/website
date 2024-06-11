import KeycloakAdminClient from '@keycloak/keycloak-admin-client'

export const keycloak = new KeycloakAdminClient({
  baseUrl: 'http://localhost:8080',
  realmName: 'monerofund',
})
