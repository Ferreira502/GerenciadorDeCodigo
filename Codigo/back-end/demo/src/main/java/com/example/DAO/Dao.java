package com.example.DAO;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

public class Dao {
    private static Dotenv dotenv = Dotenv.load();
    private static String url = dotenv.get("DB_URL", "jdbc:postgresql://localhost:5432/Armazenador");
    private static String user = dotenv.get("DB_USER", "postgres");
    private static String password = dotenv.get("DB_PASSWORD", "988739002Gc.");

    public Connection connect() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }
}