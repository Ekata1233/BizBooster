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
                // licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDk5NDU1OTksImp0aSI6ImYxMGRiNTAwLWMwMWYtNDQyNS1iYTYyLWNhZjA0NzQ4MDhjYiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjdhYTU5ODFkIn0.jfrrljzRoIcmEpjTg9ed5FYsg5ipYgo1RBymj4eMsEniUagapuZ3A76FyQpdPuW1qo4aEFZJEqsMQjGN9F7NEQ',
