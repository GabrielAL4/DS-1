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
import { SalaService } from "@/services/SalaService";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeletarSalaModal({ row, setTabela }) {
  const [open, setOpen] = useState(false);

  const handleDeleteSala = async (event) => {
    event.preventDefault();

    try {
      const response = await SalaService.deleteSala(row.id);

      if (response.status === 204) {
        setTabela((prev) => prev.filter((item) => item.id !== row.id));

        setOpen(false);
      } else {
        console.warn("Delete retornou status inesperado:", response.status);
      }
    } catch (error) {
      console.error("Erro ao deletar sala:", error);

      alert("Não foi possível deletar a sala. Tente novamente.");
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 color="red" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Sala</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleDeleteSala}>
          <p>Tem certeza que deseja excluir a sala{" "} {row.numero} do bloco {row.bloco} {row.id}?</p>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button variant="destructive" type="submit">
              Excluir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
