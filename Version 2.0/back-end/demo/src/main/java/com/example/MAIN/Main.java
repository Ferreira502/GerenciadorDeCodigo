package com.example.MAIN;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.CODIGO.Codigo;
import com.example.DAO.CodigoDAO;
import com.example.DAO.ExercicioDAO;
import com.example.DAO.GrupoDAO;
import com.example.DAO.UsuarioDAO;
import com.example.EXERCICIO.Exercicio;
import com.example.GRUPO.Grupo;
import com.example.USUARIO.Usuario;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;

import io.github.cdimascio.dotenv.Dotenv;
import static spark.Spark.before;
import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.options;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.put;

public class Main {

    // ── Adapter LocalDateTime ─────────────────────────────────────────────────
    private static class LocalDateTimeAdapter
            extends com.google.gson.TypeAdapter<LocalDateTime> {

        @Override
        public void write(com.google.gson.stream.JsonWriter out, LocalDateTime value)
                throws java.io.IOException {
            if (value == null) {
                out.nullValue(); 
            }else {
                out.value(value.toString());
            }
        }

        @Override
        public LocalDateTime read(com.google.gson.stream.JsonReader in)
                throws java.io.IOException {
            if (in.peek() == com.google.gson.stream.JsonToken.NULL) {
                in.nextNull();
                return null;
            }
            return LocalDateTime.parse(in.nextString());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static JsonObject erro(String msg) {
        JsonObject j = new JsonObject();
        j.addProperty("erro", msg);
        return j;
    }

    // Renomeado para respostaOk() — evita conflito com variável local "boolean ok"
    private static JsonObject respostaOk() {
        JsonObject j = new JsonObject();
        j.addProperty("status", "ok");
        return j;
    }

    private static int userId(spark.Request req) {
        return Integer.parseInt(req.cookie("userId"));
    }

    private static boolean autenticado(spark.Request req) {
        return req.cookie("userId") != null;
    }

    // ── Main ──────────────────────────────────────────────────────────────────
    public static void main(String[] args) {

        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        int porta = Integer.parseInt(dotenv.get("PORT", "8080"));

        CodigoDAO codigoDao = new CodigoDAO();
        UsuarioDAO usuarioDao = new UsuarioDAO();
        ExercicioDAO exercicioDao = new ExercicioDAO();
        GrupoDAO grupoDao = new GrupoDAO();

        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter())
                .create();

        port(porta);
        System.out.println("Servidor rodando na porta " + porta);

        // ── CORS ──────────────────────────────────────────────────────────────
        before((req, res) -> {
            String origin = req.headers("Origin");
            if (origin != null && (origin.contains("localhost")
                    || origin.contains("127.0.0.1")
                    || origin.contains("vercel.app"))) {
                res.header("Access-Control-Allow-Origin", origin);
            }
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
            res.header("Access-Control-Allow-Credentials", "true");
        });

        options("/*", (req, res) -> "OK");

        // ══════════════════════════════════════════════════════════════════════
        //  AUTH
        // ══════════════════════════════════════════════════════════════════════
        post("/api/auth/cadastro", (req, res) -> {
            res.type("application/json");
            try {
                Type t = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), t);

                String nome = data.get("nome");
                String email = data.get("email");
                String senha = data.get("senha");

                if (nome == null || email == null || senha == null) {
                    res.status(400);
                    return gson.toJson(erro("Campos obrigatórios faltando"));
                }

                if (usuarioDao.getUsuarioPorEmail(email) != null) {
                    res.status(409);
                    return gson.toJson(erro("Email já cadastrado"));
                }

                int id = usuarioDao.cadastrarUsuario(nome, email, senha);
                if (id > 0) {
                    res.cookie("/", "userId", String.valueOf(id), 86400, false, false);
                    JsonObject r = respostaOk();
                    r.add("usuario", gson.toJsonTree(new Usuario(id, nome, email, null)));
                    return gson.toJson(r);
                }
                res.status(500);
                return gson.toJson(erro("Erro ao criar usuário"));

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        post("/api/auth/login", (req, res) -> {
            res.type("application/json");
            try {
                Type t = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), t);

                Usuario usuario = usuarioDao.loginUsuario(data.get("email"), data.get("senha"));
                if (usuario != null) {
                    res.cookie("/", "userId", String.valueOf(usuario.getId()), 86400, false, false);
                    usuario.setSenha(null);
                    JsonObject r = respostaOk();
                    r.add("usuario", gson.toJsonTree(usuario));
                    return gson.toJson(r);
                }
                res.status(401);
                return gson.toJson(erro("Email ou senha incorretos"));

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        post("/api/auth/logout", (req, res) -> {
            res.removeCookie("/", "userId");
            return gson.toJson(respostaOk());
        });

        get("/api/auth/me", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return "{}";
                }
                Usuario u = usuarioDao.getUsuarioPorId(userId(req));
                if (u != null) {
                    u.setSenha(null);
                    return gson.toJson(u);
                }
                res.status(401);
                return "{}";
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        // ══════════════════════════════════════════════════════════════════════
        //  CÓDIGOS
        // ══════════════════════════════════════════════════════════════════════
        get("/api/codigos", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }

                List<Codigo> codigos = codigoDao.listarCodigosPorUsuario(userId(req));

                // Adiciona lista de IDs de grupos a cada código
                JsonArray arr = new JsonArray();
                for (Codigo c : codigos) {
                    JsonElement el = gson.toJsonTree(c);
                    JsonArray grupos = new JsonArray();
                    grupoDao.listarGruposDoCodigo(c.getId()).forEach(grupos::add);
                    el.getAsJsonObject().add("grupos", grupos);
                    arr.add(el);
                }
                return gson.toJson(arr);

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        post("/api/codigos", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }
                int uid = userId(req);

                JsonObject data = JsonParser.parseString(req.body()).getAsJsonObject();
                String titulo = data.has("titulo") ? data.get("titulo").getAsString() : null;
                String linguagem = data.has("linguagem") ? data.get("linguagem").getAsString() : null;
                String descricao = data.has("descricao") && !data.get("descricao").isJsonNull()
                        ? data.get("descricao").getAsString() : null;
                String codigo = data.has("codigo") ? data.get("codigo").getAsString() : null;

                if (titulo == null || linguagem == null || codigo == null) {
                    res.status(400);
                    return gson.toJson(erro("Campos obrigatórios faltando"));
                }

                int id = codigoDao.cadastrarCodigo(titulo, linguagem, descricao, codigo, uid);
                if (id > 0) {
                    // Associar grupos se enviados
                    if (data.has("grupos") && data.get("grupos").isJsonArray()) {
                        List<Integer> gids = new ArrayList<>();
                        data.get("grupos").getAsJsonArray().forEach(g -> gids.add(g.getAsInt()));
                        grupoDao.definirGruposDoCodigo(id, gids);
                    }
                    Codigo novo = codigoDao.getCodigoPorId(id);
                    JsonElement el = gson.toJsonTree(novo);
                    JsonArray grupos = new JsonArray();
                    grupoDao.listarGruposDoCodigo(id).forEach(grupos::add);
                    el.getAsJsonObject().add("grupos", grupos);
                    return gson.toJson(el);
                }
                res.status(500);
                return gson.toJson(erro("Erro ao salvar código"));

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        delete("/api/codigos/:id", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }
                int cid = Integer.parseInt(req.params(":id"));
                boolean ok = codigoDao.deletarCodigo(cid, userId(req));
                if (ok) {
                    return gson.toJson(respostaOk());
                }
                res.status(404);
                return gson.toJson(erro("Código não encontrado"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        // ══════════════════════════════════════════════════════════════════════
        //  GRUPOS
        // ══════════════════════════════════════════════════════════════════════
        get("/api/grupos", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }
                return gson.toJson(grupoDao.listarPorUsuario(userId(req)));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        post("/api/grupos", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }

                Type t = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), t);

                String nome = data.get("nome");
                if (nome == null || nome.isBlank()) {
                    res.status(400);
                    return gson.toJson(erro("Nome do grupo é obrigatório"));
                }

                Grupo g = new Grupo();
                g.setNome(nome);
                g.setDescricao(data.get("descricao"));
                g.setCor(data.getOrDefault("cor", "#00d9ff"));
                g.setUsuarioId(userId(req));

                int id = grupoDao.cadastrar(g);
                if (id > 0) {
                    return gson.toJson(grupoDao.getPorId(id));
                }
                res.status(500);
                return gson.toJson(erro("Erro ao criar grupo"));

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        put("/api/grupos/:id", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }

                Type t = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), t);

                Grupo g = new Grupo();
                g.setId(Integer.parseInt(req.params(":id")));
                g.setNome(data.get("nome"));
                g.setDescricao(data.get("descricao"));
                g.setCor(data.getOrDefault("cor", "#00d9ff"));
                g.setUsuarioId(userId(req));

                boolean ok = grupoDao.atualizar(g);
                if (ok) {
                    return gson.toJson(grupoDao.getPorId(g.getId()));
                }
                res.status(404);
                return gson.toJson(erro("Grupo não encontrado"));

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        delete("/api/grupos/:id", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }
                int gid = Integer.parseInt(req.params(":id"));
                boolean ok = grupoDao.deletar(gid, userId(req));
                if (ok) {
                    return gson.toJson(respostaOk());
                }
                res.status(404);
                return gson.toJson(erro("Grupo não encontrado"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        // Definir grupos de um código (recebe array JSON de IDs)
        post("/api/codigos/:id/grupos", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }
                int cid = Integer.parseInt(req.params(":id"));
                JsonArray arr = JsonParser.parseString(req.body()).getAsJsonArray();
                List<Integer> gids = new ArrayList<>();
                arr.forEach(e -> gids.add(e.getAsInt()));
                grupoDao.definirGruposDoCodigo(cid, gids);
                return gson.toJson(respostaOk());
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        // ══════════════════════════════════════════════════════════════════════
        //  EXERCÍCIOS
        // ══════════════════════════════════════════════════════════════════════
        get("/api/exercicios", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }
                return gson.toJson(exercicioDao.listarPorUsuario(userId(req)));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        post("/api/exercicios", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }

                Type t = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), t);

                String titulo = data.get("titulo");
                if (titulo == null || titulo.isBlank()) {
                    res.status(400);
                    return gson.toJson(erro("Título é obrigatório"));
                }

                Exercicio ex = new Exercicio();
                ex.setNumero(data.get("numero"));
                ex.setTitulo(titulo);
                ex.setEnunciado(data.get("enunciado"));
                ex.setEntrada(data.get("entrada"));
                ex.setSaida(data.get("saida"));
                ex.setDificuldade(data.getOrDefault("dificuldade", "Fácil"));
                ex.setLinguagem(data.get("linguagem"));
                ex.setStatus(data.getOrDefault("status", "pendente"));
                ex.setSolucao(data.get("solucao"));
                ex.setObservacoes(data.get("observacoes"));
                ex.setUsuarioId(userId(req));

                int id = exercicioDao.cadastrar(ex);
                if (id > 0) {
                    return gson.toJson(exercicioDao.getPorId(id));
                }
                res.status(500);
                return gson.toJson(erro("Erro ao salvar exercício"));

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        put("/api/exercicios/:id", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }

                Type t = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), t);

