# Documentación de Integración con Wompi

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Configuración](#configuración)
- [Arquitectura de API](#arquitectura-de-api)
- [Funciones Principales](#funciones-principales)
  - [Gestión de Transacciones](#gestión-de-transacciones)
  - [Utilidades de Seguridad](#utilidades-de-seguridad)
  - [Operaciones de Base de Datos](#operaciones-de-base-de-datos)
- [Modelos de Datos](#modelos-de-datos)
- [Endpoints de API](#endpoints-de-api)
- [Procesamiento de Webhooks](#procesamiento-de-webhooks)
- [Manejo de Errores](#manejo-de-errores)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Solución de Problemas](#solución-de-problemas)

## Descripción General

La integración con Wompi es una función Edge de Supabase que proporciona una interfaz segura del lado del servidor entre su aplicación y el servicio de procesamiento de pagos Wompi en Colombia. Esta integración gestiona:

- Creación y gestión de transacciones de pago
- Verificación y actualización del estado de las transacciones
- Procesamiento de webhooks para notificaciones de pago
- Sincronización de registros de pago en la base de datos
- Medidas de autenticación y seguridad

Esta implementación sigue las mejores prácticas para integrar procesadores de pago, asegurando un manejo seguro de la información de pago y un procesamiento confiable de las transacciones.

## Configuración

La función requiere que las siguientes variables de entorno estén configuradas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `WOMPI_PUBLIC_KEY` | Tu clave pública de API de Wompi | `pub_test_XXXXXXXX` |
| `WOMPI_PRIVATE_KEY` | Tu clave privada de API de Wompi | `prv_test_XXXXXXXX` |
| `WOMPI_EVENTS_KEY` | Clave para verificar firmas de webhooks de Wompi | `test_events_key` |
| `SUPABASE_URL` | URL de tu proyecto Supabase | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Clave anónima para acceso a la API de Supabase | `eyJhbGci...` |

Constantes adicionales dentro del código:

| Constante | Valor Predeterminado | Descripción |
|----------|---------------|-------------|
| `WOMPI_API_URL` | `'https://sandbox.wompi.co/v1'` | Endpoint de API de Wompi (sandbox) |

**Nota**: Para despliegue en producción, actualiza `WOMPI_API_URL` al endpoint de producción y usa claves de API de producción.

## Arquitectura de API

La integración con Wompi está construida como una Función Edge de Supabase, lo que le permite ejecutarse en un entorno sin servidor mientras mantiene una conexión segura con tu base de datos Supabase. La arquitectura sigue estos principios:

1. **Computación en el Edge**: Se ejecuta cerca de los usuarios para una latencia mínima
2. **Diseño Sin Estado**: Cada solicitud se procesa independientemente
3. **Basado en Eventos**: Responde a solicitudes HTTP y webhooks
4. **Seguridad Primero**: Implementa múltiples capas de autenticación y verificación

## Funciones Principales

### Gestión de Transacciones

#### `getAcceptanceTokens()`
Obtiene los tokens de aceptación requeridos desde la API de Wompi.

```typescript
async function getAcceptanceTokens(): Promise<{
  acceptance_token: string;
  personal_data_token: string;
}>
```

**Devuelve**: Un objeto que contiene tanto el token de aceptación como el token de datos personales requeridos para crear transacciones.

**Manejo de Errores**: Lanza un error si la solicitud a la API de Wompi falla.

#### `createTransaction(transactionData)`
Crea una nueva transacción de pago en Wompi.

```typescript
async function createTransaction(transactionData: CreateTransactionRequest): Promise<WompiTransaction>
```

**Parámetros**:
- `transactionData`: Objeto que contiene detalles de la transacción incluyendo monto, moneda, información del cliente y método de pago.

**Devuelve**: El objeto de transacción creado por Wompi.

**Proceso**:
1. Obtiene tokens de aceptación
2. Añade tokens a los datos de la transacción
3. Realiza solicitud a la API de Wompi
4. Devuelve la respuesta de la transacción

#### `getTransactionStatus(transactionId)`
Recupera el estado actual de una transacción.

```typescript
async function getTransactionStatus(transactionId: string): Promise<WompiTransaction>
```

**Parámetros**:
- `transactionId`: El ID de la transacción a consultar

**Devuelve**: El objeto de transacción con la información de estado actual.

### Utilidades de Seguridad

#### `generateSignature(amount, currency, reference)`
Crea una firma criptográfica para la integridad de la transacción.

```typescript
async function generateSignature(amount: number, currency: string, reference: string): Promise<string>
```

**Parámetros**:
- `amount`: Monto de la transacción (será convertido a centavos)
- `currency`: Código de moneda (ej. "COP")
- `reference`: Referencia única de la transacción

**Devuelve**: Una firma de cadena hexadecimal SHA-256.

#### `verifyWebhookSignature(request)`
Valida que los webhooks entrantes son legítimamente de Wompi.

```typescript
async function verifyWebhookSignature(request: Request): Promise<boolean>
```

**Parámetros**:
- `request`: El objeto de solicitud HTTP que contiene la carga útil del webhook

**Devuelve**: `true` si la firma es válida, `false` en caso contrario.

#### `verifyToken(token)`
Autentica tokens JWT de solicitudes de clientes.

```typescript
function verifyToken(token: string): JWTPayload
```

**Parámetros**:
- `token`: Cadena de token JWT

**Devuelve**: La carga útil JWT decodificada.

**Manejo de Errores**: Lanza un error si el token es inválido, está expirado o no puede ser verificado.

### Operaciones de Base de Datos

#### `storeTransaction(transaction, userId)`
Guarda datos de transacción en la base de datos Supabase.

```typescript
async function storeTransaction(transaction: WompiTransaction, userId?: string): Promise<void>
```

**Parámetros**:
- `transaction`: El objeto de transacción de Wompi
- `userId`: (Opcional) El ID de usuario asociado con la transacción

**Tabla de Base de Datos**: `transactions`

#### `updateTransactionStatus(transactionId, status)`
Actualiza el estado de la transacción en la base de datos.

```typescript
async function updateTransactionStatus(transactionId: string, status: string): Promise<void>
```

**Parámetros**:
- `transactionId`: El ID de la transacción a actualizar
- `status`: El nuevo valor de estado

**Tabla de Base de Datos**: `transactions`

## Modelos de Datos

### Datos de Solicitud de Transacción

```typescript
interface CreateTransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    [key: string]: unknown;
  };
  redirect_url?: string;
  reference: string;
  customer_data?: CustomerData;
}

interface CustomerData {
  full_name: string;
  phone_number?: string;
  legal_id?: string;
  legal_id_type?: string;
}
```

### Datos de Respuesta de Transacción

```typescript
interface WompiTransaction {
  id: string;
  amount_in_cents: number;
  reference: string;
  currency: string;
  payment_method_type: string;
  redirect_url?: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';
  payment_method: WompiPaymentMethod;
  customer_email: string;
  customer_data?: CustomerData;
}
```

### Métodos de Pago

La función soporta múltiples métodos de pago:

#### Tarjetas de Crédito/Débito
```typescript
interface WompiCardPaymentMethod extends WompiPaymentMethodBase {
  type: 'CARD';
  installments?: number;
  card: {
    last_four: string;
    brand: string;
    exp_month: string;
    exp_year: string;
  };
}
```

#### Pagos Móviles Nequi
```typescript
interface WompiNequiPaymentMethod extends WompiPaymentMethodBase {
  type: 'NEQUI';
  phone_number: string;
}
```

#### Transferencias Bancarias PSE
```typescript
interface WompiPSEPaymentMethod extends WompiPaymentMethodBase {
  type: 'PSE';
  financial_institution_code: string;
  payment_description?: string;
}
```

## Endpoints de API

La función maneja los siguientes endpoints HTTP:

### POST /create-transaction
Crea una nueva transacción de pago con Wompi.

**Autenticación**: Requerida (JWT)

**Cuerpo de la Solicitud**:
```json
{
  "amount_in_cents": 5000000,
  "currency": "COP",
  "customer_email": "user@example.com",
  "payment_method": {
    "type": "CARD",
    "token": "tok_test_xxxx_xxxxx"
  },
  "redirect_url": "https://your-app.com/checkout/result",
  "reference": "order-123-456",
  "customer_data": {
    "full_name": "John Doe",
    "phone_number": "3001234567"
  }
}
```

**Respuesta**:
```json
{
  "transaction": {
    "id": "11001-1650572337-28117",
    "amount_in_cents": 5000000,
    "reference": "order-123-456",
    "currency": "COP",
    "payment_method_type": "CARD",
    "redirect_url": "https://your-app.com/checkout/result",
    "status": "PENDING",
    "payment_method": {
      "type": "CARD",
      "card": {
        "last_four": "1234",
        "brand": "VISA",
        "exp_month": "12",
        "exp_year": "25"
      }
    },
    "customer_email": "user@example.com"
  }
}
```

### GET /transaction/:id
Recupera detalles de la transacción por ID.

**Autenticación**: Requerida (JWT)

**Parámetros de URL**:
- `id`: ID de la Transacción

**Respuesta**:
```json
{
  "transaction": {
    "id": "11001-1650572337-28117",
    "status": "APPROVED",
    "amount_in_cents": 5000000,
    "reference": "order-123-456",
    "currency": "COP",
    "payment_method_type": "CARD",
    "payment_method": {
      "type": "CARD",
      "card": {
        "last_four": "1234",
        "brand": "VISA",
        "exp_month": "12",
        "exp_year": "25"
      }
    },
    "customer_email": "user@example.com"
  }
}
```

### POST /webhook
Recibe y procesa actualizaciones de estado de transacciones desde Wompi.

**Autenticación**: Verificación de firma (no se requiere JWT)

**Cabeceras**:
- `X-Signature`: Firma de Wompi para verificación

**Cuerpo de la Solicitud** (ejemplo de un evento de pago):
```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "11001-1650572337-28117",
      "status": "APPROVED",
      "amount_in_cents": 5000000,
      "reference": "order-123-456"
    }
  },
  "sent_at": "2023-03-12T20:33:47.000Z"
}
```

**Respuesta**: HTTP 200 OK si se procesa con éxito

## Procesamiento de Webhooks

La integración puede procesar los siguientes eventos de webhook de Wompi:

| Tipo de Evento | Descripción | Acción |
|------------|-------------|--------|
| `transaction.updated` | El estado de la transacción ha cambiado | Actualiza el estado de la transacción en la base de datos |
| `transaction.pending` | La transacción está pendiente de completarse | Actualiza el estado a PENDING |
| `transaction.approved` | Transacción completada con éxito | Actualiza el estado a APPROVED |
| `transaction.declined` | La transacción fue rechazada | Actualiza el estado a DECLINED |
| `transaction.voided` | La transacción fue anulada/cancelada | Actualiza el estado a VOIDED |
| `transaction.error` | Ocurrió un error durante la transacción | Actualiza el estado a ERROR |

### Seguridad de Webhook

Todos los webhooks son verificados usando la función `verifyWebhookSignature` para asegurar que provienen de Wompi:

1. Extrae la cabecera `X-Signature` de la solicitud
2. Recalcula la firma usando el cuerpo de la solicitud y `WOMPI_EVENTS_KEY`
3. Compara la firma calculada con la firma proporcionada
4. Rechaza el webhook si la verificación falla

## Manejo de Errores

La integración implementa un manejo completo de errores para varios escenarios:

### Errores de Solicitud API
- Fallos de red al comunicarse con Wompi
- Respuestas inválidas o faltantes de Wompi

### Errores de Configuración
- Variables de entorno faltantes
- Claves API inválidas

### Errores de Autenticación
- Tokens JWT inválidos
- Expiración de tokens
- Cabeceras de autorización faltantes

### Errores de Webhook
- Firmas inválidas
- Cargas útiles de webhook mal formadas

### Errores de Base de Datos
- Fallos de conexión
- Errores de consulta
- Conflictos de transacción

Todos los errores son registrados y se devuelven respuestas HTTP apropiadas con mensajes de error descriptivos.

## Consideraciones de Seguridad

### Autenticación
- Todas las solicitudes de cliente requieren autenticación JWT
- Los JWT son verificados usando métodos seguros
- Se aplica la expiración de tokens

### Protección de Datos
- No se almacenan datos de pago sensibles en tu base de datos
- Solo se guardan referencias y estados de transacciones
- Cumple con los requisitos PCI-DSS al no almacenar datos de tarjetas

### Seguridad de API
- Comunicación solo por HTTPS
- Verificación de firma de solicitud
- Limitación de tasa (gestionada por Funciones Edge de Supabase)

### Seguridad de Webhook
- Verificación de firma criptográfica
- Validación de marca de tiempo para prevenir ataques de repetición

## Ejemplos de Uso

### Creando una Transacción desde una Aplicación Cliente

```typescript
// Ejemplo: Creando una transacción desde una aplicación cliente
const response = await fetch('https://your-supabase-url.functions.supabase.co/wompi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    path: 'create-transaction',
    data: {
      amount_in_cents: 5000000,
      currency: 'COP',
      customer_email: 'customer@example.com',
      payment_method: {
        type: 'CARD',
        token: 'tok_test_visa_approved'
      },
      reference: `order-${Date.now()}`,
      redirect_url: 'https://your-app.com/checkout/result'
    }
  })
});

const result = await response.json();
console.log(result.transaction);
```

### Obteniendo el Estado de una Transacción desde una Aplicación Cliente

```typescript
// Ejemplo: Verificando el estado de una transacción
const response = await fetch(`https://your-supabase-url.functions.supabase.co/wompi`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    path: 'transaction/11001-1650572337-28117'
  })
});

const result = await response.json();
console.log(result.transaction);
```

### Configurando la URL del Webhook en el Panel de Wompi

1. Inicia sesión en tu panel de comerciante de Wompi
2. Navega a Configuración > Webhooks
3. Añade un nuevo webhook con la URL: `https://your-supabase-url.functions.supabase.co/wompi`
4. Selecciona los eventos que quieres recibir (recomendado: todos los eventos de transacción)
5. Guarda la configuración del webhook

## Solución de Problemas

### Problemas Comunes y Soluciones

#### La Creación de Transacción Falla
- Asegúrate de que todos los campos requeridos estén proporcionados en la solicitud
- Verifica que la configuración del método de pago sea correcta
- Comprueba que tus claves API de Wompi sean válidas y tengan permisos suficientes

#### El Webhook No Actualiza el Estado de la Transacción
- Verifica que la URL del webhook esté correctamente configurada en el panel de Wompi
- Comprueba que `WOMPI_EVENTS_KEY` esté correctamente configurada
- Asegúrate de que tu función Supabase tenga acceso a la red para recibir webhooks

#### Errores de Autenticación
- Asegúrate de que los tokens JWT estén correctamente generados y no hayan expirado
- Verifica que la cabecera de autorización esté correctamente formateada
- Comprueba que el token incluya los claims necesarios (sub, exp, etc.)

#### Errores de Base de Datos
- Verifica que tu conexión Supabase esté funcionando
- Asegúrate de que la tabla de transacciones exista con el esquema correcto
- Comprueba que tu clave de rol de servicio Supabase tenga permisos suficientes

### Depuración

Para depurar problemas en producción:

1. Habilita el registro detallado en tu Función Edge de Supabase
2. Usa el visor de registros de Supabase para examinar los registros de funciones
3. Para problemas de webhook, revisa el panel de Wompi para el estado de entrega e historial de reintentos

Para desarrollo local:

1. Ejecuta `supabase start` para iniciar el entorno de desarrollo local
2. Usa `curl` o Postman para enviar solicitudes de prueba a tu función local
3. Para pruebas de webhook, usa una herramienta como ngrok para exponer tu servidor local

### Recursos de Soporte

- [Documentación de API de Wompi](https://docs.wompi.co/docs)
- [Documentación de Funciones Edge de Supabase](https://supabase.com/docs/guides/functions)
- [Guía de Autenticación JWT](https://supabase.com/docs/guides/auth/auth-jwt)
