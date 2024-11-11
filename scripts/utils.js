// utils.js

// Helper Functions
function distance(a, b) {
    return Math.hypot(a.real_x - b.real_x, a.real_y - b.real_y);
}

function moveToTarget(target) {
    if (!is_moving(character)) {
        xmove(target.x, target.y);
    }
}

function followCharacter(targetCharacter, distanceThreshold) {
    if (distance(character, targetCharacter) > distanceThreshold) {
        moveToTarget(targetCharacter);
        set_message(`Following ${targetCharacter.name}`);
    } else {
        set_message(`Close to ${targetCharacter.name}`);
    }
}

function tauntEnemies() {
    const nearbyMonsters = getNearbyEntities("monster", 250);
    for (const monster of nearbyMonsters) {
        if (monster.target && CONFIG.partyMembers.includes(monster.target) && monster.target !== character.name) {
            if (canUseSkill("taunt", monster)) {
                use_skill("taunt", monster);
                game_log(`Taunted ${monster.mtype} attacking ${monster.target}`);
                return;
            }
        }
    }
}

function updateInventoryItemIndices() {
    inventoryItemIndices = {};
    for (let i = 0; i < character.items.length; i++) {
        const item = character.items[i];
        if (item) {
            const itemType = G.items[item.name].type;
            if (!inventoryItemIndices[itemType]) inventoryItemIndices[itemType] = [];
            inventoryItemIndices[itemType].push(i);
        }
    }
}

function checkAndEquipUpgrades() {
    for (const slot of CONFIG.gearSlots) {
        const slotType = SLOT_TYPES[slot];
        if (!slotType) continue;
        const equippedItem = character.slots[slot];
        const candidateIndices = inventoryItemIndices[slotType] || [];

        for (const index of candidateIndices) {
            const item = character.items[index];
            if (!isItemEquipped(item) && isUpgrade(item, equippedItem)) {
                equip(index, slot);
                game_log(`Equipped ${item.name} in ${slot} slot`);
                break;
            }
        }
    }
}

function isItemEquipped(item) {
    return Object.values(character.slots).some(equippedItem => itemsAreEqual(item, equippedItem));
}

function itemsAreEqual(item1, item2) {
    if (!item1 || !item2) return false;
    return item1.name === item2.name &&
           (item1.level || 0) === (item2.level || 0) &&
           (item1.stat_type || '') === (item2.stat_type || '') &&
           (item1.stat || 0) === (item2.stat || 0) &&
           (item1.grade || 0) === (item2.grade || 0);
}

function isUpgrade(newItem, equippedItem) {
    if (!equippedItem) return true;
    const newScore = calculateItemScore(newItem);
    const equippedScore = calculateItemScore(equippedItem);
    return newScore > equippedScore;
}

function calculateItemScore(item) {
    const baseStats = G.items[item.name];
    const level = item.level || 0;
    const grade = item.grade || 0;
    const ls = baseStats.ls || 1;
    const gs = baseStats.gs || 1;

    const attack = (baseStats.attack || 0) + level * ls + grade * gs;
    const armor = (baseStats.armor || 0) + level * ls + grade * gs;
    const stat = item.stat || 0;

    return attack + armor + stat;
}

function isValidWeapon(item) {
    const weaponType = G.items[item.name].wtype;
    const validWeapons = {
        warrior: ["sword", "axe"],
        priest: ["staff"],
        paladin: ["mace"],
    };
    return validWeapons[character.ctype].includes(weaponType);
}

function managePotions() {
    if (character.hp / character.max_hp < CONFIG.healthThreshold[character.ctype] && can_use('use_hp')) {
        use('hp');
        game_log("Used HP potion due to low health");
    }
    if (character.mp / character.max_mp < CONFIG.manaThreshold[character.ctype] && can_use('use_mp')) {
        use('mp');
        game_log("Used MP potion due to low mana");
    }
}

function ensurePartyIntegrity() {
    const inviteCooldown = 5000; // Cooldown of 5 seconds
    if (character.name === CONFIG.partyLeader) {
        for (const memberName of CONFIG.partyMembers) {
            if (memberName !== character.name && !parent.party_list.includes(memberName)) {
                const now = new Date().getTime();
                if (!lastInviteSent[memberName] || now - lastInviteSent[memberName] > inviteCooldown) {
                    send_party_invite(memberName);
                    lastInviteSent[memberName] = now;
                    game_log(`Invited ${memberName} to the party`);
                }
            }
        }
    }
}

function canUseSkill(skillName, target = null) {
    if (!can_use(skillName)) return false;
    if (is_on_cooldown(skillName)) return false;
    const skillInfo = G.skills[skillName];
    if (!skillInfo || character.level < (skillInfo.level || 1)) return false;
    if (character.mp < (skillInfo.mp || 0)) {
        managePotions();
        return false;
    }
    if (skillName === "revive" && (!hasItem("essenceoflife") || !target || !target.rip)) return false;
    if (skillInfo.target === "enemy" && (!target || target.type !== "monster")) return false;
    if (skillInfo.target === "self" && target && target.name !== character.name) return false;
    return true;
}

function hasItem(itemName) {
    return character.items.some(item => item && item.name === itemName);
}

function isLowOnItem(itemName, threshold) {
    const item = character.items.find(item => item && item.name === itemName);
    return !item || item.q < threshold;
}

function getItemQuantity(itemName) {
    return character.items.reduce((sum, item) => {
        if (item && item.name === itemName) {
            return sum + (item.q || 1);
        }
        return sum;
    }, 0);
}

function getNearbyEntities(type, range) {
    return Object.values(parent.entities).filter(
        entity => entity.type === type && distance(character, entity) <= range
    );
}

function nearbyEnemyCount() {
    return getNearbyEntities("monster", 160).length;
}
