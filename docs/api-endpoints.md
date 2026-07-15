# Dental Clinic API Endpoints

Este documento resume los endpoints actuales del backend para que el frontend pueda consumirlos con menos ambiguedad. La API esta hecha con NestJS y usa el prefijo global `/api`.

## Base

| Dato                   | Valor                                 |
| ---------------------- | ------------------------------------- |
| Base local por defecto | `http://localhost:13000/api`          |
| Swagger UI             | `/api`                                |
| Autenticacion          | `Authorization: Bearer <accessToken>` |
| Content-Type           | `application/json`                    |
| CORS por defecto       | `http://localhost:4200`               |

> Nota: Swagger esta montado en `/api`, el mismo prefijo global de la API. Si necesitas ver la documentacion interactiva, abre `http://localhost:13000/api`.

## Reglas Globales

### Validacion

El backend usa `ValidationPipe` global con estas reglas:

| Regla                        | Efecto en frontend                                               |
| ---------------------------- | ---------------------------------------------------------------- |
| `whitelist: true`            | Campos no declarados en el DTO se eliminan o rechazan.           |
| `forbidNonWhitelisted: true` | Si envias campos extra, la API responde error de validacion.     |
| `transform: true`            | Nest intenta transformar tipos segun DTOs y `class-transformer`. |

### Autenticacion

Todos los endpoints protegidos requieren:

```http
Authorization: Bearer <accessToken>
```

Si falta el token:

