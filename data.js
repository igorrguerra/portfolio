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
    cargo: "Desenvolvedor full stack",
    resumo: "Construo produtos web, sistemas completos e interfaces interativas do banco de dados ao front-end.",
    local: "Fortaleza, CE",
    disponivel: true,
    disponivelTexto: "Aberto a estágio e projetos",
  },

  sobre: {
    texto: [
      "Sou desenvolvedor full stack e estudante de Ciência da Computação na UNIFOR, em Fortaleza. Gosto de aprender rápido, trabalhar em equipe e transformar ideias em produtos sólidos, rápidos e com interfaces que dão gosto de usar.",
      "Na ArgoTech trabalhei com treinamento de modelos de inteligência artificial e construção de sites com Figma e Webflow. Hoje desenvolvo aplicações web completas com Next.js, React, TypeScript, Supabase e PostgreSQL.",
    ],
    // Aparecem no "Sobre" e rolam no marquee.
    habilidades: [
      "TypeScript", "JavaScript", "React", "Next.js", "Supabase", "PostgreSQL",
      "Tailwind CSS", "Python", "Java", "HTML e CSS", "Figma", "Inteligência artificial",
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
   * categoria       -> ex.: "Produto", "SaaS", "Jogo", "Sistemas" (aparece no card)
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
      descricao: "Plataforma web de um estúdio de filmes feitos com IA, com catálogo interativo, prévias em vídeo, briefing sob medida e venda de masterclass integrada ao Stripe.",
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
      categoria: "SaaS",
      descricao: "Sistema SaaS de agendamento e operação para lava jatos. O cliente agenda pelo link do WhatsApp em menos de um minuto e o dono controla fila do dia, clientes e caixa pelo celular.",
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
      destaque: false,
      categoria: "Jogo",
      descricao: "Jogo 2D de estratégia e simulação ambiental desenvolvido na Godot. O jogador projeta redes de irrigação sob limites de pressão e distância para recuperar áreas degradadas.",
      tecnologias: ["Godot", "GDScript"],
      online: null,
      codigo: "https://github.com/igorrguerra/ecocity",
      codigoPrivado: true,
      extra: null,
      imagem: { src: "assets/img/ecocity.jpg", alt: "Tela do jogo EcoCity com a rede de irrigação ligando a cisterna aos canteiros" },
    },
    {
      nome: "Simulador de sistema de arquivos",
      ano: 2026,
      destaque: false,
      categoria: "Sistemas",
      descricao: "Shell interativo em Java que gerencia arquivos e árvores de diretórios com mecanismo de journaling transacional para preservar integridade em caso de falha.",
      tecnologias: ["Java"],
      online: null,
      codigo: "https://github.com/igorrguerra/Simulador-Sistema-Arquivos",
      codigoPrivado: false,
      extra: null,
      imagem: { src: "assets/img/sistema-arquivos.svg", alt: "Árvore de diretórios com um registro de journal ao lado" },
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
      { tipo: "formacao", inicio: null, fim: null, periodo: "Em andamento", pendente: "Ano de início", titulo: "Bacharelado em Ciência da Computação", lugar: "UNIFOR, Fortaleza", descricao: "Graduação em andamento, com foco em engenharia de software, estruturas de dados e desenvolvimento full stack." },
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
