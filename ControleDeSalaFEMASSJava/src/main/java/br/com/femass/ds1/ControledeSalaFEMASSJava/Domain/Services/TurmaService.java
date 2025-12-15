package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Disciplina;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Turma;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Repositories.TurmaRepository;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Services.DisciplinaService;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
public class TurmaService {

    private final TurmaRepository turmaRepository;
    
    @Autowired
    private DisciplinaService disciplinaService;
    
    @Autowired
    private EntityManager entityManager;

    @Autowired
    public TurmaService(TurmaRepository turmaRepository) {
        this.turmaRepository = turmaRepository;
    }

    public List<Turma> getAllTurmas() {
        return turmaRepository.findAllWithAlocacoes();
    }

    public Optional<Turma> getTurmaById(int id) {
        return turmaRepository.findByIdWithAlocacoes(id);
    }

    public Turma createTurma(Turma turma) {
        return turmaRepository.save(turma);
    }

    @Transactional
    public Turma updateTurma(int id, Turma turmaAtualizada) {
        Turma existingTurma = turmaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Turma não encontrada com o ID: " + id));

        existingTurma.setProfessor(turmaAtualizada.getProfessor());
        existingTurma.setDisciplina(turmaAtualizada.getDisciplina());
        existingTurma.setQuantidadeAlunos(turmaAtualizada.getQuantidadeAlunos());
        existingTurma.setCodigoHorario(turmaAtualizada.getCodigoHorario());
        existingTurma.setTurmaGrandeAntiga(turmaAtualizada.getTurmaGrandeAntiga());
        return turmaRepository.save(existingTurma);
    }

    public void deleteTurma(int id) {
        turmaRepository.deleteById(id);
    }

    public List<Turma> getTurmasByDisciplina(Disciplina disciplina) {
        return turmaRepository.findByDisciplina(disciplina);
    }

