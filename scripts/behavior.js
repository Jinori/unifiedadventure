// behavior.js

// Support Role Behavior
function supportRoleBehavior() {
    const warrior = get_player(CONFIG.warriorName);
    if (warrior) {
        followCharacter(warrior, CONFIG.followDistance);
        if (character.ctype === "priest" && (healPartyMembers() || healSelf())) return;
        assistWarrior(warrior);
        useSupportSkills(warrior);
    } else {
        navigateToZoneByLevel(() => {
            if (atDestination) engageInCombat();
        });
    }
}

// Warrior Behavior
function warriorBehavior() {
    if (!isRestocking && !atDestination) updateCurrentZone();
    handleCombat();
}

// Navigation and Movement
function navigateToZoneByLevel(callback) {
    const targetZone = CONFIG.zones.filter(zone => character.level >= zone.level).pop();
    if (targetZone && (!atDestination || character.map !== targetZone.map)) {
        game_log(`Navigating to ${targetZone.name}`);
        set_message(`Traveling to ${targetZone.name}`);
        smart_move(targetZone, () => {
            game_log(`Arrived at ${targetZone.name}`);
            atDestination = true;
            currentZoneTarget = targetZone.target;
            if (callback) callback();
        });
    } else if (callback) callback();
}

function updateCurrentZone() {
    const targetZone = CONFIG.zones.filter(zone => character.level >= zone.level).pop();
    if (targetZone && (!atDestination || character.map !== targetZone.map || currentZoneTarget !== targetZone.target)) {
        game_log(`Moving to ${targetZone.name}`);
        set_message(`Traveling to ${targetZone.name}`);
        atDestination = false;
        currentZoneTarget = targetZone.target;
        smart_move(targetZone, () => {
            game_log(`Arrived at ${targetZone.name}`);
            atDestination = true;
        });
    }
}


function findNearbyBoss() {
    for (const id in parent.entities) {
        const entity = parent.entities[id];
        if (
            entity.type === "monster" &&
            CONFIG.bosses.includes(entity.mtype) &&
            !entity.dead
        ) {
            const dist = distance(character, entity);
            if (dist <= 300) { // Adjust the detection range as needed
                return entity;
            }
        }
    }
    return null;
}

function handleCombat() {
    // Check for nearby bosses first
    if (character.level >= CONFIG.minimumBossLevel) {
        const boss = findNearbyBoss();
        if (boss) {
            set_message(`Attacking boss: ${boss.mtype}`);
            change_target(boss);
            attackTarget(boss);
            return; // Prioritize boss over regular combat
        }
    }

    // Existing combat logic
    tauntEnemies();
    let target = get_targeted_monster();
    if (!target || target.mtype !== currentZoneTarget) {
        target = get_nearest_monster({ type: currentZoneTarget });
        if (target) change_target(target);
        else {
            set_message("No Monsters of correct type");
            return;
        }
    }

    const optimalRange = CONFIG.classAttackRange[character.ctype] || character.range;
    const distanceToTarget = distance(character, target);

    if (distanceToTarget > optimalRange) {
        moveToTarget(target);
        set_message("Approaching target");
    } else {
        useWarriorSkills(target);
    }
}

function attackTarget(target) {
    const optimalRange = CONFIG.classAttackRange[character.ctype] || character.range;
    const distanceToTarget = distance(character, target);

    if (distanceToTarget > optimalRange) {
        moveToTarget(target);
        set_message("Moving to target");
    } else {
        if (character.ctype === "warrior") {
            useWarriorSkills(target);
        } else {
            // For other classes, you can define class-specific behavior here
            if (can_attack(target)) {
                attack(target);
                set_message("Attacking target");
            }
        }
    }
}

function engageInCombat() {
    let target = get_targeted_monster();
    if (!target || target.mtype !== currentZoneTarget) {
        target = get_nearest_monster({ type: currentZoneTarget });
        if (target) change_target(target);
        else {
            set_message("No Monsters of correct type");
            return;
        }
    }
    attackTarget(target);
}

function assistWarrior(warrior) {
    if (!warrior.target) return;
    const target = get_entity(warrior.target);
    if (!target) return;

    const optimalRange = CONFIG.classAttackRange[character.ctype] || character.range;
    const distanceToTarget = distance(character, target);

    if (distanceToTarget > optimalRange) {
        moveToTarget(target);
        set_message(`Moving within range (${optimalRange}) of target`);
    } else {
        if (can_attack(target)) {
            attack(target);
            set_message("Attacking Warrior's target");
        }
        useSupportSkills(warrior);
    }
}


// Skill Usage
function useWarriorSkills(target) {
    if (canUseSkill("taunt", target) && target.target !== character.id) {
        use_skill("taunt", target);
        set_message("Taunting target");
    } else if (canUseSkill("cleave") && nearbyEnemyCount() > 2) {
        use_skill("cleave");
        set_message("Using Cleave");
    } else if (canUseSkill("stomp")) {
        use_skill("stomp");
        set_message("Using Stomp");
    } else if (can_attack(target)) {
        attack(target);
        set_message("Attacking target");
    }
}

