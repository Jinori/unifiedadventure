// events.js

// Event Handlers

// Update the inventory mapping when items change
game.on("inventory", updateInventoryItemIndices);

game.on("chat", data => {
    if (data.channel !== "party" || !CONFIG.partyMembers.includes(data.name)) return;
    if (data.message.includes("potion run") && data.name !== character.name) {
        isRestocking = true;
        atDestination = false;
        set_message(`${data.name} needs potions, going to restock`);
        restockPotions();
    }
});

game.on("death", data => {
    if (data.id === character.name) {
        handleSelfDeath();
    } else if (CONFIG.partyMembers.includes(data.id)) {
        deadPartyMembers[data.id] = true;
        game_log(`Party member ${data.id} has died.`);
    }
});

// Event Handler for Party Invites
function on_party_invite(name) {
    if (name === CONFIG.partyLeader) {
        accept_party_invite(name);
        game_log(`Accepted party invite from ${name}`);
    } else {
        game_log(`Ignored party invite from ${name}`);
    }
}

function handleSelfDeath() {
    game_log(`${character.name} has died. Respawning in 15 seconds.`);
    setTimeout(() => {
        respawn();
        game_log(`${character.name} has respawned.`);
        afterRespawn();
    }, 15000);
}

function afterRespawn() {
    isRestocking = false;
    atDestination = false;
    ensurePartyIntegrity();
    if (shouldRestockPotions()) return;
    const warrior = get_player(CONFIG.warriorName);
    if (warrior) {
        smart_move(warrior);
    } else {
        navigateToZoneByLevel();
    }
}


