import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DisciplinaService } from "@/services/DisciplinaService";
import { TurmaService } from "@/services/TurmaService";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CriarTurmaModal({ setTabela }) {
  const [open, setOpen] = useState(false);
  const [disciplinas, setDisciplinas] = useState([]);
  const [novaTurma, setNovaTurma] = useState({
    professor: "",
    disciplina: {},
    horario: "",
    turmaGrandeAntiga: false,
    bloco: "",
    salaId: ""
  });

  const getDisciplinasData = async () => {
    try {
      const response = await DisciplinaService.getAllDisciplinas();
      setDisciplinas(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      setDisciplinas([]);
    }
  };

  useEffect(() => {
    if (open) {
      getDisciplinasData();
    }
  }, [open]);

  const handleNovaTurmaChange = (field, value) => {
    setNovaTurma(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateTurma = async (event) => {
    event.preventDefault();

    if (
      !novaTurma.professor ||
      !novaTurma.disciplina ||
      !novaTurma.horario
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const responseTodasTurmas = await TurmaService.getAllTurmas();

    const horarioToCode = {
      TEMPO1: 1,
      TEMPO2: 2,
      TEMPO3: 3,
      TEMPO4: 4,
      TEMPO5: 5,
      TEMPO6: 6
    };

    const turmaDuplicada = responseTodasTurmas.data?.some(turma => {
      return (
        turma.professor === novaTurma.professor &&
        turma.disciplina?.id === Number(novaTurma.disciplina) &&
        turma.codigoHorario === horarioToCode[novaTurma.horario]
      );
    });

    if (turmaDuplicada) {
      alert("Turma já cadastrada! Por favor, cadastre uma nova.");

      return;
    }

    try {
      // Busca dados da disciplina completa
      const disciplinaSelecionada = disciplinas.find(
        d => d.id.toString() === novaTurma.disciplina
      );
      if (!disciplinaSelecionada) {
        alert("Disciplina não encontrada.");
        return;
      }

      const turmaPayload = {
        id: 0,
        professor: novaTurma.professor,
        disciplina: disciplinaSelecionada,
        quantidadeAlunos: novaTurma.quantidadeAlunos,
        codigoHorario: horarioToCode[novaTurma.horario],
        turmaGrandeAntiga: novaTurma.turmaGrandeAntiga
      };

      await TurmaService.createTurma(turmaPayload);

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
            // Mantém disciplina como objeto completo para consistência
            disciplina: turma.disciplina || null,
            quantidadeAlunos: turma.quantidadeAlunos || 0,
            codigoHorario: turma.codigoHorario || 0,
            // Usa os nomes corretos do backend dentro de disciplina
            necessitaLaboratorio: turma.disciplina?.necessitaLaboratiorio || false,
            necessitaArCondicionado: turma.disciplina?.necessitaArCondicionado || false,
            necessitaLoucaDigital: turma.disciplina?.necessitaLousaDigital || false,
            disciplinaId: turma.disciplina?.id || 0,
            alocada: turma.alocada || false,
            salaSelecionada: turma.salaSelecionada || null,
          };
        } catch (error) {
          console.error('Erro ao mapear turma:', turma, error);
          return {
            id: 0,
            professor: "Erro",
            disciplina: null,
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

      alert("Turma criada e alocada com sucesso!");

      // Fecha modal e limpa campos
      setOpen(false);

      setNovaTurma({
        professor: "",
        disciplina: "",
        horario: "",
        turmaGrandeAntiga: false,
        bloco: "",
        salaId: ""
      });
    } catch (error) {
      console.error("Erro ao criar turma:", error);
      alert("Erro ao criar turma. Verifique os dados e tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-md bg-green-600 text-white p-2 min-w-[200px] h-[60px] flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Criar Turma
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova turma
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTurma}>
          <div className="grid gap-4 py-4">
            {/* Professor */}
            <div className="flex flex-col ml-6">
              <Label htmlFor="professor" className="pb-2">
                Professor:
              </Label>
              <Input
                id="professor"
                type="text"
                value={novaTurma.professor}
                onChange={(e) => handleNovaTurmaChange("professor", e.target.value)}
                required
              />
            </div>

            {/* Disciplina */}
            <div className="flex flex-col ml-6">
              <Label htmlFor="disciplina" className="pb-2">
                Disciplina:
              </Label>
              <select
                id="disciplina"
                className="rounded-md border p-2"
                value={novaTurma.disciplina}
                onChange={(e) => handleNovaTurmaChange("disciplina", e.target.value)}
                required
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas.map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Horário */}
            <div className="flex flex-col ml-6">
              <Label htmlFor="horario" className="pb-2">
                Horário:
              </Label>
              <select
                id="horario"
                className="rounded-md border p-2"
                value={novaTurma.horario}
                onChange={(e) => handleNovaTurmaChange("horario", e.target.value)}
                required
              >
                <option value="">Selecione o horário</option>
                <option value="TEMPO1">1º Horário</option>
                <option value="TEMPO2">2º Horário</option>
                <option value="TEMPO3">3º Horário</option>
                <option value="TEMPO4">4º Horário</option>
                <option value="TEMPO5">5º Horário</option>
                <option value="TEMPO6">6º Horário</option>
              </select>
            </div>

            {/* Turma Grade Antiga */}
            <div className="flex items-center gap-2 ml-6">
              <input
                id="turmaGrandeAntiga"
                type="checkbox"
                checked={novaTurma.turmaGrandeAntiga}
                onChange={(e) => handleNovaTurmaChange("turmaGrandeAntiga", e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="turmaGrandeAntiga">
                Turma Grade Antiga
              </Label>
            </div>

            {/* Quantidade de aluno */}
            <div className="flex flex-col ml-6">
              <Label htmlFor="quantidadeAlunos" className="pb-2">
                Quantidade de aluno:
              </Label>
              <Input
                id="quantidadeAlunos"
                type="text"
                value={novaTurma.quantidadeAlunos}
                onChange={(e) => handleNovaTurmaChange("quantidadeAlunos", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit">Criar Turma</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
