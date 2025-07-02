package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Controller;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Enums.TempoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Indisponibilidade;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Sala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.IndisponibilidadeService;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.SalaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Sala")
public class SalaController {

    @Autowired
    private SalaService salaService;

    @Autowired
    private IndisponibilidadeService indisponibilidadeService;

    @GetMapping
    public ResponseEntity<List<Sala>> getAllSalas() {
        List<Sala> salas = salaService.getAllSalas();
        return new ResponseEntity<>(salas, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sala> getSalaById(@PathVariable int id) {
        Optional<Sala> sala = salaService.getSalaById(id);
        return sala.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/{id}/com-indisponibilidades")
    public ResponseEntity<SalaComIndisponibilidadesResponse> getSalaWithIndisponibilidades(@PathVariable int id) {
        Optional<Sala> salaOpt = salaService.getSalaById(id);
        if (salaOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Sala sala = salaOpt.get();
        List<Indisponibilidade> indisponibilidades = indisponibilidadeService.getIndisponibilidadesBySala(sala);
        SalaComIndisponibilidadesResponse response = new SalaComIndisponibilidadesResponse(sala, indisponibilidades);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/obter-salas-disponiveis")
    public ResponseEntity<List<Sala>> getSalasDisponiveisParaAlocacao(
            @RequestParam("diaSemana") DayOfWeek diaSemana,
            @RequestParam("tempo") TempoSala tempo) {
        List<Sala> salas = salaService.getSalasDisponiveisParaAlocacao(diaSemana, tempo);
        return new ResponseEntity<>(salas, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Sala> createSala(@Valid @RequestBody Sala sala) {
        Sala savedSala = salaService.createSala(sala);
        return new ResponseEntity<>(savedSala, HttpStatus.CREATED);
    }

    @PostMapping("/{idSala}/indisponibilidade")
    public ResponseEntity<Indisponibilidade> createIndisponibilidade(@PathVariable int idSala, @RequestBody IndisponibilidadeRequest request) {
        Sala sala = salaService.getSalaById(idSala).orElseThrow();
        Indisponibilidade indisponibilidade = new Indisponibilidade(sala, request.getDiaSemana(), request.getTempo());
        Indisponibilidade savedIndisponibilidade = indisponibilidadeService.createIndisponibilidade(indisponibilidade);
        return new ResponseEntity<>(savedIndisponibilidade, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sala> updateSala(@PathVariable int id, @RequestBody @Valid Sala updatedSala) {
        Sala sala = salaService.updateSala(id, updatedSala);
        return ResponseEntity.ok(sala);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSala(@PathVariable int id) {
        salaService.deleteSala(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{id}/indisponibilidade/{indisponibilidadeId}")
    public ResponseEntity<Void> deleteSala(@PathVariable int id, @PathVariable int indisponibilidadeId) {
        indisponibilidadeService.deleteIndisponibilidade(indisponibilidadeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
