
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(express.json());
app.use(express.static(__dirname));

// --- Rotas de Arquivos e Pastas ---
// Pasta onde ficam os arquivos .config reais
app.use('/configs', express.static(path.join(__dirname, 'configuracoe_unitvfree')));

// --- Rota de Validação para o APK ---
app.get('/validar/:codigo', (req, res) => {
    const codigoInput = req.params.codigo;
    const caminhoJson = path.join(__dirname, 'codigos.json');
    
    // Verifica se o arquivo codigos.json existe
    if (!fs.existsSync(caminhoJson)) {
        return res.status(500).json({ status: "erro", mensagem: "Banco de códigos não encontrado" });
    }

    const dados = JSON.parse(fs.readFileSync(caminhoJson, 'utf8'));
    const registro = dados.find(item => item.codigo === codigoInput);

    if (registro) {
        res.json({ 
            status: "ok", 
            arquivo: registro.arquivo,
            url_download: `/configs/${registro.arquivo}` 
        });
    } else {
        res.status(404).json({ status: "erro", mensagem: "Código inválido" });
    }
});

// --- Rota para Salvar Config (Painel Admin) ---
app.post('/salvar-config', (req, res) => {
    const { codigo, pasta } = req.body;
    const pastaDestino = path.join(__dirname, 'configuracoe_unitvfree', pasta);
    
    if (!fs.existsSync(pastaDestino)) fs.mkdirSync(pastaDestino, { recursive: true });

    const caminho = path.join(pastaDestino, `${codigo}.config`);
    const dados = JSON.stringify({ codigo, status: "ativo" }, null, 2);

    fs.writeFile(caminho, dados, (err) => {
        if (err) return res.status(500).send('Erro ao salvar');
        res.send('Ok');
    });
});

// --- Rota para Listar Configs ---
app.get('/listar-configs', (req, res) => {
    const caminho = path.join(__dirname, 'configuracoe_unitvfree');
    fs.readdir(caminho, (err, files) => {
        if (err) return res.status(500).send('Erro ao ler pasta');
        res.json(files);
    });
});

// --- Rota Inicial ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});