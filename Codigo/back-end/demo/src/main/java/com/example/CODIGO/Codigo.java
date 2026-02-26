package com.example.CODIGO;

// Classe Codigo para inicializar os valores da tabela no banco
public class Codigo 
{
    private int id;
    private String nome;
    private String usuario;
    private String linguagem;
}

// Contrutor para a classe codigo
public Codigo() {}

// Contrutor com a inicializacao dos atributos
public Codigo( int id, String nome, String usuario, String linguagem)
{
    this.id = id;
    this.nome = nome;
    this.usuario= usuario;
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

// Metodos getters and setters para usuario

public String getusuario()
{
    return this.usuario;
}

public void setusuario(String usuario)
{
    this.usuario = usuario;
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
               ", usuario='" + usuario + '\'' +
               ", id='" + id + '\'' +
               '}';
    }