"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { ClassService } from "@/services/ClassService";
import { SalaService } from "@/services/SalaService";
import { TurmaService } from "@/services/TurmaService";
import { Eye, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import CriarDisciplinaModal from "./components/CriarDisciplinaModal";
import CriarTurmaModal from "./components/CriarTurmaModal";
import ImportarTurmasExcelModal from "./components/ImportarTurmasExcelModal";

export default function AlocarTurmaSala() {
  const [tabela, setTabela] = useState([]);
  const [filterDia, setFilterDia] = useState(0);
  const [filterHora, setFilterHora] = useState(0);
  const [filterValue, setFilterValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpen2, setDialogOpen2] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [alocacoes, setAlocacoes] = useState([]);
  const [alocarTurmaSala, setAlocarTurmaSala] = useState({
    turmaId: 0,
    salaId: 0,
    diaSemana: 0,
    tempoSala: 0,
  });
  const [salasDisponiveis, setSalasDisponiveis] = useState([]);
  const [selectedSala, setSelectedSala] = useState(null);
  const [salas, setSalas] = useState([]);
  const [diaPDF, setDiaPDF] = useState(0);
  const [dialog3, setDialog3] = useState(false);
  //Editar preferencias Disciplina
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [disciplinaEdit, setDisciplinaEdit] = useState(null);
  const [editedPreferences, setEditedPreferences] = useState({
    necessitaLaboratorio: false,
    necessitaArCondicionado: false,
    necessitaLoucaDigital: false,
  });
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);
  // Estados para o modal e dados de alocações
  const [dialogAlocacoes, setDialogAlocacoes] = useState(false);
  const [selectedBloco, setSelectedBloco] = useState("");
  const [selectedSalaId, setSelectedSalaId] = useState(0);
  const [alocacoesSala, setAlocacoesSala] = useState([]);
  const [isDialogDeleteAllOpen, setIsDialogDeleteAllOpen] = useState(false);
  const [isDialogAllocateOpen, setIsDialogAllocateOpen] = useState(false);

  // Estados para o modal de upload
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [dialogEncerrarPeriodo, setDialogEncerrarPeriodo] = useState(false);

  //Função para encerrar período
  const handleEncerrarPeriodo = async () => {
    try {
      // ClassService.clearSemester();
      alert("Período letivo encerrado com sucesso!");
      setDialogEncerrarPeriodo(false);
      // getTurmasData(); // Atualiza a tabela após encerramento
    } catch (error) {
      console.error('Erro ao encerrar período letivo.', error);
    }
  };

  //Atualiza tabela
  const [loading, setLoading] = useState(false);
  // Mapeamento de horários compartilhado
  const horarioMapping = {
    1: [
      { diaSemana: 1, tempoAula: 1 },
      // { diaSemana: 1, tempoAula: 2 },
      { diaSemana: 2, tempoAula: 2 },
    ],
    2: [
      { diaSemana: 1, tempoAula: 2 }, //mudar tempo de aula de 2 para 3 quando ajeitado o banco
      { diaSemana: 2, tempoAula: 1 },
    ],
    3: [
      { diaSemana: 2, tempoAula: 3 },
      { diaSemana: 3, tempoAula: 3 },
    ],
    4: [
      { diaSemana: 3, tempoAula: 1 },
      //{ diaSemana: 3, tempoAula: 2 },
      { diaSemana: 4, tempoAula: 2 },
    ],
    5: [
      { diaSemana: 4, tempoAula: 1 },
      { diaSemana: 5, tempoAula: 2 },
    ],
    6: [
      { diaSemana: 4, tempoAula: 3 },
      { diaSemana: 5, tempoAula: 1 },
    ],
  };

  // Função para carregar dados das turmas
  const getTurmasData = async () => {
    setLoading(true); // Ativa o estado de carregamento

    try {
      const response = await TurmaService.getAllTurmas();
      const turmas = response.data || [];

      const turmasComAlocacoes = await Promise.all(
        turmas.map(async (turma) => {
          try {
            const alocacoesResponse = await TurmaService.getTurmaById(turma.id);
            const alocacoes = alocacoesResponse.data.alocacoes || [];
            const alocacaoAtual = alocacoes[0]; // Considera a primeira alocação, se existir

            return {
              ...turma,
              alocada: !!alocacaoAtual,
              salaSelecionada: alocacaoAtual ? alocacaoAtual.salaId : null,
            };
          } catch (error) {
            console.error(`Erro ao buscar alocações da turma ${turma.id}:`, error);
            return {
              ...turma,
              alocada: false,
              salaSelecionada: null,
            };
          }
        })
      );

      const mapResponse = turmasComAlocacoes.map((turma) => {
        try {
          return {
            id: turma.id || 0,
            professor: turma.professor || "Não informado",
            disciplina: turma.disciplina?.nome || turma.disciplina || "Sem Nome",
            quantidadeAlunos: turma.quantidadeAlunos || 0,
            codigoHorario: turma.codigoHorario || 0,
            necessitaLaboratorio: turma.disciplina?.necessitaLaboratorio || false,
            necessitaArCondicionado: turma.disciplina?.necessitaArCondicionado || false,
            necessitaLoucaDigital: turma.disciplina?.necessitaLoucaDigital || false,
            disciplinaId: turma.disciplina?.id || 0,
            alocada: turma.alocada || false,
            salaSelecionada: turma.salaSelecionada || null,
          };
        } catch (error) {
          console.error('Erro ao mapear turma:', turma, error);
          return {
            id: 0,
            professor: "Erro",
            disciplina: "Erro",
            quantidadeAlunos: 0,
            codigoHorario: 0,
            necessitaLaboratorio: false,
            necessitaArCondicionado: false,
            necessitaLoucaDigital: false,
            disciplinaId: 0,
            alocada: false,
            salaSelecionada: null,
          };
        }
      });

      setTabela(mapResponse); // Atualiza os dados da tabela
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
      setTabela([]);
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  useEffect(() => {
    getTurmasData();
  }, []);

  const handleAlocarTurmaSala = async () => {
    // Mapas para enums do Java
    const diaSemanaMap = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY"
    };
    const tempoMap = {
      1: "TEMPO1",
      2: "TEMPO2",
      3: "TEMPO3"
    };

    const turma = {
      turmaId: selectedTurma.id,
      salaId: selectedSala.id,
      diaSemana: diaSemanaMap[filterDia],
      tempo: tempoMap[filterHora],
    }

    TurmaService.createAlocacaoTurma(turma)
      .then((response) => {
        setDialogOpen(false);
      })
      .catch((error) => {
      })
  }

  //Busca salas disponíveis para determinada disciplina
  const handleBuscarSalasDisponiveis = async (turma) => {
    try {
      const horarios = horarioMapping[turma.codigoHorario];
      if (!horarios) {
        alert("Horário inválido para a turma.");
        return;
      }

      // Mapas para enums do Java
      const diaSemanaMap = {
        1: "MONDAY",
        2: "TUESDAY",
        3: "WEDNESDAY",
        4: "THURSDAY",
        5: "FRIDAY"
      };
      const tempoMap = {
        1: "TEMPO1",
        2: "TEMPO2",
        3: "TEMPO3"
      };

      const salasDisponiveisPorHorario = await Promise.all(
        horarios.map(async (horario) => {
          const response = await SalaService.getAllSalasDisponiveis(
            diaSemanaMap[horario.diaSemana],
            tempoMap[horario.tempoAula]
          );
          return response.data || [];
        })
      );

      // Combina todas as salas disponíveis e remove duplicatas
      const salasCombinadas = salasDisponiveisPorHorario.flat();

      // Remove duplicatas baseado no ID da sala
      const salasUnicas = salasCombinadas.filter((sala, index, self) =>
        index === self.findIndex(s => s.id === sala.id)
      );

      setSalasDisponiveis((prev) => ({
        ...prev,
        [turma.id]: salasUnicas.map((sala) => ({
          id: sala.id || 0,
          bloco: sala.bloco || "Indefinido",
          numero: sala.numero || "Desconhecido",
        })),
      }));
    } catch (error) {
      console.error("Erro ao buscar salas disponíveis:", error);
      alert("Erro ao buscar salas disponíveis.");
    }
  };

  //salva a alocação de sala disponivel da disciplina
  const handleSalvarAlocacao = async (turma) => {
    try {
      if (!selectedSala) {
        alert("Por favor, selecione uma sala.");
        return;
      }

      const horarios = horarioMapping[turma.codigoHorario];
      if (!horarios) {
        alert("Horário inválido para a turma.");
        return;
      }

      // Mapas para enums do Java
      const diaSemanaMap = {
        1: "MONDAY",
        2: "TUESDAY",
        3: "WEDNESDAY",
        4: "THURSDAY",
        5: "FRIDAY"
      };

      const tempoMap = {
        1: "TEMPO1",
        2: "TEMPO2",
        3: "TEMPO3",
        4: "TEMPO4",
        3: "TEMPO5",
        4: "TEMPO6",
      };

      for (const horario of horarios) {
        const payload = {
          idTurma: turma.id,
          idSala: selectedSala.id,
          diaSemana: diaSemanaMap[horario.diaSemana],
          tempo: tempoMap[horario.tempoAula],
        };

        await TurmaService.createAlocacaoTurma(payload);
      }

      // Atualiza o estado local da tabela para refletir a mudança
      const updatedTabela = tabela.map((row) => {
        if (row.id === turma.id) {
          return {
            ...row,
            alocada: true,
            salaSelecionada: selectedSala.id,
          };
        }
        return row;
      });

      setTabela(updatedTabela);

      // Limpa a seleção de sala
      setSelectedSala(null);

      // Mostra mensagem de sucesso
      alert("Turma alocada com sucesso!");

      // Recarrega os dados após um pequeno delay para garantir que o backend processou
      setTimeout(() => {
        getTurmasData();
      }, 1000);
    } catch (error) {
      console.error("Erro ao salvar alocação:", error);
      alert("Erro ao salvar alocação.");
    }
  };

  const handleAlocacoesTurma = async (id) => {
    try {
      const response = await TurmaService.getTurmaById(id);
      const alocacoes = response.data.alocacoes || [];

      const diasDaSemana = [
        "Domingo", // 0
        "Segunda-feira", // 1
        "Terça-feira", // 2
        "Quarta-feira", // 3
        "Quinta-feira", // 4
        "Sexta-feira", // 5
        "Sábado", // 6
      ];

      const alocacoesComDetalhes = alocacoes.map((alocacao) => {
        const salaEncontrada = salas.find(
          (sala) => sala.id === alocacao.salaId
        );

        return {
          diaSemana: diasDaSemana[alocacao.diaSemana] || "Dia inválido",
          horario: `Horário ${alocacao.tempo}`,
          turmaId: alocacao.turmaId || "Não definido",
          sala: salaEncontrada
            ? `${salaEncontrada.bloco}-${salaEncontrada.numero}`
            : "Sala não encontrada",
        };
      });

      setAlocacoes(alocacoesComDetalhes);
      setDialogOpen2(true);
    } catch (error) {
      console.error("Erro ao buscar alocações da turma:", error);
      alert("Erro ao buscar alocações da turma.");
    }
  };

  const handleGerarRelatorioFinal = async () => {
    try {
      const response = await SalaService.createRelatorioFinal(diaPDF);
      // Criar um link temporário para fazer o download do arquivo
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      // Definir o nome do arquivo a ser baixado
      const contentDisposition = response.headers["content-disposition"];
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "relatorio.pdf"; // Se não houver nome no cabeçalho, usa um nome padrão

      link.download = fileName; // Define o nome do arquivo

      // Simula o clique no link para iniciar o download
      link.click();
    } catch (error) {
      console.error('Erro ao criar relatório.', error);
    }
  };

  //mapeamento que relaciona cada dia da semana aos códigos de horário
  const dayToCodeMapping = {
    1: [1, 1, 2], // Segunda
    2: [2, 1, 3], // Terça
    3: [4, 4, 3], // Quarta
    4: [5, 4, 6], // Quinta
    5: [6, 5], // Sexta
  };

  //lógica de filtragem para considerar esse mapeamento
  const filteredTable = Array.isArray(tabela) ? tabela.filter((row) => {
    // Lógica de filtragem de texto
    const matchesText = Object.values(row).some(
      (value) =>
        value !== null && value !== undefined &&
        value.toString().toLowerCase().includes(filterValue.toLowerCase())
    );

    // Lógica de filtragem com base no dia
    const matchesDay = filterDia
      ? dayToCodeMapping[filterDia]?.includes(row.codigoHorario)
      : true;

    // Lógica de filtragem com base no dia e horário
    const matchesTime =
      filterDia && filterHora
        ? row.codigoHorario === dayToCodeMapping[filterDia]?.[filterHora - 1]
        : true;

    return matchesText && matchesDay && matchesTime;
  }) : [];

  //Função para abrir o diálogo de edição
  const handleEditPreferences = async (turma) => {
    try {
      setSelectedDisciplina(turma);
      setDialogEditOpen(true);
    } catch (error) {
      console.error("Erro ao abrir edição:", error);
      alert("Erro ao abrir edição.");
    }
  };

  //Função para salvar as edições
  const handleSavePreferences = async () => {
    try {
      if (!selectedDisciplina) {
        alert("Nenhuma disciplina selecionada.");
        return;
      }

      // Atualiza a tabela localmente
      const updatedTabela = tabela.map((row) => {
        if (row.id === selectedDisciplina.id) {
          return {
            ...row,
            necessitaLaboratorio: selectedDisciplina.necessitaLaboratorio,
            necessitaLoucaDigital: selectedDisciplina.necessitaLoucaDigital,
            necessitaArCondicionado: selectedDisciplina.necessitaArCondicionado,
          };
        }
        return row;
      });

      setTabela(updatedTabela);
      setDialogEditOpen(false);
      alert("Preferências atualizadas com sucesso!");
    } catch (error) {
      alert("Erro ao salvar as alterações.");
      console.error("Erro ao salvar as alterações:", error);
    }
  };

  // Função para buscar turmas alocadas em uma sala específica
  const handleBuscarAlocacoes = async () => {
    try {
      if (!selectedSalaId) {
        alert("Selecione um bloco e uma sala.");
        return;
      }

      const response = await SalaService.getSalaById(selectedSalaId);
      const alocacoes = response.data.alocacoes || [];

      // Tabela para organizar as alocações (3 horários x 5 dias da semana)
      const tabela = Array(3)
        .fill(null)
        .map(() => Array(5).fill(null));

      // Mapeie as alocações para a tabela
      alocacoes.forEach(({ diaSemana, tempo, turmaId }) => {
        if (diaSemana >= 1 && diaSemana <= 5 && tempo >= 1 && tempo <= 3) {
          tabela[tempo - 1][diaSemana - 1] = turmaId || "X"; // Preenche com TurmaID ou "X" se indisponível
        }
      });

      setAlocacoesSala(tabela);
    } catch (error) {
      console.error("Erro ao buscar alocações:", error);
      alert("Erro ao buscar alocações.");
    }
  };

  const handleDeletarAlocacao = async (turmaId) => {
    try {
      const response = await TurmaService.getTurmaById(turmaId);
      const alocacoes = response.data.alocacoes || [];

      if (alocacoes.length === 0) {
        alert("Nenhuma alocação encontrada para esta turma.");
        return;
      }

      for (const alocacao of alocacoes) {
        await TurmaService.deleteAlocacaoTurma(alocacao.id);
      }

      // Atualiza a tabela localmente
      const updatedTabela = tabela.map((row) => {
        if (row.id === turmaId) {
          return { ...row, alocada: false, salaSelecionada: null };
        }
        return row;
      });
      setTabela(updatedTabela);
    } catch (error) {
      console.error("Erro ao tentar remover a alocação:", error);
      alert("Erro ao tentar remover a alocação.");
    }
  };
  //Função para alocar turmas automaticamente
  const handleAlocarAutomaticamente = async () => {
    try {
      setLoading(true); // Exibe o estado de carregamento
      // const response = await ClassService.allocateClassAutomatically();
      alert("Alocação automática realizada com sucesso!");
      // await getTurmasData(); // Atualiza a tabela
      // window.location.reload(); // Recarrega a página após salvar
    } catch (error) {
      console.error("Erro ao alocar turmas automaticamente:", error);
      alert("Erro ao alocar turmas automaticamente.");
    } finally {
      setLoading(false); // Remove o estado de carregamento
      setIsDialogAllocateOpen(false); // Fecha o diálogo
    }
  };
  //Função para deletar todas as alocações
  const handleDeletarTodasAlocacoes = async () => {
    try {
      setLoading(true); // Exibe o estado de carregamento

      // Busque todas as turmas para obter as alocações
      const response = await SalaService.getAllSalas();
      const turmas = response.data;

      if (!turmas || turmas.length === 0) {
        alert("Nenhuma turma encontrada.");
        return;
      }

      // Itere sobre as turmas e delete suas alocações
      for (const turma of turmas) {
        const alocacoesResponse = await SalaService.getSalaById(turma.id);
        const alocacoes = alocacoesResponse.data.alocacoes || [];

        for (const alocacao of alocacoes) {
          await SalaService.deleteIndisponibilidadeSala(alocacao.id);
        }
      }

      // Limpa as alocações na tabela local
      const updatedTabela = tabela.map((row) => ({
        ...row,
        alocada: false,
        salaSelecionada: null,
      }));
      setTabela(updatedTabela);
    } catch (error) {
      console.error("Erro ao deletar todas as alocações:", error);
      alert("Erro ao deletar todas as alocações.");
    } finally {
      setLoading(false); // Remove o estado de carregamento
      setIsDialogDeleteAllOpen(false); // Fecha o diálogo após a exclusão
    }
  };

  return (
    <main className="mb-20">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-gray-500">
            Carregando, por favor aguarde...
          </p>
        </div>
      ) : (
        <>
          <div className="w-full flex font-bold text-4xl justify-center mt-4 mb-8">
            Alocar Turma na Sala
          </div>

          <div className="p-6">
            <div className="flex items-center mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filtrar"
                  className="border border-black"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="dia" className="text-right">
                  Dia da Semana:
                </Label>
                <select
                  className="rounded-md border p-2 col-span-3 w-[150px]"
                  value={filterDia}
                  onChange={(e) => setFilterDia(e.target.value)}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="1">Segunda-Feira</option>
                  <option value="2">Terça-Feira</option>
                  <option value="3">Quarta-Feira</option>
                  <option value="4">Quinta-Feira</option>
                  <option value="5">Sexta-Feira</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="dia" className="text-right">
                  Hora:
                </Label>
                <select
                  className="rounded-md border p-2 col-span-3 w-[150px]"
                  value={filterHora}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterHora(value ? parseInt(value) : 0); // Define o horário ou reseta para 0
                  }}
                >
                  <option>Selecione uma opção</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
                <div className="flex items-center gap-2">
                  <CriarTurmaModal />

                  <CriarDisciplinaModal />

                  <ImportarTurmasExcelModal />

                  {/* Botão para abrir alocações */}
                  <button
                    className="rounded-md bg-blue-600 text-white p-2 min-w-[200px] h-[60px] text-center"
                    onClick={() => setDialogAlocacoes(true)}
                  >
                    Alocações
                  </button>

                  {/* Botão para gerar relatório */}
                  <button
                    className="rounded-md bg-blue-600 text-white p-2 min-w-[200px] h-[60px] text-center"
                    onClick={() => setDialog3(true)}
                  >
                    Gerar Relatório Final
                  </button>

                  {/* Botão para alocar turmas automaticamente */}
                  <button
                    className="rounded-md bg-green-600 text-white p-2 min-w-[200px] h-[60px] text-center"
                    onClick={() => setIsDialogAllocateOpen(true)}
                  >
                    Alocar Automaticamente
                  </button>

                  {/* Botão para deletar todas as alocações */}
                  <button
                    className="rounded-md bg-red-600 text-white p-2 min-w-[200px] h-[60px] text-center"
                    onClick={() => setIsDialogDeleteAllOpen(true)}
                  >
                    Eliminar Todas As Alocações
                  </button>
                  {/* Botão para encerrar período */}
                  <button
                    className="rounded-md bg-red-600 text-white p-2 min-w-[200px] h-[60px] text-center"
                    onClick={() => setDialogEncerrarPeriodo(true)}
                  >
                    Encerrar Período Letivo
                  </button>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-2">
              {loading ? (
                <p className="text-center text-gray-500">
                  Carregando dados, por favor aguarde...
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Professor</TableHead>
                      <TableHead>Qtd Alunos</TableHead>
                      <TableHead>Cód. Horário</TableHead>
                      <TableHead>Laboratório</TableHead>
                      <TableHead>Lousa</TableHead>
                      <TableHead>Ar</TableHead>
                      <TableHead>Sala Disponíveis</TableHead>
                      <TableHead>Alocações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTable
                      .sort((a, b) => b.quantidadeAlunos - a.quantidadeAlunos) // Ordenação existente
                      .map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.disciplina || "Sem Nome"}</TableCell>
                          <TableCell>
                            {row.professor || "Não informado"}
                          </TableCell>
                          <TableCell>
                            {row.quantidadeAlunos !== undefined
                              ? row.quantidadeAlunos
                              : "Desconhecido"}
                          </TableCell>
                          <TableCell>
                            {row.codigoHorario || "Não definido"}
                          </TableCell>
                          <TableCell>
                            {row.necessitaLaboratorio ? "Sim" : "Não"}
                          </TableCell>
                          <TableCell>
                            {row.necessitaLoucaDigital ? "Sim" : "Não"}
                          </TableCell>
                          <TableCell>
                            {row.necessitaArCondicionado ? "Sim" : "Não"}
                          </TableCell>
                          <TableCell>
                            {typeof row.salaSelecionada === "string"
                              ? row.salaSelecionada
                              : "Não alocada"}
                          </TableCell>
                          <TableCell>
                            {row.alocada ? (
                              <span className="text-green-500 font-bold">
                                Alocado
                              </span>
                            ) : (
                              <select
                                className="rounded-md border p-2"
                                value={selectedSala?.id || ""}
                                onClick={() =>
                                  handleBuscarSalasDisponiveis(row)
                                }
                                onChange={(e) => {
                                  const selected = salasDisponiveis[
                                    row.id
                                  ]?.find(
                                    (sala) =>
                                      sala.id === parseInt(e.target.value)
                                  );
                                  setSelectedSala(selected);
                                }}
                              >
                                <option value="">Selecione uma sala</option>
                                {salasDisponiveis[row.id]?.map((sala) => (
                                  <option key={sala.id} value={sala.id}>
                                    Sala: Bloco {sala.bloco} - Número{" "}
                                    {sala.numero}
                                  </option>
                                ))}
                              </select>
                            )}
                          </TableCell>
                          <TableCell>
                            <button
                              className="mr-2 text-blue-500 hover:text-blue-700"
                              onClick={() => handleEditPreferences(row)}
                            >
                              <Pencil />
                            </button>
                            <button
                              className="mr-2 text-green-500 hover:text-green-700"
                              onClick={() => {
                                handleAlocacoesTurma(row.id);
                                setDialogOpen2(true);
                              }}
                            >
                              <Eye />
                            </button>
                          </TableCell>
                          <TableCell>
                            {row.alocada ? (
                              <button
                                className="rounded-md bg-red-600 text-white p-2"
                                onClick={() => handleDeletarAlocacao(row.id)}
                              >
                                Limpar
                              </button>
                            ) : (
                              <button
                                className="rounded-md bg-blue-600 text-white p-2"
                                onClick={() => handleSalvarAlocacao(row)}
                              >
                                Salvar
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent asChild>
                  <DialogHeader>
                    <DialogTitle>Alocar Turma</DialogTitle>
                    <DialogDescription>
                      {selectedTurma && (
                        <>
                          <p>
                            Tem certeza que deseja alocar a turma{" "}
                            {selectedTurma.disciplina} do professor{" "}
                            {selectedTurma.professor} na sala{" "}
                            {selectedSala.numero} bloco {selectedSala.bloco}?
                          </p>
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        handleAlocarTurmaSala();
                        setDialogOpen(false);
                      }}
                    >
                      Sim
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={dialogOpen2} onOpenChange={setDialogOpen2}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Detalhes das Alocações</DialogTitle>
                    <DialogDescription>
                      {alocacoes && alocacoes.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Dia da Semana</TableHead>
                              <TableHead>Horário</TableHead>
                              <TableHead>Turma ID</TableHead>
                              <TableHead>Sala</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alocacoes.map((alocacao, index) => (
                              <TableRow key={index}>
                                <TableCell>{alocacao.diaSemana}</TableCell>
                                <TableCell>{alocacao.horario}</TableCell>
                                <TableCell>{alocacao.turmaId}</TableCell>
                                <TableCell>{alocacao.sala}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p>Nenhuma alocação encontrada.</p>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen2(false)}
                    >
                      Fechar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={dialog3} onOpenChange={setDialog3}>
                <DialogContent className="max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Baixar PDF</DialogTitle>
                  </DialogHeader>

                  <DialogDescription>
                    <div className="overflow-x-auto">
                      <Label htmlFor="dia" className="text-right">
                        Dia da Semana:
                      </Label>
                      <select
                        className="rounded-md border p-2 col-span-3"
                        value={diaPDF}
                        onChange={(e) => setDiaPDF(e.target.value)}
                      >
                        <option value="">Escolha uma opçao</option>
                        <option value="1">Segunda-Feira</option>
                        <option value="2">Terça-Feira</option>
                        <option value="3">Quarta-Feira</option>
                        <option value="4">Quinta-Feira</option>
                        <option value="5">Sexta-Feira</option>
                      </select>
                    </div>
                  </DialogDescription>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialog3(false)}>
                      Fechar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGerarRelatorioFinal()}
                    >
                      Baixar PDF
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={dialogEditOpen} onOpenChange={setDialogEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      Editar Preferências da Disciplina
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lab" className="text-right">
                        Laboratório:
                      </Label>
                      <Input
                        id="lab"
                        type="checkbox"
                        checked={
                          selectedDisciplina?.necessitaLaboratorio || false
                        }
                        onChange={(e) =>
                          setSelectedDisciplina({
                            ...selectedDisciplina,
                            necessitaLaboratorio: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="lousa" className="text-right">
                        Lousa Digital:
                      </Label>
                      <Input
                        id="lousa"
                        type="checkbox"
                        checked={
                          selectedDisciplina?.necessitaLoucaDigital || false
                        }
                        onChange={(e) =>
                          setSelectedDisciplina({
                            ...selectedDisciplina,
                            necessitaLoucaDigital: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ar" className="text-right">
                        Ar Condicionado:
                      </Label>
                      <Input
                        id="ar"
                        type="checkbox"
                        checked={
                          selectedDisciplina?.necessitaArCondicionado || false
                        }
                        onChange={(e) =>
                          setSelectedDisciplina({
                            ...selectedDisciplina,
                            necessitaArCondicionado: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogEditOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePreferences}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Diálogo para Encerrar Período */}
              <Dialog
                open={dialogEncerrarPeriodo}
                onOpenChange={setDialogEncerrarPeriodo}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Encerrar Período Letivo</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja encerrar o período letivo? Esta
                      ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogEncerrarPeriodo(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleEncerrarPeriodo}
                    >
                      Confirmar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={dialogAlocacoes} onOpenChange={setDialogAlocacoes}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Alocações</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    {/* Seleção de Bloco */}
                    <div className="flex flex-col ml-6">
                      <Label htmlFor="bloco" className="pb-2">
                        Bloco:
                      </Label>
                      <select
                        id="bloco"
                        className="rounded-md border p-2 col-span-3"
                        value={selectedBloco}
                        onChange={(e) => setSelectedBloco(e.target.value)}
                      >
                        <option value="">Selecione um bloco</option>
                        {salas.map((sala) => (
                          <option key={sala.bloco} value={sala.bloco}>
                            {sala.bloco}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seleção de Sala */}
                    <div className="flex flex-col ml-6">
                      <Label htmlFor="sala" className="pb-2">
                        Sala:
                      </Label>
                      <select
                        id="sala"
                        className="rounded-md border p-2 col-span-3"
                        value={selectedSalaId}
                        onChange={(e) => setSelectedSalaId(e.target.value)}
                      >
                        <option value="">Selecione uma sala</option>
                        {salas
                          .filter((sala) => sala.bloco === selectedBloco)
                          .map((sala) => (
                            <option key={sala.id} value={sala.id}>
                              {sala.numero}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Botão para buscar alocações */}
                    <Button
                      variant="outline"
                      onClick={handleBuscarAlocacoes}
                      className="mt-4"
                    >
                      Buscar Alocações
                    </Button>
                  </div>

                  {/* Tabela de Alocações */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Horário</TableHead>
                          <TableHead>Segunda</TableHead>
                          <TableHead>Terça</TableHead>
                          <TableHead>Quarta</TableHead>
                          <TableHead>Quinta</TableHead>
                          <TableHead>Sexta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alocacoesSala.map((linha, index) => (
                          <TableRow key={index}>
                            <TableCell>{`Horário ${index + 1}`}</TableCell>
                            {linha.map((celula, i) => (
                              <TableCell
                                key={i}
                                className={`border px-2 py-1 ${celula ? "bg-green-300" : "bg-red-300"
                                  }`}
                              >
                                {celula || ""}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogAlocacoes(false)}
                    >
                      Fechar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isDialogDeleteAllOpen}
                onOpenChange={setIsDialogDeleteAllOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Excluir Todas as Alocações</DialogTitle>
                  </DialogHeader>
                  <p>
                    Tem certeza que deseja excluir <b>todas as alocações</b>?
                    Esta ação não poderá ser desfeita.
                  </p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogDeleteAllOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeletarTodasAlocacoes}
                    >
                      Excluir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isDialogAllocateOpen}
                onOpenChange={setIsDialogAllocateOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alocar Automaticamente</DialogTitle>
                  </DialogHeader>
                  <p>
                    Tem certeza que deseja <b>alocar automaticamente</b> todas
                    as turmas em salas disponíveis? Essa ação tentará alocar
                    turmas automaticamente com base nas regras definidas.
                  </p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogAllocateOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleAlocarAutomaticamente}
                    >
                      Confirmar Alocação
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
