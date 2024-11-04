This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Comandos git
git pull  -Comando para traer los cambios que están en la rama remota a la rama local.
git add -A  -Añadir todo los nuevos cambios realizados en proyecto
git checkout -b feature/numeroHU  -crear rama para trabajar HU, se debe crear estando en rama develop
git checkout -b hotfix/numeroHotfix  -crear rama para trabajar Hotfix, se debe crear estando en rama develop
git commit -m "Comentario de modificaciones realizadas"  -El comando git commit captura una instantánea de los cambios realizados en el proyecto
git push -Sube los cambios confirmados en en el commit de la rama local al la rama remota del repositorio.

# Comandos para correr el servidor
npm run server

# Estructura del encarpetado del proyecto

/Birdwatch-Backend
│
├── /config               # Archivos de configuración (como base de datos, variables de entorno)
│   └── dbConnect.js      # Configuración de la base de datos
│
├── /controllers          # Lógica para manejar las solicitudes
│   └── authController.js # Controlador de autenticación (registro, login, recuperar contraseña)
│
├── /middlewares          # Middleware para validaciones o autenticación
│   └── authMiddleware.js # Middleware para verificar tokens o permisos
│
├── /models               # Modelos para la base de datos
│   └── userModel.js      # Modelo de usuario (usando Mongoose)
│
├── /routes               # Rutas de la API
│   └── authRoutes.js     # Rutas relacionadas con autenticación (registro, login, recuperar contraseña)
│
├── /utils                # Utilidades generales (funciones auxiliares)
│   └── emailService.js   # Servicio para enviar correos de recuperación de contraseña
│
├── /validation           # Validadores de datos (usando, por ejemplo, express-validator)
│   └── registerSchema.js # Validación de datos para registro, login, recuperar contraseña
│
├── .env                  # Variables de entorno (ej: URL base de datos, claves secretas)
├── .gitignore            # Para ignorar archivos como node_modules o .env
├── app.js                # Punto de entrada de la aplicación (inicialización del servidor)
└── package.json          # Dependencias del proyecto, scripts y/o dependencias