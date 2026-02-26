package com.example.USUARIO;

// Classe Usuario para inicializar os valores da tabela no banco
public class Usuario 
{
    private int id;
    private String nome;
    private String email;
    private String senha;
}

// Contrutor para a classe Usuario
public Usuario() {}

// Contrutor com a inicializacao dos atributos
public Usuario( int id, String nome, String email, String senha)
{
    this.id = id;
    this.nome = nome;
    this.email= email;
    this.senha = senha;
}

// Metodos getters and setters para os atributos

// Metodos getters and setters para id

public int getID()
{
    return this.id;
}

public void setID(int id)
{
    this.id = id;
}

// Metodos getters and setters para nome

public String getNome()
{
    return this.nome;
}

public void setNome(String nome)
{
    this.nome = nome;
}

// Metodos getters and setters para email

public String getEmail()
{
    return this.email;
}

public void setEmail(String email)
{
    this.email = email;
}

// Metodos getters and setters para senha

public String getSenha()
{
    return this.senha;
}

public void setSenha()
{
    this.senha = senha;
}

@Override
    public String toString() {
        return "Usuario {" +
               "nome='" + nome + '\'' +
               ", email='" + email + '\'' +
               ", id='" + id + '\'' +
               '}';
    }