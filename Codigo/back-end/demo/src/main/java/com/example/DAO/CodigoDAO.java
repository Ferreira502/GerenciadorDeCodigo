package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.example.CODIGO.Codigo;

public class CodigoDAO 
{
    public static Dao dao = new Dao();

    // Crud de Codigo para o banco de dados

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
}