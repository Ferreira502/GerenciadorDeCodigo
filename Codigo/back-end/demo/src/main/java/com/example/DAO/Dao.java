package com.example.DAO;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.CUIDADOR.Cuidador;
import com.example.NOTIFICACAO.Notificacao;
import com.example.PACIENTE.Paciente;
import com.example.CODIGO.Codigo;
import com.example.USUARIO.Usuario;

public class Dao {
    private static String user = "postgres";
    private static String password = "988739002Gc.";
    private static String url = "jdbc:postgresql://localhost:5432/armazena";

    public Connection connect() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }


    // Crud de Codigos para o banco de dados

    public boolean atualizarCodigo(int id, String nome, String email, String linguagem) throws SQLException 
    {
        String sql = "UPDATE codigo SET nome = ?, email = ?, linguagem = ? WHERE id = ?";

        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.setString(2, nome);
            ps.setString(3, email);
            ps.seString(4, linguagem);

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        }
    }
    
    public int cadastrarCodigo(int id, String nome, String email, String linguagem) throws SQLException {
        String sql = "INSERT INTO codigo (id, nome, email, linguagem) "
                +
                "VALUES (?, ?, ?, ?) RETURNING id";

        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) 
        {

            ps.setInt(1, id);
            ps.setString(2, nome);
            ps.setString(3, email);
            ps.setString(4, linguagem);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            } else {
                return -1;
            }
        }
    }

    public Codigo getCodigoPorId(int id) throws SQLException {
        String sql = "SELECT * FROM codigo WHERE id = ?";
        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new Paciente(
                        rs.getString("nome"),
                        rs.getString("email"),
                        rs.getString("linguagem"));
            }
        }
        return null;
    }

    public Codigo getCodigoPorEmail(String email) throws SQLException {
        String sql = "SELECT * FROM codigo WHERE email = ?";
        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new Paciente(
                        rs.getString("nome"),
                        rs.getString("email"),
                        rs.getString("linguagem"));
            }
        }
        return null;
    }

    // Crud de Usuarios para o banco de dados

    public boolean atualizarUsuario(int id, String nome, String email, String senha) throws SQLException 
    {
        String sql = "UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id = ?";

        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.setString(2, nome);
            ps.setString(3, email);
            ps.seString(4, senha);

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        }
    }
    
    public int cadastrarUsuario(int id, String nome, String email, String senha) throws SQLException {
        String sql = "INSERT INTO usuario (id, nome, email, senha) "
                +
                "VALUES (?, ?, ?, ?) RETURNING id";

        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) 
        {

            ps.setInt(1, id);
            ps.setString(2, nome);
            ps.setString(3, email);
            ps.setString(4, senha);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            } else {
                return -1;
            }
        }
    }

    public Usuario getUsuarioPorId(int id) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE id = ?";
        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new Paciente(
                        rs.getString("nome"),
                        rs.getString("email"),
                        rs.getString("senha"));
            }
        }
        return null;
    }

    public Usuario getUsuarioPorEmail(String email) throws SQLException {
        String sql = "SELECT * FROM usurio WHERE email = ?";
        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new Paciente(
                        rs.getString("nome"),
                        rs.getString("email"),
                        rs.getString("senha"));
            }
        }
        return null;
    }

    public Usuario loginUsuario(String email, String senha) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
        try (Connection conn = dao.connect();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ps.setString(2, senha);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new Paciente(
                        rs.getString("nome"),
                        rs.getString("email"),
                        rs.getString("senha"));
            }
        }
        return null;
    }
}