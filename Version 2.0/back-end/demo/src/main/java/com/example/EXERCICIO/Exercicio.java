package com.example.EXERCICIO;

import java.time.LocalDateTime;

public class Exercicio {

    private int id;
    private String numero;
    private String titulo;
    private String enunciado;
    private String entrada;
    private String saida;
    private String dificuldade;
    private String linguagem;
    private String status;
    private String solucao;
    private String observacoes;
    private LocalDateTime criadoEm;
    private int usuarioId;

    // ── Construtor vazio 
    public Exercicio() {
    }

    // ── Construtor completo 
   public Exercicio(int id, String numero, String titulo, String enunciado,
            String entrada, String saida, String dificuldade,
            String linguagem, String status, String solucao,
            String observacoes, LocalDateTime criadoEm, int usuarioId) {
        this.id = id;
        this.numero = numero;
        this.titulo = titulo;
        this.enunciado = enunciado;
        this.entrada = entrada;
        this.saida = saida;
        this.dificuldade = dificuldade;
        this.linguagem = linguagem;
        this.status = status;
        this.solucao = solucao;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm;
        this.usuarioId = usuarioId;
    }

    // ── Getters e Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getEntrada() {
        return entrada;
    }

    public void setEntrada(String entrada) {
        this.entrada = entrada;
    }

    public String getSaida() {
        return saida;
    }

    public void setSaida(String saida) {
        this.saida = saida;
    }

    public String getDificuldade() {
        return dificuldade;
    }

    public void setDificuldade(String dificuldade) {
        this.dificuldade = dificuldade;
    }

    public String getLinguagem() {
        return linguagem;
    }

    public void setLinguagem(String linguagem) {
        this.linguagem = linguagem;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSolucao() {
        return solucao;
    }

    public void setSolucao(String solucao) {
        this.solucao = solucao;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    @Override
    public String toString() {
        return "Exercicio {"
                + "id=" + id
                + ", numero='" + numero + '\''
                + ", titulo='" + titulo + '\''
                + ", dificuldade='" + dificuldade + '\''
                + ", status='" + status + '\''
                + ", usuarioId=" + usuarioId
                + '}';
    }
}