                Exercicio ex = new Exercicio();
                ex.setId(Integer.parseInt(req.params(":id")));
                ex.setNumero(data.get("numero"));
                ex.setTitulo(data.get("titulo"));
                ex.setEnunciado(data.get("enunciado"));
                ex.setEntrada(data.get("entrada"));
                ex.setSaida(data.get("saida"));
                ex.setDificuldade(data.getOrDefault("dificuldade", "Fácil"));
                ex.setLinguagem(data.get("linguagem"));
                ex.setStatus(data.getOrDefault("status", "pendente"));
                ex.setSolucao(data.get("solucao"));
                ex.setObservacoes(data.get("observacoes"));
                ex.setUsuarioId(userId(req));

                boolean ok = exercicioDao.atualizar(ex);
                if (ok) {
                    return gson.toJson(exercicioDao.getPorId(ex.getId()));
                }
                res.status(404);
                return gson.toJson(erro("Exercício não encontrado"));

            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });

        delete("/api/exercicios/:id", (req, res) -> {
            res.type("application/json");
            try {
                if (!autenticado(req)) {
                    res.status(401);
                    return gson.toJson(erro("Não autenticado"));
                }
                int eid = Integer.parseInt(req.params(":id"));
                boolean ok = exercicioDao.deletar(eid, userId(req));
                if (ok) {
                    return gson.toJson(respostaOk());
                }
                res.status(404);
                return gson.toJson(erro("Exercício não encontrado"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(erro(e.getMessage()));
            }
        });
    }
}
