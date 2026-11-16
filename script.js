const chaveBanco = "sushiiiiii-banco";
const chaveCarrinho = "sushiiiiii-carrinho";
const chaveUsuarioLogado = "sushiiiiii-usuario-logado";
const chaveTema = "sushiiiiii-tema-preferido";
const chaveEmailLembrado = "sushiiiiii-email-lembrado";

const bancoInicial = {
  usuarios: [],
  produtos: [
    { id: 1, nome: "Hot Philadelphia", preco: 34.0, categoria: "Hot Roll" },
    { id: 2, nome: "Niguiri Salomão", preco: 24.0, categoria: "Niguiri" },
    { id: 3, nome: "Temaki Salmão", preco: 29.0, categoria: "Temaki" },
    { id: 4, nome: "Combinado da Casa", preco: 119.0, categoria: "Combinados" },
    { id: 5, nome: "Hot Skin", preco: 31.0, categoria: "Hot Roll" },
    { id: 6, nome: "Niguiri Trio", preco: 39.0, categoria: "Niguiri" },
    { id: 7, nome: "Temaki Hot", preco: 32.0, categoria: "Temaki" },
    { id: 8, nome: "Combinado Silêncio", preco: 189.0, categoria: "Combinados" }
  ],
  pedidos: []
};

const estadoCardapio = { categoria: "todos", termo: "", ordem: "padrao" };

const formatarPreco = valor => `R$ ${valor.toFixed(2).replace(".", ",")}`;
const apenasDigitos = valor => valor.replace(/\D/g, "");
const normalizarEmail = valor => valor.trim().toLowerCase();
const normalizarTexto = valor => String(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const proximoId = lista => (lista.length ? Math.max(...lista.map(item => item.id)) + 1 : 1);

const definirTexto = (id, texto) => {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = texto;
};

const lerStorage = (chave, padrao) => {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao;
  } catch {
    return padrao;
  }
};

const carregarBanco = () => lerStorage(chaveBanco, structuredClone(bancoInicial));
const salvarBanco = banco => localStorage.setItem(chaveBanco, JSON.stringify(banco));
const carregarCarrinho = () => lerStorage(chaveCarrinho, []);
const salvarCarrinho = carrinho => localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));

function usuarioAtual() {
  const sessao = lerStorage(chaveUsuarioLogado, null);
  if (!sessao) return null;

  const usuario = carregarBanco().usuarios.find(item => item.id === sessao.id);
  if (!usuario) {
    localStorage.removeItem(chaveUsuarioLogado);
    return null;
  }
  return usuario;
}

function iniciarSessao(usuario) {
  localStorage.setItem(chaveUsuarioLogado, JSON.stringify({ id: usuario.id }));
}

