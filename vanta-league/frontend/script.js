async function updateHomePageStats() {
    // 1. TOP PERFORMER (Pulls the #1 team from your 'league_standings' table)
    const mvpName = document.getElementById('mvp-name');
    const { data: topTeam } = await _supabase
        .from('league_standings')
        .select('team_name')
        .order('points', { ascending: false })
        .limit(1)
        .single();

    if (topTeam && mvpName) {
        mvpName.innerText = topTeam.team_name.toUpperCase();
    }

    // 2. MONTHLY MVP (Manual - Change this name once a month)
    const monthlyMvp = document.getElementById('monthly-mvp-name');
    if (monthlyMvp) {
        monthlyMvp.innerText = "TBD";
    }

    // 3. ONLINE PLAYERS (Real Discord Widget Connection)
    const playersEl = document.getElementById('player-count');
    
    // !!! MAKE SURE THIS IS YOUR ACTUAL DISCORD SERVER ID !!!
    const SERVER_ID = '1488493554807345234'; 

    try {
        const response = await fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`);
        const data = await response.json();
        
        // This displays how many people are currently online/green
        if (data.presence_count !== undefined && playersEl) {
            playersEl.innerText = data.presence_count.toLocaleString();
        }
    } catch (e) {
        console.warn("Discord Widget error: check Server Settings > Widget > Enable");
        if (playersEl) playersEl.innerText = "OFFLINE";
    }
}