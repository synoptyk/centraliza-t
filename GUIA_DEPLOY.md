# 🚀 Guía de Puesta en Producción: Centraliza-t (Gratis)

Esta guía te permitirá subir tu aplicación a internet **totalmente gratis** y mantener un flujo de trabajo profesional donde puedes seguir desarrollando en tu Mac y actualizar la web con un solo comando.

## 🛠 Servicios que usaremos (Plan Gratuito)
1. **GitHub**: Para guardar tu código (Repositorio).
2. **Render**: Para el Backend (Servidor Node.js). *Gratis, se "duerme" tras inactividad, despierta en segundos.*
3. **Vercel**: Para el Frontend (React). *Gratis, rapidísimo y profesional.*
4. **MongoDB Atlas**: Base de datos (ya la tienes).
5. **Cloudinary**: Imágenes/Archivos (ya la tienes).

---

## PASO 0: Preparar tu Mac (Solo una vez)

Abre tu terminal en la carpeta del proyecto y ejecuta estos comandos uno por uno:

1. **Inicializar Git y crear `.gitignore` correcto** (Ya lo hice por ti en el código, solo asegúrate de estar en la carpeta).
   ```bash
   cd /Users/mauro/Synoptik_Innovacion/Centraliza-t
   git init
   git add .
   git commit -m "Primera version produccion"
   ```

2. **Crear Repositorio en GitHub**
   - Ve a [github.com/new](https://github.com/new)
   - Nombre: `centraliza-t`
   - **No** marques "Add a README file".
   - Dale a "Create repository".
   - Copia las líneas que dicen "...or push an existing repository from the command line".
   - Pégalas en tu terminal. Se verán algo así:
     ```bash
     git remote add origin https://github.com/TU_USUARIO/centraliza-t.git
     git branch -M main
     git push -u origin main
     ```

---

## PASO 1: Subir el Backend (Render)

1. Crea cuenta en [render.com](https://render.com) (usa tu GitHub).
2. Click en **"New +"** -> **"Web Service"**.
3. Selecciona "Build and deploy from a Git repository" y conecta tu repo `centraliza-t`.
4. Rellena el formulario:
   - **Name**: `centraliza-t-backend`
   - **Region**: Oregon (US West) suele ser rápido.
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server:prod`
   - **Instance Type**: **Free** (abajo del todo).
5. **Variables de Entorno** (Click en "Environment"):
   Agrega las claves de tu archivo `.env` local. ¡IMPORTANTE!
   - `MONGO_URI`: (Tu conexión a Mongo Atlas)
   - `JWT_SECRET`: (Crea una contraseña larga y segura)
   - `CLOUDINARY_CLOUD_NAME`: (Tu cloud name)
   - `CLOUDINARY_API_KEY`: (Tu api key)
   - `CLOUDINARY_API_SECRET`: (Tu api secret)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (Déjalo pendiente por ahora, luego pondremos la URL de Vercel)
6. Click **"Create Web Service"**.
   - Espera a que termine. Te dará una URL tipo: `https://centraliza-t-backend.onrender.com`. **Cópiala**.

---

## PASO 2: Subir el Frontend (Vercel)

1. Crea cuenta en [vercel.com](https://vercel.com) (usa tu GitHub).
2. Click **"Add New..."** -> **"Project"**.
3. Importa tu repo `centraliza-t`.
4. En **Framework Preset** debería decir "Create React App".
5. **Environment Variables**:
   - Nombre: `REACT_APP_API_URL`
   - Valor: `https://centraliza-t-backend.onrender.com` (La URL que copiaste de Render, **sin** la barra `/` al final).
6. Click **"Deploy"**.
   - Espera unos segundos. ¡Felicidades! Te dará tu URL final, por ejemplo: `https://centraliza-t.vercel.app`.

---

## PASO 3: Conectar Backend con Frontend

1. Vuelve a **Render** -> Dashboard -> centraliza-t-backend -> **Environment**.
2. Agrega la variable que faltaba:
   - `FRONTEND_URL`: `https://centraliza-t.vercel.app` (La URL de tu frontend en Vercel).
3. Guarda los cambios. Render reiniciará el servidor automáticamente.

---

## 🎯 CÓMO TRABAJAR DÍA A DÍA (Flujo 1-Clic)

¡Ya está todo configurado! Así es como trabajarás a partir de ahora:

### 1. Trabajar en tu Mac (Local)
Sigue usando tus comandos de siempre para desarrollar:
```bash
npm run dev
```
La app funcionará en `localhost:3000` conectada a tu backend local `localhost:5005`.

### 2. Subir Cambios a Producción
Cuando hayas hecho mejoras y quieras publicarlas, solo ejecuta **este único comando** en tu terminal:

```bash
npm run deploy
```

O si quieres poner un mensaje específico sobre qué cambiaste:

```bash
git add .
git commit -m "Agregue tal mejora"
git push
```

**¿Qué pasa después?**
1. GitHub recibe tu código.
2. **Vercel** detecta el cambio y actualiza la página web automáticamente (tarda ~1 min).
3. **Render** detecta el cambio y actualiza el servidor automáticamente (tarda ~2-3 min).

¡Eso es todo! Tienes un flujo de trabajo profesional, automatizado y gratuito.
