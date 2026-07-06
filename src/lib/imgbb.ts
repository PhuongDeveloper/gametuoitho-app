// ImgBB API Helper
// Uploads an image (as base64 or File) to ImgBB and returns the URL

export async function uploadToImgBB(imageData: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is not configured');
  }

  // Strip data URI prefix if present
  const base64Image = imageData.includes(',')
    ? imageData.split(',')[1]
    : imageData;

  const formData = new URLSearchParams();
  formData.append('key', apiKey);
  formData.append('image', base64Image);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ImgBB upload failed: ${error}`);
  }

  const data = await response.json();
  return data.data.display_url;
}
