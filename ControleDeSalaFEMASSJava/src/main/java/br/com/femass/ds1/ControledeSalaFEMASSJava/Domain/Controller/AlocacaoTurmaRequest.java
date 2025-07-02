package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Controller;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Enums.TempoSala;
import java.time.DayOfWeek;

public class AlocacaoTurmaRequest {
    private int turmaId;
    private int salaId;
    private DayOfWeek diaSemana;
    private TempoSala tempo;

    public AlocacaoTurmaRequest() {
    }

    public AlocacaoTurmaRequest(int turmaId, int salaId, DayOfWeek diaSemana, TempoSala tempo) {
        this.turmaId = turmaId;
        this.salaId = salaId;
        this.diaSemana = diaSemana;
        this.tempo = tempo;
    }

    public int getTurmaId() {
        return turmaId;
    }

    public void setTurmaId(int turmaId) {
        this.turmaId = turmaId;
    }

    public int getSalaId() {
        return salaId;
    }

    public void setSalaId(int salaId) {
        this.salaId = salaId;
    }

    public DayOfWeek getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(DayOfWeek diaSemana) {
        this.diaSemana = diaSemana;
    }

    public TempoSala getTempo() {
        return tempo;
    }

    public void setTempo(TempoSala tempo) {
        this.tempo = tempo;
    }
} 