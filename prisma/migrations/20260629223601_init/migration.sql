-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(50) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_roles" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,

    CONSTRAINT "usuario_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "fecha_nacimiento" DATE,
    "telefono_whatsapp" VARCHAR(20),
    "alergias_criticas" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_servicio" (
    "id" SERIAL NOT NULL,
    "nombre_categoria" VARCHAR(100) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "nombre_servicio" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicio_precios" (
    "id" SERIAL NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicio_precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_cita" (
    "id" SERIAL NOT NULL,
    "nombre_estado" VARCHAR(50) NOT NULL,

    CONSTRAINT "estados_cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "medico_id" INTEGER NOT NULL,
    "estado_cita_id" INTEGER NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_hora_fin" TIMESTAMP(3) NOT NULL,
    "motivo_principal" VARCHAR(200),
    "observaciones" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cita_servicios" (
    "id" SERIAL NOT NULL,
    "cita_id" INTEGER NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "cita_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" SERIAL NOT NULL,
    "nombre_metodo" VARCHAR(50) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "cita_id" INTEGER NOT NULL,
    "usuario_cobrador_id" INTEGER NOT NULL,
    "metodo_pago_id" INTEGER NOT NULL,
    "monto_pagado" DECIMAL(10,2) NOT NULL,
    "numero_operacion" VARCHAR(100),
    "observacion" TEXT,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_mensajes" (
    "id" SERIAL NOT NULL,
    "nombre_plantilla" VARCHAR(100) NOT NULL,
    "tipo_mensaje" VARCHAR(80) NOT NULL,
    "contenido" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "plantillas_mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_envio_mensaje" (
    "id" SERIAL NOT NULL,
    "nombre_estado" VARCHAR(50) NOT NULL,

    CONSTRAINT "estados_envio_mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes_envio" (
    "id" SERIAL NOT NULL,
    "plantilla_id" INTEGER NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "cita_id" INTEGER,
    "estado_envio_id" INTEGER NOT NULL,
    "fecha_hora_programada" TIMESTAMP(3) NOT NULL,
    "fecha_hora_envio" TIMESTAMP(3),
    "error_detalle" TEXT,

    CONSTRAINT "mensajes_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanas_whatsapp" (
    "id" SERIAL NOT NULL,
    "nombre_campana" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "usuario_creador_id" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "campanas_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campana_pacientes" (
    "id" SERIAL NOT NULL,
    "campana_id" INTEGER NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "estado_envio_id" INTEGER NOT NULL,
    "fecha_envio" TIMESTAMP(3),

    CONSTRAINT "campana_pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas_dentales" (
    "id" SERIAL NOT NULL,
    "codigo_fdi" VARCHAR(5) NOT NULL,
    "nombre_pieza" VARCHAR(100) NOT NULL,
    "tipo_pieza" VARCHAR(50) NOT NULL,
    "cuadrante" INTEGER NOT NULL,
    "arcada" VARCHAR(20) NOT NULL,
    "lado" VARCHAR(20) NOT NULL,
    "posicion" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "piezas_dentales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "superficies_dentales" (
    "id" SERIAL NOT NULL,
    "nombre_superficie" VARCHAR(50) NOT NULL,
    "abreviatura" VARCHAR(5) NOT NULL,

    CONSTRAINT "superficies_dentales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_pieza_dental" (
    "id" SERIAL NOT NULL,
    "nombre_estado" VARCHAR(80) NOT NULL,

    CONSTRAINT "estados_pieza_dental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odontogramas" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "cita_id" INTEGER,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion_general" TEXT,

    CONSTRAINT "odontogramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odontograma_detalles" (
    "id" SERIAL NOT NULL,
    "odontograma_id" INTEGER NOT NULL,
    "pieza_dental_id" INTEGER NOT NULL,
    "superficie_id" INTEGER,
    "estado_pieza_id" INTEGER NOT NULL,
    "diagnostico" TEXT,
    "tratamiento_recomendado" TEXT,
    "observacion" TEXT,

    CONSTRAINT "odontograma_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "estados_cita_nombre_estado_key" ON "estados_cita"("nombre_estado");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_nombre_metodo_key" ON "metodos_pago"("nombre_metodo");

-- CreateIndex
CREATE UNIQUE INDEX "estados_envio_mensaje_nombre_estado_key" ON "estados_envio_mensaje"("nombre_estado");

-- CreateIndex
CREATE UNIQUE INDEX "piezas_dentales_codigo_fdi_key" ON "piezas_dentales"("codigo_fdi");

-- CreateIndex
CREATE UNIQUE INDEX "estados_pieza_dental_nombre_estado_key" ON "estados_pieza_dental"("nombre_estado");

-- AddForeignKey
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicio_precios" ADD CONSTRAINT "servicio_precios_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_estado_cita_id_fkey" FOREIGN KEY ("estado_cita_id") REFERENCES "estados_cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_servicios" ADD CONSTRAINT "cita_servicios_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita_servicios" ADD CONSTRAINT "cita_servicios_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_usuario_cobrador_id_fkey" FOREIGN KEY ("usuario_cobrador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes_envio" ADD CONSTRAINT "mensajes_envio_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "plantillas_mensajes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes_envio" ADD CONSTRAINT "mensajes_envio_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes_envio" ADD CONSTRAINT "mensajes_envio_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes_envio" ADD CONSTRAINT "mensajes_envio_estado_envio_id_fkey" FOREIGN KEY ("estado_envio_id") REFERENCES "estados_envio_mensaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanas_whatsapp" ADD CONSTRAINT "campanas_whatsapp_usuario_creador_id_fkey" FOREIGN KEY ("usuario_creador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campana_pacientes" ADD CONSTRAINT "campana_pacientes_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "campanas_whatsapp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campana_pacientes" ADD CONSTRAINT "campana_pacientes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campana_pacientes" ADD CONSTRAINT "campana_pacientes_estado_envio_id_fkey" FOREIGN KEY ("estado_envio_id") REFERENCES "estados_envio_mensaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogramas" ADD CONSTRAINT "odontogramas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogramas" ADD CONSTRAINT "odontogramas_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontograma_detalles" ADD CONSTRAINT "odontograma_detalles_odontograma_id_fkey" FOREIGN KEY ("odontograma_id") REFERENCES "odontogramas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontograma_detalles" ADD CONSTRAINT "odontograma_detalles_pieza_dental_id_fkey" FOREIGN KEY ("pieza_dental_id") REFERENCES "piezas_dentales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontograma_detalles" ADD CONSTRAINT "odontograma_detalles_superficie_id_fkey" FOREIGN KEY ("superficie_id") REFERENCES "superficies_dentales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontograma_detalles" ADD CONSTRAINT "odontograma_detalles_estado_pieza_id_fkey" FOREIGN KEY ("estado_pieza_id") REFERENCES "estados_pieza_dental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
