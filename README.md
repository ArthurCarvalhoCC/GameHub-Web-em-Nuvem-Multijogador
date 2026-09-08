# IFAM Game Hub (Jogos WEB IFAM)

> **Status do Projeto:** Concluído ✅  
> **Acesse o site ao vivo:** [jogos-web-ifam-login-9b5c9.web.app](https://jogos-web-ifam-login-9b5c9.web.app/dashboard.html)

## Sobre 
O **IFAM Game Hub** é uma plataforma web interativa desenvolvida para hospedar minijogos de navegador. O sistema não apenas permite jogar, mas também cria um ambiente competitivo e engajador através de um sistema completo de contas, pontuação e rankings globais em tempo real.

Este é um projeto acadêmico desenvolvido em grupo para o curso técnico de Programação de Jogos Digitais (PJD) do Instituto Federal do Amazonas (IFAM).

---

## Funcionalidades Principais

* **Autenticação Segura:** Sistema de Login e Cadastro de usuários utilizando Firebase Authentication
* **Catálogo de Jogos:** Atualmente conta com os clássicos **Dino Runner** e **Jogo da Memória**
* **Dashboard do Jogador:** Painel interativo contendo nível do usuário, pontuação total, total de partidas jogadas e melhor posição nos rankings.
* **Ranking em Tempo Real:** Tabelas de classificação globais (Leaderboards) separadas por jogo, atualizadas instantaneamente via Firebase Realtime Database.
* **Histórico de Partidas:** Registro detalhado das últimas partidas, pontuações e datas.
* **Personalização (Configurações):** Suporte nativo a Tema Escuro (Dark Mode) e opção de "Privar Ranking" para usuários que desejam ocultar seus nomes nas tabelas.

---

## Tecnologias Utilizadas

* **Front-end:**
  * **HTML5 & CSS3**
  * **JavaScript (ES6 Modules)** 
  * **Bootstrap 5**
  * **FontAwesome** 

* **Back-end & Infraestrutura (BaaS - Firebase):**
  * **Firebase Authentication:** Gerenciamento de usuários e sessões.
  * **Firebase Realtime Database:** Armazenamento em nuvem para perfis, históricos e rankings de pontuação.
  * **Firebase Hosting:** Hospedagem da aplicação web.

--- 

## Como Executar localmente

1. Clone o repositório pelo terminal:
   ```bash
   gh repo clone ArthurCarvalhoCC/GameHub-Web-em-Nuvem-Multijogador
   ```
2. Como o projeto utiliza módulos JavaScript (`type="module"`), não abra o arquivo `index.html` com dois cliques. É necessário rodar o projeto através de um servidor local (como a extensão Live Server no VS Code).
3. Com o servidor local ativo, acesse a página inicial no seu navegador.