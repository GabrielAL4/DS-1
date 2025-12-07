package br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Repositories;

import br.com.femass.ds1.ControledeSalaFEMASSJava.Domain.Entities.Disciplina;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Integer> {
    Disciplina findDisciplinaByNome(String nome);

    List<Disciplina> findByNome(String nome);
}