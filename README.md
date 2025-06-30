#  CRM Personal - Contact Relationship Manager

**CRM Personal** es una aplicación móvil construida con **React Native + Expo** que permite gestionar contactos personales con un enfoque relacional. La app proporciona funcionalidades para asignar prioridades de contacto, recibir recordatorios periódicos y agendar eventos integrados directamente con el calendario nativo del sistema.

---

##  Arquitectura

El proyecto sigue una arquitectura **CLEAN + MVVM + Feature First + Atomic Design**, que asegura modularidad, escalabilidad y testabilidad:

### Estructura principal

src/
├── data/ # Capa de datos (SQLite, expo-calendar)
├── domain/ # Entidades y lógica de negocio
├── features/ # Features agrupadas: contacts, relationships, calendar, etc.
├── navigation/ # Estructura de navegación con React Navigation
├── ui/ # Componentes de UI reutilizables
├── store/ # Estado global (Zustand)
└── utils/ # Utilidades auxiliares




---

##  Integraciones Nativas

### Expo Calendar
- Se utiliza `expo-calendar` para crear, editar y eliminar eventos directamente en el calendario del dispositivo.
- Los eventos están relacionados con los contactos y la prioridad que se les asigne.

### Expo Contacts
- Se accede a la lista de contactos nativa del sistema con `expo-contacts`.
- La aplicación permite buscar contactos y asignar prioridades con límite de días de reconexión.

### SQLite
- Se implementa persistencia local con `expo-sqlite` para:
  - Guardar prioridades por contacto
  - Guardar eventos agendados
  - Almacenar historial si se requiere

---

##  Funcionalidades

-  Buscar contactos nativos del dispositivo
-  Asignar prioridades (Alta, Media, Baja) a contactos
-  Definir cada cuántos días contactar a alguien
-  Agendar eventos vinculados a contactos
-  Visualización de calendario con días resaltados
-  Edición y eliminación de eventos
-  Recordatorios relacionales según prioridad

---

##  Instalación y ejecución

### 1. Clonar el repositorio
aabrir bash
git clone https://github.com/tuusuario/crmpersonal.git
cd crmpersonal
2. Instalar dependencias
npm install
3. Ejecutar la app
npx expo start
Asegúrate de tener Expo Go en tu dispositivo o un emulador Android/iOS corriendo.

 Dependencias principales
expo-calendar

expo-contacts

expo-sqlite

zustand

@react-navigation/native

dayjs

 Lógica Relacional
Cada contacto puede tener una prioridad asignada (Alta, Media, Baja).

Se almacena también el color visual (rojo, naranja, verde) y daysLimit para reconexión.

El calendario sugiere o muestra eventos basados en esa prioridad.

El contacto con prioridad "Alta" puede sugerir reuniones más frecuentes.

 Archivos Clave
Archivo	Descripción
src/features/contacts/viewmodel/ContactsViewModel.ts	Obtiene contactos desde expo-contacts.
src/features/relationships/viewmodel/useRelationshipStore.ts	Almacena prioridades con zustand y SQLite.
src/features/calendar/viewmodel/useScheduledEventStore.ts	Controla eventos agendados en el calendario.
src/data/storage/SQLiteService.ts	Inicializa tablas y gestiona persistencia local.
src/ui/screens/ContactsScreen.tsx	Pantalla principal para gestionar prioridades.
src/ui/screens/CalendarScreen.tsx	Vista del calendario con eventos marcados.
src/ui/screens/ScheduleEventScreen.tsx	Permite agendar un evento para un contacto.

nota: en caso dequerer correrlo de manera local puedes escribir en el bash:
npx expo prebuild --clean
y posteriormente:
npx expo run:android

ten en cuenta que para ello debes tener las configuraciones necesarias en tu computadora para poderlo correr localmente.

