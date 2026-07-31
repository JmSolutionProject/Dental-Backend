# Odontogram API For Frontend

Guia rapida para que el frontend pueda consultar catalogos dentales y registrar datos del odontograma de un paciente. La API usa el prefijo global `/api`.

## Base

| Dato | Valor |
| --- | --- |
| Base local | `http://localhost:13000/api` |
| Auth | `Authorization: Bearer <accessToken>` |
| Content-Type | `application/json` |

Todos los endpoints de este documento requieren token JWT.

## Flujo Recomendado Para Ingreso

1. Consultar catalogos: `GET /odontogram/teeth`, `GET /odontogram/surfaces`, `GET /odontogram/states`.
2. Cargar odontograma actual del paciente: `GET /odontograms/:patientId`.
3. Guardar una pieza simple: `PUT /odontograms/:patientId`.
4. Guardar un detalle con superficie/tratamiento: `POST /odontogram/details`.
5. Refrescar pantalla: `GET /odontogram/details/by-patient/:patientId` o `GET /odontograms/:patientId`.

## Roles

| Accion | Roles permitidos |
| --- | --- |
| Consultar catalogos | `ADMIN`, `MEDICO` |
| Consultar detalles | `ADMIN`, `SECRETARIA`, `MEDICO` |
| Crear/actualizar detalles | `ADMIN`, `MEDICO` |
| Eliminar detalles | `ADMIN`, `MEDICO` |
| Eliminar odontogramas de paciente | `ADMIN` |

## Catalogos

### `GET /api/odontogram/teeth`

Lista piezas dentales disponibles.

Response:

```json
[
  {
    "id": 1,
    "codigoFdi": "11",
    "nombrePieza": "Pieza FDI 11",
    "tipoPieza": "permanente",
    "cuadrante": 1,
    "arcada": "superior",
    "lado": "derecho",
    "posicion": 1,
    "estado": true
  }
]
```

### `GET /api/odontogram/surfaces`

Lista superficies dentales.

Response:

```json
[
  {
    "id": 1,
    "nombreSuperficie": "Oclusal",
    "abreviatura": "O"
  }
]
```

### `GET /api/odontogram/states`

Lista estados clinicos de una pieza dental.

Response:

```json
[
  {
    "id": 1,
    "nombreEstado": "Caries"
  }
]
```

## Odontograma Por Paciente

### `GET /api/odontograms/:patientId`

Obtiene el odontograma mas reciente del paciente.

Response cuando no tiene piezas registradas:

```json
{
  "patientId": "1",
  "quadrant": "adult",
  "teeth": []
}
```

Response con piezas:

```json
{
  "patientId": "1",
  "quadrant": "adult",
  "teeth": [
    {
      "fdiNumber": 11,
      "condition": "caries",
      "notes": "Caries oclusal"
    }
  ]
}
```

### `POST /api/odontograms`

Crea un odontograma para un paciente.

Request:

```json
{
  "patientId": 1,
  "citaId": 10,
  "notes": "Odontograma inicial"
}
```

Campos:

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `patientId` | number | Si | ID del paciente. En el DTO aparece opcional, pero la logica lo requiere. |
| `citaId` | number | No | ID de la cita asociada. |
| `notes` | string | No | Observacion general del odontograma. |

Response:

```json
{
  "patientId": "1",
  "quadrant": "adult",
  "teeth": []
}
```

### `PUT /api/odontograms/:patientId`

Actualiza una pieza dental simple del paciente. Si el paciente no tiene odontograma, el backend crea uno. Si la pieza ya existe en el odontograma, la actualiza; si no existe, la crea.

Request:

```json
{
  "fdiNumber": 11,
  "condition": "caries",
  "notes": "Caries oclusal"
}
```

Campos:

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `fdiNumber` | number | Si | Numero FDI de la pieza dental. Debe existir en catalogo como `codigoFdi`. |
| `condition` | string | Si | Estado/diagnostico visible de la pieza. Si no existe como estado, el backend lo crea. |
| `notes` | string | No | Observacion de la pieza. |

Response: odontograma completo del paciente actualizado.

### `DELETE /api/odontograms/:patientId`

Elimina fisicamente todos los odontogramas y detalles del paciente.

Response:

```json
{
  "patientId": "1",
  "deleted": 2
}
```

## Detalles De Odontograma

Usar estos endpoints cuando el frontend necesita guardar informacion mas completa: superficie, tratamiento recomendado, observacion clinica, o asociar el detalle a una cita.

### `GET /api/odontogram/details?page=1&limit=10&patientId=1`

Lista detalles paginados. `patientId` es opcional; si se envia, filtra por paciente.

Response:

