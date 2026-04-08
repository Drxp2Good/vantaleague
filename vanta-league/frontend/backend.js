// 1. SUPABASE CONNECTION
const SUPABASE_URL = 'https://mqirarwxvqalxpbrucvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXJhcnd4dnFhbHhwYnJ1Y3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODI4NTAsImV4cCI6MjA5MDk1ODg1MH0.DX9gemUxI7tGtvYtQ_hkEr6pj7gbOUl6Ov6zb8VSqVU';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. PAGE ROUTING (Turns the key for specific pages)
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    
    // Check Home Page
    if (path.includes("index.html") || path === "/" || path === "") {
        updateHomePageStats();
    }
    
    // Check Leaderboard Page
    if (path.includes("league.html")) {
        renderStandings();
    }

    // Check Tournaments Page
    if (path.includes("matches.html")) {
        renderTournaments();
    }
});

/** 🏠 HOME PAGE LOGIC **/
async function updateHomePageStats() {
    const mvpName = document.getElementById('mvp-name');
    const monthlyMvp = document.getElementById('monthly-mvp-name');
    const playersEl = document.getElementById('player-count');

    // Fetch Overall MVP
    const { data: topTeam } = await _supabase
        .from('league_standings')
        .select('team_name')
        .order('points', { ascending: false })
        .limit(1)
        .single();

    if (topTeam && mvpName) mvpName.innerText = topTeam.team_name.toUpperCase();
    if (monthlyMvp) monthlyMvp.innerText = "TBD"; 

    // Fetch Discord Online
    const SERVER_ID = '1488493554807345234'; 
    try {
        const response = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const data = await response.json();
        if (data.presence_count !== undefined && playersEl) {
            playersEl.innerText = data.presence_count.toLocaleString();
        }
    } catch (e) {
        if (playersEl) playersEl.innerText = "OFFLINE";
    }
}

/** 🏆 LEADERBOARD LOGIC **/
async function renderStandings() {
    const tableBody = document.getElementById("standings-body");
    if (!tableBody) return;

    const { data, error } = await _supabase
        .from('league_standings')
        .select('*')
        .order('points', { ascending: false });

    if (error) {
        tableBody.innerHTML = "<tr><td colspan='4'>CONNECTION ERROR</td></tr>";
        return;
    }

    tableBody.innerHTML = ""; // Clear the "Initializing" text
    data.forEach(row => {
        tableBody.innerHTML += `
            <tr>
                <td>${row.team_name}</td>
                <td>${row.wins}</td>
                <td>${row.losses}</td>
                <td class="points">${row.points}</td>
            </tr>`;
    });
}

/** ⚔️ TOURNAMENTS LOGIC **/
async function renderTournaments() {
    const list = document.getElementById("tournament-list");
    if (!list) return;

    const { data, error } = await _supabase
        .from('tournaments')
        .select('*')
        .order('starts_at', { ascending: true });

    if (error) return;

    list.innerHTML = ""; 
    data.forEach(t => {
        const tId = `timer-${t.id}`;
        list.innerHTML += `
            <div class="card tournament-card">
                <div class="t-info">
                    <h2>${t.title}</h2>
                    <p>PRIZE: ${t.prize_pool}</p>
                </div>
                <div id="${tId}" class="t-timer">00d 00h 00m 00s</div>
                <div class="status-bar"><div class="fill-purple"></div></div>
            </div>`;
        startCountdown(tId, t.starts_at);
    });
}

function startCountdown(elementId, dateString) {
    const targetDate = new Date(dateString).getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        const el = document.getElementById(elementId);
        if (!el) return;

        if (distance < 0) {
            el.innerHTML = "LIVE";
        } else {
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            el.innerHTML = `${d}d ${h}h ${m}m ${s}s`;
        }
    }, 1000);
}