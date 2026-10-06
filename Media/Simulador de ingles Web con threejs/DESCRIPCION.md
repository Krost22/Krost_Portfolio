# LinguaSpace — VR English Practice

**Plataforma de práctica de inglés en realidad virtual con huéspedes simulados por IA, evaluación automática y panel docente.**

## Resumen

LinguaSpace es una aplicación WebXR que sumerge al estudiante en un lobby de hotel en 3D donde asume el rol de **recepcionista**. Un huésped controlado por IA (Google Gemini) conversa con él en inglés por voz; el sistema detecta semánticamente qué objetivos va cumpliendo y, al terminar, genera una evaluación detallada con puntuaciones y recomendaciones. Los docentes disponen de un dashboard con las sesiones, métricas y errores comunes de la clase.

Funciona en navegador de escritorio, móvil y en visores VR (optimizado y probado para **Pico 4 Ultra**), sin instalar nada.

## El problema

La práctica de conversación en inglés en el aula carece de realismo y presión, y el profesor no tiene visibilidad objetiva del desempeño de cada alumno. LinguaSpace ofrece escenarios repetibles, nunca idénticos, con retroalimentación inmediata y datos para el docente.

## Funcionalidades

- **Escena VR inmersiva**: lobby de hotel con recepción, columnas de madera, mobiliario, iluminación cálida y avatar 3D del huésped (modelos GLB).
- **Conversación por voz**: reconocimiento de voz (Web Speech API / transcripción en servidor para el navegador del Pico) y respuesta hablada con síntesis de voz. Respaldo por texto cuando el micrófono no está disponible.
- **4 personalidades de huésped aleatorias** (educado, impaciente, indeciso, exigente/VIP), cada una con datos y comportamiento distintos.
- **6 misiones detectadas por IA** en orden lógico: saludar → obtener nombre → confirmar nº de huéspedes → tipo de habitación → noches → confirmar la reserva. Se reflejan en la checklist (HUD 2D y panel 3D) con sonido de éxito.
- **Evaluación automática** en 5 criterios (Comunicación, Orden lógico, Profesionalismo, Precisión, Fluidez) + nota global, resumen, errores y recomendaciones.
- **Roles y acceso**: login para estudiante y profesor.
- **Dashboard del estudiante**: catálogo de experiencias (Hotel activo; Aeropuerto, Restaurante y Entrevista de trabajo en desarrollo) e historial de progreso.
- **Dashboard del profesor**: tabla de sesiones con búsqueda, KPIs, exportación a CSV y pestaña *Class Insights* (éxito por personalidad de huésped, errores más frecuentes, duración media).
- **Audio ambiental** generado con Web Audio API (sin archivos externos).

## Arquitectura y tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML/CSS/JavaScript sin build ni framework; **A-Frame 1.5 (WebXR)**; modelos GLB |
| IA | **Google Gemini** (`gemini-2.5-flash-lite`) con salida JSON estructurada (respuesta del huésped + misiones + valores) |
| Voz | Web Speech API, Web Audio API, endpoints de transcripción y síntesis (TTS) |
| Backend | **Funciones serverless en Vercel** (proxy a Gemini, auth por rol, guardado y lectura de resultados) |
| Datos | Vercel KV (Redis) para persistir resultados |
| Seguridad | Clave de API solo en servidor (cabecera `X-Goog-Api-Key`), códigos de acceso por rol, Permissions-Policy de micrófono |
| Despliegue | Vercel (`cleanUrls`, cabeceras para GLB) |

## Retos técnicos destacados

- Diseñar un **prompt con esquema JSON** que haga que el modelo actúe como huésped realista y a la vez rastree el estado de la reserva y las misiones.
- Hacer funcionar el **reconocimiento de voz en el navegador del Pico**, con transcripción en servidor y respaldo por texto.
- Colisiones y locomoción sin motor de físicas (componente propio de limitación de posición y locomoción con thumbstick).
- Pipeline de evaluación que convierte el historial de chat en una rúbrica objetiva y la persiste para el análisis del docente.
- Corrección de despliegue de modelos GLB en Vercel (sin Git LFS, con cabeceras correctas).

## Mi rol

Diseño y desarrollo completo: escena 3D, lógica conversacional con IA, interfaz 2D/VR, backend serverless, paneles de estudiante/profesor y despliegue.

## Nota sobre las evidencias

Las capturas se tomaron en local con Chrome (render por software). Como no había clave de Gemini en el entorno, **las respuestas del huésped y la evaluación de las capturas 05–06 son simuladas** (respuestas guionizadas interceptadas en el navegador); los datos de los dashboards son de demostración (modo sandbox). La UI, la escena y el flujo son los reales del proyecto. El texto 3D (A-Frame) se ve pixelado por el renderizado por software; en el visor/GPU real se ve nítido, por lo que conviene reemplazar esas capturas por una grabación real en el Pico si es posible.
