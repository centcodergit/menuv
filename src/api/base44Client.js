import { createClient } from "@base44/sdk";
import { appParams } from "@/lib/app-params";

const { appId, serverUrl, token, functionsVersion } = appParams;

// Public marketing site: auth is optional (requiresAuth: false).
// Note: modules that run during the first paint use getBase44() from "@/api/getBase44" instead,
// so the SDK stays out of the initial bundle.
export const base44 = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false,
});

export { hasBackend } from "@/api/getBase44";
