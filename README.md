# Portfólio do Igor

Site em HTML, CSS e JavaScript puros, sem build nem bibliotecas JavaScript. O conteúdo fica em `data.js`, no objeto `window.PORTFOLIO`.

## Ver localmente

Na pasta do repositório, execute:

```sh
python3 -m http.server 8000
```

Abra http://localhost:8000 no navegador. Para parar o servidor, pressione `Ctrl+C`. Não precisa instalar pacotes.

## Como colocar seu conteúdo

Abra `data.js` em um editor. Preserve as chaves, aspas e vírgulas; use `true` e `false` sem aspas e `null` para valores ausentes. Duplique um item dentro de uma lista para acrescentar conteúdo ou remova o objeto inteiro para excluí-lo.

### Pessoa

Em `pessoa`, preencha:

| Campo | O que colocar |
| --- | --- |
| `nome` | Primeira linha do nome no início do site. |
| `sobrenome` | Segunda linha do nome. |
| `cargo` | Sua atuação profissional. |
| `resumo` | Uma frase curta sobre o que você faz. |
| `local` | Sua localização. |
| `disponivel` | `true` para indicar disponibilidade; `false` para ocultar essa indicação. |

### Sobre

- `sobre.texto`: lista de parágrafos, cada um entre aspas.
- `sobre.habilidades`: lista de habilidades; elas também aparecem na faixa de texto do site.

### Projetos

Cada objeto de `projetos` representa um trabalho:

| Campo | O que colocar |
| --- | --- |
| `nome` | Nome do projeto. |
| `ano` | Ano, como número. |
| `descricao` | O problema resolvido e o que você entregou. |
| `destaque` | `true` para apresentar o projeto maior, com imagem e no topo; `false` para uma linha menor. |
| `tecnologias` | Lista de tecnologias; o site cria os filtros a partir dela. |
| `online` | URL completa da versão publicada ou `null`. |
| `codigo` | URL completa do repositório ou `null`. |
| `codigoPrivado` | `true` mostra “Código privado” no lugar do link; use `false` para um repositório público. |
| `imagem` | Objeto com `src` (caminho do arquivo) e `alt` (descrição acessível), ou `null` se não houver imagem. |
| `exemplo` | `true` identifica conteúdo provisório com uma etiqueta visível. |

Coloque capas em `assets/img/`, de preferência em proporção 16:10 ou 16:9. Exemplo de caminho: `assets/img/meu-projeto.webp`. Descreva a imagem em `alt`, sem repetir apenas o nome do arquivo.

### Currículo e linha do tempo

Em `curriculo.arquivos`, cadastre cada versão do currículo:

- `idioma`: nome do idioma, como “Português”.
- `sigla`: identificação curta, como “PT”.
- `arquivo`: caminho do PDF, como `assets/curriculos/curriculo-pt.pdf`.
- `exemplo`: `true` enquanto o documento for provisório.

Em `curriculo.linhaDoTempo`, organize os itens do mais recente para o mais antigo:

- `tipo`: `"experiencia"` ou `"formacao"`.
- `inicio`: ano de início entre aspas.
- `fim`: ano de conclusão entre aspas, ou `null` quando estiver em andamento.
- `titulo`: cargo ou curso.
- `lugar`: empresa ou instituição.
- `descricao`: atividades, resultados ou detalhes da formação.
- `exemplo`: `true` enquanto o item for provisório.

### Certificações

Cada objeto de `certificacoes` contém:

- `nome`: título da certificação.
- `emissor`: organização responsável.
- `data`: mês de emissão no formato `"AAAA-MM"`, como `"2026-03"`.
- `credencial`: identificador da credencial.
- `arquivo`: caminho do PDF ou imagem em `assets/certificados/`; `null` oculta o botão de visualização.
- `verificar`: URL completa da validação oficial; `null` oculta o link.
- `exemplo`: `true` enquanto o item for provisório.

### Contato

Em `contato`, atualize `email`, `linkedin` e `github` com seus contatos reais. Em `whatsapp`, use apenas números, incluindo DDI e DDD. Em `mensagemWhatsapp`, escreva a mensagem inicial que o visitante poderá enviar. Use `null` nos canais que você não quiser divulgar.

### Guardar os arquivos

| Pasta | Arquivos |
| --- | --- |
| `assets/curriculos/` | PDFs do currículo por idioma. |
| `assets/certificados/` | PDFs e imagens das certificações. |
| `assets/img/` | Capas de projetos, favicon e imagem de compartilhamento. |

Use nomes simples, sem espaços ou acentos, e respeite maiúsculas e minúsculas nos caminhos. Nos dados, comece o caminho com `assets/`, sem uma barra inicial: assim ele funciona também em `/portfolio/`.

### Remover a marcação de exemplo

Substitua os textos, links e arquivos provisórios pelos reais. Depois, apague `exemplo: true` ou troque por `exemplo: false` no respectivo item e remova os trechos `[EXEMPLO]` dos textos. Não remova apenas a etiqueta de um item que ainda contém dados fictícios. Apague por inteiro os itens que não quiser publicar.

### Arquivos que você não precisa editar

Para atualizar conteúdo, basta editar `data.js` e colocar os documentos e imagens nas pastas indicadas.

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura, fontes e carregamento dos scripts. |
| `css/tokens.css` | Cores, fontes e medidas compartilhadas. |
| `css/base.css`, `css/projetos.css`, `css/documentos.css` | Layout e aparência. |
| `js/main.js`, `js/projetos.js`, `js/documentos.js` | Renderização e interações. |
| `404.html` | Página para endereços que não existem. |

Se mudar o nome ou o cargo, atualize também os metadados do `<head>` em `index.html` e a imagem `assets/img/og.png`, pois prévias de compartilhamento não leem `data.js`.

## Publicar

O site é publicado pelo GitHub Pages a partir da branch `main`. Salve as alterações, faça um commit e dê push para `main`; o GitHub Pages publica a atualização. Confira o resultado em `https://igorrguerra.github.io/portfolio/` após a publicação.
