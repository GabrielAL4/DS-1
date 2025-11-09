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
import { SalaService } from "@/services/SalaService";
import { TurmaService } from "@/services/TurmaService";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CriarTurmaModal() {
  const [open, setOpen] = useState(false);
  const [salas, setSalas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [novaTurma, setNovaTurma] = useState({
    professor: "",
    disciplina: "",
    diaSemana: "",
    horario: "",
    turmaGrandeAntiga: false,
    bloco: "",
    salaId: ""
  });

  const getSalasData = async () => {
    try {
      const response = await SalaService.getAllSalas();
      setSalas(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar salas:", error);
      setSalas([]);
    }
  };

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
    getSalasData();
    getDisciplinasData();
  }, []);

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
      !novaTurma.diaSemana ||
      !novaTurma.horario ||
      !novaTurma.bloco ||
      !novaTurma.salaId
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
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

      // Busca dados da sala
      const salaSelecionada = salas.find(
        s => s.id.toString() === novaTurma.salaId
      );
      if (!salaSelecionada) {
        alert("Sala não encontrada.");
        return;
      }

      // Cálculo de código de horário (exemplo simples, adapte se tiver mapping)
      const diaSemanaToCode = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5
      };

      const horarioToCode = {
        TEMPO1: 1,
        TEMPO2: 2,
        TEMPO3: 3,
        TEMPO4: 4,
        TEMPO5: 5,
        TEMPO6: 6
      };

      // Monta payload da turma conforme backend exige
      const turmaPayload = {
        id: 0,
        professor: novaTurma.professor,
        disciplina: disciplinaSelecionada.nome,
        quantidadeAlunos: salaSelecionada.capacidadeMaxima,
        codigoHorario: horarioToCode[novaTurma.horario],
        turmaGrandeAntiga: novaTurma.turmaGrandeAntiga
      };

      console.log("Payload de criação de turma:", turmaPayload);

      const turmaResponse = await TurmaService.createTurma(turmaPayload);
      const turmaCriada = turmaResponse.data;

      // Monta payload da alocação conforme backend exige
      const alocacaoPayload = {
        idTurma: turmaCriada.id,
        idSala: salaSelecionada.id,
        diaSemana: novaTurma.diaSemana,
        tempo: novaTurma.horario
      };

      console.log("Payload de alocação:", alocacaoPayload);

      await TurmaService.createAlocacaoTurma(alocacaoPayload);

      alert("Turma criada e alocada com sucesso!");

      // Fecha modal e limpa campos
      setOpen(false);
      setNovaTurma({
        professor: "",
        disciplina: "",
        diaSemana: "",
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
          onClick={() => setOpen(true)}
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

            {/* Dia da Semana */}
            <div className="flex flex-col ml-6">
              <Label htmlFor="diaSemana" className="pb-2">
                Dia da Semana:
              </Label>
              <select
                id="diaSemana"
                className="rounded-md border p-2"
                value={novaTurma.diaSemana}
                onChange={(e) => handleNovaTurmaChange("diaSemana", e.target.value)}
                required
              >
                <option value="">Selecione o dia</option>
                <option value="MONDAY">Segunda-feira</option>
                <option value="TUESDAY">Terça-feira</option>
                <option value="WEDNESDAY">Quarta-feira</option>
                <option value="THURSDAY">Quinta-feira</option>
                <option value="FRIDAY">Sexta-feira</option>
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

            {/* Bloco */}
            <div className="flex flex-col ml-6">
              <Label htmlFor="bloco" className="pb-2">
                Bloco:
              </Label>
              <select
                id="bloco"
                className="rounded-md border p-2"
                value={novaTurma.bloco}
                onChange={(e) => handleNovaTurmaChange("bloco", e.target.value)}
                required
              >
                <option value="">Selecione um bloco</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            {/* Sala */}
            <div className="flex flex-col ml-6">
              <Label htmlFor="salaId" className="pb-2">
                Sala:
              </Label>
              <select
                id="salaId"
                className="rounded-md border p-2"
                value={novaTurma.salaId}
                onChange={(e) => handleNovaTurmaChange("salaId", e.target.value)}
                required
              >
                <option value="">Selecione uma sala</option>
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.numero} (Capacidade: {sala.capacidadeMaxima})
                  </option>
                ))}
              </select>
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