```json
{
  "data": [
    {
      "id": "1",
      "odontogramId": "5",
      "dentalPieceId": "1",
      "fdiNumber": 11,
      "dentalPieceName": "Pieza FDI 11",
      "condition": "Caries oclusal",
      "surfaceId": "6",
      "surface": "Oclusal",
      "surfaceName": "Oclusal",
      "stateId": "2",
      "stateName": "Caries",
      "diagnosis": "Caries oclusal",
      "recommendedTreatment": "Restauracion con resina",
      "notes": "Paciente refiere sensibilidad al frio"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `GET /api/odontogram/details/by-patient/:patientId`

Lista todos los detalles del odontograma de un paciente sin paginacion.

Response:

```json
{
  "patientId": "1",
  "dentition": "adult",
  "details": [
    {
      "id": "1",
      "odontogramId": "5",
      "dentalPieceId": "1",
      "fdiNumber": 11,
      "dentalPieceName": "Pieza FDI 11",
      "condition": "Caries oclusal",
      "surfaceId": "6",
      "surface": "Oclusal",
      "surfaceName": "Oclusal",
      "stateId": "2",
      "stateName": "Caries",
      "diagnosis": "Caries oclusal",
      "recommendedTreatment": "Restauracion con resina",
      "notes": "Paciente refiere sensibilidad al frio"
    }
  ]
}
```

### `GET /api/odontogram/details/:id`

Obtiene un detalle por ID.

Response: el mismo objeto usado dentro de `details`.

### `POST /api/odontogram/details`

Registra o actualiza un detalle para una pieza/superficie del odontograma. Si ya existe un detalle para el mismo odontograma, pieza y superficie, el backend lo actualiza en vez de duplicarlo.

Request recomendado para frontend:

```json
{
  "patientId": 1,
  "citaId": 10,
  "fdiNumber": 11,
  "surface": "Oclusal",
  "condition": "Caries",
  "diagnostico": "Caries oclusal",
  "tratamientoRecomendado": "Restauracion con resina",
  "observacion": "Paciente refiere sensibilidad al frio",
  "observacionGeneral": "Odontograma inicial"
}
```

Tambien se puede enviar con IDs internos:

```json
{
  "pacienteId": 1,
  "citaId": 10,
  "odontogramaId": 5,
  "piezaDentalId": 1,
  "superficieId": 6,
  "estadoPiezaId": 2,
  "diagnostico": "Caries oclusal",
  "tratamientoRecomendado": "Restauracion con resina",
  "observacion": "Paciente refiere sensibilidad al frio"
}
```

Campos importantes:

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `patientId` o `pacienteId` | number | Si | ID del paciente. |
| `odontogramaId` | number | No | Si se envia, usa ese odontograma. Si no, busca/crea uno para el paciente y cita. |
| `citaId` | number | No | ID de cita asociada. |
| `fdiNumber` o `piezaDentalId` | number | Si | Pieza dental por FDI o por ID interno. |
| `surface` o `superficieId` | string/number | No | Superficie dental. Si `surface` no existe, el backend la crea. |
| `condition` o `estadoPiezaId` | string/number | Si | Estado clinico. Si `condition` no existe, el backend lo crea. |
| `diagnostico` | string | No | Diagnostico final mostrado como `diagnosis`. |
| `tratamientoRecomendado` | string | No | Tratamiento recomendado. |
| `observacion` o `notes` | string | No | Observacion del detalle. |
| `observacionGeneral` | string | No | Observacion general al crear el odontograma. |

Response:

```json
{
  "id": "1",
  "odontogramId": "5",
  "dentalPieceId": "1",
  "fdiNumber": 11,
  "dentalPieceName": "Pieza FDI 11",
  "condition": "Caries oclusal",
  "surfaceId": "6",
  "surface": "Oclusal",
  "surfaceName": "Oclusal",
  "stateId": "2",
  "stateName": "Caries",
  "diagnosis": "Caries oclusal",
  "recommendedTreatment": "Restauracion con resina",
  "notes": "Paciente refiere sensibilidad al frio"
}
```

### `PUT /api/odontogram/details/:id`

Actualiza parcialmente un detalle existente.

Request:

```json
{
  "diagnostico": "Caries profunda",
  "tratamientoRecomendado": "Endodoncia",
  "observacion": "Dolor al frio"
}
```

Acepta los mismos campos que `POST /api/odontogram/details`, todos opcionales.

Response: detalle actualizado.

### `DELETE /api/odontogram/details/:id`

Elimina fisicamente un detalle.

Response: registro eliminado desde Prisma.

## Errores Comunes

| Caso | Respuesta esperada |
| --- | --- |
| Falta token | `401 Unauthorized` |
| Paciente no existe | `404 Paciente no encontrado.` |
| Detalle no existe | `404 Detalle de odontograma no encontrado.` |
| Pieza dental por ID no existe | `404 Pieza dental no encontrada.` |
| Pieza FDI invalida al crear detalle | `400 Codigo FDI invalido.` |
| Falta `patientId`/`pacienteId` en detalle | `400 patientId es requerido.` |
| Falta `fdiNumber` y `piezaDentalId` | `400 fdiNumber o piezaDentalId es requerido.` |
| Falta `condition` y `estadoPiezaId` | `400 condition o estadoPiezaId es requerido.` |

## Ejemplo De Implementacion Frontend

```ts
const API_URL = 'http://localhost:13000/api';

async function saveToothDetail(token: string, patientId: number) {
  const response = await fetch(`${API_URL}/odontogram/details`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patientId,
      fdiNumber: 11,
      surface: 'Oclusal',
      condition: 'Caries',
      diagnostico: 'Caries oclusal',
      tratamientoRecomendado: 'Restauracion con resina',
      observacion: 'Paciente refiere sensibilidad al frio',
    }),
  });

  if (!response.ok) {
    throw new Error('No se pudo guardar el detalle del odontograma');
  }

  return response.json();
}
```

## Recomendacion Para La Pantalla

Para una pantalla simple de odontograma, usar `GET /odontograms/:patientId` para pintar piezas y `PUT /odontograms/:patientId` para guardar una condicion rapida.

Para una pantalla clinica completa, usar `GET /odontogram/details/by-patient/:patientId` para pintar detalles y `POST /odontogram/details` para guardar cada pieza/superficie con diagnostico, tratamiento y observacion.
