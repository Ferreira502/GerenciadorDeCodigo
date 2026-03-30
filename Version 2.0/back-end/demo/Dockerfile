FROM maven:3.9.9-eclipse-temurin-21

WORKDIR /app

# Copia tudo (não só pom.xml)
COPY . .

# Build do projeto
RUN mvn clean package -DskipTests

# Rodar o jar
CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]