function formatarCpf(valor) {
  return apenasDigitos(valor)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

function formatarTelefone(valor) {
  const digitos = apenasDigitos(valor).slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function cpfValido(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calcularDigito = tamanho => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(cpf[9]) && calcularDigito(10) === Number(cpf[10]);
}

function iniciarTema() {
  const raiz = document.documentElement;
  if (localStorage.getItem(chaveTema) === "escuro") {
    raiz.classList.add("dark");
  }
  document.querySelectorAll(".botao-tema").forEach(botao => {
    botao.addEventListener("click", () => {
      raiz.classList.toggle("dark");
      localStorage.setItem(chaveTema, raiz.classList.contains("dark") ? "escuro" : "claro");
    });
  });
}

function iniciarMenu() {
  const menuLateral = document.getElementById("menu-lateral");
  const fundo = document.getElementById("fundo-menu");

  const abrir = () => {
    menuLateral?.classList.add("aberto");
    fundo?.classList.add("ativo");
  };

  const fechar = () => {
    menuLateral?.classList.remove("aberto");
    fundo?.classList.remove("ativo");
  };

  document.getElementById("abrir-menu")?.addEventListener("click", abrir);
  document.getElementById("fechar-menu")?.addEventListener("click", fechar);
  fundo?.addEventListener("click", fechar);
  menuLateral?.querySelectorAll("a").forEach(link => link.addEventListener("click", fechar));

  document.querySelectorAll(".link-sair").forEach(link => {
    link.addEventListener("click", evento => {
      evento.preventDefault();
      localStorage.removeItem(chaveUsuarioLogado);
      window.location.href = "index.html";
    });
  });
}

function atualizarMenuUsuario() {
  const logado = Boolean(usuarioAtual());
  document.querySelectorAll(".item-cadastro").forEach(item => {
    item.hidden = logado;
  });
  document.querySelectorAll(".item-perfil, .item-sair").forEach(item => {
    item.hidden = !logado;
  });
}

function rolarParaSecao(hash) {
  const secao = document.querySelector(hash);
  if (!secao) return;

  secao.scrollIntoView({ behavior: "smooth", block: "start" });
  secao.classList.remove("secao-entrando");
  void secao.offsetWidth;
  secao.classList.add("secao-entrando");
}

function iniciarTransicoes() {
  document.body.classList.add("pagina-entrando");

  if (window.location.hash && document.querySelector(window.location.hash)) {
    setTimeout(() => rolarParaSecao(window.location.hash), 350);
  }

  document.querySelectorAll("a[href]").forEach(link => {
    link.addEventListener("click", evento => {
      if (link.hasAttribute("download") || link.target === "_blank" || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;

      const destino = new URL(link.href, window.location.href);
      const atual = new URL(window.location.href);

      if (destino.origin !== atual.origin) return;

      const mesmaPagina = destino.pathname === atual.pathname;

      if (mesmaPagina && destino.hash) {
        evento.preventDefault();
        history.pushState(null, "", destino.hash);
        rolarParaSecao(destino.hash);
        return;
      }

      if (mesmaPagina || link.classList.contains("link-sair")) return;

      evento.preventDefault();
      document.body.classList.add("pagina-saindo");
      setTimeout(() => {
        window.location.href = destino.href;
      }, 280);
    });
  });
}

function iniciarTilt() {
  const imagem = document.querySelector("#sushi_img");
  if (imagem && window.VanillaTilt) {
    VanillaTilt.init(imagem, {
      max: 10,
      speed: 600,
      scale: 1.03,
      glare: true,
      "max-glare": 0.25
    });
  }
}

function itensDoCarrinho() {
  const produtos = carregarBanco().produtos;
  return carregarCarrinho()
    .map(item => {
      const produto = produtos.find(produto => produto.id === item.id);
      return produto ? { ...produto, quantidade: item.quantidade } : null;
    })
    .filter(Boolean);
}

const calcularTotal = itens => itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

function modeloItemCarrinho(item) {
  return `
    <li class="item-carrinho">
      <div>
        <h3>${item.nome}</h3>
        <span>${formatarPreco(item.preco)}</span>
      </div>
      <div class="controles-item">
        <button data-id="${item.id}" data-variacao="-1" aria-label="Diminuir quantidade">−</button>
        <span>${item.quantidade}</span>
        <button data-id="${item.id}" data-variacao="1" aria-label="Aumentar quantidade">+</button>
      </div>
    </li>`;
}

function atualizarCarrinho() {
  const itens = itensDoCarrinho();
  const quantidade = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const total = formatarPreco(calcularTotal(itens));
  const html = itens.length
    ? itens.map(modeloItemCarrinho).join("")
    : `<li class="carrinho-vazio">Seu carrinho está vazio.</li>`;

  ["itens-carrinho", "itens-finalizar"].forEach(id => {
    const lista = document.getElementById(id);
    if (lista) lista.innerHTML = html;
  });

  definirTexto("total-carrinho", total);
  definirTexto("total-finalizar", total);
  definirTexto("contador-carrinho", quantidade);
  definirTexto("quantidade-finalizar", quantidade);

  const contador = document.getElementById("contador-carrinho");
  if (contador) contador.hidden = quantidade === 0;

  const confirmar = document.getElementById("confirmar-pedido");
  if (confirmar) confirmar.disabled = !itens.length;
}

function adicionarAoCarrinho(id) {
  const carrinho = carregarCarrinho();
  const item = carrinho.find(item => item.id === id);
  if (item) {
    item.quantidade++;
  } else {
    carrinho.push({ id, quantidade: 1 });
  }
  salvarCarrinho(carrinho);
  atualizarCarrinho();
  document.getElementById("menu-carrinho")?.classList.add("aberto");
}

function alterarQuantidade(id, variacao) {
  const carrinho = carregarCarrinho()
    .map(item => item.id === id ? { ...item, quantidade: item.quantidade + variacao } : item)
    .filter(item => item.quantidade > 0);
  salvarCarrinho(carrinho);
  atualizarCarrinho();
}

function iniciarEventosGlobais() {
  document.addEventListener("click", evento => {
    const adicionar = evento.target.closest(".btn-produto[data-id]");
    if (adicionar) {
      adicionarAoCarrinho(Number(adicionar.dataset.id));
      return;
    }

    const quantidade = evento.target.closest("[data-variacao]");
    if (quantidade) {
      alterarQuantidade(Number(quantidade.dataset.id), Number(quantidade.dataset.variacao));
    }
  });
}

function iniciarCarrinho() {
  const painel = document.getElementById("menu-carrinho");
  if (!painel) return;

  document.getElementById("abrir-carrinho")?.addEventListener("click", () => painel.classList.toggle("aberto"));
  document.getElementById("fechar-carrinho")?.addEventListener("click", () => painel.classList.remove("aberto"));
}

function aplicarFiltrosCardapio() {
  const grade = document.getElementById("grade");
  if (!grade) return;

  const termo = normalizarTexto(estadoCardapio.termo);

  const produtos = Array.from(grade.querySelectorAll(".produto")).sort((a, b) => {
    if (estadoCardapio.ordem === "menor-preco") return Number(a.dataset.preco) - Number(b.dataset.preco);
    if (estadoCardapio.ordem === "maior-preco") return Number(b.dataset.preco) - Number(a.dataset.preco);
    if (estadoCardapio.ordem === "az") return a.querySelector("h2").textContent.localeCompare(b.querySelector("h2").textContent, "pt-BR");
    return Number(a.dataset.ordem) - Number(b.dataset.ordem);
  });

  let encontrados = 0;

  produtos.forEach(produto => {
    grade.appendChild(produto);

    const texto = normalizarTexto(`${produto.querySelector("h2").textContent} ${produto.querySelector("p").textContent} ${produto.dataset.categoria}`);
    const categoriaOk = estadoCardapio.categoria === "todos" || produto.dataset.categoria === estadoCardapio.categoria;
    const mostrar = categoriaOk && (!termo || texto.includes(termo));

    produto.hidden = !mostrar;
    if (mostrar) encontrados++;
  });

  document.querySelectorAll(".botao[data-filtro]").forEach(botao => {
    botao.classList.toggle("ativo", botao.dataset.filtro === estadoCardapio.categoria);
  });

  definirTexto("contagem-produtos", `${encontrados} produto(s) encontrado(s)`);

  const semResultados = document.getElementById("sem-resultados");
  if (semResultados) semResultados.hidden = encontrados > 0;
}

function iniciarCardapio() {
  const grade = document.getElementById("grade");
  if (!grade) return;

  grade.querySelectorAll(".produto").forEach((produto, indice) => {
    produto.dataset.ordem = indice;
  });

  document.querySelectorAll(".botao[data-filtro]").forEach(botao => {
    botao.addEventListener("click", () => {
      estadoCardapio.categoria = botao.dataset.filtro;
      aplicarFiltrosCardapio();
    });
  });

  document.getElementById("busca-produtos")?.addEventListener("input", evento => {
    estadoCardapio.termo = evento.target.value;
    aplicarFiltrosCardapio();
  });

  document.getElementById("ordenar-produtos")?.addEventListener("change", evento => {
    estadoCardapio.ordem = evento.target.value;
    aplicarFiltrosCardapio();
  });

  document.getElementById("limpar-busca")?.addEventListener("click", () => {
    estadoCardapio.termo = "";
    estadoCardapio.categoria = "todos";
    estadoCardapio.ordem = "padrao";
    document.getElementById("busca-produtos").value = "";
    document.getElementById("ordenar-produtos").value = "padrao";
    aplicarFiltrosCardapio();
  });

  aplicarFiltrosCardapio();
}

function iniciarCarrossel() {
  const areaCarrossel = document.querySelector(".area_carrossel");
  const cartoesPratos = document.querySelectorAll(".cartao_prato");
  if (!areaCarrossel || !cartoesPratos.length) return;

  const botaoAnterior = document.querySelector(".botao_navegacao[aria-label='Anterior']");
  const botaoProximo = document.querySelector(".botao_navegacao[aria-label='Próximo']");
  const pontosIndicadores = document.querySelectorAll(".ponto_indicador");
  const totalPratos = cartoesPratos.length;
  let indicePratoAtual = 0;
  let rolagemProgramatica = false;
  let temporizadorRolagem;

  function atualizarIndicadores(novoIndice) {
    indicePratoAtual = novoIndice;

    pontosIndicadores.forEach((ponto, indice) => {
      ponto.classList.toggle("ativo", indice === indicePratoAtual);
    });

    cartoesPratos.forEach((cartao, indice) => {
      const ativo = indice === indicePratoAtual;
      cartao.style.opacity = ativo ? "1" : "0.6";
      cartao.style.transform = ativo ? "scale(1)" : "scale(0.92)";
      cartao.style.boxShadow = ativo ? "0 12px 32px rgba(0, 0, 0, 0.12)" : "none";
    });
  }

  function rolarParaPrato(indice) {
    rolagemProgramatica = true;

    if (indice < 0) {
      indice = totalPratos - 1;
    } else if (indice >= totalPratos) {
      indice = 0;
    }

    const pratoAlvo = cartoesPratos[indice];
    const deslocamento = pratoAlvo.offsetLeft - (areaCarrossel.offsetWidth / 2 - pratoAlvo.offsetWidth / 2);

    areaCarrossel.scrollTo({ left: deslocamento, behavior: "smooth" });
    atualizarIndicadores(indice);

    setTimeout(() => {
      rolagemProgramatica = false;
    }, 400);
  }

  botaoAnterior?.addEventListener("click", () => rolarParaPrato(indicePratoAtual - 1));
  botaoProximo?.addEventListener("click", () => rolarParaPrato(indicePratoAtual + 1));
  pontosIndicadores.forEach((ponto, indice) => ponto.addEventListener("click", () => rolarParaPrato(indice)));

  areaCarrossel.addEventListener("scroll", () => {
    if (rolagemProgramatica) return;

    clearTimeout(temporizadorRolagem);
    temporizadorRolagem = setTimeout(() => {
      const centro = areaCarrossel.scrollLeft + areaCarrossel.offsetWidth / 2;
      let maisProximo = 0;
      let menorDistancia = Infinity;

      cartoesPratos.forEach((cartao, indice) => {
        const distancia = Math.abs(cartao.offsetLeft + cartao.offsetWidth / 2 - centro);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          maisProximo = indice;
        }
      });

      atualizarIndicadores(maisProximo);
    }, 80);
  });

  setTimeout(() => rolarParaPrato(0), 50);
}

function iniciarLogin() {
  const formulario = document.getElementById("form-login");
  if (!formulario) return;

  const campoEmail = document.getElementById("email");
  const campoSenha = document.getElementById("senha");
  const lembrar = document.getElementById("lembrar");
  const emailLembrado = localStorage.getItem(chaveEmailLembrado);

  if (emailLembrado) {
    campoEmail.value = emailLembrado;
    lembrar.checked = true;
  }

  formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const email = normalizarEmail(campoEmail.value);
    const usuario = carregarBanco().usuarios.find(item => item.email === email && item.senha === campoSenha.value);

    if (!usuario) {
      alert("E-mail ou senha incorretos.");
      return;
    }

    iniciarSessao(usuario);

    if (lembrar.checked) {
      localStorage.setItem(chaveEmailLembrado, email);
    } else {
      localStorage.removeItem(chaveEmailLembrado);
    }

    window.location.href = "cardapio.html";
  });
}

