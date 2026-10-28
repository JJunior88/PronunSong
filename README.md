# PronunSong

App web para brasileiros praticarem pronúncia em inglês com letras de músicas tradicionais de domínio público.

## Executar

Requer Node.js 22 ou superior. Não há dependências externas para instalar.

```sh
npm start
```

O servidor escuta na porta 3000 (ou na variável `PORT`). Abra no navegador em localhost ou por uma conexão HTTPS disponibilizada pelo seu ambiente. A gravação exige um contexto seguro e permissão para usar o microfone.

```sh
npm test
npm run check
```

## Primeira versão

- Três músicas, tradução e dicas de pronúncia por trecho.
- Filtro por nível, voz de referência com velocidade ajustável e navegação entre trechos.
- Gravação de até 30 segundos pelo microfone e reprodução local.
- Marcação manual de músicas praticadas, salva no localStorage do navegador.
- Interface responsiva em português com suporte a teclado e mensagens de estado.

A referência usa a síntese de voz do navegador: é falada, não cantada. As vozes disponíveis e eventual processamento remoto dependem do navegador/sistema operacional. O app não envia as gravações a um servidor; elas ficam em memória até trocar de trecho ou encerrar a página. Não há reconhecimento de voz nem avaliação automática da pronúncia. Não há contas, backend persistente ou integração com catálogos comerciais.

## Validação manual no navegador

1. Filtrar músicas por nível e abrir uma prática.
2. Ouvir a frase; mudar velocidade e navegar pelos quatro trechos.
3. Autorizar o microfone, gravar, encerrar e ouvir a própria voz.
4. Testar também permissão negada e navegador sem suporte a gravação.
5. Marcar uma música, recarregar e confirmar a persistência; desfazer a marcação.

Os testes automatizados cobrem o catálogo e a recuperação do progresso. Áudio e permissões exigem validação em navegador com dispositivos disponíveis.

## GitHub Actions e publicação

O workflow `.github/workflows/web.yml` executa os testes em pushes para `main` e pull requests. Ele disponibiliza o artefato **PronunSong-web** para download por 14 dias. Em `main`, também publica o site no GitHub Pages.

No GitHub, em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. Depois execute **Actions → PronunSong — testes e site → Run workflow**, caso necessário. O job de publicação apresenta a URL após concluir com sucesso. O endereço esperado é `https://jjunior88.github.io/PronunSong/`.

O Pages serve somente `index.html` e os arquivos de `src/`; o servidor Node e arquivos internos não são publicados. O navegador acessa o site por HTTPS, necessário para o microfone. Voz e microfone continuam dependendo do suporte e das permissões do dispositivo.
