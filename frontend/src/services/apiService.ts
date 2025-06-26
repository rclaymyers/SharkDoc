export const ApiService = {
  uploadImageFile: async (
    file: File,
    galleryId: string | null
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    if (galleryId) {
      formData.append("galleryId", galleryId);
    }
    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error uploading image:", errorData);
        return null;
      }
      const data = (await response.json()) as unknown as { imagePath: string };
      if (data.imagePath) {
        return data.imagePath;
      }
      console.error("Response was ok, but didn't include an imagePath");
      return null;
    } catch (e) {
      console.error("Error uploading image:", e);
      return null;
    }
  },
};
