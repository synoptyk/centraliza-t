# 🌐 Guía: Configurar Dominio `centraliza-t.synoptyk.cl`

Sigue estos pasos para que tu aplicación responda en **centraliza-t.synoptyk.cl**.

## PASO 1: Configurar Vercel (Donde vive la App)

1.  Ve a tu proyecto en [vercel.com](https://vercel.com).
2.  Clic en la pestaña **"Settings"** -> **"Domains"**.
3.  Escribe el dominio completo que quieres usar:
    *   `centraliza-t.synoptyk.cl`
4.  Dale a **"Add"**.
5.  Vercel te mostrará unos datos en rojo (Invalid Configuration). **No cierres esta pestaña**, necesitamos copiar el dato que dice **CNAME Record** (Valor esperado: `cname.vercel-dns.com`).

---

## PASO 2: Configurar tu cPanel (Donde vive el Dominio)

1.  Entra a tu cPanel (suele ser `synoptyk.cl/cpanel` o la URL que te dio tu proveedor).
2.  Busca la sección **"DOMINIOS"** o **"DOMAINS"**.
3.  Haz clic en **"Zone Editor"** (Editor de Zona DNS).
4.  Junto a tu dominio `synoptyk.cl`, haz clic en el botón **"+ CNAME Record"**.
5.  Rellena el formulario así:
    *   **Name (Nombre)**: `centraliza-t` (cPanel añadirá automáticamente el `.synoptyk.cl`).
        *   *Resultado final debe ser: `centraliza-t.synoptyk.cl`*
    *   **CNAME (Destino/Record)**: `cname.vercel-dns.com`
6.  Dale a **"Add CNAME Record"**.

*Nota: Si no tienes botón "+ CNAME Record", busca "Manage" -> "Add Record" -> Tipo "CNAME".*

---

## PASO 3: Esperar y Verificar

1.  Vuelve a la pestaña de **Vercel** en "Domains".
2.  Espera unos minutos (puede tardar desde 5 min hasta 24h, pero suele ser rápido).
3.  Vercel verificará automáticamente el dominio y lo pondrá en verde ✅.

¡Listo! Ahora tu aplicación será accesible en `https://centraliza-t.synoptyk.cl`.
