package com.example.MAIN;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.example.CODIGO.Codigo;
import com.example.DAO.CodigoDAO;
import com.example.DAO.UsuarioDAO;
import com.example.USUARIO.Usuario;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import io.github.cdimascio.dotenv.Dotenv;
import static spark.Spark.before;
import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.options;
import static spark.Spark.port;
import static spark.Spark.post;

public class Main {

    private static class LocalDateTimeAdapter extends com.google.gson.TypeAdapter<LocalDateTime> {

        @Override
        public void write(com.google.gson.stream.JsonWriter out, LocalDateTime value) throws java.io.IOException {
            if (value == null) {
                out.nullValue();
            } else {
                out.value(value.toString());
            }
        }

        @Override
        public LocalDateTime read(com.google.gson.stream.JsonReader in) throws java.io.IOException {
            if (in.peek() == com.google.gson.stream.JsonToken.NULL) {
                in.nextNull();
                return null;
            }
            return LocalDateTime.parse(in.nextString());
        }
    }

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        int porta = Integer.parseInt(dotenv.get("PORT", "8080"));

        CodigoDAO codigoDao = new CodigoDAO();
        UsuarioDAO usuarioDao = new UsuarioDAO();

        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter())
                .create();

        port(porta);

        System.out.println("Servidor rodando na porta " + porta);

        // CORS
        before((req, res) -> {
            String origin = req.headers("Origin");
            if (origin != null && (origin.contains("localhost") ||
                    origin.contains("127.0.0.1") ||
                    origin.contains("vercel.app")
            )) {
                res.header("Access-Control-Allow-Origin", origin);
            }
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
            res.header("Access-Control-Allow-Credentials", "true");
        });

        options("/*", (req, res) -> "OK");

        // Cadastro
        post("/api/auth/cadastro", (req, res) -> {
            System.out.println("Recebendo requisição de cadastro...");
            res.type("application/json");
            try {
                Type mapType = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), mapType);

                String nome = data.get("nome");
                String email = data.get("email");
                String senha = data.get("senha");

                if (nome == null || email == null || senha == null) {
                    res.status(400);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Campos obrigatórios faltando");
                    return gson.toJson(erro);
                }

                Usuario existente = usuarioDao.getUsuarioPorEmail(email);
                if (existente != null) {
                    res.status(409);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Email já cadastrado");
                    return gson.toJson(erro);
                }

                int id = usuarioDao.cadastrarUsuario(nome, email, senha);

                if (id > 0) {
                    Usuario usuario = new Usuario(id, nome, email, null);
                    res.cookie("/", "userId", String.valueOf(id), 86400, false, false);

                    JsonObject resposta = new JsonObject();
                    resposta.addProperty("status", "ok");
                    resposta.add("usuario", gson.toJsonTree(usuario));
                    return gson.toJson(resposta);
                } else {
                    res.status(500);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Erro ao criar usuário");
                    return gson.toJson(erro);
                }

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        // Login
        post("/api/auth/login", (req, res) -> {
            res.type("application/json");
            try {
                Type mapType = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), mapType);

                String email = data.get("email");
                String senha = data.get("senha");

                Usuario usuario = usuarioDao.loginUsuario(email, senha);

                if (usuario != null) {
                    // FIX: cookie com path "/" e maxAge de 1 dia (86400s)
                    res.cookie("/", "userId", String.valueOf(usuario.getId()), 86400, false, false);

                    usuario.setSenha(null);
                    JsonObject resposta = new JsonObject();
                    resposta.addProperty("status", "ok");
                    resposta.add("usuario", gson.toJsonTree(usuario));
                    return gson.toJson(resposta);
                } else {
                    res.status(401);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Email ou senha incorretos");
                    return gson.toJson(erro);
                }

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        // Logout
        post("/api/auth/logout", (req, res) -> {
            res.removeCookie("/", "userId");
            JsonObject resposta = new JsonObject();
            resposta.addProperty("status", "ok");
            return gson.toJson(resposta);
        });

        // Usuario logado
        get("/api/auth/me", (req, res) -> {
            res.type("application/json");
            try {
                String userIdCookie = req.cookie("userId");
                if (userIdCookie == null) {
                    res.status(401);
                    return "{}";
                }

                int userId = Integer.parseInt(userIdCookie);
                Usuario usuario = usuarioDao.getUsuarioPorId(userId);

                if (usuario != null) {
                    usuario.setSenha(null);
                    return gson.toJson(usuario);
                } else {
                    res.status(401);
                    return "{}";
                }

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        // Listar codigos do usuario logado
        get("/api/codigos", (req, res) -> {
            res.type("application/json");
            try {
                String userIdCookie = req.cookie("userId");
                if (userIdCookie == null) {
                    res.status(401);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Não autenticado");
                    return gson.toJson(erro);
                }

                int userId = Integer.parseInt(userIdCookie);
                List<Codigo> codigos = codigoDao.listarCodigosPorUsuario(userId);
                return gson.toJson(codigos);

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        // Criar codigo
        post("/api/codigos", (req, res) -> {
            res.type("application/json");
            try {
                String userIdCookie = req.cookie("userId");
                if (userIdCookie == null) {
                    res.status(401);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Não autenticado");
                    return gson.toJson(erro);
                }

                int userId = Integer.parseInt(userIdCookie);

                Type mapType = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), mapType);

                String titulo = data.get("titulo");
                String linguagem = data.get("linguagem");
                String descricao = data.get("descricao");
                String codigo = data.get("codigo");

                if (titulo == null || linguagem == null || codigo == null) {
                    res.status(400);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Campos obrigatórios faltando");
                    return gson.toJson(erro);
                }

                int id = codigoDao.cadastrarCodigo(titulo, linguagem, descricao, codigo, userId);

                if (id > 0) {
                    Codigo novoCodigo = codigoDao.getCodigoPorId(id);
                    return gson.toJson(novoCodigo);
                } else {
                    res.status(500);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Erro ao salvar código");
                    return gson.toJson(erro);
                }

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        // Deletar codigo
        delete("/api/codigos/:id", (req, res) -> {
            res.type("application/json");
            try {
                String userIdCookie = req.cookie("userId");
                if (userIdCookie == null) {
                    res.status(401);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Não autenticado");
                    return gson.toJson(erro);
                }

                int userId = Integer.parseInt(userIdCookie);
                int codigoId = Integer.parseInt(req.params(":id"));

                boolean sucesso = codigoDao.deletarCodigo(codigoId, userId);

                if (sucesso) {
                    JsonObject resposta = new JsonObject();
                    resposta.addProperty("status", "ok");
                    return gson.toJson(resposta);
                } else {
                    res.status(404);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Código não encontrado");
                    return gson.toJson(erro);
                }

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });
    }
}
