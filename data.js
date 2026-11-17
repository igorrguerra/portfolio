/*
 * TODO O CONTEÚDO DO SITE FICA AQUI.
 * Edite só este arquivo para trocar textos, projetos, currículos, certificações e contatos.
 *
 * Tudo que estiver marcado com  exemplo: true  (ou com "[EXEMPLO]" no texto) é conteúdo
 * provisório. Troque pelo real e apague a marcação. O site mostra uma etiqueta "Exemplo"
 * em cada item marcado, para ninguém confundir com conteúdo de verdade.
 *
 * Caminhos de arquivos são relativos à raiz do site:
 *   currículos   -> assets/curriculos/
 *   certificados -> assets/certificados/
 *   imagens      -> assets/img/
 */
window.PORTFOLIO = {
  pessoa: {
    nome: "Igor",            // primeira linha do nome gigante
    sobrenome: "Guerra",     // segunda linha  [EXEMPLO: confirme como quer seu nome]
    cargo: "Desenvolvedor full stack",
    // Frase curta que aparece abaixo do cargo no hero.
    resumo: "Faço produtos web e jogos do banco de dados até a última animação.",
    local: "Brasil",
    disponivel: true,         // mostra "Aberto a novos projetos" no hero e no contato
  },

  sobre: {
    exemplo: true,            // [EXEMPLO] apague quando reescrever o texto
    // Parágrafos curtos. [EXEMPLO] Reescreva com a sua voz.
    texto: [
      "Gosto de pegar uma ideia confusa e transformar em algo que roda: um SaaS que um dono de lava jato usa com a mão molhada, um site de estúdio de cinema que carrega rápido mesmo cheio de vídeo, um jogo que ensina sem parecer aula.",
      "Trabalho com Next.js, TypeScript e Supabase no dia a dia, e com Godot quando o projeto pede jogo. Uso agentes de IA para acelerar, mas reviso cada linha que vai para produção.",
    ],
    // Aparecem no texto "Sobre" e rolam no marquee.
    habilidades: [
      "Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL",
      "Node.js", "Godot", "GDScript", "Stripe", "Testes com Vitest", "CI no GitHub Actions",
      "UI e motion", "Agentes de IA",
    ],
  },

  /*
   * PROJETOS
   * destaque: true  -> aparece maior, com imagem, no topo da lista
   * tecnologias     -> viram os filtros automaticamente
   * online          -> link "Ver online" (deixe null se não houver)
   * codigo          -> link do código (deixe null se não houver)
   * codigoPrivado   -> true mostra "Código privado" no lugar do link
   * imagem          -> em assets/img/ (proporção 16:10 ou 16:9). alt é obrigatório
   */
  projetos: [
    {
      nome: "Cozy World",
      ano: 2026,
      destaque: true,
      descricao: "Site de um estúdio de filmes feitos com IA: catálogo de filmes com prévias em vídeo, briefing de filme sob medida e venda de masterclass com pagamento.",
      tecnologias: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Stripe"],
      online: "https://cozyworld.ai",        // [EXEMPLO: confirme se o domínio já está no ar]
      codigo: "https://github.com/igorrguerra/cozyworld",
      codigoPrivado: true,
      imagem: { src: "assets/img/cozyworld.svg", alt: "Capa do projeto Cozy World com o título sobre fundo escuro" },
    },
    {
      nome: "Lava Jato",
      ano: 2026,
      destaque: true,
      descricao: "SaaS para lava jatos: o cliente agenda pelo link do WhatsApp em menos de um minuto e o dono acompanha fila do dia, clientes e caixa pelo celular.",
      tecnologias: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Vitest"],
      online: null,                           // [EXEMPLO: coloque o link da demo quando tiver]
      codigo: "https://github.com/igorrguerra/lavajato",
      codigoPrivado: true,
      imagem: { src: "assets/img/lavajato.svg", alt: "Capa do projeto Lava Jato com o título sobre fundo escuro" },
    },
    {
      nome: "EcoCity",
      ano: 2025,
      destaque: true,
      descricao: "RPG educacional sobre meio ambiente. O jogador constrói uma ponte sem derrubar árvores e projeta uma rede de irrigação, resolvendo desafios de grafos.",
      tecnologias: ["Godot", "GDScript"],
      online: null,
      codigo: "https://github.com/igorrguerra/ecocity",
      codigoPrivado: true,
      imagem: { src: "assets/img/ecocity.jpg", alt: "Cena do jogo EcoCity: mapa da rede de irrigação ligando a cisterna aos canteiros" },
    },
    {
      exemplo: true,
      nome: "Projeto de exemplo A",
      ano: 2025,
      destaque: false,
      descricao: "[EXEMPLO] Descrição curta de um projeto menor. Troque ou apague este item.",
      tecnologias: ["React", "Node.js"],
      online: "https://example.com",
      codigo: "https://github.com/igorrguerra",
      codigoPrivado: false,
      imagem: null,
    },
    {
      exemplo: true,
      nome: "Projeto de exemplo B",
      ano: 2024,
      destaque: false,
      descricao: "[EXEMPLO] Outro projeto de exemplo, só para o filtro ter o que filtrar.",
      tecnologias: ["TypeScript", "PostgreSQL"],
      online: null,
      codigo: "https://github.com/igorrguerra",
      codigoPrivado: false,
      imagem: null,
    },
  ],

  curriculo: {
    arquivos: [
      { idioma: "Português", sigla: "PT", arquivo: "assets/curriculos/curriculo-pt.pdf", exemplo: true },
      { idioma: "English", sigla: "EN", arquivo: "assets/curriculos/resume-en.pdf", exemplo: true },
    ],
    // Linha do tempo, da mais recente para a mais antiga.
    // tipo: "experiencia" ou "formacao". fim: null = atual.
    linhaDoTempo: [
      { exemplo: true, tipo: "experiencia", inicio: "2025", fim: null, titulo: "Desenvolvedor full stack", lugar: "Freelancer", descricao: "[EXEMPLO] Produtos web sob medida em Next.js e Supabase." },
      { exemplo: true, tipo: "experiencia", inicio: "2024", fim: "2025", titulo: "Cargo de exemplo", lugar: "Empresa de exemplo", descricao: "[EXEMPLO] O que você fez e qual resultado entregou." },
      { exemplo: true, tipo: "formacao", inicio: "2023", fim: null, titulo: "Curso superior de exemplo", lugar: "Instituição de exemplo", descricao: "[EXEMPLO] Graduação em andamento." },
      { exemplo: true, tipo: "formacao", inicio: "2022", fim: "2022", titulo: "Curso livre de exemplo", lugar: "Escola de exemplo", descricao: "[EXEMPLO] Curso complementar." },
    ],
  },

  /*
   * CERTIFICAÇÕES
   * arquivo   -> PDF ou imagem em assets/certificados/ (abre no visualizador). null esconde o botão
   * verificar -> link oficial de validação. null esconde o link
   * data      -> "AAAA-MM" (o site formata como "mar. 2026")
   */
  certificacoes: [
    { exemplo: true, nome: "Certificação de exemplo em nuvem", emissor: "Emissor de exemplo", data: "2026-03", credencial: "EX-2026-0001", arquivo: "assets/certificados/exemplo-1.pdf", verificar: "https://example.com/verificar/EX-2026-0001" },
    { exemplo: true, nome: "Certificação de exemplo em front-end", emissor: "Outro emissor", data: "2025-08", credencial: "EX-2025-0142", arquivo: "assets/certificados/exemplo-2.png", verificar: null },
    { exemplo: true, nome: "Certificação de exemplo em banco de dados", emissor: "Emissor de exemplo", data: "2024-11", credencial: "EX-2024-0777", arquivo: "assets/certificados/exemplo-3.pdf", verificar: "https://example.com/verificar/EX-2024-0777" },
  ],

  contato: {
    exemplo: true,            // [EXEMPLO] apague quando colocar seus contatos reais
    email: "seuemail@exemplo.com",                   // [EXEMPLO]
    linkedin: "https://www.linkedin.com/in/seu-perfil", // [EXEMPLO]
    github: "https://github.com/igorrguerra",
    whatsapp: "5500000000000",                         // [EXEMPLO] só dígitos, com DDI e DDD
    mensagemWhatsapp: "Oi, Igor! Vi seu portfólio e queria conversar.",
  },
};
