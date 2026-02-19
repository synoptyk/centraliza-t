# Guía de Verificación Definitiva: Configuración de Correo (SMTP)

Esta guía explica paso a paso **dónde** y **cómo** el sistema busca las credenciales para enviar correos. Sigue estos pasos para asegurarte de que todo esté correcto.

## 1. Jerarquía de Configuración (Cómo piensa el sistema)

El sistema (`sendEmail.js`) sigue un orden estricto para buscar las credenciales. Si encuentra datos en el paso 1, **ignora** el paso 2.

1.  **PRIORIDAD ALTA: Base de Datos (Panel de Administración)**
    *   Si hay una configuración guardada en la base de datos (con usuario lleno), el sistema **usará esta configuración**.
    *   *Problema Común:* Si aquí hay una contraseña antigua o incorrecta, el sistema fallará, incluso si las variables de entorno están bien.

2.  **RESPALDO: Variables de Entorno (Render / Servidor)**
    *   Solo se usan si **NO** hay configuración en la base de datos o si la contraseña en base de datos está vacía (gracias a nuestra última corrección).

---

## 2. Puntos de Revisión

### A. Panel de Administración (Prioridad Alta)
Este es el lugar más probable donde puede haber un error si se guardó una configuración incorrecta anteriormente.

1.  Ingresa a **Centraliza-T** como SuperAdmin.
2.  Ve a **Centro de Mando (Dashboard)** -> Pestaña **Configuración**.
3.  Baja hasta **Ajustes del Sistema (SMTP)**.
4.  **Verifica los campos:**
    *   **Host SMTP:** `smtp.zoho.com`
    *   **Puerto:** `465`
    *   **Email del Sistema:** `soporte@synoptyk.cl` (o el que uses)
    *   **Contraseña:** **IMPORTANTE:** Escríbela nuevamente (`Ch1l3.2026.##`) para asegurar que está actualizada.
5.  Haz clic en **Guardar Configuración**.
6.  Haz clic en **Prueba de Correo**.

### B. Variables de Entorno en Render (Respaldo)
Si la base de datos falla, el sistema intentará usar esto. Es bueno tenerlo configurado como "red de seguridad".

1.  Ve a tu Dashboard en **Render**.
2.  Selecciona el servicio web de **Centraliza-T**.
3.  Ve a la sección **Environment**.
4.  Asegúrate de tener estas variables definidas correctamente:
    *   `SMTP_HOST`: `smtp.zoho.com`
    *   `SMTP_PORT`: `465`
    *   `SMTP_EMAIL`: `soporte@synoptyk.cl` (o `ceo@synoptyk.cl` si usas ese)
    *   `SMTP_PASSWORD`: `Ch1l3.2026.##`

---

## 3. ¿Cómo sé qué está usando? (Logs)

Gracias a la última actualización, puedes ver en los **Logs de Render** qué está pasando:

- Si ves: `--- SMTP: Using Database Configuration ---`
  -> El sistema está usando lo que guardaste en el Panel de Administración (Punto A).

- Si ves: `--- SMTP: No Database Configuration found, using Environment Variables ---`
  -> El sistema está usando las variables de Render (Punto B).

- Si ves: `--- SMTP WARNING: DB Password empty... ---`
  -> La contraseña en la base de datos estaba vacía, así que saltó a las variables de entorno por seguridad.

## Resumen de Solución

Si tienes problemas, lo más efectivo es:
1.  Ir al **Panel de Administración**.
2.  **Re-escribir la contraseña** correctamente.
3.  **Guardar**.

Esto actualizará la fuente de **Prioridad Alta** y el sistema debería funcionar inmediatamente.
