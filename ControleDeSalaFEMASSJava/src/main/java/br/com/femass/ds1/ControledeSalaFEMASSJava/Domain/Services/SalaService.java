package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.AlocacaoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Enums.TempoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Indisponibilidade;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Sala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Repositories.AlocacaoSalaRepository;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Repositories.IndisponibilidadeRepository;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Repositories.SalaRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SalaService {

    private record DiaTempoKey(DayOfWeek diaSemana, TempoSala tempo) {}

    private static final Map<DiaTempoKey, DiaTempoKey> COMPLEMENTARY_MAP = new HashMap<>();

    static {
        // MONDAY, Tempo1 <-> TUESDAY, Tempo2
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.MONDAY, TempoSala.TEMPO1), new DiaTempoKey(DayOfWeek.TUESDAY, TempoSala.TEMPO2));
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.TUESDAY, TempoSala.TEMPO2), new DiaTempoKey(DayOfWeek.MONDAY, TempoSala.TEMPO1));

        // MONDAY, Tempo2 <-> TUESDAY, Tempo1
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.MONDAY, TempoSala.TEMPO2), new DiaTempoKey(DayOfWeek.TUESDAY, TempoSala.TEMPO1));
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.TUESDAY, TempoSala.TEMPO1), new DiaTempoKey(DayOfWeek.MONDAY, TempoSala.TEMPO2));

        // TUESDAY, Tempo3 <-> WEDNESDAY, Tempo3
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.TUESDAY, TempoSala.TEMPO3), new DiaTempoKey(DayOfWeek.WEDNESDAY, TempoSala.TEMPO3));
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.WEDNESDAY, TempoSala.TEMPO3), new DiaTempoKey(DayOfWeek.TUESDAY, TempoSala.TEMPO3));

        // WEDNESDAY, Tempo1 <-> THURSDAY, Tempo2
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.WEDNESDAY, TempoSala.TEMPO1), new DiaTempoKey(DayOfWeek.THURSDAY, TempoSala.TEMPO2));
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.THURSDAY, TempoSala.TEMPO2), new DiaTempoKey(DayOfWeek.WEDNESDAY, TempoSala.TEMPO1));

        // THURSDAY, Tempo1 <-> FRIDAY, Tempo2
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.THURSDAY, TempoSala.TEMPO1), new DiaTempoKey(DayOfWeek.FRIDAY, TempoSala.TEMPO2));
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.FRIDAY, TempoSala.TEMPO2), new DiaTempoKey(DayOfWeek.THURSDAY, TempoSala.TEMPO1));

        // THURSDAY, Tempo3 <-> FRIDAY, Tempo1
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.THURSDAY, TempoSala.TEMPO3), new DiaTempoKey(DayOfWeek.FRIDAY, TempoSala.TEMPO1));
        COMPLEMENTARY_MAP.put(new DiaTempoKey(DayOfWeek.FRIDAY, TempoSala.TEMPO1), new DiaTempoKey(DayOfWeek.THURSDAY, TempoSala.TEMPO3));
    }

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private AlocacaoSalaRepository alocacaoSalaRepository;

    @Autowired
    private IndisponibilidadeRepository indisponibilidadeRepository;

    public List<Sala> getAllSalas() {
        return salaRepository.findAll();
    }

    public Optional<Sala> getSalaById(int id) {
        return salaRepository.findById(id);
    }

    public Sala createSala(Sala sala) {
        return salaRepository.save(sala);
    }

    @Transactional
    public Sala updateSala(int id, Sala updatedSala) {
        Sala existingSala = salaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala não encontrada com o ID: " + id));

        existingSala.setBloco(updatedSala.getBloco());
        existingSala.setNumero(updatedSala.getNumero());
        existingSala.setCapacidadeMaxima(updatedSala.getCapacidadeMaxima());
        existingSala.setPossuiLaboratorio(updatedSala.getPossuiLaboratorio());
        existingSala.setPossuiArCondicionado(updatedSala.getPossuiArCondicionado());
        existingSala.setPossuiLousaDigital(updatedSala.getPossuiLousaDigital());
        return salaRepository.save(existingSala);
    }

    public void deleteSala(int id) {
        salaRepository.deleteById(id);
    }


    public List<Sala> getSalasDisponiveisParaAlocacao(DayOfWeek diaSemana, TempoSala tempo) {
        DiaTempoKey outroDiaDoHorario = COMPLEMENTARY_MAP.get(new DiaTempoKey(diaSemana, tempo));
        List<Sala> todasSalas = salaRepository.findAll();
        List<AlocacaoSala> todasAlocacoes = alocacaoSalaRepository.findByDiaSemanaAndTempo(diaSemana, tempo);
        List<Indisponibilidade> indisponibilidadesNoPeriodo = indisponibilidadeRepository.findByDiaSemanaAndTempo(diaSemana, tempo);
        List<Indisponibilidade> indisponibilidadesNoOutroHorario = indisponibilidadeRepository.findByDiaSemanaAndTempo(outroDiaDoHorario.diaSemana, outroDiaDoHorario.tempo);
        indisponibilidadesNoPeriodo.addAll(indisponibilidadesNoOutroHorario);
        System.out.println(indisponibilidadesNoPeriodo);
        return todasSalas.stream()
                .filter(sala -> indisponibilidadesNoPeriodo.stream()
                        .noneMatch(indisponibilidade -> indisponibilidade.getSala().getId() == sala.getId()))
                .filter(sala -> todasAlocacoes.stream()
                        .noneMatch(alocacao -> alocacao.getSala().getId() == sala.getId()))
                .collect(Collectors.toList());
    }
}