# Dockerfile para compilar Auto Book Whisper APK
FROM ubuntu:22.04

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias básicas
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    openjdk-11-jdk \
    android-tools-adb \
    android-tools-fastboot \
    && rm -rf /var/lib/apt/lists/*

# Configurar variables de entorno de Java
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# Instalar Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Configurar directorio de trabajo
WORKDIR /app

# Instalar Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p $ANDROID_HOME/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip \
    && unzip commandlinetools-linux-9477386_latest.zip -d $ANDROID_HOME/cmdline-tools \
    && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
    && rm commandlinetools-linux-9477386_latest.zip

# Aceptar licencias de Android SDK y instalar componentes necesarios
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"

# Instalar Gradle
ENV GRADLE_VERSION=8.0
RUN wget -q https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip \
    && unzip gradle-${GRADLE_VERSION}-bin.zip \
    && mv gradle-${GRADLE_VERSION} /opt/gradle \
    && rm gradle-${GRADLE_VERSION}-bin.zip
ENV PATH=$PATH:/opt/gradle/bin

# Copiar archivos de configuración del proyecto
COPY package*.json ./
COPY capacitor.config.ts ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY tsconfig*.json ./

# Instalar dependencias de npm
RUN npm ci

# Copiar el código fuente
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Script de compilación
COPY docker-build.sh /usr/local/bin/docker-build.sh
RUN chmod +x /usr/local/bin/docker-build.sh

# Crear directorio para los artefactos de salida
RUN mkdir -p /app/output

# Exponer puerto para desarrollo (opcional)
EXPOSE 5173

# Comando por defecto
CMD ["/usr/local/bin/docker-build.sh"]