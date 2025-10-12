package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "tb_disciplina")
public class Disciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_disciplina")
    private int id;

    @NotBlank(message = "nome da disciplina é obrigatório")
    @Column(name = "nome_disciplina")
    private String nome;

    @NotNull(message = "informação sobre laboratório é obrigatória")
    @Column(name = "laboratorio")
    private boolean necessitaLaboratiorio;

    @NotNull(message = "informação sobre ar-condicionado é obrigatória")
    @Column(name = "ar_condicionado")
    private boolean necessitaArCondicionado;

    @NotNull(message = "informação sobre lousa é obrigatória")
    @Column(name = "lousa_digital")
    private boolean necessitaLousaDigital;

    @OneToMany(mappedBy = "disciplina", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<AlocacaoSala> alocacoes;

    @ManyToOne
    @JoinColumn(name = "id_turma")
    @JsonBackReference
    private Turma turma;

    // Getters e Setters

    public int getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public boolean getNecessitaLaboratiorio() {
        return necessitaLaboratiorio;
    }

    public void setNecessitaLaboratiorio(boolean necessitaLaboratiorio) {
        this.necessitaLaboratiorio = necessitaLaboratiorio;
    }

    public boolean getNecessitaArCondicionado() {
        return necessitaArCondicionado;
    }

    public void setNecessitaArCondicionado(boolean necessitaArCondicionado) {
        this.necessitaArCondicionado = necessitaArCondicionado;
    }

    public boolean getNecessitaLousaDigital() {
        return necessitaLousaDigital;
    }

    public void setNecessitaLousaDigital(boolean necessitaLousaDigital) {
        this.necessitaLousaDigital = necessitaLousaDigital;
    }

    public List<AlocacaoSala> getAlocacoes() {
        return alocacoes;
    }

    public void setAlocacoes(List<AlocacaoSala> alocacoes) {
        this.alocacoes = alocacoes;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }

    @Override
    public String toString() {
        return "Disciplina{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", necessitaLaboratiorio=" + necessitaLaboratiorio +
                ", necessitaArCondicionado=" + necessitaArCondicionado +
                ", necessitaLousaDigital=" + necessitaLousaDigital +
                '}';
    }
}
