package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "tb_turma")
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_turma")
    private int id;

    @NotBlank(message="Professor é obrigatório")
    @Column(name="professor")
    private String professor;

    @ManyToOne
    @JoinColumn(name = "id_disciplina")
    private Disciplina disciplina;

    @Min(value = 1,message="Alunos deve ser maior que 0")
    @Column(name="quantidade_alunos")
    private int quantidadeAlunos;

    @Min(value = 1,message="Horário deve ser maior que 0")
    @Max(value = 53,message="Horário deve ser menor ou igual a 53")
    @Column(name="codigo_horario")
    private int codigoHorario;

    @NotNull(message="Informação sobre grade antiga é obrigatória")
    @Column(name="turma_grade_antiga")
    private boolean turmaGrandeAntiga;

    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<AlocacaoSala> alocacoes;

    public int getId() {
        return id;
    }

    public @NotBlank(message = "Professor é obrigatório") String getProfessor() {
        return professor;
    }

    public void setProfessor(@NotBlank(message = "Professor é obrigatório") String professor) {
        this.professor = professor;
    }

    public Disciplina getDisciplina() {
        return disciplina;
    }

    public void setDisciplina(Disciplina disciplina) {
        this.disciplina = disciplina;
    }

    @Min(value = 1, message = "Alunos deve ser maior que 0")
    public int getQuantidadeAlunos() {
        return quantidadeAlunos;
    }

    public void setQuantidadeAlunos(@Min(value = 1, message = "Alunos deve ser maior que 0") int quantidadeAlunos) {
        this.quantidadeAlunos = quantidadeAlunos;
    }

    @Min(value = 1, message = "Horário deve ser maior que 0")
    @Max(value = 53, message = "Horário deve ser menor ou igual a 53")
    public int getCodigoHorario() {
        return codigoHorario;
    }

    public void setCodigoHorario(@Min(value = 1, message = "Horário deve ser maior que 0") @Max(value = 53, message = "Horário deve ser menor ou igual a 53") int codigoHorario) {
        this.codigoHorario = codigoHorario;
    }

    @NotNull(message = "Informação sobre grade antiga é obrigatória")
    public boolean getTurmaGrandeAntiga() {
        return turmaGrandeAntiga;
    }

    public void setTurmaGrandeAntiga(@NotNull(message = "Informação sobre grade antiga é obrigatória") boolean turmaGrandeAntiga) {
        this.turmaGrandeAntiga = turmaGrandeAntiga;
    }

    public List<AlocacaoSala> getAlocacoes() {
        return alocacoes;
    }

    public void setAlocacoes(List<AlocacaoSala> alocacoes) {
        this.alocacoes = alocacoes;
    }

    @Override
    public String toString() {
        return "Turma{" +
                "id=" + id +
                ", professor='" + professor + '\'' +
                ", disciplina=" + disciplina +
                ", quantidadeAlunos=" + quantidadeAlunos +
                ", codigoHorario=" + codigoHorario +
                ", turmaGrandeAntiga=" + turmaGrandeAntiga +
                '}';
    }

    //    private List<Turma> turmasGradeAntiga;
//
//    private int turmaId;
//
//    private int totalQuantidadeAlunosAgrupados;

    //private List<AlocacaoSala> alocacoes;

}
