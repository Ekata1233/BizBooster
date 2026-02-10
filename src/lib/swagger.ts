import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fetch True API",
      version: "1.0.0",
      description: "API documentation for Fetch True Project",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Server",
      },
       {
        url: "https://api.fetchtrue.com",
        description: "Production Server",
      },
    ],
  },
  apis: ["./src/app/api/**/route.ts"], // 👈 important
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
