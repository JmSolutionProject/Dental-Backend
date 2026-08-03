ALTER TABLE "campanas_whatsapp"
ADD COLUMN "fecha_inicio" TIMESTAMP(3),
ADD COLUMN "fecha_pausa" TIMESTAMP(3),
ADD COLUMN "fecha_cancelacion" TIMESTAMP(3),
ADD COLUMN "fecha_finalizacion" TIMESTAMP(3),
ADD COLUMN "estado_proceso" VARCHAR(20) NOT NULL DEFAULT 'pending',
ADD COLUMN "tipo_envio" VARCHAR(50) NOT NULL DEFAULT 'custom-message';

ALTER TABLE "campana_pacientes"
ADD COLUMN "telefono_whatsapp" VARCHAR(20),
ADD COLUMN "contenido" TEXT,
ADD COLUMN "media_key" VARCHAR(255),
ADD COLUMN "media_name" VARCHAR(255),
ADD COLUMN "media_mime_type" VARCHAR(100),
ADD COLUMN "intentos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "max_intentos" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "error_detalle" TEXT,
ADD COLUMN "whatsapp_message_id" VARCHAR(255),
ADD COLUMN "locked_at" TIMESTAMP(3),
ADD COLUMN "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

INSERT INTO "estados_envio_mensaje" ("nombre_estado")
VALUES ('Enviando')
ON CONFLICT ("nombre_estado") DO NOTHING;

INSERT INTO "estados_envio_mensaje" ("nombre_estado")
VALUES ('Cancelado')
ON CONFLICT ("nombre_estado") DO NOTHING;
