FROM maven:3.9.9-eclipse-temurin-21

WORKDIR /app

COPY pom.xml .
RUN mvn -B -q -e -DskipTests dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

EXPOSE 8080

CMD sh -c "ls target && java -jar target/*.jar"