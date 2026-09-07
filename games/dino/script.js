// ===== CONFIGURAÇÕES DO FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update, get, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCjXuseOir6MQ-8Eg34ttCeH-Bsc2_vw9s",
    authDomain: "jogos-web-ifam-login-9b5c9.firebaseapp.com",
    projectId: "jogos-web-ifam-login-9b5c9",
    storageBucket: "jogos-web-ifam-login-9b5c9.firebasestorage.app",
    messagingSenderId: "64867484287",
    appId: "1:64867484287:web:2f240767d1bfa8e28c354a",
    measurementId: "G-Y2Q2541G6Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ===== VARIÁVEIS DE ESTADO E ELEMENTOS DO DOM =====
const astro = document.querySelector('.astro');
const nuvem = document.querySelector('.nuvem');
const dino = document.querySelector('.dino');
const board = document.getElementById('game-board');
const scoreE1 = document.getElementById('score');
const startMsg = document.getElementById('start-msg');
const highScore = document.getElementById('high-score');

let isGameOver = false;
let score = 0;
let scoreInterval, cactusTimeout, checkCollisionInterval;
let cactusSpawnSpeed = 2000;
let usuarioAtual = null;
let dadosUsuario = null;

// Cores base


// ===== EVENTOS DE ENTRADA (OUVINTES) =====

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') HandleAction();
});

document.addEventListener('click', HandleAction);

// ===== LÓGICA DE AUTENTICAÇÃO E SINCRONIZAÇÃO =====

onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioAtual = user;
        await carregarDadosUsuario(user.uid);
    } else {
        window.location.href = '../../login.html';
    }
});

