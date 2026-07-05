import { passkeyClient } from '@better-auth/passkey/client';
import {
  emailOTPClient,
  inferAdditionalFields,
  usernameClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from './auth';

export const authClient = createAuthClient({
  basePath: '/elysia/auth/api',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    emailOTPClient(),
    usernameClient(),
    passkeyClient(),
  ],
});
