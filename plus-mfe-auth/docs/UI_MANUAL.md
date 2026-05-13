# Manual de UI — plus-mfe-auth

## Visão geral

O microfrontend `plus-mfe-auth` oferece a interface de autenticação do sistema
Plus. É a primeira tela com a qual o usuário interage e controla o acesso aos
demais módulos. O componente `LoginPage` é consumido pelo `plus-shell` via
Module Federation, mas também roda standalone em desenvolvimento isolado.

## Integração com o `plus-shell` (Module Federation)

- O nome do evento de sucesso é a constante **`PLUS_AUTH_LOGIN_SUCCESS_EVENT`**
  (`"plus-auth-login-success"`) em `src/shellAuthEvents.ts`, mantida igual à
  constante em `plus-shell/src/shellAuthEvents.js`.
- Após login bem-sucedido, o `LoginPage` chama **`window.dispatchEvent`** com
  esse nome **sempre**, para o host poder sincronizar sessão mesmo quando a
  prop **`onLogin`** não atravessa o remote.
- O **shell** envolve o remote com **`Suspense`**, **`React.lazy`** e um
  **`RemoteErrorBoundary`** que orienta o utilizador se o
  `remoteEntry.js` estiver inacessível.

## Fluxo de login

### 1. Entrada na tela

Sem sessão ativa (sem token válido em `localStorage`), o Shell carrega o
`LoginPage`. A tela apresenta um cartão centralizado com:

- Título: **"Plus — Entrar"**
- Campo de e-mail (com foco automático)
- Campo de senha
- Botão **"Entrar"** ocupando largura total

A tela é centralizada vertical e horizontalmente em qualquer resolução.

### 2. Preenchimento dos campos

- **E-mail**: aceita qualquer texto, validado no submit. `type="email"` ativa
  teclado apropriado no mobile e habilita autopreenchimento de credenciais.
- **Senha**: mascarada. `autoComplete="current-password"` habilita o
  gerenciador de senhas do navegador.

Os dois campos são desabilitados durante o submit para evitar alterações
enquanto a requisição está em andamento.

### 3. Validação local (antes da rede)

Ao clicar em **"Entrar"** ou pressionar `Enter`:

| Regra | Mensagem exibida |
|---|---|
| E-mail vazio | "E-mail é obrigatório" |
| E-mail sem formato `algo@dominio.tld` | "E-mail inválido" |
| Senha vazia | "Senha é obrigatória" |
| Senha com menos de 4 caracteres | "Senha muito curta (mín. 4 caracteres)" |

As mensagens aparecem em vermelho abaixo do campo correspondente; o campo
ganha a borda vermelha do estado de erro do MUI. Múltiplas regras podem
disparar simultaneamente.

Se qualquer regra falhar, **nenhuma requisição é feita ao backend**.

### 4. Submissão ao backend

Validação passando, o componente:

1. Limpa qualquer mensagem de erro anterior
2. Desabilita os campos e o botão
3. Substitui o texto do botão por um spinner (`CircularProgress`)
4. Chama `authClient.login({ email, password })`, que dispara
   `POST ${VITE_MS_AUTH_URL}/auth/login` com `{ email, password }` no corpo

### 5. Resposta de sucesso

Backend retornando `200 OK` com `{ token, refresh, user? }`:

1. Dentro de `authClient.login`, os tokens são gravados no `localStorage`
   (`plus.auth.token` e `plus.auth.refresh`) via `tokenStorage.setTokens()`
   **antes** de a função devolver o objecto ao `LoginPage`.
2. O `LoginPage` dispara um **`CustomEvent`** em `window` com o nome
   **`plus-auth-login-success`** e `detail` igual à resposta do login. O
   **`plus-shell` escuta este evento** e aplica a sessão (`localStorage` +
   estado React), porque a prop `onLogin` **pode não propagar de forma fiável**
   através do limite do Module Federation.
3. Em seguida chama-se `onLogin?.(data)` quando o host passou essa prop
   (caminho complementar, útil quando a prop funciona).
4. O Shell **não usa React Router** nesta versão: alterna `useState` de
   “não autenticado” para “autenticado” e renderiza um **dashboard** simples —
   não há `navigate()` nem redirecionamento HTTP.

