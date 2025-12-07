package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Utils;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Disciplina;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Enums.TempoSala;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Turma;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.DisciplinaService;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.TurmaService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ImportarExcel {

    @Autowired
    private DisciplinaService disciplinaService;

    @Autowired
    private TurmaService turmaService;

    public record DadosDisciplinaJson(
            Integer codigoturma,
            String professor,
            String disciplina,
            Integer quantidade,
            Integer codigohorario) {
    }

    public record TurmaKey(
            Integer codigohorario,
            String professor) {

        // Must implement equals and hashCode for correct Map grouping
        @Override
        public boolean equals(Object o) {
            if (this == o)
                return true;
            if (o == null || getClass() != o.getClass())
                return false;
            TurmaKey turmaKey = (TurmaKey) o;
            // Handles null codigohorario correctly
            return java.util.Objects.equals(codigohorario, turmaKey.codigohorario) &&
                    java.util.Objects.equals(professor, turmaKey.professor);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(codigohorario, professor);
        }
    }

    /**
     * Recebe uma String JSON com os dados da tabela,
     * converte para objetos Disciplina e salva no banco de dados.
     *
     * @param jsonString A string JSON contendo a lista de disciplinas.
     * @return O número de disciplinas salvas com sucesso.
     */
    // 2. O método NÃO deve ser estático para acessar o campo não-estático
    // 'disciplinaService'.
    public int importarDadosJson(String jsonString) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<DadosDisciplinaJson> dadosJson;

        try {
            // 1. Deserializa o JSON
            dadosJson = objectMapper.readValue(jsonString, new TypeReference<List<DadosDisciplinaJson>>() {
            });
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
                System.err
                        .println("Erro ao salvar a disciplina: " + disciplina.getNome() + ". Erro: " + e.getMessage());
            }
        }

        // 3. Mapeia a lista de objetos auxiliares para a entidade Turma
        List<Turma> turmasParaSalvar = dadosJson.stream()
                .filter(d -> turmaService != null)
                .map(this::mapearParaTurma)
                .toList();

        List<Turma> turmasAgrupadas = agglutinateDisciplines(turmasParaSalvar);

        // 3. Salva as novas entidades Turma
        for (Turma turma : turmasAgrupadas) {
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
     * 
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
        turma.setDisciplina(disciplinaService.findDisciplinasByNome(dadosJson.disciplina));
        turma.setProfessor(dadosJson.professor);
        turma.setTurmaGrandeAntiga(false);
        turma.setCodigoHorario(dadosJson.codigohorario != null ? dadosJson.codigohorario : 0);
        turma.setQuantidadeAlunos(dadosJson.quantidade);
        return turma;
    }

    private List<Turma> agglutinateDisciplines(List<Turma> turmas) {
        // 1. Group the Turmas by the composite key (codigohorario + professor)
        // We filter out any record where the professor is null (unlikely, but safe)
        Map<TurmaKey, List<Turma>> groupedByCompositeKey = turmas.stream()
                .filter(t -> t.getProfessor() != null && t.getCodigoHorario() != 0)
                .collect(Collectors.groupingBy(t -> new TurmaKey(t.getCodigoHorario(), t.getProfessor())));

        // 2. Process each group to aggregate the data
        List<Turma> aggregatedTurmas = groupedByCompositeKey.values().stream()
                .map(group -> {
                    // A. Find the Turma with the HIGHEST original 'quantidade'
                    // This discipline name will be used for the final aggregated record.
                    Turma maxTurma = group.stream()
                            .max(Comparator.comparingInt(Turma::getQuantidadeAlunos))
                            .orElse(group.get(0));

                    // B. Calculate the TOTAL 'quantidade' for the entire group
                    int totalQuantidade = group.stream()
                            .mapToInt(Turma::getQuantidadeAlunos)
                            .sum();

                    // C. Create a NEW Turma record with the aggregated values
                    Turma aggregated = new Turma();
                    aggregated.setCodigoHorario(maxTurma.getCodigoHorario());
                    aggregated.setProfessor(maxTurma.getProfessor());

                    // Crucial step: Set the discipline from the 'maxTurma'
                    aggregated.setDisciplina(maxTurma.getDisciplina());

                    // Crucial step: Set the calculated total quantity
                    aggregated.setQuantidadeAlunos(totalQuantidade);

                    return aggregated;
                })
                .collect(Collectors.toList());

        List<Turma> turmasSemCodigoHorario = turmas.stream()
                .filter(t -> t.getProfessor() != null && t.getCodigoHorario() == 0)
                .collect(Collectors.toList());

        aggregatedTurmas.addAll(turmasSemCodigoHorario);

        return aggregatedTurmas;
    }
}