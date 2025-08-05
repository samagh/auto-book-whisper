# Auto Book Whisper

Una aplicación de audiolibros para Android Auto que convierte archivos EPUB en audio utilizando síntesis de voz nativa y modelos de IA de Hugging Face.

## Características

- 📚 Lectura de archivos EPUB
- 🎵 Síntesis de voz nativa de Android
- 🤖 Modelos de IA avanzados (Hugging Face)
- 🚗 Interfaz optimizada para Android Auto
- ⚡ Controles de velocidad y volumen
- 📖 Navegación por capítulos
- 🌙 Tema oscuro optimizado para conducción

## Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Mobile**: Capacitor
- **Styling**: Tailwind CSS
- **TTS**: Web Speech API + Hugging Face Transformers
- **EPUB**: epub.js

## Desarrollo Local

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn
- Android Studio (para desarrollo Android)

### Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd auto-book-whisper
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Compilación para Android

### Preparación del Entorno

1. Instala Android Studio y configura el SDK de Android
2. Asegúrate de tener Java 11 o superior instalado
3. Configura las variables de entorno `ANDROID_HOME` y `JAVA_HOME`

### Compilación del APK

1. Construye la aplicación web:
```bash
npm run build
```

2. Sincroniza con Capacitor:
```bash
npx cap sync android
```

3. Abre el proyecto en Android Studio:
```bash
npx cap open android
```

4. En Android Studio:
   - Ve a `Build` > `Generate Signed Bundle / APK`
   - Selecciona `APK`
   - Configura tu keystore (crear uno nuevo si es necesario)
   - Selecciona `release` como build variant
   - Haz clic en `Finish`

### Compilación desde Línea de Comandos

También puedes compilar directamente desde la terminal:

```bash
# Compilar APK de debug
cd android
./gradlew assembleDebug

# Compilar APK de release (requiere keystore configurado)
./gradlew assembleRelease
```

Los APKs se generarán en `android/app/build/outputs/apk/`

### Configuración de Keystore para Release

1. Genera un keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. Coloca el archivo keystore en `android/app/`

3. Crea un archivo `android/keystore.properties`:
```
storeFile=my-release-key.keystore
storePassword=tu-password
keyAlias=my-key-alias
keyPassword=tu-password
```

4. El archivo `android/app/build.gradle` ya está configurado para usar estas propiedades.

## Compilación con Docker

### Usando Docker Compose (Recomendado)

1. Compilar APK:
```bash
docker-compose up android-builder
```

2. Para desarrollo web:
```bash
docker-compose up dev-server
```

Los APKs compilados se guardarán en el directorio `./output/`

### Usando Docker directamente

1. Construir la imagen:
```bash
docker build -t auto-book-whisper .
```

2. Ejecutar compilación:
```bash
docker run -v $(pwd)/output:/app/output auto-book-whisper
```

## Instalación en Dispositivo

### Vía USB (Debug)

1. Habilita las opciones de desarrollador en tu dispositivo Android
2. Activa la depuración USB
3. Conecta el dispositivo y ejecuta:
```bash
npx cap run android
```

### Vía APK

1. Compila el APK siguiendo los pasos anteriores
2. Transfiere el APK al dispositivo
3. Habilita "Fuentes desconocidas" en configuración
4. Instala el APK

## Android Auto

Para usar con Android Auto:

1. Conecta tu dispositivo a Android Auto
2. La aplicación aparecerá en la categoría de "Media" de Android Auto
3. Asegúrate de que los permisos de micrófono estén habilitados si usas TTS

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── AudioPlayer.tsx # Reproductor principal
│   ├── EpubUploader.tsx
│   └── ...
├── hooks/              # Hooks personalizados
│   ├── useEpubReader.ts
│   ├── useTTS.ts
│   └── useNativeTTS.ts
├── pages/              # Páginas de la aplicación
└── lib/                # Utilidades
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa de la build
- `npx cap sync` - Sincronizar con plataformas nativas
- `npx cap run android` - Ejecutar en Android

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.