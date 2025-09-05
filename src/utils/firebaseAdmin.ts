// utils/firebaseAdmin.ts
import * as admin from "firebase-admin";

let app: admin.app.App;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(
      require("../config/push-notification-key.json")
    ),
  });
} else {
  app = admin.app();
}

export const messaging = app.messaging();
