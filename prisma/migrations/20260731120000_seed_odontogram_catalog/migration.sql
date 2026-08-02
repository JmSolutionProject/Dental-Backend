-- Seed the base odontogram catalog in the database so patient records can reference real teeth.
INSERT INTO "piezas_dentales" ("codigo_fdi", "nombre_pieza", "tipo_pieza", "cuadrante", "arcada", "lado", "posicion", "estado")
SELECT
    CONCAT(q.quadrant, p.position),
    CONCAT('Pieza FDI ', q.quadrant, p.position),
    'permanente',
    q.quadrant,
    CASE WHEN q.quadrant IN (1, 2) THEN 'superior' ELSE 'inferior' END,
    CASE WHEN q.quadrant IN (1, 4) THEN 'derecho' ELSE 'izquierdo' END,
    p.position,
    true
FROM (VALUES (1), (2), (3), (4)) AS q(quadrant)
CROSS JOIN generate_series(1, 8) AS p(position)
ON CONFLICT ("codigo_fdi") DO UPDATE SET
    "nombre_pieza" = EXCLUDED."nombre_pieza",
    "tipo_pieza" = EXCLUDED."tipo_pieza",
    "cuadrante" = EXCLUDED."cuadrante",
    "arcada" = EXCLUDED."arcada",
    "lado" = EXCLUDED."lado",
    "posicion" = EXCLUDED."posicion",
    "estado" = true;

INSERT INTO "piezas_dentales" ("codigo_fdi", "nombre_pieza", "tipo_pieza", "cuadrante", "arcada", "lado", "posicion", "estado")
SELECT
    CONCAT(q.quadrant, p.position),
    CONCAT('Pieza FDI ', q.quadrant, p.position),
    'temporal',
    q.quadrant,
    CASE WHEN q.quadrant IN (5, 6) THEN 'superior' ELSE 'inferior' END,
    CASE WHEN q.quadrant IN (5, 8) THEN 'derecho' ELSE 'izquierdo' END,
    p.position,
    true
FROM (VALUES (5), (6), (7), (8)) AS q(quadrant)
CROSS JOIN generate_series(1, 5) AS p(position)
ON CONFLICT ("codigo_fdi") DO UPDATE SET
    "nombre_pieza" = EXCLUDED."nombre_pieza",
    "tipo_pieza" = EXCLUDED."tipo_pieza",
    "cuadrante" = EXCLUDED."cuadrante",
    "arcada" = EXCLUDED."arcada",
    "lado" = EXCLUDED."lado",
    "posicion" = EXCLUDED."posicion",
    "estado" = true;

INSERT INTO "superficies_dentales" ("nombre_superficie", "abreviatura")
SELECT v."nombre_superficie", v."abreviatura"
FROM (VALUES
    ('Vestibular', 'V'),
    ('Lingual / Palatina', 'LP'),
    ('Mesial', 'M'),
    ('Distal', 'D'),
    ('Oclusal', 'O'),
    ('Incisal', 'I')
) AS v("nombre_superficie", "abreviatura")
WHERE NOT EXISTS (
    SELECT 1
    FROM "superficies_dentales" s
    WHERE LOWER(s."nombre_superficie") = LOWER(v."nombre_superficie")
       OR LOWER(s."abreviatura") = LOWER(v."abreviatura")
);

INSERT INTO "estados_pieza_dental" ("nombre_estado")
VALUES
    ('Sano'),
    ('Caries'),
    ('Curación'),
    ('Restauración'),
    ('Extracción'),
    ('Corona'),
    ('Ausente'),
    ('Endodoncia'),
    ('Implante'),
    ('Sellante'),
    ('Fractura')
ON CONFLICT ("nombre_estado") DO NOTHING;

-- Keep the newest duplicated mark before enforcing update semantics.
DELETE FROM "odontograma_detalles" d
WHERE d."id" NOT IN (
    SELECT MAX(keep."id")
    FROM "odontograma_detalles" keep
    GROUP BY keep."odontograma_id", keep."pieza_dental_id", COALESCE(keep."superficie_id", -1)
);

CREATE UNIQUE INDEX IF NOT EXISTS "odontograma_detalles_unique_tooth_idx"
ON "odontograma_detalles" ("odontograma_id", "pieza_dental_id")
WHERE "superficie_id" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "odontograma_detalles_unique_surface_idx"
ON "odontograma_detalles" ("odontograma_id", "pieza_dental_id", "superficie_id")
WHERE "superficie_id" IS NOT NULL;