// Buscar o perfil completo do usuário
async function carregarDadosUsuario(uid) {
    try {
        const snapshot = await get(ref(db, 'usuarios/' + uid));
        if (snapshot.exists()) {
            dadosUsuario = snapshot.val();
            
            // Atualiza o recorde visual pegando do objeto de rankings interno do usuário
            // const recorde = dadosUsuario.ranking.dino.melhorPontuacao || 0;
            const snapshotRanking = await get(ref(db, `ranking/dino/${usuarioAtual.uid}`));
            const recorde = snapshotRanking.exists() ? snapshotRanking.val().melhorPontuacao : 0;
            highScore.textContent = recorde.toString().padStart(5, '0');
            
            // Se o usuário existe mas não tem o objeto ranking, cria um localmente para evitar erros
            if (!dadosUsuario.ranking) dadosUsuario.ranking = {};
        }
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// Ajuste no Salvamento: Use Optional Chaining e caminhos consistentes
async function salvarPartida() {
    // Se o usuário está logado, mas não tem dados (ex: internet lenta), tenta prosseguir apenas com o ID
    if (!usuarioAtual) return;

    
    const rankingRef = ref(db, `ranking/dino/${usuarioAtual.uid}`);
    const snapshotRanking = await get(rankingRef);
    const recordeAnterior = snapshotRanking.exists() ? snapshotRanking.val().melhorPontuacao : 0;
    

    const pontuacaoGanha = Math.max(1, score);
    const novaPontuacaoTotal = (dadosUsuario?.pontuacao || 0) + pontuacaoGanha;
    const novoNivel = Math.floor(novaPontuacaoTotal / 500) + 1;
    
    try {
        // 1. Atualiza Perfil Geral
        await update(ref(db, 'usuarios/' + usuarioAtual.uid), {
            pontuacao: novaPontuacaoTotal,
            nivel: novoNivel || 1,
        });

        // 2. Atualiza Ranking Global 
        if (score > recordeAnterior) {
            // Atualiza no ranking global
            await set(rankingRef, {
                jogo: "Dino Runner &#129430",
                nome: dadosUsuario.nome,
                melhorPontuacao: score,
            });
        }

        // 3. Histórico
        await push(ref(db, 'historico/' + usuarioAtual.uid), {
            pontuacao: pontuacaoGanha,
            jogo: "Dino Runner &#129430",
            data: new Date().toISOString(),
            tempo: score,
            nivel: novoNivel || 1,
        });

    } catch (e) {
        console.error("Erro ao salvar:", e);
    }
}

// ===== MECÂNICAS E CONTROLE DO JOGO =====

function HandleAction() {
    if (isGameOver) restartGame();
    else if (!startMsg.classList.contains('hidden')) startGame();
    else jump();
}

function startGame() {
    isGameOver = false;
    pauseGame(false);
    dino.classList.remove('jump-anim');
    dino.classList.add('run-anim');

    startMsg.classList.add('hidden');
    score = 0;

    // Início do Cronômetro de Pontuação
    scoreInterval = setInterval(() => {
        score++;
        scoreE1.innerText = score.toString().padStart(5, '0');
    }, 100);

    // Limpeza de obstáculos e reinício do loop de spawn
    document.querySelectorAll('.cacto').forEach(c => c.remove());
    spawnCactus();
    checkCollisionInterval = setInterval(checkCollision, 10);
}

function restartGame() {
    resetAnimation(astro);
    resetAnimation(nuvem);
    
    clearInterval(scoreInterval);
    clearInterval(checkCollisionInterval);
    clearTimeout(cactusTimeout);
    startGame();
}

function jump() {
    if (dino.classList.contains('jump-anim')) return;
    dino.classList.remove('run-anim');
    dino.classList.add('jump-anim');
    
        setTimeout(() => {
            if (!isGameOver) {
                dino.classList.remove('jump-anim');
                dino.classList.add('run-anim');
            }
        }, 500);
}

// ===== GERENCIAMENTO DE OBSTÁCULOS E COLISÃO =====

function spawnCactus() {
    if (isGameOver) return;

    const cactus = document.createElement('div');
    cactus.classList.add('cacto');
    cactus.innerText = '🌵';
    board.appendChild(cactus);

    // Aumento progressivo da dificuldade
    cactusSpawnSpeed = Math.max(250, cactusSpawnSpeed - 5);

    // Remoção automática do cacto após atravessar a tela
    setTimeout(() => { 
        if (board.contains(cactus) && !isGameOver) cactus.remove(); 
    }, 2000);

    // Cálculo do próximo spawn aleatório
    const randomTime = Math.random() * 1000 + cactusSpawnSpeed;
    cactusTimeout = setTimeout(spawnCactus, randomTime);
}

function checkCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const cactuses = document.querySelectorAll('.cacto');

    cactuses.forEach((cactus) => {
        const cactusRect = cactus.getBoundingClientRect();
        
        // Verificação de intersecção entre os elementos
        if (
            dinoRect.right > cactusRect.left + 10 &&
            dinoRect.left < cactusRect.right - 10 &&
            dinoRect.bottom > cactusRect.top + 10
        ) {
            handleGameOver();
        }
    });
}

// ===== FINALIZAÇÃO E ESTADOS DE INTERFACE =====

function handleGameOver() {
    isGameOver = true;

    salvarPartida(); // Sincroniza resultados com a nuvem
    pauseGame(true);

    clearTimeout(cactusTimeout);
    clearInterval(scoreInterval);
    clearInterval(checkCollisionInterval);

    verifyNewScore(); // Atualiza recorde local
    startMsg.classList.remove('hidden');
}

function verifyNewScore() {
    const atual = parseInt(highScore.innerText);
    if (score > atual) {
        highScore.innerText = score.toString().padStart(5, '0');
    }
}

function pauseGame(active) {
    board.classList.toggle('game-paused', active);
}

function resetAnimation(objeto) {
    if (!objeto) return;
    const classe = objeto.className;

    objeto.className = '';
    void objeto.offsetWidth; // Trigger para resetar o fluxo de renderização
    objeto.classList.add(classe);
}

// ===== FUNÇÕES VISUÁVEIS =====

function makeDayCicle () {
    
}