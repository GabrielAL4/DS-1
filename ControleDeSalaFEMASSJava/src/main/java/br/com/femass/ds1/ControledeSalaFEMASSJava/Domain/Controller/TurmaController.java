package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Controller;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.AlocacaoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Disciplina;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Enums.TempoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Sala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Turma;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.AlocacaoSalaService;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.DisciplinaService;
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
@RequestMapping("/Turma")
public class TurmaController {

    @Autowired
    private TurmaService turmaService;

    @Autowired
    private SalaService salaService;

    @Autowired
    private AlocacaoSalaService alocacaoSalaService;

    @Autowired
    private DisciplinaService disciplinaService;

    // DTO para criação de turma
    public static class CreateTurmaRequest {
        private String professor;
        private String disciplina; // Nome da disciplina como string
        private int quantidadeAlunos;
        private int codigoHorario;
        private boolean turmaGrandeAntiga;

        // Getters e Setters
        public String getProfessor() { return professor; }
        public void setProfessor(String professor) { this.professor = professor; }
        
        public String getDisciplina() { return disciplina; }
        public void setDisciplina(String disciplina) { this.disciplina = disciplina; }
        
        public int getQuantidadeAlunos() { return quantidadeAlunos; }
        public void setQuantidadeAlunos(int quantidadeAlunos) { this.quantidadeAlunos = quantidadeAlunos; }
        
        public int getCodigoHorario() { return codigoHorario; }
        public void setCodigoHorario(int codigoHorario) { this.codigoHorario = codigoHorario; }
        
        public boolean getTurmaGrandeAntiga() { return turmaGrandeAntiga; }
        public void setTurmaGrandeAntiga(boolean turmaGrandeAntiga) { this.turmaGrandeAntiga = turmaGrandeAntiga; }
    }

    @GetMapping
    public ResponseEntity<List<Turma>> getAllTurmas() {
        List<Turma> turmas = turmaService.getAllTurmas();
        return new ResponseEntity<>(turmas, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Turma> getTurmaById(@PathVariable int id) {
        Optional<Turma> turma = turmaService.getTurmaById(id);
        return turma.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Turma> createTurma(@RequestBody CreateTurmaRequest request) {
        try {
            System.out.println("Recebendo request para criar turma: " + request.getProfessor() + " - " + request.getDisciplina());
            
            // Buscar ou criar a disciplina
            Disciplina disciplina;
            Optional<Disciplina> disciplinaExistente = disciplinaService.getAllDisciplinas()
                .stream()
                .filter(d -> d.getNome().equalsIgnoreCase(request.getDisciplina()))
                .findFirst();
            
            if (disciplinaExistente.isPresent()) {
                disciplina = disciplinaExistente.get();
                System.out.println("Disciplina existente encontrada: " + disciplina.getNome());
            } else {
                // Criar nova disciplina
                Disciplina novaDisciplina = new Disciplina();
                novaDisciplina.setNome(request.getDisciplina());
                novaDisciplina.setNecessitaLaboratiorio(false);
                novaDisciplina.setNecessitaArCondicionado(false);
                novaDisciplina.setNecessitaLousaDigital(false);
                disciplina = disciplinaService.createDisciplina(novaDisciplina);
                System.out.println("Nova disciplina criada: " + disciplina.getNome());
            }
            
            // Criar a turma
            Turma turma = new Turma();
            turma.setProfessor(request.getProfessor());
            turma.setDisciplina(disciplina);
            turma.setQuantidadeAlunos(request.getQuantidadeAlunos());
            turma.setCodigoHorario(request.getCodigoHorario());
            turma.setTurmaGrandeAntiga(request.getTurmaGrandeAntiga());
            
            System.out.println("Criando turma com código de horário: " + request.getCodigoHorario());
            
            Turma savedTurma = turmaService.createTurma(turma);
            System.out.println("Turma criada com sucesso: " + savedTurma.getId());
            return new ResponseEntity<>(savedTurma, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Erro ao criar turma: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/alocar-turma")
    public ResponseEntity<AlocacaoSala> alocarTurma(@RequestBody AlocacaoTurmaRequest request) {
        Turma turma = turmaService.getTurmaById(request.getTurmaId()).orElseThrow();
        Sala sala = salaService.getSalaById(request.getSalaId()).orElseThrow();
        AlocacaoSala alocacaoSala = new AlocacaoSala(sala, turma, request.getDiaSemana(), request.getTempo());
        alocacaoSalaService.createAlocacao(alocacaoSala);
        return new ResponseEntity<>(alocacaoSala, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Turma> updateTurma(@PathVariable int id, @RequestBody @Valid Turma updatedTurma) {
        Turma turma = turmaService.updateTurma(id, updatedTurma);
        return ResponseEntity.ok(turma);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTurma(@PathVariable int id) {
        turmaService.deleteTurma(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/deletar-alocacao/{id}")
    public ResponseEntity<Void> deletarAlocacao(@PathVariable int id) {
        alocacaoSalaService.deleteAlocacao(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/disciplina/{disciplinaId}")
    public ResponseEntity<List<Turma>> getTurmasByDisciplina(@PathVariable int disciplinaId) {
         Disciplina disciplina = disciplinaService.getDisciplinaById(disciplinaId).orElse(null);
         if (disciplina == null) {
             return new ResponseEntity<>(HttpStatus.NOT_FOUND);
         }
         List<Turma> turmas = turmaService.getTurmasByDisciplina(disciplina);
         return new ResponseEntity<>(turmas, HttpStatus.OK);
    }
}
