CREATE TABLE "odontograma_detalle_historiales" (
    "id" SERIAL NOT NULL,
    "odontograma_detalle_id" INTEGER NOT NULL,
    "condicion" VARCHAR(100) NOT NULL,
    "superficie" VARCHAR(100),
    "observacion" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "odontograma_detalle_historiales_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "odontograma_detalle_historiales_odontograma_detalle_id_fecha_registro_idx"
ON "odontograma_detalle_historiales"("odontograma_detalle_id", "fecha_registro");

ALTER TABLE "odontograma_detalle_historiales"
ADD CONSTRAINT "odontograma_detalle_historiales_odontograma_detalle_id_fkey"
FOREIGN KEY ("odontograma_detalle_id") REFERENCES "odontograma_detalles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
