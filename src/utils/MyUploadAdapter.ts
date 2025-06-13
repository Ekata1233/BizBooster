// utils/MyUploadAdapter.ts

export class MyUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  // Called by CKEditor to upload the file
  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          const data = new FormData();
          data.append('file', file);

          fetch('/api/upload', {
            method: 'POST',
            body: data,
          })
            .then(async (res) => {
              if (!res.ok) {
                return reject('Upload failed');
              }
              const json = await res.json();
              resolve({
                default: json.url, // URL of uploaded image returned by backend
              });
            })
            .catch((err) => reject(err));
        }),
    );
  }

  abort() {
    // Optional: implement abort logic if needed
  }
}
