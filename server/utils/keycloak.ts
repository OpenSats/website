import { JWT } from 'next-auth/jwt'
import axios from 'axios'

import { keycloak } from '../services'
import { env } from '../../env.mjs'

export const authenticateKeycloakClient = () =>
  keycloak.auth({
    clientId: env.KEYCLOAK_CLIENT_ID as string,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET as string,
    grantType: 'client_credentials',
  })
