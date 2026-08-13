-- Agregar el estado de cita "Atendida" para que las comisiones de doctores
-- y el cambio manual de estado a "Atendida" funcionen correctamente.
INSERT INTO "estados_cita" ("nombre_estado")
VALUES ('Atendida')
ON CONFLICT ("nombre_estado") DO NOTHING;
