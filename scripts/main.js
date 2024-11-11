// main.js

// Load other scripts
load_code("config");
load_code("state");
load_code("utils");
load_code("events");
load_code("behavior");

// Main Loop
setInterval(mainLoop, 250);

function mainLoop() {
    if (character.rip || isRestocking || shouldRestockPotions()) return;

    managePotions();
    checkAndEquipUpgrades();
    loot();

    const now = new Date().getTime();
    if (now - lastPartyCheck > partyCheckInterval) {
        ensurePartyIntegrity();
        lastPartyCheck = now;
    }

    if (character.ctype === "priest") handleRevive();

    if (character.ctype !== "warrior") {
        supportRoleBehavior();
    } else {
        warriorBehavior();
    }
}
