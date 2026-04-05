/**
 * Utility for uploading files to ImageKit using the company's auth server.
 */
export async function uploadToImageKit(file: File, folder: string = "/general"): Promise<string> {
    if (!file) return "";
    
    // The auth API URL provided by the user
    const API_URL = "https://transgression-vigilance.vercel.app";
    
    try {
      const authResponse = await fetch(`${API_URL}/api/auth`);
      if (!authResponse.ok) {
        throw new Error(`Failed to get auth tokens: ${authResponse.status} ${authResponse.statusText}`);
      }
      
      const authData = await authResponse.json();
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${folder.replace("/", "")}_${Date.now()}_${file.name}`);
      formData.append("publicKey", "public_KoLQpUZM3TZfPrc1If4RUVRgHAw=");
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire);
      formData.append("token", authData.token);
      formData.append("folder", folder);
      
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.url) {
        throw new Error("Upload failed: " + (result.error?.message || "No URL returned"));
      }
      
      return result.url;
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
}
