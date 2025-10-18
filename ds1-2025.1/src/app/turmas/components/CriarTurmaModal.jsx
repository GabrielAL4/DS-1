import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalaService } from "@/services/SalaService";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CriarTurmaModal() {
  const [salas, setSalas] = useState([]);
  const [novaTurma, setNovaTurma] = useState({
    professor: "",
    disciplinaId: "",
    diaSemana: "",
    horario: "",
    turmaGrandeAntiga: false,
    bloco: "",
    salaId: ""
  });

  useEffect(() => {
    SalaService.getAllSalas()
      .then((response) => {
        console.log('Salas carregadas:', response.data);
        setSalas(response.data || []);
      })
      .catch((error) => {
        console.log('Não foi possível requisitar todas as salas', error);
        setSalas([]);
      });
  }, []);

  // Função para atualizar campos do formulário
  const handleNovaTurmaChange = (field, value) => {
    setNovaTurma(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para criar turma
  const handleCreateTurma = async (event) => {
    event.preventDefault();

    console.log("Iniciando criação de turma...");
    console.log("Dados do formulário:", novaTurma);

    // Validação dos campos obrigatórios
    console.log("Validando campos:", novaTurma);

    if (!novaTurma.professor || !novaTurma.disciplinaId || !novaTurma.diaSemana ||
      !novaTurma.horario || !novaTurma.bloco || !novaTurma.salaId) {
      console.log("Campos faltando:", {
        professor: !novaTurma.professor,
        disciplinaId: !novaTurma.disciplinaId,
        diaSemana: !novaTurma.diaSemana,
        horario: !novaTurma.horario,
        bloco: !novaTurma.bloco,
        salaId: !novaTurma.salaId
      });
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // 1. Buscar a sala pelo ID para obter a capacidade
      const salasResponse = await SalaService.getAllSalas();
      console.log("Salas disponíveis:", salasResponse.data);
      console.log("Sala ID selecionada:", novaTurma.salaId);

      const salaEncontrada = salasResponse.data.find(sala => sala.id.toString() === novaTurma.salaId);
      console.log("Sala encontrada:", salaEncontrada);

      if (!salaEncontrada) {
        alert("Sala não encontrada. Verifique a seleção da sala.");
        return;
      }

      // 2. Mapear dia da semana e horário para código de horário
      const diaSemanaToCode = {
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5
      };

      const horarioToCode = {
        'TEMPO1': 1,
        'TEMPO2': 2,
        'TEMPO3': 3
      };

      // Encontrar o código de horário baseado no mapeamento
      let codigoHorario = 0;
      for (const [codigo, horarios] of Object.entries(horarioMapping)) {
        for (const horario of horarios) {
          if (horario.diaSemana === diaSemanaToCode[novaTurma.diaSemana] &&
            horario.tempoAula === horarioToCode[novaTurma.horario]) {
            codigoHorario = parseInt(codigo);
            break;
          }
        }
        if (codigoHorario > 0) break;
      }

      // Se não encontrou no mapeamento, usar um código padrão baseado no dia
      if (codigoHorario === 0) {
        codigoHorario = diaSemanaToCode[novaTurma.diaSemana];
      }

      console.log("Código de horário calculado:", codigoHorario);
      console.log("Dia da semana:", novaTurma.diaSemana);
      console.log("Horário:", novaTurma.horario);

      // 3. Criar a turma com o nome da disciplina como string
      const turmaPayload = {
        professor: novaTurma.professor,
        disciplina: novaTurma.disciplinaId, // Usar o nome da disciplina diretamente
        quantidadeAlunos: salaEncontrada.capacidadeMaxima,
        codigoHorario: codigoHorario,
        turmaGrandeAntiga: novaTurma.turmaGrandeAntiga
      };

      console.log("Payload da turma sendo enviado:", turmaPayload);
      console.log("Payload JSON:", JSON.stringify(turmaPayload));

      const turmaResponse = await TurmaService.createTurma(turmaPayload);
      console.log("Resposta da criação da turma:", turmaResponse);
      const turmaCriada = turmaResponse.data;
      console.log("Turma criada:", turmaCriada);

      // 4. Criar alocação da turma na sala
      const alocacaoPayload = {
        turmaId: turmaCriada.id,
        salaId: salaEncontrada.id,
        diaSemana: novaTurma.diaSemana,
        tempo: novaTurma.horario
      };

      console.log("Payload da alocação:", alocacaoPayload);
      await TurmaService.createAlocacaoTurma(alocacaoPayload);

      // 5. Limpar formulário
      setNovaTurma({
        professor: "",
        disciplinaId: "",
        diaSemana: "",
        horario: "",
        turmaGrandeAntiga: false,
        bloco: "",
        salaId: ""
      });

      setDialogCreateTurma(false);
      getTurmasData(); // Atualizar lista de turmas
      alert("Turma criada e alocada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar turma:", error);
      alert("Erro ao criar turma. Verifique os dados e tente novamente.");
    }
  };

  return (
    <Dialog>
      <form onSubmit={handleCreateTurma}>
        <DialogTrigger asChild>
          <Button className="rounded-md bg-green-600 text-white p-2 min-w-[200px] h-[60px] text-center flex items-center justify-center gap-2">
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
                Nome da Disciplina:
              </Label>
              <Input
                id="disciplina"
                type="text"
                value={novaTurma.disciplinaId}
                onChange={(e) => handleNovaTurmaChange("disciplinaId", e.target.value)}
                placeholder="Digite o nome da disciplina"
                required
              />
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
                {salas && salas.length > 0 ? (
                  salas.map((sala) => (
                    <option key={sala.id} value={sala.id}>
                      {sala.numero} (Capacidade: {sala.capacidadeMaxima})
                    </option>
                  ))
                ) : (
                  <option disabled>Você não tem salas cadastradas</option>
                )}
              </select>
            </div>

            {/* Capacidade da Sala Selecionada */}
            {novaTurma.salaId && Array.isArray(salas) && (
              <div className="flex flex-col ml-6">
                <Label className="pb-2 text-green-600 font-semibold">
                  Capacidade da Sala: {
                    (() => {
                      const salaEncontrada = salas.find(sala => sala.id && sala.id.toString() === novaTurma.salaId);
                      return salaEncontrada?.capacidadeMaxima ?? 'N/A';
                    })()
                  } alunos
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit">
              Criar Turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog >
  );
}
