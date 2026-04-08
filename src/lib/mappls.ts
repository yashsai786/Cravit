import { toast } from "sonner";

const CLIENT_ID = "96dHZVzsAuvCu3IHO23IWU-2PWwi_u9AUHQsXrht7J7CfUcRnBYS0CTMx7B4tKN7WK70ouqko7owcKm-1kfpXA==";
const CLIENT_SECRET = "lrFxI-iSEg_EQYp6CWINxFP_7mGQty8efazvNgxGp36tQAAmvfh9pInkSCurSW-S4_a1GJVXIiapqoAb0mZDvtMpBe4wJzZ0";

let cachedToken: string | null = null;
let scriptLoadingPromise: Promise<string> | null = null;

export const loadMapplsSDK = (): Promise<string> => {
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = (async () => {
    try {
      // Step 1: Force Generate Access Token (OAuth) via Proxy
      const authResponse = await fetch("/mappls-auth/api/security/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      if (!authResponse.ok) throw new Error("Auth Failure");
      const authData = await authResponse.json();
      const token = authData.access_token;
      cachedToken = token;

      // Step 2: Dynamically Inject Scripts using the Token
      await new Promise<void>((resolve, reject) => {
        const sdkScript = document.createElement("script");
        sdkScript.src = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk?v=3.0&layer=vector`;
        sdkScript.onload = () => {
          const pluginScript = document.createElement("script");
          pluginScript.src = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk_plugins?v=3.0&libraries=direction`;
          pluginScript.onload = () => resolve();
          pluginScript.onerror = () => reject(new Error("Plugin Load Error"));
          document.head.appendChild(pluginScript);
        };
        sdkScript.onerror = () => reject(new Error("SDK Load Error"));
        document.head.appendChild(sdkScript);
      });

      return token;
    } catch (err) {
      console.error("MAPPLS_INIT_FAILURE", err);
      toast.error("Map Protocol Signal Lost.");
      scriptLoadingPromise = null;
      throw err;
    }
  })();

  return scriptLoadingPromise;
};
