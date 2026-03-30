package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.example.GRUPO.Grupo;

public class GrupoDAO {

    private final Dao dao = new Dao();

    // ── mapeamento ResultSet → Grupo ──────────────────────────────────────────
    private Grupo mapear(ResultSet rs) throws SQLException {
        Grupo g = new Grupo();
        g.setId(rs.getInt("id"));
        g.setNome(rs.getString("nome"));
        g.setDescricao(rs.getString("descricao"));
        g.setCor(rs.getString("cor"));
        g.setCriadoEm(rs.getString("criado_em"));
        g.setUsuarioId(rs.getInt("usuario_id"));
        return g;
    }

    // ── cadastrar (recebe objeto Grupo) — chamado em Main: grupoDao.cadastrar(g) ──
    public int cadastrar(Grupo grupo) throws SQLException {
        String sql = "INSERT INTO grupo (nome, descricao, cor, usuario_id) VALUES (?,?,?,?) RETURNING id";
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, grupo.getNome());
            ps.setString(2, grupo.getDescricao());
            ps.setString(3, grupo.getCor() != null ? grupo.getCor() : "#00d9ff");
            ps.setInt(4, grupo.getUsuarioId());
            ResultSet rs = ps.executeQuery();
            return rs.next() ? rs.getInt("id") : -1;
        }
    }

    // ── listarPorUsuario — chamado em Main: grupoDao.listarPorUsuario(userId) ──
    public List<Grupo> listarPorUsuario(int usuarioId) throws SQLException {
        String sql = "SELECT * FROM grupo WHERE usuario_id = ? ORDER BY criado_em DESC";
        List<Grupo> lista = new ArrayList<>();
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                lista.add(mapear(rs));
            }
        }
        return lista;
    }

    // ── getPorId — chamado em Main: grupoDao.getPorId(id) ────────────────────
    public Grupo getPorId(int id) throws SQLException {
        String sql = "SELECT * FROM grupo WHERE id = ?";
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            return rs.next() ? mapear(rs) : null;
        }
    }

    // ── atualizar (recebe objeto Grupo) — chamado em Main: grupoDao.atualizar(g) ──
    public boolean atualizar(Grupo grupo) throws SQLException {
        String sql = "UPDATE grupo SET nome=?, descricao=?, cor=? WHERE id=? AND usuario_id=?";
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, grupo.getNome());
            ps.setString(2, grupo.getDescricao());
            ps.setString(3, grupo.getCor());
            ps.setInt(4, grupo.getId());
            ps.setInt(5, grupo.getUsuarioId());
            return ps.executeUpdate() > 0;
        }
    }

    // ── deletar — chamado em Main: grupoDao.deletar(gid, userId) ─────────────
    public boolean deletar(int id, int usuarioId) throws SQLException {
        String sql = "DELETE FROM grupo WHERE id=? AND usuario_id=?";
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.setInt(2, usuarioId);
            return ps.executeUpdate() > 0;
        }
    }

    // ── listarGruposDoCodigo — chamado em Main: grupoDao.listarGruposDoCodigo(codigoId) ──
    public List<Integer> listarGruposDoCodigo(int codigoId) throws SQLException {
        String sql = "SELECT grupo_id FROM codigo_grupo WHERE codigo_id=?";
        List<Integer> ids = new ArrayList<>();
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, codigoId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ids.add(rs.getInt("grupo_id"));
            }
        }
        return ids;
    }

    // ── definirGruposDoCodigo — chamado em Main: grupoDao.definirGruposDoCodigo(codigoId, gids) ──
    // Remove todos os grupos do código e insere os novos
    public void definirGruposDoCodigo(int codigoId, List<Integer> grupoIds) throws SQLException {
        // Remove vínculos atuais
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement("DELETE FROM codigo_grupo WHERE codigo_id=?")) {
            ps.setInt(1, codigoId);
            ps.executeUpdate();
        }
        if (grupoIds == null || grupoIds.isEmpty()) {
            return;
        }

        // Insere os novos vínculos
        String sql = "INSERT INTO codigo_grupo (codigo_id, grupo_id) VALUES (?,?) ON CONFLICT DO NOTHING";
        try (Connection c = dao.connect(); PreparedStatement ps = c.prepareStatement(sql)) {
            for (int gid : grupoIds) {
                ps.setInt(1, codigoId);
                ps.setInt(2, gid);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }
}
