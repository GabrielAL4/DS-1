package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Controller;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Enums.TempoSala;
import java.time.DayOfWeek;

public class IndisponibilidadeRequest {
    private DayOfWeek diaSemana;
    private TempoSala tempo;

    public IndisponibilidadeRequest() {}

    public IndisponibilidadeRequest(DayOfWeek diaSemana, TempoSala tempo) {
        this.diaSemana = diaSemana;
        this.tempo = tempo;
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