
# ToDoList Frontend

Frontend para a aplicação ToDoList com páginas de login e cadastro.

## Estrutura de Pastas

```
todolist-frontend/
├── html/
│   ├── login.html
│   └── register.html
├── css/
│   └── styles.css
├── typescript/
│   ├── login.ts
│   ├── register.ts
│   └── common.ts
├── dist/ (gerado automaticamente)
├── package.json
├── tsconfig.json
└── README.md
```

## Funcionalidades

### Página de Login
- Campo de e-mail
- Campo de senha com máscara de password
- Botão para mostrar/ocultar senha
- Botão "Entrar"
- Link para página de cadastro

### Página de Cadastro
- Campo de Nome
- Campo de Sobrenome
- Campo de Nome de Usuário (exibido para outros usuários)
- Campo de E-mail
- Campo de Senha com máscara de password
- Campo de Confirmação de Senha com máscara de password
- Botão para mostrar/ocultar senha em ambos os campos
- Botão "Cadastrar"
- Link para página de login

## Instalação e Execução

1. **Instalar dependências:**
```bash
npm install
```

2. **Compilar TypeScript:**
```bash
npm run build
```

Para compilar automaticamente durante o desenvolvimento:
```bash
npm run watch
```

3. **Abrir as páginas HTML:**
- Abra `html/login.html` no navegador para a página de login
- Abra `html/register.html` no navegador para a página de cadastro

## Configuração do Backend

Certifique-se de que o backend esteja rodando em `http://localhost:3000` antes de usar o frontend.

## Notas

- Os campos de senha têm máscaras de password (`type="password"`)
- É possível mostrar/ocultar a senha clicando no ícone de olho
- O cadastro atualmente usa a rota de cliente (`/api/auth/client/register`)
- O login tenta primeiro como cliente, depois como admin
- Após o login bem-sucedido, o usuário é redirecionado para o dashboard apropriado
