package com.example.DAO;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

public class Dao {
    private static Dotenv dotenv = Dotenv.configure()
        .ignoreIfMissing()
        .load();

    private static String url      = dotenv.get("DB_URL",      "jdbc:postgresql://ep-tiny-mountain-an5xf3uj-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require");
    private static String user     = dotenv.get("DB_USER",     "neondb_owner");
    private static String password = dotenv.get("DB_PASSWORD", "npg_jmOR1gub2DHS");

    public Connection connect() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }
}