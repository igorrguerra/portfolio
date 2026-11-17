# Portfólio do Igor Romero

Site em HTML, CSS e JavaScript puros, sem build nem bibliotecas JavaScript. O conteúdo fica em `data.js`, no objeto `window.PORTFOLIO`.

## Ver localmente

Na pasta do repositório, execute:

```sh
python3 -m http.server 8000
```

Abra http://localhost:8000 no navegador. Para parar o servidor, pressione `Ctrl+C`. Não precisa instalar pacotes.

## Como colocar seu conteúdo

Abra `data.js` em um editor. Preserve as chaves, aspas e vírgulas; use `true` e `false` sem aspas e `null` para valores ausentes. Nos campos opcionais, `null` esconde a informação ou o botão correspondente; na linha do tempo, `fim: null` indica que o item está em andamento. Duplique um item dentro de uma lista para acrescentar conteúdo ou remova o objeto inteiro para excluí-lo.

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
| `disponivelTexto` | Texto da indicação, como “Aberto a estágio e projetos”. |

### Sobre

- `sobre.texto`: lista de parágrafos, cada um entre aspas.
- `sobre.habilidades`: lista de habilidades; elas também aparecem na faixa de texto do site.
- `sobre.idiomas`: lista de objetos com `idioma` e `nivel`, como `{ idioma: "Inglês", nivel: "Intermediário/avançado (B2)" }`.

### Projetos

Cada objeto de `projetos` representa um trabalho:

| Campo | O que colocar |
| --- | --- |
| `nome` | Nome do projeto. |
| `ano` | Ano, como número. |
| `descricao` | O problema resolvido e o que você entregou. |
| `destaque` | `true` para apresentar o projeto primeiro e maior na grade; `false` para um card regular. |
| `categoria` | “Produto” ou “Faculdade”, exibido no card. |
| `tecnologias` | Lista de tecnologias; o site cria os filtros a partir dela. |
| `online` | URL completa da versão publicada ou `null`. |
| `codigo` | URL completa do repositório ou `null`. |
| `codigoPrivado` | `true` mostra “Código privado” no lugar do link; use `false` para um repositório público. |
| `extra` | Link adicional `{ rotulo: "Ver vídeo", url: "https://…" }`, ou `null` para ocultar. |
| `pendente` | Texto sobre o que falta confirmar; mostra “A confirmar” e a explicação visível. |
| `imagem` | Objeto com `src` (caminho do arquivo) e `alt` (descrição acessível), ou `null` se não houver imagem. |
| `exemplo` | `true` identifica conteúdo provisório com uma etiqueta visível. |

Coloque capas em `assets/img/`, em proporção 16:10. Exemplo de caminho: `assets/img/meu-projeto.webp`. Descreva a imagem em `alt`, sem repetir apenas o nome do arquivo.

### Currículo e linha do tempo

Em `curriculo.arquivos`, cadastre cada versão do currículo:

- `idioma`: nome do idioma, como “Português”.
- `sigla`: identificação curta, como “PT”.
- `arquivo`: caminho do PDF, como `assets/curriculos/curriculo-pt.pdf`.
- `exemplo`: `true` enquanto o documento for provisório.

Você pode manter apenas a versão em português; o layout se adapta a um único arquivo. Para adicionar a versão em inglês, coloque o PDF em `assets/curriculos/resume-en.pdf` e descomente o objeto já preparado em `curriculo.arquivos` (remova os `//` no início da linha):

```js
{ idioma: "English", sigla: "EN", arquivo: "assets/curriculos/resume-en.pdf" },
```

Mantenha a versão em português na lista e confira os dois PDFs no navegador.

Em `curriculo.linhaDoTempo`, organize os itens do mais recente para o mais antigo:

- `tipo`: `"experiencia"` ou `"formacao"`.
- `inicio`: ano de início entre aspas, ou `null` se ainda não souber.
- `fim`: ano de conclusão entre aspas, ou `null` quando estiver em andamento.
- `periodo`: texto opcional que substitui o período calculado, como “ago. 2023 a fev. 2024” ou “Em andamento”.
- `pendente`: detalhe que falta confirmar, como “Ano de início”; remova o campo após a confirmação.
- `titulo`: cargo ou curso.
- `lugar`: empresa ou instituição.
- `descricao`: atividades, resultados ou detalhes da formação.
- `exemplo`: `true` enquanto o item for provisório.

### Certificações

Cada objeto de `certificacoes` contém:

- `nome`: título da certificação.
- `emissor`: organização responsável.
- `status`: `"concluida"` para uma certificação concluída ou `"andamento"` para mostrar a etiqueta de curso em andamento.
- `data`: mês de emissão no formato `"AAAA-MM"`, como `"2026-03"`, ou `null` para esconder a data.
- `credencial`: identificador da credencial ou `null` para esconder a linha.
- `arquivo`: caminho do PDF ou imagem em `assets/certificados/`; `null` oculta o botão de visualização.
- `verificar`: URL completa da validação oficial; `null` oculta o link.
- `exemplo`: `true` enquanto o item for provisório.
- `pendente`: explicação do que falta preencher; aparece com a etiqueta “A confirmar”, no `title` e em uma linha visível.

Para adicionar o certificado Huawei Storage, coloque o PDF real em `assets/certificados/huawei-storage.pdf` e troque `arquivo: null` por `arquivo: "assets/certificados/huawei-storage.pdf"` no item Huawei. Preencha `data` e `credencial` com os dados do certificado; adicione a URL oficial em `verificar` se existir. Mantenha `status: "concluida"` e remova `pendente` somente quando confirmar todos os dados solicitados; se faltar algo, atualize o texto da pendência. Não invente datas, IDs ou links.

### Contato

Em `contato`, atualize `email`, `linkedin` e `github` com seus contatos reais. Em `whatsapp`, use apenas números, incluindo DDI e DDD. Em `mensagemWhatsapp`, escreva a mensagem inicial que o visitante poderá enviar. Use `null` nos canais que você não quiser divulgar; por exemplo, `linkedin: null` esconde esse link.

### Guardar os arquivos

| Pasta | Arquivos |
| --- | --- |
| `assets/curriculos/` | PDFs do currículo por idioma. |
| `assets/certificados/` | PDFs e imagens das certificações. |
| `assets/img/` | Capas de projetos, favicon e imagem de compartilhamento. |

Use nomes simples, sem espaços ou acentos, e respeite maiúsculas e minúsculas nos caminhos. Nos dados, comece o caminho com `assets/`, sem uma barra inicial: assim ele funciona também em `/portfolio/`.

### Remover a marcação de exemplo

Substitua os textos, links e arquivos provisórios pelos reais. Depois, apague `exemplo: true` ou troque por `exemplo: false` no respectivo item e remova os trechos `[EXEMPLO]` dos textos. Não remova apenas a etiqueta de um item que ainda contém dados fictícios. Apague por inteiro os itens que não quiser publicar.

### Resolver pendências

Qualquer item com `pendente: "texto"` mostra a etiqueta “A confirmar”, a explicação em uma linha visível e no `title`. Confirme o dado, atualize o conteúdo e remova o campo `pendente` ou atribua `null`; se ainda houver algo a conferir, mantenha uma descrição específica. A pendência indica dados reais incompletos, enquanto `exemplo: true` identifica conteúdo fictício.

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
