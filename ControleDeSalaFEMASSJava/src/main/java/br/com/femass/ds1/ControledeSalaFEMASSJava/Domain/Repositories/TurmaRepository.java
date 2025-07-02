package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Repositories;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Disciplina;
import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Integer> {
    List<Turma> findByDisciplina(Disciplina disciplina);

    @Query("SELECT t FROM Turma t LEFT JOIN FETCH t.alocacoes WHERE t.id = :id")
    Optional<Turma> findByIdWithAlocacoes(@Param("id") int id);

    @Query("SELECT DISTINCT t FROM Turma t LEFT JOIN FETCH t.alocacoes")
    List<Turma> findAllWithAlocacoes();
}