O `LoginPage` **não** decide qual página mostrar no host; só notifica o
sucesso (evento + callback) e deixa o Shell trocar a árvore de componentes.

### 6. Resposta de erro

Backend retornando erro (401, 500, falha de rede etc.):

1. Um `Alert` com severity `error` é renderizado acima do botão, mostrando a
   mensagem retornada pelo MS (ou genérica se o corpo não tiver `error`)
2. Os campos e o botão são reabilitados
3. O spinner some, o texto **"Entrar"** volta
4. O foco permanece — o usuário pode corrigir e tentar de novo sem reiniciar

## Componentes MUI utilizados

O design é construído sobre **Material UI v5** (`@mui/material`) com
`@emotion/react` + `@emotion/styled` como engine de estilos.

| Componente | Função |
|---|---|
| `Box` | Container raiz centralizado e wrapper do `<form>` |
| `Paper` | Cartão branco com elevação que agrupa o formulário |
| `Typography` | Título "Plus — Entrar" (variante `h5`, `component="h1"`) |
| `TextField` | Inputs de e-mail e senha, com label flutuante, `helperText` para erros e estado `error` |
| `Alert` | Banner de erro de submissão (severity `error`) |
| `Button` | Botão "Entrar" (variante `contained`, tamanho `large`) |
| `CircularProgress` | Spinner exibido dentro do botão durante o submit |
| `ThemeProvider` + `CssBaseline` | Aplicação do tema e normalização de CSS (apenas no modo standalone, em `main.tsx`) |

### Tema

Em modo **standalone**, `main.tsx` aplica `ThemeProvider` + `CssBaseline` com
`createTheme({ palette: { mode: "light" } })`.

Quando o `LoginPage` é carregado pelo **`plus-shell`**, o entrypoint `main.tsx`
do MFE **não** corre: só o chunk do remote é executado. O **shell não inclui
MUI** nas dependências — apenas **React** e **ReactDOM**. No Federation
(`vite.config.ts`), `shared` é o array **`["react", "react-dom"]`**; **MUI e
Emotion não estão em `shared`** e permanecem no bundle do remote. O aspeto
visual usa então o **tema por defeito** do MUI embutido no remote (não há
`ThemeProvider` do host a envolver o login).

## Acessibilidade

- O título é `<h1>` semântico (`component="h1"`) para leitores de tela
- Cada campo é um `TextField` com `label`, garantindo `<label for>` associado
  ao `<input>`
- Mensagens de erro de campo aparecem em `helperText`, com `aria-describedby`
  automático do MUI
- `noValidate` no `<form>` desativa a validação nativa do browser, tornando a
  UX de erros consistente entre navegadores
- Foco inicial é colocado no primeiro campo (`autoFocus` no e-mail)
- O botão de submit aceita `Enter` no formulário (comportamento padrão de
  `type="submit"`)

## Estados visuais

| Estado | O que muda |
|---|---|
| Inicial | Campos vazios, sem mensagens, foco no e-mail |
| Digitando | Erros do submit anterior permanecem até o próximo submit |
| Validação falhou | Helper text vermelho abaixo do(s) campo(s) inválido(s) |
| Submetendo | Campos desabilitados, botão com spinner |
| Erro do backend | Alert vermelho acima do botão, campos reabilitados |
| Sucesso | Shell deixa de renderizar o login e mostra o dashboard (estado + evento) |

## Interação do usuário final

1. Abre o navegador no endereço do Plus
2. Vê o cartão de login centralizado
3. Digita o e-mail — o cursor já está no campo certo
4. `Tab` ou clique para o campo de senha
5. Digita a senha
6. `Enter` ou clique em **Entrar**
7. Aguarda menos de um segundo o spinner; se algo der errado, lê o alert
   vermelho e tenta novamente
8. No sucesso, o Shell (origem `:3000`) actualiza o estado e mostra o dashboard; os tokens já estão no `localStorage` dessa origem

Esta versão não traz "esqueci minha senha" nem "cadastre-se" — esses fluxos
serão entregues pelos MFEs `plus-mfe-password-reset` e `plus-mfe-signup` em
iterações futuras.
