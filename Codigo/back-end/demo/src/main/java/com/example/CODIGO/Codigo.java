package com.example.CODIGO;

// Classe Codigo para inicializar os valores da tabela no banco
public class Codigo 
{
    private int id;
    private String nome;
    private String email;
    private String linguagem;
}

// Contrutor para a classe codigo
public Codigo() {}

// Contrutor com a inicializacao dos atributos
public Codigo( int id, String nome, String email, String linguagem)
{
    this.id = id;
    this.nome = nome;
    this.email= email;
    this.linguagem = linguagem;
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

// Metodos getters and setters para linguagem

public String getlinguagem()
{
    return this.linguagem;
}

public void setlinguagem()
{
    this.linguagem = linguagem;
}

@Override
    public String toString() {
        return "Codigo {" +
               "nome='" + nome + '\'' +
               ", email='" + email + '\'' +
               ", id='" + id + '\'' +
               '}';
    }