```json
{
  "message": "Token no proporcionado.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Si el token es invalido o expiro:

```json
{
  "message": "Token invalido o expirado.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### Paginacion

Varios listados responden con esta forma:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

`page` inicia en `1`. `limit` se limita a un maximo de `100`.

### Importante Para Frontend

Algunos endpoints reciben campos en espanol pero responden con campos en ingles. Ejemplo: crear una cita usa `pacienteId`, pero listar citas devuelve `patientId`.

Tambien hay endpoints `POST` que actualmente parecen stubs: validan el body, pero no crean el recurso real y devuelven `{ "count": n }` o `null`. Estan marcados en este documento como "comportamiento actual".

## Resumen Rapido

| Modulo              | Endpoints                                                      |
| ------------------- | -------------------------------------------------------------- |
| Health/App          | `GET /api`                                                     |
| Auth                | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` |
| Roles               | CRUD en `/roles`                                               |
| Patients            | CRUD en `/patients`                                            |
| Appointments        | CRUD en `/appointments` y disponibilidad                       |
| Payments            | CRUD en `/payments`                                            |
| Catalog             | CRUD de servicios en `/catalog/services`                       |
| Messages            | CRUD en `/messages`                                            |
| Odontogram Catalog  | `/odontogram/teeth`, `/surfaces`, `/states`, `/details`        |
| Patient Odontograms | CRUD funcional en `/odontograms`                               |

## App

### `GET /api`

Endpoint raiz simple.

| Campo            | Detalle                       |
| ---------------- | ----------------------------- |
| Auth             | No requiere token             |
| Query            | Ninguno                       |
| Body             | Ninguno                       |
| Respuesta actual | Texto plano: `Api funcionado` |

## Auth

### `POST /api/auth/register`

Registra un usuario del sistema y devuelve token JWT.

| Campo | Detalle              |
| ----- | -------------------- |
| Auth  | No requiere token    |
| Body  | `RegisterRequestDto` |

Request:

```json
{
  "nombreCompleto": "Dr. Juan Perez",
  "email": "doctor@clinic.com",
  "password": "SecurePass123*",
  "roles": ["admin", "medico"]
}
```

Validaciones:

| Campo            | Tipo     | Reglas                         |
| ---------------- | -------- | ------------------------------ |
| `nombreCompleto` | string   | Requerido, no vacio            |
| `email`          | string   | Requerido, email valido        |
| `password`       | string   | Requerido, minimo 8 caracteres |
| `roles`          | string[] | Opcional, valores unicos       |

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "nombreCompleto": "Dr. Juan Perez",
    "email": "doctor@clinic.com",
    "estado": true,
    "fechaRegistro": "2026-06-28T23:00:00.000Z",
    "roles": [{ "id": 1, "nombreRol": "admin" }]
  }
}
```

### `POST /api/auth/login`

Inicia sesion y devuelve token JWT.

| Campo | Detalle           |
| ----- | ----------------- |
| Auth  | No requiere token |
| Body  | `LoginRequestDto` |

Request:

```json
{
  "email": "doctor@clinic.com",
  "password": "SecurePass123*"
}
```

Validaciones:

| Campo      | Tipo   | Reglas              |
| ---------- | ------ | ------------------- |
| `email`    | string | Email valido        |
| `password` | string | Minimo 8 caracteres |

Response: igual a `POST /api/auth/register`.

### `GET /api/auth/profile`

Devuelve el perfil del usuario autenticado.

| Campo | Detalle               |
| ----- | --------------------- |
| Auth  | Requiere Bearer token |
| Query | Ninguno               |
| Body  | Ninguno               |

Response:

```json
{
  "id": 1,
  "nombreCompleto": "Dr. Juan Perez",
  "email": "doctor@clinic.com",
  "estado": true,
  "fechaRegistro": "2026-06-28T23:00:00.000Z",
  "roles": [{ "id": 1, "nombreRol": "admin" }]
}
```

## Roles

Todos los endpoints de roles requieren Bearer token.

### `GET /api/roles`

Lista roles paginados.

Query:

| Campo   | Tipo          | Default | Detalle           |
| ------- | ------------- | ------- | ----------------- |
| `page`  | string/number | `1`     | Pagina solicitada |
| `limit` | string/number | `10`    | Maximo `100`      |

Response:

```json
{
  "data": [{ "id": 1, "nombreRol": "admin", "estado": true }],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `GET /api/roles/:id`

Obtiene un rol por ID.

Response:

```json
{ "id": 1, "nombreRol": "admin", "estado": true }
```

Si no existe: `404` con `Rol no encontrado.`

### `POST /api/roles`

Crea un rol.

Request:

```json
{
  "nombreRol": "admin",
  "estado": true
}
```

Validaciones:

| Campo       | Tipo    | Reglas                            |
| ----------- | ------- | --------------------------------- |
| `nombreRol` | string  | Requerido, maximo 50              |
| `estado`    | boolean | Opcional, default esperado `true` |

Response:

```json
{ "id": 1, "nombreRol": "admin", "estado": true }
```

### `PUT /api/roles/:id`

Actualiza parcialmente un rol.

Request:

```json
{
  "nombreRol": "recepcionista",
  "estado": true
}
```

Todos los campos son opcionales. Responde el rol actualizado.

### `DELETE /api/roles/:id`

Elimina logicamente un rol colocando `estado: false`.

Response: rol actualizado.

## Patients

Todos los endpoints de pacientes requieren Bearer token.

### `GET /api/patients`

Lista pacientes paginados, con busqueda y ordenamiento.

Query:

| Campo     | Tipo   | Default | Detalle                                              |
| --------- | ------ | ------- | ---------------------------------------------------- |
| `page`    | string | `1`     | Pagina                                               |
| `limit`   | string | `10`    | Maximo `100`                                         |
| `search`  | string | -       | Busca en nombres, apellidos y telefono WhatsApp      |
| `sortBy`  | string | `id`    | `firstName`, `lastName`, `birthDate`, `status`, `id` |
| `sortDir` | string | `asc`   | `asc` o `desc`                                       |

Response:

```json
{
  "data": [
    {
      "id": "1",
      "firstName": "Juan",
      "lastName": "Perez",
      "documentNumber": "",
      "phone": "+51999999999",
      "email": "",
      "birthDate": "1990-05-10",
      "status": "active",
      "medicalHistory": {
        "allergies": ["Alergia a penicilina"],
        "conditions": [],
        "medications": []
      },
      "notes": ""
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `GET /api/patients/:id`

Obtiene detalle de un paciente.

Response: objeto `PatientResponse` igual al item de `GET /patients`.

Si no existe: `404` con `Paciente no encontrado.`

### `POST /api/patients`

Crea un paciente.

Request:

```json
{
  "nombres": "Juan",
  "apellidos": "Perez",
  "fechaNacimiento": "1990-05-10",
  "telefonoWhatsapp": "+51999999999",
  "alergiasCriticas": "Alergia a penicilina"
}
```

Validaciones:

| Campo              | Tipo   | Reglas                |
| ------------------ | ------ | --------------------- |
| `nombres`          | string | Requerido, maximo 100 |
| `apellidos`        | string | Requerido, maximo 100 |
| `fechaNacimiento`  | string | Opcional, fecha ISO   |
| `telefonoWhatsapp` | string | Opcional, maximo 20   |
| `alergiasCriticas` | string | Opcional              |

Comportamiento actual: el use case no crea el paciente todavia; devuelve un conteo.

```json
{ "count": 10 }
```

### `PUT /api/patients/:id`

Actualiza parcialmente un paciente.

Request: mismos campos que `POST /patients`, todos opcionales.

Response: `PatientResponse` actualizado.

### `DELETE /api/patients/:id`

Elimina logicamente un paciente colocando `estado: false`.

Response: `PatientResponse` con `status: "inactive"`.

## Appointments

Todos los endpoints de citas requieren Bearer token.

### `GET /api/appointments/availability`

Valida si un odontologo esta disponible en un rango horario.

Query:

| Campo       | Tipo   | Reglas                  |
| ----------- | ------ | ----------------------- |
| `dentistId` | string | Opcional, ID del medico |
| `start`     | string | Opcional, fecha ISO     |
| `end`       | string | Opcional, fecha ISO     |

Si falta algun parametro requerido por la logica:

```json
{ "available": false, "conflicts": [] }
```

Response con conflictos:

```json
{
  "available": false,
  "conflicts": [
    {
      "id": "1",
      "patientId": "1",
      "patientName": "Juan Perez",
      "dentistId": "2",
      "dentistName": "Dr. Ana Lopez",
      "scheduledAt": "2026-07-05T09:00:00.000Z",
      "reason": "Dolor molar",
      "status": "scheduled",
      "cancelReason": null
    }
  ]
}
```

### `GET /api/appointments`

Lista citas paginadas ordenadas por fecha de inicio ascendente.

Query: `page`, `limit`.

Response:

```json
{
  "data": [
    {
      "id": "1",
      "patientId": "1",
      "patientName": "Juan Perez",
      "dentistId": "2",
      "dentistName": "Dr. Ana Lopez",
      "scheduledAt": "2026-07-05T09:00:00.000Z",
      "reason": "Dolor molar",
      "status": "scheduled",
      "cancelReason": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

Estados normalizados para frontend:

| Estado en BD                          | Response frontend |
| ------------------------------------- | ----------------- |
| `cancelled`, `cancelada`, `cancelado` | `cancelled`       |
| `completed`, `completada`, `atendida` | `completed`       |
| Otros                                 | `scheduled`       |

### `GET /api/appointments/:id`

Obtiene detalle de una cita.

Response: objeto `AppointmentResponse` igual al item de `GET /appointments`.

Si no existe: `404` con `Cita no encontrada.`

### `POST /api/appointments`

Crea una cita.

Request:

```json
{
  "pacienteId": 1,
  "medicoId": 2,
  "estadoCitaId": 1,
  "fechaHoraInicio": "2026-07-05T09:00:00.000Z",
  "fechaHoraFin": "2026-07-05T10:00:00.000Z",
  "motivoPrincipal": "Dolor molar",
  "observaciones": "Paciente requiere radiografia"
}
```

Validaciones principales: IDs enteros positivos, fechas ISO, `motivoPrincipal` maximo 200.

Comportamiento actual: el use case no crea la cita todavia; devuelve un conteo.

```json
{ "count": 10 }
```

### `PUT /api/appointments/:id`

Actualiza parcialmente una cita.

Request: mismos campos que `POST /appointments`, todos opcionales.

Response: `AppointmentResponse` actualizado.

### `DELETE /api/appointments/:id`

Cancela una cita. No la borra fisicamente: resuelve o crea el estado `cancelled` y lo asigna a la cita.

Response: `AppointmentResponse` con `status: "cancelled"`.

## Payments

Todos los endpoints de pagos requieren Bearer token.

### `GET /api/payments`

Lista pagos paginados ordenados por `fechaPago` descendente.

Query: `page`, `limit`.

Response:

```json
{
  "data": [
    {
      "id": "1",
      "appointmentId": "1",
      "cashierId": "2",
      "cashierName": "Recepcionista Uno",
      "methodId": "1",
      "methodName": "Yape",
      "amount": 120.5,
      "reference": "YAPE-00012345",
      "notes": "Pago parcial de la cita",
      "paidAt": "2026-07-03T20:15:00.000Z",
      "status": "active"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `GET /api/payments/:id`

Obtiene un pago por ID.

Response: objeto `PaymentResponse` igual al item de `GET /payments`.

Si no existe: `404` con `Pago no encontrado.`

### `POST /api/payments`

Registra un pago.

Request:

```json
{
  "citaId": 1,
  "usuarioCobradorId": 2,
  "metodoPagoId": 1,
  "montoPagado": 120.5,
  "numeroOperacion": "YAPE-00012345",
  "observacion": "Pago parcial de la cita",
  "fechaPago": "2026-07-03T20:15:00.000Z"
}
```

Validaciones principales: IDs enteros positivos, `montoPagado` positivo con maximo 2 decimales, `numeroOperacion` maximo 100.

Comportamiento actual: el use case no crea el pago todavia; devuelve un conteo.

```json
{ "count": 10 }
```

### `PUT /api/payments/:id`

Actualiza parcialmente un pago.

Request: mismos campos que `POST /payments`, todos opcionales.

Response: `PaymentResponse` actualizado.

### `DELETE /api/payments/:id`

Elimina logicamente un pago colocando `estado: false`.

Response: `PaymentResponse` con `status: "inactive"`.

## Catalog Services

Todos los endpoints de catalogo requieren Bearer token.

### `GET /api/catalog/services`

Lista servicios paginados con categoria y precio vigente mas reciente.

Query: `page`, `limit`.

Response:

```json
{
  "data": [
    {
      "id": "1",
      "categoryId": "1",
      "categoryName": "Odontologia general",
      "name": "Limpieza dental",
      "description": "Incluye profilaxis y fluorizacion",
      "status": "active",
      "price": 85
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `GET /api/catalog/services/:id`

Obtiene un servicio por ID.

Response: objeto `ServiceResponse` igual al item de `GET /catalog/services`.

Si no existe: `404` con `Servicio no encontrado.`

### `POST /api/catalog/services`

Crea un servicio dentro del catalogo.

Request:

```json
{
  "categoriaId": 1,
  "nombreServicio": "Limpieza dental",
  "descripcion": "Incluye profilaxis y fluorizacion",
  "precio": 85,
  "fechaInicio": "2026-07-04"
}
```

Validaciones principales: `categoriaId` entero positivo, `nombreServicio` maximo 150, `precio` positivo con maximo 2 decimales, `fechaInicio` ISO opcional.

Comportamiento actual: el use case no crea el servicio todavia; devuelve un conteo.

```json
{ "count": 10 }
```

### `PUT /api/catalog/services/:id`

Actualiza parcialmente un servicio. Si se envia `precio`, crea un nuevo registro de precio con `fechaInicio` enviada o la fecha actual.

Request: mismos campos que `POST /catalog/services`, todos opcionales.

Response: `ServiceResponse` actualizado.

### `DELETE /api/catalog/services/:id`

Elimina logicamente un servicio colocando `estado: false`.

Response: `ServiceResponse` con `status: "inactive"`.

## Messages

Todos los endpoints de mensajes requieren Bearer token.

### `GET /api/messages`

Lista mensajes paginados ordenados por `fechaHoraProgramada` descendente.

Query: `page`, `limit`.

Response:

```json
{
  "data": [
    {
      "id": "1",
      "templateId": "1",
      "templateName": "Recordatorio de cita",
      "messageType": "whatsapp",
      "patientId": "10",
      "patientName": "Juan Perez",
      "appointmentId": "20",
      "statusId": "1",
      "status": "scheduled",
      "content": "Hola, recuerda tu cita.",
      "scheduledAt": "2026-07-06T09:30:00.000Z",
      "sentAt": null,
      "error": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `GET /api/messages/:id`

Obtiene un mensaje por ID.

Response: objeto `MessageResponse` igual al item de `GET /messages`.

Si no existe: `404` con `Mensaje no encontrado.`

### `POST /api/messages`

Registra un mensaje.

Request:

```json
{
  "plantillaId": 1,
  "pacienteId": 10,
  "citaId": 20,
  "estadoEnvioId": 1,
  "fechaHoraProgramada": "2026-07-06T09:30:00.000Z",
  "fechaHoraEnvio": "2026-07-06T09:35:00.000Z",
  "errorDetalle": "Error de proveedor externo"
}
```

Validaciones principales: IDs enteros positivos, fechas ISO, `citaId`, `fechaHoraEnvio` y `errorDetalle` opcionales.

Comportamiento actual: el use case busca `findById(0)`, por lo que puede devolver `null` o el resultado que implemente el repositorio para ID `0`; no crea el mensaje todavia.

### `PUT /api/messages/:id`

Actualiza parcialmente un mensaje.

Request: mismos campos que `POST /messages`, todos opcionales.

Response: `MessageResponse` actualizado.

### `DELETE /api/messages/:id`

Elimina fisicamente el mensaje.

Response: registro eliminado desde Prisma.

## Odontogram Catalog And Details

Todos los endpoints de odontograma requieren Bearer token.

### `GET /api/odontogram/teeth`

Lista el catalogo base de piezas dentales.

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

Lista superficies dentales disponibles.

Response:

```json
[{ "id": 1, "nombreSuperficie": "Oclusal", "abreviatura": "O" }]
```

### `GET /api/odontogram/states`

Lista estados clinicos disponibles para una pieza dental.

Response:

```json
[{ "id": 1, "nombreEstado": "Caries" }]
```

### `GET /api/odontogram/details`

Lista detalles de odontograma paginados.

Query: `page`, `limit`.

Response:

```json
{
  "data": [
    {
      "id": "1",
      "odontogramId": "1",
      "dentalPieceId": "1",
      "fdiNumber": 11,
      "dentalPieceName": "Pieza FDI 11",
      "surfaceId": "6",
      "surfaceName": "Oclusal",
      "stateId": "2",
      "stateName": "Caries",
      "diagnosis": "Caries oclusal en pieza 16.",
      "recommendedTreatment": "Evaluar restauracion con resina.",
      "notes": "Paciente refiere sensibilidad al frio."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `GET /api/odontogram/details/:id`

Obtiene un detalle de odontograma por ID.

Response: objeto `OdontogramDetailFrontendResponse` igual al item de `GET /odontogram/details`.

Si no existe: `404` con `Detalle de odontograma no encontrado.`

### `POST /api/odontogram/details`

Registra un detalle dentro del odontograma del paciente.

Request:

```json
{
  "pacienteId": 1,
  "citaId": 10,
  "odontogramaId": 5,
  "piezaDentalId": 1,
  "superficieId": 6,
  "estadoPiezaId": 2,
  "diagnostico": "Caries oclusal en pieza 16.",
  "tratamientoRecomendado": "Evaluar restauracion con resina.",
  "observacion": "Paciente refiere sensibilidad al frio.",
  "observacionGeneral": "Odontograma inicial del paciente."
}
```

Validaciones principales: IDs enteros mayores o iguales a `1`; `citaId`, `odontogramaId`, `superficieId`, textos y observacion general son opcionales.

Errores de negocio posibles:

| Caso                        | Error                                          |
| --------------------------- | ---------------------------------------------- |
| Pieza dental inexistente    | `400 La pieza dental indicada no existe.`      |
| Superficie inexistente      | `400 La superficie dental indicada no existe.` |
| Estado de pieza inexistente | `400 El estado de pieza indicado no existe.`   |

Response desde dominio:

```json
{
  "id": 1,
  "odontogramaId": 5,
  "piezaDentalId": 1,
  "superficieId": 6,
  "estadoPiezaId": 2,
  "diagnostico": "Caries oclusal en pieza 16.",
  "tratamientoRecomendado": "Evaluar restauracion con resina.",
  "observacion": "Paciente refiere sensibilidad al frio."
}
```

### `PUT /api/odontogram/details/:id`

Actualiza parcialmente un detalle de odontograma.

Request: mismos campos que `POST /odontogram/details`, todos opcionales.

Response: `OdontogramDetailFrontendResponse` actualizado.

### `DELETE /api/odontogram/details/:id`

Elimina fisicamente un detalle de odontograma.

Response: registro eliminado desde Prisma.

## Patient Odontograms

Todos los endpoints de odontogramas de paciente requieren Bearer token.

### `GET /api/odontograms`

Lista odontogramas paginados.

Query: `page`, `limit`.

Response:

```json
{
  "data": [
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
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `POST /api/odontograms`

Crea un odontograma de paciente.

Request:

```json
{
  "patientId": 1,
  "citaId": 1,
  "notes": "Initial odontogram"
}
```

Validaciones:

| Campo       | Tipo   | Reglas                                        |
| ----------- | ------ | --------------------------------------------- |
| `patientId` | number | Opcional en DTO, pero requerido por la logica |
| `citaId`    | number | Opcional                                      |
| `notes`     | string | Opcional                                      |

Si falta o no existe el paciente: `404 Paciente no encontrado.`

Response: `PatientOdontogram`.

### `GET /api/odontograms/:patientId`

Obtiene el odontograma completo mas reciente de un paciente.

Si el paciente existe pero no tiene odontograma, devuelve:

```json
{
  "patientId": "1",
  "quadrant": "adult",
  "teeth": []
}
```

Si existe odontograma, devuelve `PatientOdontogram` con piezas.

### `PUT /api/odontograms/:patientId`

Actualiza una pieza dental del paciente. Si el paciente no tiene odontograma, crea uno. Si el detalle de la pieza ya existe, lo actualiza; si no existe, lo crea.

Request:

```json
{
  "fdiNumber": 11,
  "condition": "caries",
  "notes": "Caries oclusal"
}
```

Validaciones:

| Campo       | Tipo   | Reglas                                           |
| ----------- | ------ | ------------------------------------------------ |
| `fdiNumber` | number | Requerido, numero FDI existente como `codigoFdi` |
| `condition` | string | Requerido                                        |
| `notes`     | string | Opcional                                         |

Si la pieza dental no existe: `404 Pieza dental no encontrada.`

Response: `PatientOdontogram` actualizado.

### `DELETE /api/odontograms/:patientId`

Elimina fisicamente todos los odontogramas y detalles asociados a un paciente.

Response:

```json
{
  "patientId": "1",
  "deleted": 2
}
```

## Contratos Para Tipar En Frontend

Estos tipos son una guia practica basada en las respuestas actuales.

```ts
type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

type AuthTokenResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  user: AuthUser;
};

type AuthUser = {
  id: number;
  nombreCompleto: string;
  email: string;
  estado: boolean;
  fechaRegistro: string;
  roles: Array<{ id: number; nombreRol: string }>;
};

type PatientResponse = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone: string;
  email: string;
  birthDate: string | null;
  status: 'active' | 'inactive';
  medicalHistory: {
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
  notes: string;
};

type AppointmentResponse = {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  scheduledAt: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  cancelReason: string | null;
};

type PatientOdontogram = {
  patientId: string;
  quadrant: 'adult';
  teeth: Array<{
    fdiNumber: number;
    condition: string;
    notes: string;
  }>;
};
```

## Endpoints Con Comportamiento Incompleto

Estos endpoints existen, validan entrada y responden, pero su implementacion actual no persiste el recurso como esperaria un CRUD completo:

| Endpoint                     | Comportamiento actual                      |
| ---------------------------- | ------------------------------------------ |
| `POST /api/patients`         | Devuelve `{ count }`                       |
| `POST /api/appointments`     | Devuelve `{ count }`                       |
| `POST /api/payments`         | Devuelve `{ count }`                       |
| `POST /api/catalog/services` | Devuelve `{ count }`                       |
| `POST /api/messages`         | Busca `findById(0)`; puede devolver `null` |

Para integracion frontend, conviene tratar estos endpoints como no finalizados hasta que el backend devuelva el recurso creado.
