package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.example.USUARIO.Usuario;

public class UsuarioDAO {
    private Dao dao = new Dao();

    // Cadastrar novo usuario
    public int cadastrarUsuario(String nome, String email, String senha) throws SQLException {
        String sql = "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?) RETURNING id";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, nome);
            ps.setString(2, email);
            ps.setString(3, senha);
            
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            }
            return -1;
        }
    }

    // Login do usuario
    public Usuario loginUsuario(String email, String senha) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, email);
            ps.setString(2, senha);
            
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new Usuario(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("email"),
                    rs.getString("senha")
                );
            }
        }
        return null;
    }

    // Buscar usuario por ID
    public Usuario getUsuarioPorId(int id) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE id = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return new Usuario(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("email"),
                    rs.getString("senha")
                );
            }
        }
        return null;
    }

    // Buscar usuario por email
    public Usuario getUsuarioPorEmail(String email) throws SQLException {
        String sql = "SELECT * FROM usuario WHERE email = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                return new Usuario(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("email"),
                    rs.getString("senha")
                );
            }
        }
        return null;
    }

    // Atualizar usuario
    public boolean atualizarUsuario(int id, String nome, String email, String senha) throws SQLException {
        String sql = "UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, nome);
            ps.setString(2, email);
            ps.setString(3, senha);
            ps.setInt(4, id);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // Deletar usuario
    public boolean deletarUsuario(int id) throws SQLException {
        String sql = "DELETE FROM usuario WHERE id = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, id);
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        }
    }
}