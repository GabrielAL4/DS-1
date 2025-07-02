package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Controller;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Indisponibilidade;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Sala;
import java.util.List;

public class SalaComIndisponibilidadesResponse {
    private Sala sala;
    private List<Indisponibilidade> indisponibilidades;

    public SalaComIndisponibilidadesResponse(Sala sala, List<Indisponibilidade> indisponibilidades) {
        this.sala = sala;
        this.indisponibilidades = indisponibilidades;
    }

    public Sala getSala() {
        return sala;
    }

    public void setSala(Sala sala) {
        this.sala = sala;
    }

    public List<Indisponibilidade> getIndisponibilidades() {
        return indisponibilidades;
    }

    public void setIndisponibilidades(List<Indisponibilidade> indisponibilidades) {
        this.indisponibilidades = indisponibilidades;
    }
} 