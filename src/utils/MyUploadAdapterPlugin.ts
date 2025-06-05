// utils/MyUploadAdapterPlugin.ts
export class MyUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then((file: File) => {
      // Replace this with your actual image upload logic (e.g., to Cloudinary, ImageKit)
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
          .then((res) => res.json())
          .then((res) => {
            resolve({
              default: res.url, // The uploaded image URL
            });
          })
          .catch(reject);
      });
    });
  }

  abort() {
    // Handle abort if necessary
  }
}

export function MyUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new MyUploadAdapter(loader);
  };
}