    @Transactional
    public List<Turma> importarTurmasDoExcel(MultipartFile file) throws Exception {
        List<Turma> turmasCriadas = new ArrayList<>();
        
        System.out.println("=== INICIANDO IMPORTAÇÃO DE EXCEL ===");
        System.out.println("Nome do arquivo: " + file.getOriginalFilename());
        System.out.println("Tamanho do arquivo: " + file.getSize() + " bytes");
        
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            System.out.println("Nome da planilha: " + sheet.getSheetName());
            System.out.println("Número de linhas: " + sheet.getLastRowNum() + 1);
            
            Iterator<Row> rowIterator = sheet.iterator();
            
            // Ler cabeçalho para mapear colunas
            Row headerRow = null;
            if (rowIterator.hasNext()) {
                headerRow = rowIterator.next();
            }
            
            // Mapear índices das colunas
            int colProfessor = -1;
            int colDisciplina = -1;
            int colQuantidade = -1;
            int colCodigoHorario = -1;
            
            System.out.println("=== MAPEANDO COLUNAS ===");
            if (headerRow != null) {
                for (Cell cell : headerRow) {
                    String headerValue = getCellValueAsString(cell);
                    String headerValueLower = headerValue.toLowerCase();
                    int colIndex = cell.getColumnIndex();
                    
                    System.out.println("Coluna " + colIndex + ": '" + headerValue + "'");
                    
                    if (headerValueLower.contains("professor")) {
                        colProfessor = colIndex;
                        System.out.println("  -> Mapeada como PROFESSOR");
                    } else if (headerValueLower.contains("disciplina")) {
                        colDisciplina = colIndex;
                        System.out.println("  -> Mapeada como DISCIPLINA");
                    } else if (headerValueLower.contains("quantidade") || headerValueLower.contains("qtd") || headerValueLower.contains("alunos")) {
                        colQuantidade = colIndex;
                        System.out.println("  -> Mapeada como QUANTIDADE");
                    } else if (headerValueLower.contains("codigohorario") || 
                               (headerValueLower.contains("horario") && !headerValueLower.contains("codigoturma")) ||
                               headerValueLower.contains("codhorario")) {
                        colCodigoHorario = colIndex;
                        System.out.println("  -> Mapeada como CODIGO_HORARIO");
                    }
                }
            }
            
            // Se não encontrou pelos nomes, usar índices padrão (assumindo ordem: codigoturma, professor, disciplina, quantidade, codigohorario)
            if (colProfessor == -1) {
                colProfessor = 1;
                System.out.println("PROFESSOR não encontrado, usando índice padrão: 1");
            }
            if (colDisciplina == -1) {
                colDisciplina = 2;
                System.out.println("DISCIPLINA não encontrada, usando índice padrão: 2");
            }
            if (colQuantidade == -1) {
                colQuantidade = 3;
                System.out.println("QUANTIDADE não encontrada, usando índice padrão: 3");
            }
            if (colCodigoHorario == -1) {
                colCodigoHorario = 4;
                System.out.println("CODIGO_HORARIO não encontrado, usando índice padrão: 4");
            }
            
            System.out.println("=== PROCESSANDO LINHAS ===");
            
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                
                // Verificar se a linha está vazia
                if (isRowEmpty(row)) {
                    continue;
                }
                
                try {
                    // Ler os dados da linha usando os índices mapeados
                    Cell cellProfessor = row.getCell(colProfessor);
                    Cell cellDisciplina = row.getCell(colDisciplina);
                    Cell cellQuantidade = row.getCell(colQuantidade);
                    Cell cellCodigoHorario = row.getCell(colCodigoHorario);
                    
                    String professor = getCellValueAsString(cellProfessor);
                    String nomeDisciplina = getCellValueAsString(cellDisciplina);
                    double quantidadeAlunosDouble = getCellValueAsNumeric(cellQuantidade);
                    int quantidadeAlunos = (int) quantidadeAlunosDouble;
                    double codigoHorarioDouble = getCellValueAsNumeric(cellCodigoHorario);
                    int codigoHorario = (int) codigoHorarioDouble;
                    
                    System.out.println("Linha " + (row.getRowNum() + 1) + ": Professor='" + professor + 
                                     "', Disciplina='" + nomeDisciplina + 
                                     "', Qtd=" + quantidadeAlunos + 
                                     ", CodHorario=" + codigoHorario);
                    
                    // Validar dados obrigatórios
                    if (professor == null || professor.trim().isEmpty() ||
                        nomeDisciplina == null || nomeDisciplina.trim().isEmpty()) {
                        System.err.println("Linha " + (row.getRowNum() + 1) + " ignorada: dados obrigatórios faltando");
                        continue;
                    }
                    
                    if (quantidadeAlunos <= 0 || codigoHorario <= 0) {
                        System.err.println("Linha " + (row.getRowNum() + 1) + " ignorada: quantidade ou código de horário inválido");
                        continue;
                    }
                    
                    // Buscar ou criar disciplina
                    Disciplina disciplina;
                    Optional<Disciplina> disciplinaExistente = disciplinaService.getAllDisciplinas()
                        .stream()
                        .filter(d -> d.getNome().equalsIgnoreCase(nomeDisciplina))
                        .findFirst();
                    
                    if (disciplinaExistente.isPresent()) {
                        disciplina = disciplinaExistente.get();
                    } else {
                        Disciplina novaDisciplina = new Disciplina();
                        novaDisciplina.setNome(nomeDisciplina);
                        novaDisciplina.setNecessitaLaboratiorio(false);
                        novaDisciplina.setNecessitaArCondicionado(false);
                        novaDisciplina.setNecessitaLousaDigital(false);
                        disciplina = disciplinaService.createDisciplina(novaDisciplina);
                    }
                    
                    // Criar turma
                    Turma turma = new Turma();
                    turma.setProfessor(professor);
                    turma.setDisciplina(disciplina);
                    turma.setQuantidadeAlunos(quantidadeAlunos);
                    turma.setCodigoHorario(codigoHorario);
                    turma.setTurmaGrandeAntiga(false); // Padrão
                    
                    Turma turmaSalva = turmaRepository.save(turma);
                    turmasCriadas.add(turmaSalva);
                    System.out.println("  -> Turma criada com ID: " + turmaSalva.getId());
                    
                    // Flush a cada 10 turmas para melhor performance
                    if (turmasCriadas.size() % 10 == 0) {
                        entityManager.flush();
                        entityManager.clear(); // Limpa o cache para evitar problemas de memória
                    }
                    
                } catch (Exception e) {
                    System.err.println("Erro ao processar linha " + (row.getRowNum() + 1) + ": " + e.getMessage());
                    e.printStackTrace();
                    // Continua processando outras linhas
                }
            }
            
            // Flush final para garantir que todas sejam salvas
            entityManager.flush();
            
            System.out.println("=== IMPORTAÇÃO CONCLUÍDA ===");
            System.out.println("Total de turmas criadas: " + turmasCriadas.size());
        }
        
        return turmasCriadas;
    }
    
    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    private double getCellValueAsNumeric(Cell cell) {
        if (cell == null) {
            return 0;
        }
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    return 0;
                }
            default:
                return 0;
        }
    }
}