function iniciarCadastro() {
  const formulario = document.getElementById("form-registro");
  if (!formulario) return;

  const campoCpf = document.getElementById("cpf");
  const campoTelefone = document.getElementById("telefone");

  campoCpf.addEventListener("input", () => {
    campoCpf.value = formatarCpf(campoCpf.value);
  });

  campoTelefone.addEventListener("input", () => {
    campoTelefone.value = formatarTelefone(campoTelefone.value);
  });

  formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = normalizarEmail(document.getElementById("email").value);
    const senha = document.getElementById("senha").value;
    const endereco = document.getElementById("endereco").value.trim();

    if (!cpfValido(campoCpf.value)) {
      alert("CPF inválido. Confira os números digitados.");
      return;
    }

    if (apenasDigitos(campoTelefone.value).length < 10) {
      alert("Telefone inválido. Informe DDD e número.");
      return;
    }

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    const banco = carregarBanco();

    if (banco.usuarios.some(item => item.email === email)) {
      alert("Este e-mail já está cadastrado.");
      return;
    }

    const usuario = {
      id: proximoId(banco.usuarios),
      nome,
      email,
      senha,
      endereco
    };

    banco.usuarios.push(usuario);
    salvarBanco(banco);
    iniciarSessao(usuario);
    window.location.href = "cardapio.html";
  });
}

