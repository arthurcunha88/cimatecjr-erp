# CIMATEC jr ERP

Projeto inicial de um **ERP desenvolvido para uso interno da CIMATEC jr**, começando pelo cadastro e gerenciamento das informações dos membros.

A aplicação foi desenvolvida como uma primeira etapa de uma solução maior, com foco em apoiar o **DGG — Departamento de Gente e Gestão** na organização dos dados dos membros e em futuras funcionalidades de gestão interna.

## Aplicação

A versão hospedada na Vercel pode ser acessada em:

https://cimatecjr-erp.vercel.app/cadastro

## Tecnologias utilizadas

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** — banco de dados
- **Resend** — envio dos códigos de confirmação por e-mail
- **Zod** — validação dos dados
- **React Hook Form** — gerenciamento do formulário
- **Git/GitHub** — versionamento
- **Vercel** — hospedagem e deploy

## Funcionamento

O fluxo principal do cadastro é:

```text
Formulário
    ↓
Validação dos dados
    ↓
Cadastro pendente no Supabase
    ↓
Geração do código de confirmação
    ↓
Envio do código por e-mail
    ↓
Confirmação do código
    ↓
Cadastro do membro
```

O sistema utiliza o domínio institucional `@cimatecjr.com.br` para os cadastros e utiliza o **Resend** para o envio do código de confirmação.

## Estrutura de dados

O projeto possui estruturas destinadas aos:

- membros cadastrados;
- cadastros pendentes;
- códigos de confirmação (OTC).

O acesso às informações sensíveis do banco é realizado pelo backend utilizando a chave secreta do Supabase.

O arquivo `supabase-setup.sql` contém o script inicial para configuração do banco de dados.

## Como executar localmente

### 1. Pré-requisitos

Tenha instalado:

- Node.js
- npm

### 2. Clone o repositório

```bash
git clone https://github.com/arthurcunha88/cimatecjr-erp.git
cd cimatecjr-erp
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo chamado `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
SUPABASE_SECRET_KEY=sua_chave_secreta_do_supabase
RESEND_API_KEY=sua_chave_da_resend
INSTITUTIONAL_EMAIL_DOMAIN=cimatecjr.com.br
```

Não envie o arquivo `.env.local` para o GitHub. As chaves devem permanecer privadas.

### 5. Configure o banco de dados

Caso esteja configurando o projeto em uma nova instância do Supabase, execute o conteúdo de:

```text
supabase-setup.sql
```

no SQL Editor do Supabase.

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Depois, acesse:

http://localhost:3000/cadastro

## Build de produção local

Para testar a aplicação em modo de produção:

```bash
npm run build
npm run start
```

Por padrão, ela ficará disponível em:

http://localhost:3000

## Deploy

O projeto está conectado ao **GitHub** e hospedado na **Vercel**. Alterações enviadas para a branch principal podem gerar novos deployments automaticamente conforme a configuração do projeto na Vercel.

## Próximos passos

Este projeto representa o início de uma solução maior. Entre as possibilidades de evolução estão:

- limpeza automática de cadastros pendentes expirados;
- painel administrativo para gerenciamento dos membros;
- filtros e consultas dos dados;
- novas funcionalidades voltadas ao DGG;
- expansão do sistema para outros processos internos da CIMATEC jr.

## Autor

Desenvolvido por **Arthur Cunha**.
