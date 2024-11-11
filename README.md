Adventure Land Party Bot Scripts

Welcome to the Adventure Land Party Bot Scripts! This collection of modular scripts is designed to automate and coordinate a party of characters in the MMORPG Adventure Land. The scripts allow characters to form parties, navigate the game world, combat monsters, restock supplies, and support each other efficiently.

Overview

These scripts automate party gameplay in Adventure Land by managing party formation, navigation, combat, skill usage, healing, and inventory management. The scripts are modular, making them easier to maintain and customize.
Features

    Automated Party Formation: Characters automatically form a party with a designated leader.
    Class-Specific Behaviors: Different behaviors for Warrior, Priest, and Paladin classes.
    Combat Automation: Targets appropriate monsters based on character level and zone.
    Skill Usage: Smart skill usage with consideration of skill ranges and cooldowns.
    Healing and Reviving: Priests heal party members and revive fallen allies.
    Inventory Management: Automatically equips better gear and restocks potions when low.
    Navigation: Characters navigate to appropriate zones based on level.
    Modular Design: Code is organized into separate scripts for better maintainability.

Requirements

    Adventure Land Account: You must have an account and characters in Adventure Land.
    Multiple Characters: For party features, you need at least two characters.
    Knowledge of Adventure Land Scripting: Basic understanding of how to load and run scripts in the game.

Installation

    Open Adventure Land Code Editor:
        Log into your Adventure Land account.
        Open the in-game code editor by clicking on the "CODE" button.

    Create New Scripts:
        Create new scripts for each of the following files:
            config
            state
            utils
            events
            behavior
            main

    Copy Script Contents:
        Copy the code provided for each script into the corresponding file.
        Ensure that you save each script after copying.

    Load the Main Script:
        For each character, set their code to the main script.
        The main script will load the other modules and run the main loop.

Configuration

Before running the scripts, you need to configure the config script to match your characters and preferences.
Edit config.js

// config.js

    Configuration Constants
    const CONFIG = {
    warriorName: "Jinori", // Change to your Warrior's name
    partyLeader: "Jinori",  // The character who will be the party leader
    followDistance: 100,    // Distance at which characters will follow the leader
    healthThreshold: {
        priest: 0.85,
        paladin: 0.5,
        warrior: 0.2
    },
    manaThreshold: {
        priest: 0.5,
        paladin: 0.7,
        warrior: 0.5
    },
    potionThreshold: 30,    // Minimum potion quantity before restocking
    maxPotions: {
        hpot0: 1000,
        mpot0: 1000
    },
    merchantLocation: {     // Location to buy potions
        map: "main",
        x: -57.8,
        y: -58.1
    },
    partyMembers: ["Nizzi", "Kalai", "Jinori"], // Names of your party members
    gearSlots: [
        "helmet", "chest", "gloves", "pants", "shoes",
        "weapon", "shield", "ring1", "ring2", "amulet"
    ],
    classAttackRange: {
        priest: 200,  // Adjusted based on class abilities
        paladin: 20,
        warrior: 20
    },
    classSkills: {
        priest: ["partyheal", "darkblessing", "absorb", "curse"],
        paladin: ["selfheal", "purify", "mshield", "smash"],
        warrior: ["stomp", "cleave", "taunt"]
    },
    zones: [
        // Define zones with appropriate level ranges and targets
        { name: "Beginner Zone", map: "main", x: 38, y: 773, level: 1, target: "goo" },
        // Add or adjust zones as needed
    ],
    };

 Update Character Names:
        Replace "Jinori", "Nizzi", and "Kalai" with your actual character names.
    Adjust Zones:
        Modify the zones to fit your leveling strategy.
    Customize Thresholds:
        Adjust health and mana thresholds as per your preferences.
    Set Party Leader:
        Choose one character to be the party leader.