function validarBanco(dados) {
  return Boolean(dados) && Array.isArray(dados.usuarios) && Array.isArray(dados.produtos) && Array.isArray(dados.pedidos);
}

function baixarJson(banco) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(banco, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "json.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importarJson(evento) {
  const campo = evento.target;
  const arquivo = campo.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const dados = JSON.parse(leitor.result);
      if (!validarBanco(dados)) throw new Error("Estrutura inválida");

      salvarBanco(dados);
      alert("JSON importado com sucesso.");
      window.location.reload();
    } catch {
      alert("Arquivo inválido. Use um JSON com as listas usuarios, produtos e pedidos.");
    }
  };
  leitor.readAsText(arquivo);
  campo.value = "";
}

function finalizarPedido() {
  const cliente = usuarioAtual();
  const itens = itensDoCarrinho();

  if (!cliente) {
    window.location.href = "login.html";
    return;
  }

  if (!itens.length) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const banco = carregarBanco();
  const id = proximoId(banco.pedidos);
  const total = Number(calcularTotal(itens).toFixed(2));

  banco.pedidos.push({
    id,
    codigo_pedido: `PED-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`,
    nome_cliente: cliente.nome,
    total,
    status: "Em preparo"
  });

  salvarBanco(banco);
  salvarCarrinho([]);
  baixarJson(banco);
  atualizarCarrinho();
  alert(`Pedido realizado com sucesso! Total: ${formatarPreco(total)}`);
}

