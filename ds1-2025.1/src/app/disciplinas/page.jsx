"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DisciplinaService } from "@/services/DisciplinaService";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CadastrarSala() {
  const [filterValue, setFilterValue] = useState("");
  const [tabela, setTabela] = useState([]);
  const [isDialogEditOpen, setIsDialogEditOpen] = useState(false);
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [necessitaArCondicionado, setArCondicionado] = useState(false);
  const [necessitaLaboratiorio, setLaboratorio] = useState(false);
  const [necessitaLousaDigital, setLousaDigital] = useState(false);
  const [selectedDisciplinaId, setSeletecDisciplinaId] = useState("");

  useEffect(() => {
    DisciplinaService.getAllDisciplinas()
      .then((response) => {
        //console.log('Salas Disciplinas:', response.data);
        setTabela(response.data || []);
      })
      .catch((error) => {
        console.error('Não foi possível requisitar todas as disciplinas', error);
        setTabela([]);
      });
  }, []);

  const criarDisciplina = async (event) => {
    event.preventDefault();

    const payload = {
      nome: nome,
      necessitaLaboratiorio: necessitaLaboratiorio ? necessitaLaboratiorio : false,
      necessitaArCondicionado: necessitaArCondicionado ? necessitaArCondicionado : false,
      necessitaLousaDigital: necessitaLousaDigital ? necessitaLousaDigital : false,
    };

    //console.log("Payload sendo enviado:", payload);

    try {
      const response = await DisciplinaService.createDisciplina(payload);
      //("Resposta do servidor:", response);
      setTabela((prevTable) => [...prevTable, response.data]);

      setArCondicionado(null);
      setLousaDigital(null);
      setLaboratorio(null);
    } catch (error) {
      console.error("Erro ao criar disciplina:", error);
    }
  };


  const handleEditDisciplina = (disciplina) => {
    setSeletecDisciplinaId(disciplina.id)

    setNome(disciplina.nome);
    setArCondicionado(disciplina.necessitaArCondicionado);
    setLaboratorio(disciplina.necessitaLaboratiorio);
    setLousaDigital(disciplina.necessitaLousaDigital);

    setIsDialogEditOpen(true);
  };

  const handleOpenDeleteDialog = (disciplina) => {
    setSeletecDisciplinaId(disciplina.id);

    setNome(disciplina.nome);
    setArCondicionado(disciplina.necessitaArCondicionado);
    setLaboratorio(disciplina.necessitaLaboratiorio);
    setLousaDigital(disciplina.necessitaLousaDigital);

    setIsDialogDeleteOpen(true);
  };

  // Atualizar os dados da sala
  const editarDisciplina = async () => {
    const payload = {
      nome,
      necessitaLaboratiorio,
      necessitaArCondicionado,
      necessitaLousaDigital,
    };

    try {
      await DisciplinaService.editDisciplina(selectedDisciplinaId, payload);
      setTabela(prev =>
        prev.map(item =>
          item.id === selectedDisciplinaId
            ? { ...item, ...payload }
            : item
        )
      );

      setIsDialogEditOpen(false);

    } catch (error) {
      console.error("Erro ao atualizar disciplina:", error);
    }
  };

  const deletarDisciplina = async () => {
    try {
      const response = await DisciplinaService.deleteDisciplina(selectedDisciplinaId);

      setTabela((prevTable) => prevTable.filter(item => item.id !== selectedDisciplinaId));
      alert("Disciplina deletada com sucesso!");
      setIsDialogDeleteOpen(false);
    } catch (error) {
      console.error("Erro ao deletar disciplina:", error);
    }
  };

  return (
    <main className="w-full">
      <div className="w-full flex font-bold text-4xl justify-center mt-4 mb-8">
        Disciplinas
      </div>

      <div className="p-6 max-w-full mx-auto">
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar"
              className="border border-black"
              value={filterValue}
              onChange={(e) =>
                setDisciplina(e.target.value)
              }
            />

            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="rounded-md bg-blue-600 text-white p-1.5 mr-2 w-[200px]">
                    Cadastrar Disciplina
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      Cadastrar Disciplina
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 ">
                    <div className="flex flex-col ml-6">
                      <Label htmlFor="name" className="pb-2">
                        Nome:
                      </Label>
                      <Input
                        type="text"
                        id="nome"
                        className="col-span-3"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 items-center gap-3 ml-6">
                      <div className="flex items-center gap-2">
                        <Input
                          id="lab"
                          type="checkbox"
                          checked={necessitaLaboratiorio}
                          onChange={(e) => setLaboratorio(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="lab" className="text-right">Laboratório</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="lousa"
                          className="w-4 h-4"
                          type="checkbox"
                          checked={necessitaLousaDigital}
                          onChange={(e) => setLousaDigital(e.target.checked)}
                        />
                        <Label htmlFor="lousa" className="text-right">Lousa Digital</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="ar"
                          type="checkbox"
                          checked={necessitaArCondicionado}
                          onChange={(e) => setArCondicionado(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="ar" className="text-sm font-medium">Ar</Label>
                      </div>
                    </div>


                  </div>

                  <form onSubmit={criarDisciplina}>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button type="submit">
                        Salvar
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

          </div>
        </div>

        <div className="border rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Ar</TableHead>
                <TableHead>Lab</TableHead>
                <TableHead>Lousa Digital</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(tabela) && tabela
                .filter((row) =>
                  Object.values(row).some((value) =>
                    value !== null && value !== undefined &&
                    value
                      .toString()
                      .toLowerCase()
                      .includes(filterValue.toLowerCase())
                  )
                )
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>
                      {row.necessitaArCondicionado ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell>
                      {row.necessitaLaboratiorio ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell>
                      {row.necessitaLousaDigital ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell>
                      {/* Botão de Editar */}
                      <button className="mr-2 text-blue-500 hover:text-blue-700">
                        <Pencil onClick={() => handleEditDisciplina(row)} />
                      </button>

                      {/* Botão de Excluir */}
                      <button className="mr-2 text-red-500 hover:text-red-700" onClick={() => handleOpenDeleteDialog(row)}>
                        <Trash2 />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogEditOpen} onOpenChange={setIsDialogEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Disciplina</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome:</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Laboratório:
              </Label>
              <Input
                id="username"
                className="col-span-3"
                type="checkbox"
                checked={necessitaLaboratiorio}
                onChange={(e) => setLaboratorio(e.target.checked)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Lousa Digital:
              </Label>
              <Input
                id="username"
                className="col-span-3"
                type="checkbox"
                checked={necessitaLousaDigital}
                onChange={(e) => setLousaDigital(e.target.checked)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Ar Condicionado:
              </Label>
              <Input
                id="username"
                className="col-span-3"
                type="checkbox"
                checked={necessitaArCondicionado}
                onChange={(e) => setArCondicionado(e.target.checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editarDisciplina}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogDeleteOpen} onOpenChange={setIsDialogDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Disciplina</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir a disciplina {nome}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deletarDisciplina}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
