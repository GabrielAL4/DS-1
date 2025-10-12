package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Controller;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.AlocacaoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Sala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Turma;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Enums.TempoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.AlocacaoSalaService;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.SalaService;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.TurmaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/alocacoes")
public class AlocacaoSalaController {

    @Autowired
    private AlocacaoSalaService alocacaoSalaService;

    @Autowired
    private SalaService salaService;

    @Autowired
    private TurmaService turmaService;

    @GetMapping
    public ResponseEntity<List<AlocacaoSala>> getAllAlocacoes() {
        return ResponseEntity.ok(alocacaoSalaService.getAllAlocacoes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlocacaoSala> getAlocacaoById(@PathVariable int id) {
        Optional<AlocacaoSala> alocacao = alocacaoSalaService.getAlocacaoById(id);
        return alocacao.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AlocacaoSala> createAlocacao(@RequestBody AlocacaoSala alocacao) {
        return new ResponseEntity<>(alocacaoSalaService.createAlocacao(alocacao), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlocacaoSala> updateAlocacaoSala(@PathVariable int id, @RequestBody @Valid AlocacaoSala updatedAlocacao) {
        AlocacaoSala result = alocacaoSalaService.updateAlocacao(id, updatedAlocacao);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlocacao(@PathVariable int id) {
        alocacaoSalaService.deleteAlocacao(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/alocar-turma")
    public ResponseEntity<?> alocarTurma(@RequestBody AlocacaoTurmaRequest request) {
        try {
            Turma turma = turmaService.getTurmaById(request.getTurmaId())
                    .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

            Sala sala = salaService.getSalaById(request.getSalaId())
                    .orElseThrow(() -> new RuntimeException("Sala não encontrada"));

            // *** CORRECTION HERE ***
            // If request.getDiaSemana() already returns a DayOfWeek enum:
            DayOfWeek diaSemana = request.getDiaSemana();

            // If request.getTempo() already returns a TempoSala enum:
            TempoSala tempo = request.getTempo();


            AlocacaoSala alocacao = new AlocacaoSala(sala, turma, diaSemana, tempo);
            AlocacaoSala saved = alocacaoSalaService.createAlocacao(alocacao);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar alocação: " + e.getMessage());
        }
    }
}