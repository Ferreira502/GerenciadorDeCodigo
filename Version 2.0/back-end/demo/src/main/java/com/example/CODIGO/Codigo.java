package com.example.CODIGO;

import java.time.LocalDateTime;

public class Codigo {
    private int id;
    private String titulo;
    private String linguagem;
    private String descricao;
    private String codigo;
    private LocalDateTime criadoEm;
    private int usuarioId;

    // Construtor vazio
    public Codigo() {}

    // Construtor completo
    public Codigo(int id, String titulo, String linguagem, String descricao, 
                  String codigo, LocalDateTime criadoEm, int usuarioId) {
        this.id = id;
        this.titulo = titulo;
        this.linguagem = linguagem;
        this.descricao = descricao;
        this.codigo = codigo;
        this.criadoEm = criadoEm;
        this.usuarioId = usuarioId;
    }

    // Getters e Setters
    public int getId() {
        return this.id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitulo() {
        return this.titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getLinguagem() {
        return this.linguagem;
    }

    public void setLinguagem(String linguagem) {
        this.linguagem = linguagem;
    }

    public String getDescricao() {
        return this.descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCodigo() {
        return this.codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public LocalDateTime getCriadoEm() {
        return this.criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public int getUsuarioId() {
        return this.usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    @Override
    public String toString() {
        return "Codigo {" +
               "id=" + id +
               ", titulo='" + titulo + '\'' +
               ", linguagem='" + linguagem + '\'' +
               ", usuarioId=" + usuarioId +
               '}';
    }
}