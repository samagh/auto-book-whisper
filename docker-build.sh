#!/bin/bash

set -e

echo "🚀 Iniciando compilación de Auto Book Whisper APK..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

echo "📦 Instalando dependencias..."
npm ci

echo "🏗️  Compilando aplicación web..."
npm run build

echo "🔧 Inicializando Capacitor (si es necesario)..."
if [ ! -d "android" ]; then
    npx cap add android
fi

echo "🔄 Sincronizando con Capacitor..."
npx cap sync android

echo "📱 Compilando APK..."
cd android

# Compilar APK de debug por defecto
echo "🔨 Generando APK de debug..."
./gradlew assembleDebug

# Si existe configuración de keystore, también compilar release
if [ -f "keystore.properties" ]; then
    echo "🔨 Generando APK de release..."
    ./gradlew assembleRelease
    
    echo "✅ APKs generados exitosamente:"
    echo "  📄 Debug: android/app/build/outputs/apk/debug/app-debug.apk"
    echo "  📄 Release: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copiar APKs al directorio de salida
    cp app/build/outputs/apk/debug/app-debug.apk /app/output/
    cp app/build/outputs/apk/release/app-release.apk /app/output/
else
    echo "⚠️  No se encontró keystore.properties, solo se generó APK de debug"
    echo "✅ APK generado exitosamente:"
    echo "  📄 Debug: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Copiar APK al directorio de salida
    cp app/build/outputs/apk/debug/app-debug.apk /app/output/
fi

echo "🎉 ¡Compilación completada!"
echo "📁 Los archivos APK están disponibles en el directorio 'output'"

# Información adicional
echo ""
echo "📋 Información del APK:"
ls -la /app/output/

echo ""
echo "🔍 Para extraer los APK del contenedor, ejecuta:"
echo "   docker cp <container_id>:/app/output/. ."