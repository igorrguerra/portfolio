/*
 * TODO O CONTEÚDO DO SITE FICA AQUI.
 * Edite só este arquivo para trocar textos, projetos, currículos, certificações e contatos.
 *
 * Itens com  exemplo: true  aparecem com a etiqueta "Exemplo".
 * Itens com  pendente: "texto"  aparecem com uma etiqueta "A confirmar" (dados que ainda faltam).
 * Campos com valor null são escondidos no site.
 *
 * Caminhos de arquivos são relativos à raiz do site:
 *   currículos   -> assets/curriculos/
 *   certificados -> assets/certificados/
 *   imagens      -> assets/img/
 */
window.PORTFOLIO = {
  pessoa: {
    nome: "Igor",
    sobrenome: "Romero",
    cargo: "Dev full stack e estudante de Ciência da Computação",
    resumo: "Estudo Ciência da Computação na UNIFOR, em Fortaleza, e construo produtos web do banco de dados à interface.",
    local: "Fortaleza, CE",
    disponivel: true,          // mostra "Aberto a estágio e projetos"
    disponivelTexto: "Aberto a estágio e projetos",
  },

  sobre: {
    texto: [
      "Sou estudante de Ciência da Computação na UNIFOR e entusiasta de inteligência artificial. Gosto de aprender rápido, trabalhar em equipe e transformar uma ideia em algo que funciona de verdade.",
      "Na ArgoTech trabalhei com treinamento de modelos de IA e design de sites em Figma e Webflow. Hoje desenvolvo aplicações full stack com Next.js, TypeScript e Supabase, e na faculdade resolvo problemas de grafos e algoritmos em Python.",
    ],
    // Aparecem no "Sobre" e rolam no marquee.
    habilidades: [
      "Python", "JavaScript", "TypeScript", "Java", "Next.js", "React", "Supabase",
      "HTML e CSS", "Figma", "Webflow", "Grafos e algoritmos", "Inteligência artificial",
    ],
    idiomas: [
      { idioma: "Português", nivel: "Nativo" },
      { idioma: "Inglês", nivel: "Intermediário/avançado (B2)" },
      { idioma: "Espanhol", nivel: "Básico (A2)" },
    ],
  },

  /*
   * PROJETOS
   * destaque: true  -> aparece primeiro e maior na grade
   * categoria       -> "Produto" ou "Faculdade" (aparece no card)
   * tecnologias     -> viram os filtros automaticamente
   * online          -> link "Ver online" (null esconde)
   * codigo          -> link do código (null esconde)
   * codigoPrivado   -> true mostra "Código privado" no lugar do link
   * extra           -> link adicional opcional { rotulo, url } (ex.: vídeo, Colab)
   * imagem          -> em assets/img/ (proporção 16:10). alt é obrigatório
   */
  projetos: [
    {
      nome: "Cozy World",
      ano: 2026,
      destaque: true,
      categoria: "Produto",
      descricao: "Site de um estúdio de filmes feitos com IA, com catálogo de filmes, prévias em vídeo, briefing de filme sob medida e venda de masterclass com pagamento.",
      tecnologias: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Stripe"],
      online: "https://cozyworld.ai",
      pendente: "Confirmar se cozyworld.ai já está no ar",
      codigo: "https://github.com/igorrguerra/cozyworld",
      codigoPrivado: true,
      extra: null,
      imagem: { src: "assets/img/cozyworld.svg", alt: "Capa do projeto Cozy World: claquete e o nome do estúdio" },
    },
    {
      nome: "Lava Jato",
      ano: 2026,
      destaque: true,
      categoria: "Produto",
      descricao: "SaaS para lava jatos. O cliente agenda pelo link do WhatsApp em menos de um minuto e o dono acompanha fila do dia, clientes e caixa pelo celular.",
      tecnologias: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL"],
      online: null,
      codigo: "https://github.com/igorrguerra/lavajato",
      codigoPrivado: true,
      extra: null,
      imagem: { src: "assets/img/lavajato.svg", alt: "Capa do projeto Lava Jato: agenda do dia com um horário destacado" },
    },
    {
      nome: "EcoCity",
      ano: 2025,
      destaque: true,
      categoria: "Faculdade",
      descricao: "Jogo educacional de estratégia com grafos. O jogador planeja uma ponte e uma rede de irrigação para recuperar uma região sem derrubar árvores.",
      tecnologias: ["Godot", "GDScript"],
      online: null,
      codigo: "https://github.com/igorrguerra/ecocity",
      codigoPrivado: true,
      extra: null,
      imagem: { src: "assets/img/ecocity.jpg", alt: "Tela do jogo EcoCity com a rede de irrigação ligando a cisterna aos canteiros" },
    },
    {
      nome: "Malha viária da Pensilvânia",
      ano: 2026,
      destaque: false,
      categoria: "Faculdade",
      descricao: "Análise de uma rede real com 1 milhão de cruzamentos. Testei se ela segue lei de potência e mostrei que a malha viária não é uma rede de escala livre.",
      tecnologias: ["Python", "Jupyter", "Grafos"],
      online: null,
      codigo: "https://github.com/igorrguerra/analiseroadnetwork",
      codigoPrivado: false,
      extra: { rotulo: "Abrir no Colab", url: "https://colab.research.google.com/drive/1ST_nDwdlTcCyZ0kmYWg_N4BXaoDgvslJ" },
      imagem: { src: "assets/img/malha-viaria.svg", alt: "Ilustração de uma rede de ruas e cruzamentos" },
    },
    {
      nome: "Coloração do mapa do Brasil",
      ano: 2026,
      destaque: false,
      categoria: "Faculdade",
      descricao: "Algoritmo DSatur aplicado aos 27 estados brasileiros. Encontrou uma coloração válida com apenas 3 cores.",
      tecnologias: ["Python", "Grafos"],
      online: null,
      codigo: "https://github.com/igorrguerra/trabalhoproblemacoloracao",
      codigoPrivado: false,
      extra: { rotulo: "Ver vídeo", url: "https://youtu.be/Mloy0kJWXiw" },
      imagem: { src: "assets/img/coloracao.svg", alt: "Grafo de estados vizinhos pintado com três cores" },
    },
    {
      nome: "Isomorfismo de árvores",
      ano: 2026,
      destaque: false,
      categoria: "Faculdade",
      descricao: "Decide se duas árvores têm a mesma estrutura usando codificação canônica, ignorando os rótulos dos vértices.",
      tecnologias: ["Python", "Grafos"],
      online: null,
      codigo: "https://github.com/igorrguerra/t6carubbi",
      codigoPrivado: false,
      extra: { rotulo: "Ver vídeo", url: "https://www.youtube.com/watch?v=tl2JAxUp6lQ" },
      imagem: { src: "assets/img/isomorfismo.svg", alt: "Duas árvores com a mesma estrutura lado a lado" },
    },
    {
      nome: "Jzzhu and Cities",
      ano: 2026,
      destaque: false,
      categoria: "Faculdade",
      descricao: "Solução do problema 449B do Codeforces com Dijkstra: quantas rotas de trem dá para fechar sem piorar a distância até a capital.",
      tecnologias: ["Python", "Grafos"],
      online: null,
      codigo: "https://github.com/igorrguerra/449bcodeforce",
      codigoPrivado: false,
      extra: { rotulo: "Ver problema", url: "https://codeforces.com/problemset/problem/449/B" },
      imagem: { src: "assets/img/dijkstra.svg", alt: "Grafo de cidades com o caminho mínimo até a capital destacado" },
    },
    {
      nome: "Cofre da Panda Land",
      ano: 2026,
      destaque: false,
      categoria: "Faculdade",
      descricao: "Calcula o mínimo de giros para abrir um cofre de várias chaves, modelando o problema como uma árvore geradora mínima.",
      tecnologias: ["Python", "Grafos"],
      online: null,
      codigo: "https://github.com/igorrguerra/solucaopandasafebox",
      codigoPrivado: false,
      extra: null,
      imagem: { src: "assets/img/cofre.svg", alt: "Cadeado de quatro dígitos ligado a uma árvore geradora" },
    },
    {
      nome: "Simulador de sistema de arquivos",
      ano: 2026,
      destaque: false,
      categoria: "Faculdade",
      descricao: "Shell em Java que cria, copia, renomeia e apaga arquivos e diretórios, com journaling para manter os dados íntegros em caso de falha.",
      tecnologias: ["Java"],
      online: null,
      codigo: "https://github.com/igorrguerra/Simulador-Sistema-Arquivos",
      codigoPrivado: false,
      extra: null,
      imagem: { src: "assets/img/sistema-arquivos.svg", alt: "Árvore de diretórios com um registro de journal ao lado" },
    },
    {
      nome: "Agenda CLI",
      ano: 2026,
      destaque: false,
      categoria: "Faculdade",
      descricao: "Agenda de contatos de linha de comando em Elixir, com busca, edição e remoção, escrita no paradigma funcional.",
      tecnologias: ["Elixir"],
      online: null,
      codigo: "https://github.com/igorrguerra/agenda_cli",
      codigoPrivado: false,
      extra: null,
      imagem: { src: "assets/img/agenda-cli.svg", alt: "Terminal com comandos da agenda de contatos" },
    },
  ],

  curriculo: {
    arquivos: [
      { idioma: "Português", sigla: "PT", arquivo: "assets/curriculos/curriculo-pt.pdf" },
      // Quando tiver a versão em inglês, coloque em assets/curriculos/resume-en.pdf e descomente:
      // { idioma: "English", sigla: "EN", arquivo: "assets/curriculos/resume-en.pdf" },
    ],
    // Linha do tempo, da mais recente para a mais antiga.
    // tipo: "experiencia" ou "formacao". fim: null = atual. periodo (opcional) substitui o texto do período.
    linhaDoTempo: [
      { tipo: "formacao", inicio: "2026", fim: null, titulo: "AWS Academy Cloud Foundations", lugar: "AWS Academy", descricao: "Curso em andamento." },
      { tipo: "formacao", inicio: null, fim: null, periodo: "Em andamento", pendente: "Ano de início", titulo: "Bacharelado em Ciência da Computação", lugar: "UNIFOR, Fortaleza", descricao: "Graduação em andamento, com foco em algoritmos, grafos e desenvolvimento de software." },
      { tipo: "experiencia", inicio: "2023", fim: "2024", periodo: "ago. 2023 a fev. 2024", titulo: "Estagiário", lugar: "ArgoTech", descricao: "Treinamento de modelos de inteligência artificial e design de sites com Figma e Webflow." },
      { tipo: "formacao", inicio: "2023", fim: "2023", titulo: "Curso de inglês", lugar: "Open English", descricao: "Inglês intermediário/avançado (B2)." },
      { tipo: "experiencia", inicio: "2022", fim: "2022", periodo: "mai. 2022 a jul. 2022", titulo: "Gestão de redes sociais", lugar: "MDB", descricao: "Acompanhamento e gestão das redes sociais." },
      { tipo: "formacao", inicio: "2022", fim: "2022", periodo: "Concluído em 2022", titulo: "Ensino médio", lugar: "Colégio Darwin, Fortaleza", descricao: "" },
    ],
  },

  /*
   * CERTIFICAÇÕES
   * status    -> "concluida" ou "andamento" (em andamento mostra a etiqueta e esconde data/credencial vazias)
   * arquivo   -> PDF ou imagem em assets/certificados/ (abre no visualizador). null esconde o botão
   * verificar -> link oficial de validação. null esconde o link
   * data      -> "AAAA-MM" ou null
   */
  certificacoes: [
    {
      nome: "Huawei Storage",
      emissor: "Huawei",
      status: "concluida",
      data: null,
      credencial: null,
      arquivo: null,
      verificar: null,
      pendente: "Envie o PDF do certificado, a data e o ID da credencial",
    },
    {
      nome: "AWS Academy Cloud Foundations",
      emissor: "Amazon Web Services",
      status: "andamento",
      data: null,
      credencial: null,
      arquivo: null,
      verificar: null,
    },
  ],

  contato: {
    email: "igorrguerra@gmail.com",
    linkedin: null,            // coloque a URL do seu LinkedIn aqui
    github: "https://github.com/igorrguerra",
    whatsapp: "5585999601551", // só dígitos, com DDI e DDD
    mensagemWhatsapp: "Oi, Igor! Vi seu portfólio e queria conversar.",
  },
};
