-- AlterTable
ALTER TABLE "citas" ADD COLUMN     "recordatorio_enviado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "configuraciones" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "configuraciones_pkey" PRIMARY KEY ("clave")
);