Usage

    Start the Scripts:
        On each character, run the main script.
        Ensure that all characters are online and scripts are running.

    Observe Behavior:
        Characters should form a party automatically.
        They will navigate to appropriate zones based on their levels.
        Support characters will follow the leader and assist in combat.

    Monitor Logs:
        Use game_log messages to monitor actions.
        Look for messages about party invites, skill usage, restocking, etc.

Script Breakdown
1. config.js

Contains all configuration constants and mappings.

    CONFIG Object: Holds all configurable settings.
    SLOT_TYPES: Maps equipment slots to item types.
    partyCheckInterval: Interval for checking party integrity.

2. state.js

Holds the state variables used across scripts.

    Variables like isRestocking, atDestination, and deadPartyMembers.

3. utils.js

Contains utility functions that support the main logic.

    Movement Functions: moveToTarget, followCharacter.
    Combat Utilities: tauntEnemies, nearbyEnemyCount.
    Inventory Management: updateInventoryItemIndices, checkAndEquipUpgrades.
    Skill Checks: canUseSkill, hasItem, isLowOnItem.
    General Helpers: distance, getNearbyEntities.

4. events.js

Handles all event-related functions.

    Event Handlers:
        on_party_invite: Accepts party invites from the leader.
        game.on("inventory"): Updates inventory indices.
        game.on("chat"): Handles chat messages for restocking.
        game.on("death"): Manages death and respawn behavior.
    Death Handling Functions:
        handleSelfDeath: Manages respawn after death.
        afterRespawn: Actions to take after respawning.

5. behavior.js

Contains character behavior functions based on class roles.

    Support Role Behavior:
        supportRoleBehavior: Logic for non-warrior classes.
        assistWarrior: Assists the warrior in combat.
        useSupportSkills: Uses class-specific support skills.
    Warrior Behavior:
        warriorBehavior: Logic for the warrior class.
        handleCombat: Manages combat engagement.
        useWarriorSkills: Uses warrior-specific skills.
    Healing Functions:
        healPartyMembers: Heals party members when necessary.
        healSelf: Heals self if health is low.
    Restocking Functions:
        shouldRestockPotions: Checks if restocking is needed.
        restockPotions: Automates potion buying.
        resumeAfterRestock: Returns to action after restocking.

6. main.js

The main script that ties everything together and runs the main loop.

    Loads Other Scripts:
        Uses load_code to include other modules.
    Main Loop:
        Runs at a set interval to perform actions.
        Checks for restocking, manages potions, handles combat.

Class Roles and Behaviors

    Warrior:
        Acts as the party leader and tank.
        Engages enemies and uses skills like "taunt" and "stomp".
    Priest:
        Provides healing and support.
        Uses skills like "partyheal", "curse", and "absorb".
    Paladin:
        Hybrid role with support and melee capabilities.
        Uses skills like "selfheal", "smash", and "purify".

Customization

    Adjust Skill Usage:
        Modify classSkills in config.js to change which skills are used.
    Add New Zones:
        Expand the zones array in config.js with new hunting areas.
    Modify Behaviors:
        Edit functions in behavior.js to change how characters act.

Troubleshooting

    Characters Not Accepting Party Invites:
        Ensure on_party_invite is correctly defined in events.js.
        Check that CONFIG.partyLeader matches the leader's name exactly.
    Skills Not Being Used:
        Verify that skills are listed in classSkills.
        Check that characters have enough mana and are within skill range.
    Characters Not Moving:
        Confirm that smart_move is functioning and that destinations are correct.
    Errors in Logs:
        Look for any ReferenceError or TypeError messages.
        Ensure all scripts are loaded in the correct order.

Contributing

Contributions are welcome! If you have improvements or bug fixes, feel free to submit a pull request.

    Fork the Repository
    Create a Feature Branch
    Commit Your Changes
    Open a Pull Request

Please ensure your code follows the existing style and includes comments where necessary.
License

This project is open-source and available under the GNU v3 License.

Disclaimer: Use of automation scripts in Adventure Land is allowed as the game encourages coding. However, always ensure your scripts comply with the game's terms of service and community guidelines.

Enjoy your automated adventures in Adventure Land!
