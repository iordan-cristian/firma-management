FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY gradlew gradlew.bat ./
COPY gradle gradle/
COPY build.gradle settings.gradle ./
COPY backend/build.gradle backend/
COPY backend/src backend/src
RUN chmod +x gradlew && ./gradlew :backend:bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/backend/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]