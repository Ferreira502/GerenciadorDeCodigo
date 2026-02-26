
package com.example.MAIN;

import static spark.Spark.*;

import com.example.DAO.Codigo;
import com.example.DAO.Usuario;
import com.example.DAO.CodigoDao;
import com.example.DAO.UsuarioDAO;
import com.example.CODIGO.Codigo;
import com.example.USUARIO.Usuario;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import io.github.cdimascio.dotenv.Dotenv;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.lang.reflect.Type;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;

public class Main 
{
    private static void main(String[] args)
    {
        int porta = Integer.parseInt(dotenv.get("PORT", "4567"));

        // DAOs
        CodigoDao codigoDao = new CodigoDao();
        UsuarioDAO usuarioDao = new UsuarioDAO();

        Gson gson = new Gson();

        port(porta);

        System.out.println("  Armazenador De Codigo");

        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        });

        options("/*", (req, res) -> "OK");

        // EndPoints para usuario

        // criar novo usuario
        post("/usuario", (req, res) -> {
            res.type("application/json");
            try {
                Type mapType = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), mapType);

                int id = usuarioDao.cadastrarUsuario(
                        data.get("nome"),
                        data.get("email"),
                        data.get("senha"));

                JsonObject resposta = new JsonObject();
                resposta.addProperty("usuarioId", id);
                return gson.toJson(resposta);

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        
        // login do usuario
        post("/login/usuario", (req, res) -> {
            res.type("application/json");

            try {
                Type mapType = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), mapType);

                Usuario usuario = usuarioDao.loginUsuario(
                        data.get("email"),
                        data.get("senha"));

                if (usuario != null) {
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



        // atualizar usuario
        put("/usuario/:id", (req, res) -> 
        {
            res.type("application/json");
            try {
                int id = Integer.parseInt(req.params(":id"));
                Type mapType = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), mapType);

                boolean sucesso = usuarioDao.atualizarUsuario(
                        id,
                        data.get("nome"),
                        data.get("email"),
                        data.get("senha"));

                if (sucesso) 
                {
                    JsonObject resposta = new JsonObject();
                    resposta.addProperty("status", "ok");
                    resposta.addProperty("mensagem", "Usuario atualizado com sucesso");
                    return gson.toJson(resposta);
                } 
                else 
                {
                    res.status(404);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Usuario nao encontrado");
                    return gson.toJson(erro);
                }

            } 
            catch (Exception e) 
            {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        // buscar usuario por ID
        
        get("/usuario/:id", (req, res) -> 
        {
            res.type("application/json");
            try {
                int id = Integer.parseInt(req.params(":id"));
                Usuario usuario = usuarioDao.getUsuarioPorId(id);

                if (usuario != null) {
                    usuario.setSenha(null);
                    JsonObject resposta = new JsonObject();
                    resposta.addProperty("status", "ok");
                    resposta.add("usuario", gson.toJsonTree(usuario));
                    return gson.toJson(resposta);
                } else {
                    res.status(404);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Usuario nao encontrado");
                    return gson.toJson(erro);
                }

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });
    

    // buscar usuario por email
        get("/usuario/email/:email", (req, res) -> {
            res.type("application/json");
            try {
                String email = req.params(":email");
                Usuario usuario = usurioDao.getUsuarioPorEmail(email);

                if (usuario != null) {
                    usuario.setSenha(null);
                    JsonObject resposta = new JsonObject();
                    resposta.addProperty("status", "ok");
                    resposta.add("usuario", gson.toJsonTree(usuario));
                    return gson.toJson(resposta);
                } else {
                    res.status(404);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Usuario nao encontrado");
                    return gson.toJson(erro);
                }

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
 
        });

        // Endpoints de codigos

        // cadastra um novo codigo
        post("/codigos", (req, res) -> {
            res.type("application/json");

            try {
                Type mapType = new TypeToken<Map<String, String>>() {
                }.getType();
                Map<String, String> data = gson.fromJson(req.body(), mapType);

                int id = codigoDao.cadastrarCodigo(
                        data.get("nome"),
                        data.get("email"),
                        data.get("linguagem"));

                JsonObject resposta = new JsonObject();
                resposta.addProperty("codigoId", id);
                return gson.toJson(resposta);

            } catch (Exception e) {
                res.status(500);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", e.getMessage());
                return gson.toJson(erro);
            }
        });

        // retorna um codigo pelo ID
        get("/codigo/:id", (req, res) -> {
            res.type("application/json");

            try {
                int id = Integer.parseInt(req.params(":id"));
                Codigo codigo = codigoDao.getCodigoPorId(id);

                if (codigo != null) {
                    codigo.setSenha(null);
                    JsonObject resposta = new JsonObject();
                    resposta.addProperty("status", "ok");
                    resposta.add("codigo", gson.toJsonTree(codigo));
                    return gson.toJson(resposta);
                } else {
                    res.status(404);
                    JsonObject erro = new JsonObject();
                    erro.addProperty("erro", "Codigo nao encontrado");
                    return gson.toJson(erro);
                }

            } catch (NumberFormatException nfe) {
                res.status(400);
                JsonObject erro = new JsonObject();
                erro.addProperty("erro", "ID invalido");
                return gson.toJson(erro);
            }
        });
    } 
}
