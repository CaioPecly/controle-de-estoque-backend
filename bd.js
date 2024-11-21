const express = require("express");
const rotas = express();
const Sequelize = require("sequelize");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

rotas.use(cors());
rotas.use(express.json()); // Permite ler o corpo da requisição como JSON


const conexaoComBanco = new Sequelize("estoque", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const Estoque = conexaoComBanco.define("estoques", {
  nome_produto: {
    type: Sequelize.STRING,
  },
  quantidade_produto: {
    type: Sequelize.INTEGER,
  },
  valor_unitario: {
    type: Sequelize.FLOAT,
  },
  valor_atacado: {
    type: Sequelize.FLOAT,
  },
  descricao: {
    type: Sequelize.STRING,
  },
});

// Sincronizando o modelo com o banco
Estoque.sync({ force: false });

rotas.get("/", function (req, res) {
  res.send("Rota principal");
});

// Rota para salvar um produto com método POST (ajustado)
rotas.post("/salvar", async function (req, res) {
  const { nome_produto, quantidade_produto, valor_unitario, valor_atacado, descricao } = req.body;

  try {
      // Cria um novo produto
      const novoProduto = await Estoque.create({
          nome_produto,
          quantidade_produto,
          valor_unitario,
          valor_atacado,
          descricao,
      });

      // Retorna o sucesso
      res.json({
          resposta: "Produto cadastrado com sucesso",
          produto: novoProduto,
      });
  } catch (error) {
      res.status(500).json({ mensagem: `Erro ao salvar produto: ${error}` });
  }
});
// Rota para mostrar todos os produtos cadastrados
rotas.get("/mostrar", async function (req, res) {
  try {
    const estoque = await Estoque.findAll(); // Busca todos os registros
    res.json(estoque); // Retorna os registros em formato JSON
  } catch (error) {
    res.status(500).json({ message: `Erro ao buscar produtos: ${error}` }); // Retorna erro ao cliente
  }
});

// Rota para deletar um produto
rotas.delete("/deletar/:id", async function (req, res) {
  const { id } = req.params;
  const idNumber = parseInt(id, 10); // Converte o ID para número

  try {
    const deleted = await Estoque.destroy({
      where: { id: idNumber },
    });

    if (deleted) {
      res.json({ mensagem: "Produto deletado com sucesso" });
    } else {
      res.status(404).json({ mensagem: "Produto não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao deletar produto: ${error}` });
  }
});

// Rota para editar um produto existente
rotas.put("/editar/:id", async function (req, res) {
  const { id } = req.params;
  const { nome_produto, quantidade_produto, valor_unitario, valor_atacado, descricao } = req.body;
  const idNumber = parseInt(id, 10); // Converte o ID para número

  try {
    const [updated] = await Estoque.update(
      { nome_produto, quantidade_produto, valor_unitario, valor_atacado, descricao },
      { where: { id: idNumber } }
    );

    if (updated) {
      res.json({ mensagem: "Produto atualizado com sucesso" });
    } else {
      res.status(404).json({ mensagem: "Produto não encontrado para atualização" });
    }
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao editar produto: ${error}` });
  }
});
const conexaoBanco = new Sequelize("estoque", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// Definindo o modelo de usuários
const Usuario = conexaoComBanco.define("usuarios", {
  username: {
    type: Sequelize.STRING,
    unique: true,
  },
  senha: {
    type: Sequelize.STRING,
  },
});

// Sincronizando o modelo com o banco
Usuario.sync({ force: false});

// Rota de cadastro de usuários
rotas.post("/cadastro", async function (req, res) {
  const { username, senha } = req.body;

  try {
    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o novo usuário
    const novoUsuario = await Usuario.create({
      username,
      senha: senhaCriptografada,
    });

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao cadastrar usuário: ${error}` });
  }
});

// Rota de login de usuários
rotas.post("/login", async function (req, res) {
  const { username, senha } = req.body;

  try {
    // Procura o usuário pelo nome de usuário
    const usuario = await Usuario.findOne({ where: { username } });

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado!" });
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Senha incorreta!" });
    }

    // Cria o token JWT
    const token = jwt.sign({ id: usuario.id }, "secreta", { expiresIn: "1h" });

    res.json({ mensagem: "Login bem-sucedido!", token });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao fazer login: ${error}` });
  }
});

//###Servidor###
rotas.listen(3031, function () {
  console.log("Servidor rodando na porta 3031");
});