function useSupportSkills(warrior) {
    const target = get_entity(warrior.target);
    const skills = CONFIG.classSkills[character.ctype];

    for (const skill of skills) {
        if (skill === "partyheal" && character.ctype === "priest") continue;

        let skillTarget = null;
        let requiredRange = character.range; // Default to character's attack range

        // Determine the appropriate target and required range for the skill
        if (["curse", "smash", "purify"].includes(skill)) {
            if (target) {
                skillTarget = target;
                const skillInfo = G.skills[skill];
                requiredRange = skillInfo.range || character.range;
            }
        } else if (["darkblessing", "absorb"].includes(skill)) {
            skillTarget = warrior;
            const skillInfo = G.skills[skill];
            requiredRange = skillInfo.range || character.range;
        } else if (skill === "mshield") {
            if (character.s.mshield) continue; // Already active
            skillTarget = character;
            const skillInfo = G.skills[skill];
            requiredRange = skillInfo.range || character.range;
        } else if (skill === "selfheal" && character.hp / character.max_hp < CONFIG.healthThreshold.paladin) {
            skillTarget = character;
            const skillInfo = G.skills[skill];
            requiredRange = skillInfo.range || character.range;
        }

        if (skillTarget && canUseSkill(skill, skillTarget)) {
            const distanceToTarget = distance(character, skillTarget);
            if (distanceToTarget <= requiredRange) {
                use_skill(skill, skillTarget);
                game_log(`Used ${skill} on ${skillTarget.name || 'self'}`);
            } else {
                // Move closer to the target if necessary
                moveToTarget(skillTarget);
                set_message(`Moving closer for ${skill}`);
            }
            break; // Attempt one skill at a time
        }
    }
}


// Healing Functions
function healPartyMembers() {
    if (character.ctype !== "priest") return false;
    let healed = false;
    for (const memberName of parent.party_list) {
        const member = get_player(memberName);
        if (member && member.hp / member.max_hp < CONFIG.healthThreshold.priest && canUseSkill("partyheal")) {
            use_skill("partyheal");
            game_log(`Used Party Heal`);
            healed = true;
            break;
        }
    }
    return healed;
}

function healSelf() {
    if (character.ctype !== "priest") return false;
    if (character.hp / character.max_hp < CONFIG.healthThreshold.priest && canUseSkill("heal", character)) {
        use_skill("heal", character);
        game_log("Healed self");
        return true;
    }
    return false;
}

// Revive Function
function handleRevive() {
    if (character.ctype !== "priest") return;
    for (const memberName in deadPartyMembers) {
        const deadMember = get_player(memberName);
        if (!deadMember) continue;
        if (distance(character, deadMember) > character.range) {
            moveToTarget(deadMember);
            set_message(`Moving to revive ${deadMember.name}`);
        } else if (canUseSkill("revive", deadMember)) {
            use_skill("revive", deadMember);
            game_log(`Revived ${deadMember.name}`);
            delete deadPartyMembers[memberName];
        } else {
            set_message("Cannot revive yet");
        }
        break;
    }
}

// Restocking Functions
function shouldRestockPotions() {
    if (isRestocking) return true;
    const needsRestock = isLowOnItem("hpot0", CONFIG.potionThreshold) ||
                         isLowOnItem("mpot0", CONFIG.potionThreshold);
    if (needsRestock) {
        isRestocking = true;
        atDestination = false;
        party_say(`${character.name} needs a potion run. All party members should top off on potions!`);
        set_message("Restocking, heading to merchant");
        restockPotions();
        return true;
    }
    return false;
}

function restockPotions() {
    smart_move(CONFIG.merchantLocation, () => {
        const potionsToBuy = [
            { name: "hpot0", max: CONFIG.maxPotions.hpot0 },
            { name: "mpot0", max: CONFIG.maxPotions.mpot0 },
        ];

        for (const potion of potionsToBuy) {
            const currentQuantity = getItemQuantity(potion.name);
            const amountToBuy = potion.max - currentQuantity;
            if (amountToBuy > 0) {
                buyWithGoldCheck(potion.name, amountToBuy);
            }
        }
        isRestocking = false;
        resumeAfterRestock();
    });
}

function buyWithGoldCheck(itemName, amount) {
    const totalCost = G.items[itemName].g * amount;
    if (character.gold >= totalCost) {
        buy(itemName, amount);
        game_log(`Bought ${amount} ${itemName}`);
    } else {
        game_log(`Not enough gold to buy ${itemName}!`);
    }
}

function resumeAfterRestock() {
    const warrior = get_player(CONFIG.warriorName);
    if (warrior) {
        smart_move(warrior, () => set_message("Returned to Warrior"));
    } else {
        navigateToZoneByLevel();
    }
}
