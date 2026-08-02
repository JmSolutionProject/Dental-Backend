-- AlterTable
ALTER TABLE "citas" ADD COLUMN     "plan_servicio_id" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "porcentaje_comision" DECIMAL(5,2) DEFAULT 0.00;

-- CreateTable
CREATE TABLE "planes_tratamiento" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "medico_id" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,

    CONSTRAINT "planes_tratamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_tratamiento_servicios" (
    "id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "ejecutado" BOOLEAN NOT NULL DEFAULT false,
    "odontograma_detalle_id" INTEGER,

    CONSTRAINT "plan_tratamiento_servicios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_plan_servicio_id_fkey" FOREIGN KEY ("plan_servicio_id") REFERENCES "plan_tratamiento_servicios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_tratamiento" ADD CONSTRAINT "planes_tratamiento_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_tratamiento" ADD CONSTRAINT "planes_tratamiento_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_tratamiento_servicios" ADD CONSTRAINT "plan_tratamiento_servicios_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_tratamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_tratamiento_servicios" ADD CONSTRAINT "plan_tratamiento_servicios_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_tratamiento_servicios" ADD CONSTRAINT "plan_tratamiento_servicios_odontograma_detalle_id_fkey" FOREIGN KEY ("odontograma_detalle_id") REFERENCES "odontograma_detalles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