function iniciarFinalizacao() {
  const pagina = document.getElementById("pagina-finalizar");
  if (!pagina) return;

  const cliente = usuarioAtual();
  if (!cliente) {
    alert("Entre na sua conta para finalizar o pedido.");
    window.location.href = "login.html";
    return;
  }

  definirTexto("nome-entrega", cliente.nome);
  definirTexto("endereco-entrega", cliente.endereco);

  const campoArquivo = document.getElementById("arquivo-importacao");
  document.getElementById("botao-importar").addEventListener("click", () => campoArquivo.click());
  campoArquivo.addEventListener("change", importarJson);
  document.getElementById("botao-exportar").addEventListener("click", () => baixarJson(carregarBanco()));
  document.getElementById("confirmar-pedido").addEventListener("click", finalizarPedido);
}

function preencherPerfil(cliente) {
  definirTexto("nome-usuario", cliente.nome);
  document.getElementById("nome-perfil").value = cliente.nome;
  document.getElementById("email-perfil").value = cliente.email;
  document.getElementById("endereco-perfil").value = cliente.endereco;
}

function salvarPerfil(evento) {
  evento.preventDefault();

  const cliente = usuarioAtual();
  if (!cliente) return;

  const novoNome = document.getElementById("nome-perfil").value.trim();
  const novoEndereco = document.getElementById("endereco-perfil").value.trim();
  const novaSenha = document.getElementById("senha-perfil").value;

  if (novaSenha && novaSenha.length < 6) {
    alert("A nova senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  const banco = carregarBanco();
  const indice = banco.usuarios.findIndex(item => item.id === cliente.id);

  banco.usuarios[indice] = {
    ...banco.usuarios[indice],
    nome: novoNome,
    endereco: novoEndereco,
    senha: novaSenha || banco.usuarios[indice].senha
  };

  banco.pedidos.forEach(pedido => {
    if (pedido.nome_cliente === cliente.nome) {
      pedido.nome_cliente = novoNome;
    }
  });

  salvarBanco(banco);
  definirTexto("nome-usuario", novoNome);
  document.getElementById("senha-perfil").value = "";
  alert("Dados atualizados com sucesso.");
  renderizarPedidos();
}

function modeloPedido(pedido) {
  return `
    <li class="cartao-pedido">
      <div>
        <strong>${pedido.codigo_pedido}</strong>
        <span class="cor">${formatarPreco(pedido.total)}</span>
      </div>
      <span class="etiqueta-status" data-status="${pedido.status}">${pedido.status}</span>
    </li>`;
}

function renderizarPedidos() {
  const lista = document.getElementById("lista-pedidos");
  const cliente = usuarioAtual();
  if (!lista || !cliente) return;

  const termo = normalizarTexto(document.getElementById("busca-pedidos").value);
  const status = document.getElementById("filtro-status").value;

  const pedidos = carregarBanco().pedidos
    .filter(pedido => pedido.nome_cliente === cliente.nome)
    .filter(pedido => status === "todos" || pedido.status === status)
    .filter(pedido => !termo || normalizarTexto(`${pedido.codigo_pedido} ${pedido.status} ${formatarPreco(pedido.total)} ${pedido.total}`).includes(termo))
    .sort((a, b) => b.id - a.id);

  lista.innerHTML = pedidos.length
    ? pedidos.map(modeloPedido).join("")
    : `<li class="vazio">Nenhum pedido encontrado.</li>`;

  definirTexto("contagem-pedidos", `${pedidos.length} pedido(s) encontrado(s)`);
}

function iniciarPerfil() {
  const pagina = document.getElementById("pagina-perfil");
  if (!pagina) return;

  const cliente = usuarioAtual();
  if (!cliente) {
    window.location.href = "login.html";
    return;
  }

  preencherPerfil(cliente);
  document.getElementById("form-perfil").addEventListener("submit", salvarPerfil);
  document.getElementById("busca-pedidos").addEventListener("input", renderizarPedidos);
  document.getElementById("filtro-status").addEventListener("input", renderizarPedidos);
  renderizarPedidos();
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarTema();
  iniciarMenu();
  iniciarTransicoes();
  iniciarTilt();
  iniciarCarrinho();
  iniciarCardapio();
  iniciarCarrossel();
  iniciarLogin();
  iniciarCadastro();
  iniciarPerfil();
  iniciarFinalizacao();
  iniciarEventosGlobais();
  atualizarMenuUsuario();
  atualizarCarrinho();
});