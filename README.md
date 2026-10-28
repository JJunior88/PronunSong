# PronunSong

App web para brasileiros praticarem pronúncia em inglês com letras de músicas tradicionais de domínio público.

## Executar

Requer Node.js 22 ou superior. O app não precisa de dependências externas em execução. Para instalar as ferramentas de teste, execute `npm ci`.

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

## Instalar no celular Android

Em **Actions → Android — testes e APK**, abra uma execução concluída e baixe **PronunSong-Android-debug**, em **Artifacts** (é necessário entrar no GitHub). Extraia o ZIP e abra `app-debug.apk` no celular. Autorize a instalação por esse navegador ou gerenciador de arquivos quando o Android solicitar. Android 8 ou superior; não funciona no iPhone. O APK de depuração é para testes, não para publicação na Play Store.

As músicas e a interface vêm no APK. A voz usa o texto para fala do Android; instale uma voz inglesa nas configurações do sistema se necessário. O microfone exige permissão. Os áudios ficam na sessão; não são enviados pelo app. Atualizações de APKs de depuração de diferentes execuções podem exigir desinstalar a versão anterior, perdendo o progresso local, pois a chave de depuração do runner não é persistida.

O wrapper está em `android/`. Com Java 21 e SDK Android 35 configurados, execute `cd android && ./gradlew lintDebug assembleDebug`. Os arquivos web são copiados automaticamente para os assets durante a compilação.

## Importar suas músicas (v0.2)

Na seção **Importar**, escolha um MP3 de até 50 MB, informe o nome e cole a letra em inglês ou escolha um TXT/LRC de até 200 KB. Toque em **Abrir minha música**. Uma linha representa um trecho; letras LRC com horários permitem iniciar o áudio no trecho selecionado. A velocidade do MP3 é independente da velocidade da pronúncia sintetizada. Letras sem horários usam navegação manual, sem sincronização automática nem tradução.

O áudio e a letra importados ficam somente na sessão atual: recarregar, fechar ou substituir a música exige importar novamente. A biblioteca inicial mantém seu progresso local. Não há envio desses arquivos a um servidor. O Android usa o seletor de documentos do sistema sem pedir acesso geral ao armazenamento. Há uma música pessoal por vez, até 500 trechos.

## Núcleo de prática (v0.4)

Cada trecho tem marcação manual **Pratiquei este trecho**. O app salva no aparelho o último trecho e os trechos praticados, inclusive de letras importadas. Para retomar uma música pessoal depois de fechar, reimporte o MP3 e a mesma letra: a identidade do progresso é calculada a partir do texto e horários da letra. Áudio e letras pessoais não são persistidos. Limpar os dados do app/navegador ou desinstalá-lo apaga o progresso; não há sincronização entre aparelhos.

A biblioteca inicial inclui pronúncia escrita aproximada para brasileiros, apresentada como apoio ao áudio, sem substituir os sons reais. Letras importadas não recebem transcrição ou tradução automática. Gravar a voz não significa avaliar a pronúncia: esta versão não atribui notas nem reconhece o canto. O professor virtual é uma voz sintetizada falada.

Antes de integrações externas, validar no celular: importar MP3 e TXT/LRC; selecionar trecho; ouvir referência; gravar e reproduzir; marcar trecho; fechar e reabrir; reimportar a mesma letra e confirmar a retomada. Conferir também permissão de microfone negada, cancelamento do seletor de arquivos e pausa do app durante a gravação. Busca em catálogo, letras licenciadas, contas, banco de dados e armazenamento remoto ainda não estão implementados.

## Correção de pronúncia para letras importadas (v0.5.1)

Letras pessoais agora recebem pronúncia escrita aproximada usando o CMU Pronouncing Dictionary, incluído no APK e no site, sem API ou serviço pago. O painel aparece aberto por padrão. Palavras não cadastradas, como alguns nomes ou gírias, aparecem entre colchetes e são listadas como indisponíveis. A conversão é um apoio aproximado para brasileiros, baseada no inglês americano; não é transcrição fonética exata nem avaliação de canto. Consulte o áudio de referência.

Dados: `src/vendor/cmudict.json`, derivados de https://github.com/cmusphinx/cmudict; licença e atribuição em `src/vendor/CMUDICT-LICENSE.txt`. O site carrega o dicionário ao importar a letra; no APK ele já está incluído. A licença deve acompanhar qualquer redistribuição. Esta seção substitui a limitação anterior de ausência de pronúncia escrita em letras importadas.

## Biblioteca salva e guia lento (v0.6)

MP3 e letras importados agora ficam em IndexedDB no aparelho, com várias músicas na biblioteca e botão para excluir. Só aparece confirmação de salvamento após a gravação no banco local concluir. Falta de espaço ou bloqueio de armazenamento é informado. Não precisa reimportar ao reabrir. Limpar os dados, desinstalar o app ou limpeza de armazenamento pelo navegador pode remover os arquivos; não há backup na nuvem. O app solicita armazenamento persistente quando o navegador oferece esse recurso.

O guia tem velocidades de 0,25× a 1×, além de **Ouvir palavra por palavra**, com pausas de 700 ms e botão de parada. O motor de voz do aparelho pode limitar a velocidade efetiva. A escrita usa “x”, “qu”, “gu” e “rr” para facilitar a leitura em português; “f/d” para TH são aproximações, não substituem ouvir e aprender o som original.

Os APKs de teste continuam usando a chave de depuração gerada pelo runner. Atualizações entre execuções podem exigir desinstalação por diferença de assinatura, apagando a biblioteca. Para atualizações sem perda de dados, será necessário configurar uma chave de assinatura persistente em GitHub Secrets em uma etapa separada; nenhuma chave deve ser publicada no repositório.
