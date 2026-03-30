package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.example.EXERCICIO.Exercicio;

public class ExercicioDAO {

    private final Dao dao = new Dao();

    private Exercicio mapear(ResultSet rs) throws SQLException {
        Exercicio e = new Exercicio();
        e.setId(rs.getInt("id"));
        e.setNumero(rs.getString("numero"));
        e.setTitulo(rs.getString("titulo"));
        e.setEnunciado(rs.getString("enunciado"));
        e.setEntrada(rs.getString("entrada"));
        e.setSaida(rs.getString("saida"));
        e.setDificuldade(rs.getString("dificuldade"));
        e.setLinguagem(rs.getString("linguagem"));
        e.setStatus(rs.getString("status"));
        e.setSolucao(rs.getString("solucao"));
        e.setObservacoes(rs.getString("observacoes"));
        e.setUsuarioId(rs.getInt("usuario_id"));

        Timestamp ts = rs.getTimestamp("criado_em");
        if (ts != null) {
            e.setCriadoEm(ts.toLocalDateTime());
        }

        return e;
    }

    // Cadastrar novo exercicio
    public int cadastrar(Exercicio ex) throws SQLException {
        String sql = """
            INSERT INTO exercicio
                (numero, titulo, enunciado, entrada, saida, dificuldade,
                 linguagem, status, solucao, observacoes, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id
            """;

        try (Connection conn = dao.connect(); PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, ex.getNumero());
            ps.setString(2, ex.getTitulo());
            ps.setString(3, ex.getEnunciado());
            ps.setString(4, ex.getEntrada());
            ps.setString(5, ex.getSaida());
            ps.setString(6, ex.getDificuldade() != null ? ex.getDificuldade() : "Fácil");
            ps.setString(7, ex.getLinguagem());
            ps.setString(8, ex.getStatus() != null ? ex.getStatus() : "pendente");
            ps.setString(9, ex.getSolucao());
            ps.setString(10, ex.getObservacoes());
            ps.setInt(11, ex.getUsuarioId());

            ResultSet rs = ps.executeQuery();
            return rs.next() ? rs.getInt("id") : -1;
        }
    }

    // Listar por usuario 
    public List<Exercicio> listarPorUsuario(int usuarioId) throws SQLException {
        String sql = "SELECT * FROM exercicio WHERE usuario_id = ? ORDER BY criado_em DESC";
        List<Exercicio> lista = new ArrayList<>();

        try (Connection conn = dao.connect(); PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, usuarioId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                lista.add(mapear(rs));
            }
        }
        return lista;
    }

    // Buscar por ID 
    public Exercicio getPorId(int id) throws SQLException {
        String sql = "SELECT * FROM exercicio WHERE id = ?";

        try (Connection conn = dao.connect(); PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        }
    }

    // Atualizar 
    public boolean atualizar(Exercicio ex) throws SQLException {
        String sql = """
            UPDATE exercicio SET
                numero = ?, titulo = ?, enunciado = ?, entrada = ?, saida = ?,
                dificuldade = ?, linguagem = ?, status = ?, solucao = ?, observacoes = ?
            WHERE id = ? AND usuario_id = ?
            """;

        try (Connection conn = dao.connect(); PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, ex.getNumero());
            ps.setString(2, ex.getTitulo());
            ps.setString(3, ex.getEnunciado());
            ps.setString(4, ex.getEntrada());
            ps.setString(5, ex.getSaida());
            ps.setString(6, ex.getDificuldade());
            ps.setString(7, ex.getLinguagem());
            ps.setString(8, ex.getStatus());
            ps.setString(9, ex.getSolucao());
            ps.setString(10, ex.getObservacoes());
            ps.setInt(11, ex.getId());
            ps.setInt(12, ex.getUsuarioId());

            return ps.executeUpdate() > 0;
        }
    }

    // Deletar
    public boolean deletar(int id, int usuarioId) throws SQLException {
        String sql = "DELETE FROM exercicio WHERE id = ? AND usuario_id = ?";

        try (Connection conn = dao.connect(); PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.setInt(2, usuarioId);
            return ps.executeUpdate() > 0;
        }
    }
}
