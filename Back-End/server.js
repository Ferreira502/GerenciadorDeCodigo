const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/teste', (req, res) => {
    res.json({ msg: 'Backend funcionando' });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
