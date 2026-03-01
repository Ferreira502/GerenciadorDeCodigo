# Usa Java 17
FROM eclipse-temurin:17-jdk

# Define pasta dentro do container
WORKDIR /app

# Copia tudo para dentro do container
COPY . .

# Compila o projeto
RUN ./mvnw clean package -DskipTests

# Comando para rodar
CMD ["java", "-jar", "target/seuprojeto.jar"]