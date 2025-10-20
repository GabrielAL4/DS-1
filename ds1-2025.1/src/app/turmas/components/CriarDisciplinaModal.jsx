import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DisciplinaService } from "@/services/DisciplinaService";
import { useState } from "react";

export default function CriarDisciplinaModal() {
  const [novaDisciplina, setNovaDisciplina] = useState({
    nome: "",
    disciplinaId: 0,
    necessitaLaboratiorio: false,
    necessitaArCondicionado: false,
    necessitaLousaDigital: false,
  });

  // Função para atualizar campos do formulário
  const handleNovaDisciplinaChange = (field, value) => {
    setNovaDisciplina(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateDisciplina = async (event) => {
    event.preventDefault();

    if (!novaDisciplina.nome) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const disciplinaPayload = {
        nome: novaDisciplina.nome,
        disciplinaId: novaDisciplina.disciplinaId,
        necessitaLaboratiorio: novaDisciplina.necessitaLaboratiorio,
        necessitaArCondicionado: novaDisciplina.necessitaArCondicionado,
        necessitaLousaDigital: novaDisciplina.necessitaLousaDigital
      }

      const response = await DisciplinaService.createDisciplina(disciplinaPayload);

      console.log(response);
    } catch (error) {
      console.error("Erro ao criar disciplina:", error);
      alert("Erro ao criar disciplina. Verifique os dados e tente novamente.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-md bg-green-600 text-white p-2 min-w-[200px] h-[60px] text-center flex items-center justify-center gap-2">Criar Disciplina</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar nova disciplina</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova disciplina
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateDisciplina}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col ml-6">
              <Label htmlFor="nome" className="pb-2">
                Nome:
              </Label>
              <Input
                id="nome"
                type="text"
                value={novaDisciplina.nome}
                onChange={(e) => handleNovaDisciplinaChange("nome", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-3 ml-6">
              <div className="flex items-center gap-2">
                <Input
                  id="necessitaLaboratiorio"
                  className="w-4 h-4"
                  type="checkbox"
                  checked={novaDisciplina.necessitaLaboratiorio}
                  onChange={(e) => handleNovaDisciplinaChange("necessitaLaboratiorio", e.target.checked)}
                />
                <Label
                  htmlFor="necessitaLaboratiorio" className="text-right">Necessita de laboratório</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="necessitaArCondicionado"
                  className="w-4 h-4"
                  type="checkbox"
                  checked={novaDisciplina.necessitaArCondicionado}
                  onChange={(e) => handleNovaDisciplinaChange("necessitaArCondicionado", e.target.checked)}
                />
                <Label htmlFor="necessitaArCondicionado" className="text-right">Lousa Digital</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="necessitaLousaDigital"
                  type="checkbox"
                  checked={novaDisciplina.necessitaLousaDigital}
                  onChange={(e) => handleNovaDisciplinaChange("necessitaLousaDigital", e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="necessitaLousaDigital" className="text-sm font-medium">Ar</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit">
              Criar disciplina
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
