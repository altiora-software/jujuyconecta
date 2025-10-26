import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>¡Próximamente!</DialogTitle>
          <DialogDescription>
            Estamos preparando el primer episodio de nuestro videopodcast. 
            <br />
            Suscribite para recibir la notificación cuando esté disponible.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={() => {
              // Podés agregar aquí la lógica de suscripción
              window.location.href = 'https://www.youtube.com/@jujuyconecta'
              onClose();
            }}
          >
            Suscribirse
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
