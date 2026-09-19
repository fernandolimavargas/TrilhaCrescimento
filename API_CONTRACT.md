# Contrato da API .NET

Defina `VITE_API_BASE_URL` (veja `.env.example`) para a origem da API ASP.NET Core. O frontend envia o JWT em `Authorization: Bearer <token>` e nunca acessa o banco diretamente.

## Autenticação

| Método e rota | Corpo / resposta esperada |
| --- | --- |
| `POST /api/auth/login` | Corpo: `{ email, password }`. Resposta: `{ accessToken, expiresAt?, user: { id, email }, profile: { id, full_name, email, area, phone }, roles: [{ id?, user_id?, role, area }] }` |
| `POST /api/auth/register` | Corpo: `{ fullName, area, email, password }`. Retorne `204` ou JSON. |
| `GET /api/auth/google?returnUrl=...` | Inicia o OAuth do Google. Após a autorização, redireciona exclusivamente para o `returnUrl` permitido, acrescentando `?code=<código-de-uso-único>`. |
| `POST /api/auth/google/exchange` | Corpo: `{ code }`. Troca o código retornado pelo Google por `{ accessToken, expiresAt?, user, profile, roles }`. O código deve expirar rapidamente e só poder ser usado uma vez. |
| `GET /api/auth/me` | Resposta: `{ user, profile, roles }`. Retorne `401` para token inválido/expirado. |
| `POST /api/auth/logout` | Opcional no servidor; o cliente sempre remove o token local. |

`role` é `admin`, `leader` ou `volunteer`. O backend deve autorizar ações pela role, sem confiar em regras da interface.

Para o Google, configure no provedor a URL de callback do próprio backend (por exemplo, `https://api.seudominio.com/signin-google`), não uma URL do frontend. No backend, mantenha uma lista de `returnUrl` permitidas; o frontend usa `https://seu-frontend/auth` e jamais recebe o JWT diretamente na URL.

## Dados

| Método e rota | Descrição |
| --- | --- |
| `GET /api/attendances/mine?month=YYYY-MM` | Lista as presenças do usuário autenticado. |
| `POST /api/attendances` | Corpo: `{ served_on: "YYYY-MM-DD", note: string | null }`. O backend define usuário, área e passo. |
| `DELETE /api/attendances/{id}` | Remove uma presença autorizada. |
| `GET /api/team/members` | Admin/líder: voluntários permitidos ao solicitante. |
| `GET /api/team/attendances?month=YYYY-MM` | Admin/líder: presenças permitidas ao solicitante. |
| `GET /api/team/roles` | Admin: permissões. |
| `PUT /api/team/roles` | Admin. Corpo: `{ user_id, role, area }`. |
| `DELETE /api/team/roles/{id}` | Admin. |

Os campos usados nas respostas são `id`, `user_id`, `full_name`, `email`, `area`, `phone`, `served_on`, `step` e `note`. Para chamadas que falharem, responda JSON com `{ "message": "descrição" }` e o status HTTP adequado.

## CORS local

No ASP.NET Core, permita a origem do Vite (normalmente `http://localhost:5173`), os métodos usados e o cabeçalho `Authorization`.
