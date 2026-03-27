package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.example.CODIGO.Codigo;

public class CodigoDAO {
    private Dao dao = new Dao();

    // Cadastrar novo cddigo
    public int cadastrarCodigo(String titulo, String linguagem, String descricao, 
                               String codigo, int usuarioId) throws SQLException {
        String sql = "INSERT INTO codigo (titulo, linguagem, descricao, codigo, usuario_id) " +
                     "VALUES (?, ?, ?, ?, ?) RETURNING id";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, titulo);
            ps.setString(2, linguagem);
            ps.setString(3, descricao);
            ps.setString(4, codigo);
            ps.setInt(5, usuarioId);
            
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            }
            return -1;
        }
    }

    // Listar todos os cddigos de um usuário
    public List<Codigo> listarCodigosPorUsuario(int usuarioId) throws SQLException {
        String sql = "SELECT * FROM codigo WHERE usuario_id = ? ORDER BY criado_em DESC";
        List<Codigo> codigos = new ArrayList<>();
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, usuarioId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                Codigo c = new Codigo();
                c.setId(rs.getInt("id"));
                c.setTitulo(rs.getString("titulo"));
                c.setLinguagem(rs.getString("linguagem"));
                c.setDescricao(rs.getString("descricao"));
                c.setCodigo(rs.getString("codigo"));
                
                Timestamp ts = rs.getTimestamp("criado_em");
                if (ts != null) {
                    c.setCriadoEm(ts.toLocalDateTime());
                }
                
                c.setUsuarioId(rs.getInt("usuario_id"));
                codigos.add(c);
            }
        }
        return codigos;
    }

    // Buscar codigo por ID
    public Codigo getCodigoPorId(int id) throws SQLException {
        String sql = "SELECT * FROM codigo WHERE id = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                Codigo c = new Codigo();
                c.setId(rs.getInt("id"));
                c.setTitulo(rs.getString("titulo"));
                c.setLinguagem(rs.getString("linguagem"));
                c.setDescricao(rs.getString("descricao"));
                c.setCodigo(rs.getString("codigo"));
                
                Timestamp ts = rs.getTimestamp("criado_em");
                if (ts != null) {
                    c.setCriadoEm(ts.toLocalDateTime());
                }
                
                c.setUsuarioId(rs.getInt("usuario_id"));
                return c;
            }
        }
        return null;
    }

    // Atualizar codigo
    public boolean atualizarCodigo(int id, String titulo, String linguagem, 
                                   String descricao, String codigo) throws SQLException {
        String sql = "UPDATE codigo SET titulo = ?, linguagem = ?, descricao = ?, codigo = ? WHERE id = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, titulo);
            ps.setString(2, linguagem);
            ps.setString(3, descricao);
            ps.setString(4, codigo);
            ps.setInt(5, id);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        }
    }

    // Deletar codigo
    public boolean deletarCodigo(int id, int usuarioId) throws SQLException {
        String sql = "DELETE FROM codigo WHERE id = ? AND usuario_id = ?";
        
        try (Connection conn = dao.connect();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, id);
            ps.setInt(2, usuarioId);
            
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        }
    }
}