package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Utils;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Disciplina;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Turma;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.DisciplinaService;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.TurmaService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImportarExcel {

    @Autowired
    private DisciplinaService disciplinaService;

    @Autowired
    private TurmaService turmaService;

    public record DadosDisciplinaJson(
            int codigoturma,
            String professor,
            String disciplina,
            int quantidade,
            int codigohorario
    ) {}

    /**
     * Recebe uma String JSON com os dados da tabela,
     * converte para objetos Disciplina e salva no banco de dados.
     *
     * @param jsonString A string JSON contendo a lista de disciplinas.
     * @return O número de disciplinas salvas com sucesso.
     */
    // 2. O método NÃO deve ser estático para acessar o campo não-estático 'disciplinaService'.
    public int importarDadosJson(String jsonString) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<DadosDisciplinaJson> dadosJson;

        try {
            // 1. Deserializa o JSON
            dadosJson = objectMapper.readValue(jsonString, new TypeReference<List<DadosDisciplinaJson>>() {});
        } catch (JsonProcessingException e) {
            System.err.println("Erro ao processar JSON: " + e.getMessage());
            return 0;
        }

        // 2. Mapeia a lista de objetos auxiliares para a entidade Disciplina
        List<Disciplina> disciplinasParaSalvar = dadosJson.stream()
                .filter(d -> disciplinaService != null && disciplinaService.findDisciplinaByNome(d.disciplina) == null)
                .map(this::mapearParaDisciplina)
                .toList();

        // 3. Salva as novas entidades Disciplina
        for (Disciplina disciplina : disciplinasParaSalvar) {
            try {
                // Chamada ao serviço para persistir o objeto
                if (disciplinaService != null) {
                    disciplinaService.createDisciplina(disciplina);
                }
            } catch (Exception e) {
                System.err.println("Erro ao salvar a disciplina: " + disciplina.getNome() + ". Erro: " + e.getMessage());
            }
        }

        // 3. Mapeia a lista de objetos auxiliares para a entidade Turma
        List<Turma> turmasParaSalvar = dadosJson.stream()
                .filter(d -> turmaService != null)
                .map(this::mapearParaTurma)
                .toList();

        // 3. Salva as novas entidades Turma
        for (Turma turma : turmasParaSalvar) {
            try {
                // Chamada ao serviço para persistir o objeto
                if (turmaService != null) {
                    turmaService.createTurma(turma);
                }
            } catch (Exception e) {
                System.err.println("Erro ao salvar a turma: " + turma.getId() + ". Erro: " + e.getMessage());
            }
        }

        return Math.min(disciplinasParaSalvar.size(), turmasParaSalvar.size());
    }

    /**
     * Mapeia um objeto DadosDisciplinaJson para a entidade Disciplina.
     * @param dadosJson O objeto com os dados do JSON.
     * @return A entidade Disciplina criada.
     */
    private Disciplina mapearParaDisciplina(DadosDisciplinaJson dadosJson) {
        Disciplina disciplina = new Disciplina();
        disciplina.setNome(dadosJson.disciplina);
        disciplina.setNecessitaLaboratiorio(false);
        disciplina.setNecessitaArCondicionado(false);
        disciplina.setNecessitaLousaDigital(false);

        return disciplina;
    }

    private Turma mapearParaTurma(DadosDisciplinaJson dadosJson) {
        Turma turma = new Turma();
        turma.setDisciplina(disciplinaService.findDisciplinaByNome(dadosJson.disciplina));
        turma.setProfessor(dadosJson.professor);
        turma.setTurmaGrandeAntiga(false);
        turma.setCodigoHorario(dadosJson.codigohorario);
        turma.setQuantidadeAlunos(dadosJson.quantidade);
        return turma;
    }
}