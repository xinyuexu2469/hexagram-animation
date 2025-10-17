// Enhanced Game Logic for Hexagram Web Version
class HexagramGame {
    constructor() {
        // Initialize default game state
        this.defaultGameState = {
            currentRoom: 'courtyard_start',
            inventory: [],
            itemStates: {},
            npcStates: {},
            dialogueStates: {},
            gameFlags: {},
            pushCount: 0,
            birdReleased: false,
            forestBirdEncouraged: false,
            birdShouldFlyAway: false,
            showFeatherDrop: false,
            shieldPickedUp: false,
            rosesTalked: [],
            roseChosen: null,
            libraryPaths: [],
            theaterTalked: [],
            stageMode: false,
            createStep: 0,
            createChoice: null,
            currentDialogueNpc: null,
            currentDialogueIndex: 0,
            inConversation: false,
            conversationState: '',
            courtyardStartGuideTalked: false,
            caveNPCsTalked: [],
            stoneCirclePushCount: 0,
            stoneCircleTrialFinished: false,
            stoneCircleStoneOnGround: false,
            gardenRosesTalked: [],
            gardenRoseChosen: null,
            gardenSeedOnGround: false,
            courtyardFinalTalked: false,
            courtyardFinalRepaired: false,
            courtyardFinalReady: false
        };
        
        // Try to load saved game state
        const loadedState = this.loadGame();
        if (loadedState) {
            this.gameState = loadedState;
        } else {
            // Initialize with default state and convert arrays to Sets
            this.gameState = JSON.parse(JSON.stringify(this.defaultGameState));
            this.gameState.rosesTalked = new Set();
            this.gameState.libraryPaths = new Set();
            this.gameState.theaterTalked = new Set();
            this.gameState.caveNPCsTalked = new Set();
            this.gameState.gardenRosesTalked = new Set();
        }
        
        // Initialize rooms, items, and NPCs
        this.rooms = {
            courtyard_start: {
                title: "Courtyard of Light",
                description: "At your feet lies a broken Hexagram Stone Disk, fragments scattered. In the center of the courtyard stands a warm figure, holding an ancient scroll in hand. Under the starry dome, light seeps faintly from the cracks of the disk, suggesting the beginning of the journey.",
                background: "linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
                npcs: ['guide'],
                items: ['hexagram_disk'],
                exits: { west: 'cave' }
            },
            cave: {
                title: "Cave of Shadows",
                description: "Cold stone walls, oppressive air. Firelight casts twisted shadows on the walls, as if living beings are swaying.",
                background: "linear-gradient(135deg, #2c1810, #1a1a1a, #0f0f0f), radial-gradient(circle at 30% 30%, rgba(255, 100, 100, 0.2) 0%, transparent 50%)",
                npcs: [],
                items: ['torch'],
                exits: { south: 'forest' }
            },
            forest: {
                title: "Forest of Freedom",
                description: "A sunlit forest clearing. The wind rustles, air is fresh, light and shadow dappled. The bird looks at its companions soaring in the sky.",
                background: "linear-gradient(135deg, #0f4c3a, #1a5f4a, #2d7a5f), radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)",
                npcs: [],
                items: [],
                exits: { east: 'library' }
            },
            library: {
                title: "Library of Wisdom",
                description: "A tall round hall, dome painted with stars, bookshelves like a maze. Candles flicker, pages turn on their own, and the air is filled with the fragrance of ink and dust.",
                background: "linear-gradient(135deg, #2d1b69, #1a1a2e, #16213e), radial-gradient(circle at 50% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 70%)",
                npcs: [],
                items: [],
                exits: { north: 'theater' }
            },
            theater: {
                title: "Theater of Creation",
                description: "The stage is shrouded in darkness, heavy red curtains hanging low. The air smells of wood and dust, and the silence is so deep you can hear only your own breath.",
                background: "linear-gradient(135deg, #8b0000, #2c1810, #1a1a1a), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 60%)",
                npcs: ['einstein', 'marx'],
                items: ['stage'],
                exits: { north: 'stone_circle' }
            },
            stone_circle: {
                title: "Slope of Persistence",
                description: "There is a massive boulder rests halfway up the incline. The air is heavy with oppression, pressing against your chest.",
                background: "linear-gradient(135deg, #2c2c2c, #1a1a1a, #0f0f0f), radial-gradient(ellipse at 50% 100%, rgba(255, 100, 100, 0.1) 0%, transparent 70%)",
                npcs: [],
                items: ['big stone'],
                exits: { west: 'garden' }
            },
            garden: {
                title: "Garden of Choices",
                description: "The air grows still, as if the world is holding its breath.\nAbove, the sky casts a gentle glow; petals glimmer in the soft light. Distant music hums faintly, like sacred chanting.",
                background: "linear-gradient(135deg, #2d5a27, #1a4a1a, #0f3a0f), radial-gradient(circle at 50% 50%, rgba(255, 182, 193, 0.2) 0%, transparent 60%)",
                npcs: ['red', 'white', 'purple'],
                items: ['3 flowers'],
                exits: { south: 'courtyard_finale' }
            },
            courtyard_finale: {
                title: "Courtyard of Light - Finale",
                description: "On the ground still lies the broken Hexagram Stone Disk. The kind old man smiles warmly at you.",
                background: "linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 50%)",
                npcs: ['guide'],
                items: [], // Final room should not have collectible items
                exits: {}
            }
        };

        this.items = {
            torch: { name: "Torch", description: "A torch. Maybe you can light it to see the truth." },
            bird: { name: "Bird", description: "A small bird with gray-white feathers, curled up in a crack in the stone." },
            flame_of_courage: { name: "Flame of Courage", description: "A flame that burns away illusions and lights the path of truth." },
            feather_of_freedom: { name: "Feather of Freedom", description: "A feather that symbolizes the courage to break free and soar." },
            shield_of_wisdom: { name: "Shield of Wisdom", description: "A shield forged from understanding, experience, communication, and reflection." },
            orb_of_creation: { name: "Orb of Creation", description: "A crystal orb that holds the power of imagination and vision." },
            stone_of_grit: { name: "Stone of Grit", description: "A stone that embodies perseverance and inner strength." },
            seed_of_love: { name: "Seed of Love", description: "A shining seed that contains the essence of love and responsibility." },
            hexagram_disk: { name: "A broken Hexagram Stone Disk", description: "Fragments of a once-whole disk, faintly glowing with cosmic energy." }
        };
        
        this.npcs = {
            guide: { name: "The Final Guide", dialogue: ["Ah, you've finally arrived. Welcome… you are the chosen one, the destined savior."] },
            prisoner: { name: "Prisoner in Chains", dialogue: ["Who are you? I've never seen you before."] },
            watcher: { name: "Watcher of Shadows", dialogue: ["Greetings, outsider."] },
            philosopher: { name: "Guide at the Cave Entrance", dialogue: ["Do you have the courage to go out? The light will sting your eyes, but it is the only road to freedom."] },
            einstein: { name: "Einstein", dialogue: ["Imagination is more important than knowledge. Knowledge is limited, but imagination encompasses everything in the world."] },
            marx: { name: "Marx", dialogue: ["The poorest architect is still, from the start, more skilled than the most expert bee."] },
            red: { name: "Red Rose", dialogue: ["If you choose me, please guard my passion."] },
            white: { name: "White Rose", dialogue: ["If you choose me, please cherish my purity."] },
            purple: { name: "Purple Rose", dialogue: ["If you choose me, please listen to my silence."] },
            bird: { name: "Bird", dialogue: ["This place feels so unfamiliar… I'm a little scared."] }
        };
    }

    // Enhanced command processing with all original logic
    processCommand(command) {
        const words = command.toLowerCase().split(' ');
        const action = words[0];
        
        // Handle reset command specially
        if (action === 'reset') {
            return this.resetGame();
        }
        
        let result;
        
        switch (action) {
            case 'look':
                result = this.handleLook();
                break;
            case 'go':
                result = this.handleMove(words[1]);
                break;
            case 'take':
                result = this.handleTake(words.slice(1).join(' '));
                break;
            case 'use':
                result = this.handleUse(words.slice(1).join(' '));
                break;
            case 'talk':
                result = this.handleTalk(words.slice(1).join(' '));
                break;
            case 'inventory':
                result = this.handleInventory();
                break;
            case 'respond':
                result = this.handleRespond();
                break;
            case 'end':
                result = this.handleEndDialogue();
                break;
            case 'release':
                result = this.handleRelease();
                break;
            case 'learn':
            case 'live':
            case 'dialogue':
            case 'reflect':
                result = this.handlePath(action);
                break;
            case 'stage':
                result = this.handleStage();
                break;
            case 'create':
                result = this.handleCreate(words.slice(1).join(' '));
                break;
            case 'continue':
                result = this.handleContinue();
                break;
            case 'cancel':
                result = this.handleCancel();
                break;
            case 'push':
                if (words[1] === 'stone') {
                    result = this.handlePushStone();
                } else {
                    result = { type: 'error', message: "Unknown command. Type 'help' for available commands." };
                }
                break;
            case 'leave':
                result = this.handleLeave();
                break;
            case 'choose':
                result = this.handleChoose(words.slice(1).join(' '));
                break;
            case 'repair':
                if (words[1] === 'disk') {
                    result = this.handleRepairDisk();
                } else {
                    result = { type: 'error', message: "Unknown command. Type 'help' for available commands." };
                }
                break;
            case 'help':
                result = this.handleHelp();
                break;
            case 'learn':
            case 'live':
            case 'dialogue':
            case 'reflect':
                result = this.handleLibraryPath(action);
                break;
            case 'water':
            case 'fertilize':
            case 'weed':
            case 'wish':
            case 'wait':
            case 'take':
                if (action === 'take' && words[1] === 'seed') {
                    result = this.handleTakeSeed();
                } else {
                    result = this.handleGardenAction(action);
                }
                break;
            default:
                result = { type: 'error', message: "Unknown command. Type 'help' for available commands." };
        }
        
        // Auto-save after any successful command (except look and inventory which don't change state)
        if (result && result.type !== 'error' && action !== 'look' && action !== 'inventory') {
            this.saveGame();
        }
        
        return result;
    }

    // Save game to localStorage
    saveGame() {
        try {
            const saveData = {
                ...this.gameState,
                // Convert Sets to Arrays for JSON serialization
                rosesTalked: Array.from(this.gameState.rosesTalked || []),
                libraryPaths: Array.from(this.gameState.libraryPaths || []),
                theaterTalked: Array.from(this.gameState.theaterTalked || []),
                caveNPCsTalked: Array.from(this.gameState.caveNPCsTalked || []),
                gardenRosesTalked: Array.from(this.gameState.gardenRosesTalked || [])
            };
            
            localStorage.setItem('hexagramGameSave', JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }
    
    // Load game from localStorage
    loadGame() {
        try {
            const savedData = localStorage.getItem('hexagramGameSave');
            if (!savedData) return null;
            
            const loadedState = JSON.parse(savedData);
            
            // Convert Arrays back to Sets
            if (loadedState.rosesTalked) {
                loadedState.rosesTalked = new Set(loadedState.rosesTalked);
            }
            if (loadedState.libraryPaths) {
                loadedState.libraryPaths = new Set(loadedState.libraryPaths);
            }
            if (loadedState.theaterTalked) {
                loadedState.theaterTalked = new Set(loadedState.theaterTalked);
            }
            if (loadedState.caveNPCsTalked) {
                loadedState.caveNPCsTalked = new Set(loadedState.caveNPCsTalked);
            }
            if (loadedState.gardenRosesTalked) {
                loadedState.gardenRosesTalked = new Set(loadedState.gardenRosesTalked);
            }
            
            return loadedState;
        } catch (e) {
            console.error('Failed to load game:', e);
            return null;
        }
    }
    
    // Reset game to initial state
    resetGame() {
        this.gameState = JSON.parse(JSON.stringify(this.defaultGameState));
        // Convert arrays to Sets for the default state
        this.gameState.rosesTalked = new Set();
        this.gameState.libraryPaths = new Set();
        this.gameState.theaterTalked = new Set();
        this.gameState.caveNPCsTalked = new Set();
        this.gameState.gardenRosesTalked = new Set();
        
        // Clear localStorage
        localStorage.removeItem('hexagramGameSave');
        
        return { type: 'success', message: 'Game has been reset to the beginning.' };
    }

    // Room exit conditions with detailed prompts
    canExitRoom(direction) {
        const room = this.rooms[this.gameState.currentRoom];
        const targetRoom = room.exits[direction];
        
        if (!targetRoom) {
            return { canExit: false, message: "You can't go that way." };
        }

        switch (this.gameState.currentRoom) {
            case 'courtyard_start':
                if (direction === 'west' && !this.gameState.courtyardStartGuideTalked) {
                    return {
                        canExit: false,
                        message: "You cannot leave yet. The figure in the center seems to be waiting for you.\nThis journey requires guidance—seek wisdom from the one who holds the ancient scroll.\n(Type 'talk guide' to begin your quest)"
                    };
                }
                break;
                
            case 'cave':
                if (direction === 'south') {
                    const requiredNPCs = ['prisoner', 'watcher', 'philosopher'];
                    
                    if (!requiredNPCs.every(npc => this.gameState.caveNPCsTalked.has(npc))) {
                        const missing = requiredNPCs.filter(npc => !this.gameState.caveNPCsTalked.has(npc));
                        const missingNames = missing.map(npc => this.npcs[npc].name);
                        return {
                            canExit: false,
                            message: `You cannot leave yet. Wisdom lies in understanding all perspectives.\nSeek counsel from those who remain: ${missingNames.join(', ')}.\n(Type 'talk <NPC>' to learn their truth)`
                        };
                    }
                    
                    if (!this.gameState.inventory.includes('bird')) {
                        return {
                            canExit: false,
                            message: "You cannot leave yet. The guide spoke of a companion who shares your journey to freedom.\nTake the small one with you—together you shall find the light.\n(Type 'take bird' to bring your companion)"
                        };
                    }
                }
                break;
                
            case 'forest':
                if (direction === 'east') {
                    if (!this.gameState.birdReleased) {
                        return {
                            canExit: false,
                            message: "You cannot leave yet. Your companion from the cave awaits release in this place of freedom.\nLet her find her wings among the trees and sky.\n(Type 'release' to set her free)"
                        };
                    }
                    
                    if (!this.gameState.forestBirdEncouraged) {
                        return {
                            canExit: false,
                            message: "You cannot leave yet. The bird hesitates at the threshold of flight.\nYour words of encouragement may give her the courage to soar.\n(Type 'talk bird' to inspire her heart)"
                        };
                    }
                    
                    if (!this.gameState.inventory.includes('feather_of_freedom')) {
                        return {
                            canExit: false,
                            message: "You cannot leave yet. The bird has gifted you a token of her freedom.\nTake this feather—it carries the essence of courage and liberation.\n(Type 'take feather' to claim your reward)"
                        };
                    }
                }
                break;
                
            case 'library':
                if (direction === 'north' && !this.gameState.inventory.includes('shield_of_wisdom')) {
                    return {
                        canExit: false,
                        message: "The way forward is blocked. Without the Shield of Wisdom, you cannot withstand the trials beyond.\n\nTrue wisdom comes from walking all paths of knowledge:\n• Learning · Understanding (Type 'learn')\n• Living · Experience (Type 'live')\n• Dialogue · Communication (Type 'dialogue')\n• Thinking · Reflection (Type 'reflect')\n\nWhen all paths converge, the Shield of Wisdom shall be forged.\n(Type 'take shield' when ready)"
                    };
                }
                break;
                
            case 'theater':
                if (direction === 'north' && !this.gameState.inventory.includes('orb_of_creation')) {
                    return {
                        canExit: false,
                        message: "Without the Orb of Creation, your vision cannot manifest beyond this stage.\n\nIn this theater of imagination, you must first:\n• Speak with both visionaries to understand their wisdom\n  (Type 'talk einstein' and 'talk marx')\n• Step onto the stage as the creator\n  (Type 'stage' to begin your creative journey)\n• Bring your vision to life through creation\n  (Type 'create star', 'create tree', or 'create castle')\n• Complete your artistic vision\n  (Type 'continue' until your creation is complete)\n• Claim the crystal orb of your imagination\n  (Type 'take orb' to add the Orb of Creation to your inventory)\n\nOnly with the Orb of Creation can you face the trials of persistence ahead."
                    };
                }
                break;
                
            case 'stone_circle':
                if (direction === 'west' && !this.gameState.inventory.includes('stone_of_grit')) {
                    return {
                        canExit: false,
                        message: "You cannot begin the next journey without the Stone Fragment of Grit.\n\nThis slope teaches that true strength comes from persistence in the face of impossibility.\nThe stone awaits your determination—but first, you must prove your grit through trial.\n(Type 'push stone' to begin the test of perseverance)"
                    };
                }
                break;
                
            case 'garden':
                if (direction === 'south' && !this.gameState.inventory.includes('seed_of_love')) {
                    return {
                        canExit: false,
                        message: "The exit is now open, but you're still missing something important.\n\nIn this garden of choices, love awaits your decision:\n• Listen to each rose's heart (Type 'talk red', 'talk white', 'talk purple')\n• Choose the one that calls to your soul (Type 'choose <color>')\n• Accept the seed of love they offer (Type 'take seed')\n\nOnly with the Seed of Love can you return to the Courtyard of Light."
                    };
                }
                break;
        }

        return { canExit: true };
    }

    // Handle movement with enhanced logic and transition messages
    handleMove(direction) {
        const exitCheck = this.canExitRoom(direction);
        
        if (!exitCheck.canExit) {
            return { type: 'error', message: exitCheck.message };
        }

        const room = this.rooms[this.gameState.currentRoom];
        const targetRoom = room.exits[direction];
        
        if (!targetRoom) {
            return { type: 'error', message: "You can't go that way." };
        }

        this.gameState.currentRoom = targetRoom;
        
        // Special room transition effects with detailed messages
        let transitionMessage = `You move ${direction}.`;
        
        switch (targetRoom) {
            case 'cave':
                transitionMessage = "You are in a dark, damp cave.";
                break;
            case 'forest':
                if (this.gameState.inventory.includes('torch')) {
                    this.gameState.inventory = this.gameState.inventory.filter(item => item !== 'torch');
                    if (!this.gameState.inventory.includes('flame_of_courage')) {
                        this.gameState.inventory.push('flame_of_courage');
                    }
                    transitionMessage = "The dazzling light blinds you for a moment, forcing your eyes shut.\nBut at last you understand: the real world is not upon the walls of the cave, but beneath the boundless sky.\nFrom now on, your torch is no longer just a tool—it has become the very embodiment of the Flame of Courage.";
                }
                break;
            case 'library':
                transitionMessage = "You step into a tall round hall.";
                break;
            case 'theater':
                transitionMessage = "You step into the theater.";
                break;
            case 'stone_circle':
                transitionMessage = "You arrive at a steep slope.";
                break;
            case 'garden':
                transitionMessage = "You step slowly into the garden's depths.";
                break;
            case 'courtyard_finale':
                transitionMessage = "You return once again to the Courtyard of Light!";
                break;
        }

        return {
            type: 'move',
            room: targetRoom,
            message: transitionMessage
        };
    }

    // Enhanced dialogue system with full conversation flows
    handleTalk(npc) {
        const room = this.rooms[this.gameState.currentRoom];
        
        // Handle NPC aliases
        const npcAliases = {
            'guide': 'guide',
            'prisoner': 'prisoner',
            'watcher': 'watcher',
            'philosopher': 'philosopher',
            'bird': 'bird',
            'einstein': 'einstein',
            'marx': 'marx',
            'red': 'red',
            'white': 'white',
            'purple': 'purple',
            'rose': 'red', // Default rose alias
            'roses': 'red' // Default roses alias
        };
        
        // Check if the input is an alias and convert to actual NPC ID
        const actualNpc = npcAliases[npc] || npc;
        
        if (!room.npcs.includes(actualNpc)) {
            return { type: 'error', message: "There is no such person here." };
        }

        // Set up conversation state
        this.gameState.currentDialogueNpc = actualNpc;
        this.gameState.currentDialogueIndex = 0;
        this.gameState.inConversation = true;
        this.gameState.conversationState = '';

        // Handle specific NPC dialogues with full conversation flows
        if (actualNpc === 'guide' && this.gameState.currentRoom === 'courtyard_start') {
            this.gameState.inConversation = true;
            this.gameState.currentDialogueNpc = 'guide';
            this.gameState.currentDialogueIndex = 0;
            this.gameState.conversationState = 'guide_start';
            return {
                type: 'success',
                message: `The Final Guide: Ah, you've finally arrived. Welcome… you are the chosen one, the destined savior.\n\n(Type 'respond' to reply and 'end' to end dialogue)`
            };
        }

        if (actualNpc === 'guide' && this.gameState.currentRoom === 'courtyard_finale') {
            this.gameState.inConversation = false;
            this.gameState.currentDialogueNpc = null;
            this.gameState.currentDialogueIndex = 0;
            this.gameState.conversationState = '';
            return {
                type: 'success',
                message: `Guide: Welcome back, young one. Let me see what you've brought with you.\n\n(Type 'inventory' to check the items in your inventory)`
            };
        }

        // Cave NPCs
        if (actualNpc === 'prisoner') {
            this.gameState.inConversation = true;
            this.gameState.currentDialogueNpc = 'prisoner';
            this.gameState.currentDialogueIndex = 0;
            this.gameState.caveNPCsTalked.add('prisoner');
            this.gameState.conversationState = 'prisoner';
            return {
                type: 'success',
                message: `Prisoner in Chains: Who are you? I've never seen you before.\n\n(Type 'respond' to reply and 'end' to end dialogue)`
            };
        }

        if (actualNpc === 'watcher') {
            this.gameState.inConversation = true;
            this.gameState.currentDialogueNpc = 'watcher';
            this.gameState.currentDialogueIndex = 0;
            this.gameState.caveNPCsTalked.add('watcher');
            this.gameState.conversationState = 'watcher';
            return {
                type: 'success',
                message: `Watcher of Shadows: Greetings, outsider.\n\n(Type 'respond' to reply and 'end' to end dialogue)`
            };
        }

        if (actualNpc === 'philosopher') {
            this.gameState.inConversation = true;
            this.gameState.currentDialogueNpc = 'philosopher';
            this.gameState.currentDialogueIndex = 0;
            this.gameState.caveNPCsTalked.add('philosopher');
            this.gameState.conversationState = 'philosopher';
            return {
                type: 'success',
                message: `Guide at the Cave Entrance: Do you have the courage to go out? The light will sting your eyes, but it is the only road to freedom.\nOh, and one more thing—there is also a poor little bird in this cave. This bird too fell into the cave in childhood. Take her with you, and walk toward the light together!\n(Type 'take bird' to pick it up)\n(The conversation is over.)`
            };
        }

        // Forest bird
        if (actualNpc === 'bird' && this.gameState.currentRoom === 'forest') {
            if (this.gameState.birdReleased) {
                this.gameState.inConversation = true;
                this.gameState.currentDialogueNpc = 'bird';
                this.gameState.currentDialogueIndex = 0;
                this.gameState.conversationState = 'bird_forest';
                return {
                    type: 'success',
                    message: `Bird: This place feels so unfamiliar… I'm a little scared.\n\n(Type 'respond' to reply and 'end' to end dialogue)`
                };
            } else {
                return { type: 'error', message: "The bird is not here." };
            }
        }

        // Theater NPCs
        if (actualNpc === 'einstein') {
            this.gameState.inConversation = true;
            this.gameState.currentDialogueNpc = 'einstein';
            this.gameState.currentDialogueIndex = 0;
            this.gameState.theaterTalked.add('einstein');
            this.gameState.conversationState = 'einstein';
            let message = `Einstein: Imagination is more important than knowledge. Knowledge is limited, but imagination encompasses everything in the world, drives progress, and is the source of knowledge's evolution.`;
            
            // Check if both NPCs have been talked to
            if (this.gameState.theaterTalked.has('marx')) {
                message += `\n\nStep onto the stage and see for yourself.\n(Type 'stage' to begin)`;
            }
            
            message += `\n\n(The conversation is over.)`;
            
            return {
                type: 'success',
                message: message
            };
        }

        if (actualNpc === 'marx') {
            this.gameState.inConversation = true;
            this.gameState.currentDialogueNpc = 'marx';
            this.gameState.currentDialogueIndex = 0;
            this.gameState.theaterTalked.add('marx');
            this.gameState.conversationState = 'marx';
            let message = `Marx: The poorest architect is still, from the start, more skilled than the most expert bee. For the architect has already built the structure in thought, existing in the mind before it takes shape in reality.`;
            
            // Check if both NPCs have been talked to
            if (this.gameState.theaterTalked.has('einstein')) {
                message += `\n\nStep onto the stage and see for yourself.\n(Type 'stage' to begin)`;
            }
            
            message += `\n\n(The conversation is over.)`;
            
            return {
                type: 'success',
                message: message
            };
        }

        // Garden roses
        if (['red', 'white', 'purple'].includes(actualNpc)) {
            this.gameState.inConversation = true;
            this.gameState.currentDialogueNpc = actualNpc;
            this.gameState.currentDialogueIndex = 0;
            this.gameState.gardenRosesTalked.add(actualNpc);
            this.gameState.conversationState = 'rose';
            const roseMessages = {
                red: "[Warm red glow surrounding, petals trembling like burning flame.]\n「Red Rose: \"If you choose me, please guard my passion.\nYour protection will let my life burn more brilliantly.\"」",
                white: "[Gentle white glow envelops, like dew on petals in morning light.]\n「White Rose: \"If you choose me, please cherish my purity.\nYour nurture can let my beauty bloom forever.\"」",
                purple: "[Mysterious purple glow sways, petals dancing lightly in the wind.]\n「Purple Rose: \"If you choose me, please listen to my silence.\nOnly when fully seen by you, can my soul truly bloom.\"」"
            };
            
            let message = roseMessages[actualNpc];
            
            // Check if all roses have been talked to
            if (this.gameState.gardenRosesTalked.size === 3) {
                message += `\n\nStep closer to the rose that calls to you.\nType: choose red / choose white / choose purple\nOnce chosen, the others will fade, leaving only your path.`;
            }
            
            message += `\n\n(The conversation is over.)`;
            
            return {
                type: 'success',
                message: message
            };
        }

        return { type: 'error', message: "This person has nothing to say right now." };
    }

    // Handle conversation responses
    handleRespond() {
        if (!this.gameState.inConversation || !this.gameState.currentDialogueNpc) {
            return { type: 'error', message: "You're not in a conversation." };
        }

        const npc = this.gameState.currentDialogueNpc;
        const conversationState = this.gameState.conversationState;

        // Guide start conversation
        if (conversationState === 'guide_start') {
            if (this.gameState.currentDialogueIndex === 0) {
                this.gameState.currentDialogueIndex = 1;
                return {
                    type: 'success',
                    message: `You: What happened here?\n\nThe Final Guide: The Hexagram was once whole, containing immense cosmic energy. But now it lies shattered.\nYou must retrieve the six symbols—Courage, Freedom, Wisdom, Creation, Grit, and Love—to restore the stone disk.\nOnly then can the gate to self-completion be opened.\n\n(Type 'respond' to continue and 'end' to end dialogue)`
                };
            } else if (this.gameState.currentDialogueIndex === 1) {
                this.gameState.courtyardStartGuideTalked = true;
                // 不要立即设置 inConversation = false，让HTML处理对话结束
                return {
                    type: 'success',
                        message: `You: Alright… what should I do now?\n\nThe Final Guide: Find the exit of this courtyard. That will begin your journey of discovery.\nAlong the way, you will understand what must be done.\nGo now—and may the light guide your steps.\n\n(The conversation is over.)`
                };
            }
        }

        // Guide final conversation
        if (conversationState === 'guide_final') {
            if (this.gameState.currentDialogueIndex === 0) {
                this.gameState.currentDialogueIndex = 1;
                return {
                    type: 'success',
                    message: `The Final Guide: I believe you've gathered everything needed to restore the Hexagram! Try placing them onto the disk one by one and see what happens.\n\n(Type 'repair disk' to place your six tokens into the Hexagram.)`
                };
            } else if (this.gameState.currentDialogueIndex === 1) {
                this.gameState.courtyardFinalTalked = true;
                this.gameState.inConversation = false;
                return {
                    type: 'success',
                    message: `The Final Guide: The time has come, traveler. Use your gathered symbols to restore the Hexagram and complete your journey.\n\n(The conversation is over.)`
                };
            }
        }

        // Prisoner conversation
        if (conversationState === 'prisoner') {
            if (this.gameState.currentDialogueIndex === 0) {
                this.gameState.currentDialogueIndex = 1;
                return {
                    type: 'success',
                    message: `You: I came from outside. How did you end up here?\n\nPrisoner in Chains: All my life I have been here.\n\n(Type 'respond' to continue and 'end' to end dialogue)`
                };
            } else if (this.gameState.currentDialogueIndex === 1) {
                // 不要立即设置 inConversation = false，让HTML处理对话结束
                return {
                    type: 'success',
                    message: `You: Perhaps you should go out and see?\n\nPrisoner in Chains: This is my world. Outside? Surely there is nothing good.\n\n(The conversation is over.)`
                };
            }
        }

        // Watcher conversation
        if (conversationState === 'watcher') {
            if (this.gameState.currentDialogueIndex === 0) {
                this.gameState.currentDialogueIndex = 1;
                return {
                    type: 'success',
                    message: `You: What are you doing? What happened to the people here?\n\nWatcher of Shadows: I am responsible for lighting the fire, moving the puppets, letting them see what they want to see. Illusions give them a sense of safety.\n\n(Type 'respond' to continue and 'end' to end dialogue)`
                };
            } else if (this.gameState.currentDialogueIndex === 1) {
                // 不要立即设置 inConversation = false，让HTML处理对话结束
                return {
                    type: 'success',
                    message: `You: Why deceive?\n\nWatcher of Shadows: Because truth will bring them pain. Illusion makes them feel at ease.\n\n(The conversation is over.)`
                };
            }
        }


        // Bird forest conversation
        if (conversationState === 'bird_forest') {
            if (this.gameState.currentDialogueIndex === 0) {
                this.gameState.currentDialogueIndex = 1;
                return {
                    type: 'success',
                    message: `You: It's okay. Listen—the forest is full of your kind. You won't be alone anymore. You've already left the swamp behind—where you once tried so hard to belong among those who could never understand your wings. You don't need their approval. Just keep walking, until you reach the forest that welcomes you.

Bird: The swamp… yes. I once thought its shadows were the whole world, never imagining I could meet companions. But now, the wind and light make me uneasy… Can I really learn to fly like them?

(Type 'respond' to reply and 'end' to end dialogue)`
                };
            } else if (this.gameState.currentDialogueIndex === 1) {
                this.gameState.currentDialogueIndex = 2;
                return {
                    type: 'success',
                    message: `You: Don't rush. Take your time. First, let yourself get used to the forest.

Bird: Take my time… yes. Maybe I should first face my fear, and then let new experiences come in. This forest… maybe it will change me.

(Type 'respond' to reply and 'end' to end dialogue)`
                };
            } else if (this.gameState.currentDialogueIndex === 2) {
                this.gameState.forestBirdEncouraged = true;
                // 不要立即设置 inConversation = false，让HTML处理对话结束
                
                // Add feather to room items
                const room = this.rooms[this.gameState.currentRoom];
                if (!room.items.includes('feather_of_freedom')) {
                    room.items.push('feather_of_freedom');
                }
                
                // 设置小鸟飞走标志，让HTML处理
                this.gameState.birdShouldFlyAway = true;
                
                // 立即触发羽毛掉落显示
                this.gameState.showFeatherDrop = true;
                
                return {
                    type: 'success',
                    message: `You: That's right. Give it a try—this place has been yours all along. If you never try, you'll remain bound by the shadows of old memories. You deserve new experiences, new light. Fear is only the trembling of your heart—but the sky is still there, wide and real. When you learn to tell them apart, you'll see that you can honor your fear and still walk toward the light.

Bird: You're right. Thank you, my friend. Farewell—and may you, too, find the forest that belongs to you.

(The conversation is over.)`
                };
            }
        }

        return { type: 'error', message: "Nothing more to say." };
    }

    // End dialogue
    handleEndDialogue() {
        if (!this.gameState.inConversation) {
            return { type: 'error', message: "You're not in a conversation." };
        }

        this.gameState.inConversation = false;
        this.gameState.currentDialogueNpc = null;
        this.gameState.currentDialogueIndex = 0;
        this.gameState.conversationState = '';

        return {
            type: 'success',
            message: "(The conversation is over. You can type 'talk <npc>' to start the conversation again.)"
        };
    }

    // Handle special commands with full logic
    handleRelease() {
        if (this.gameState.currentRoom !== 'forest' || !this.gameState.inventory.includes('bird')) {
            return { type: 'error', message: "You can't release anything here." };
        }

        this.gameState.birdReleased = true;
        this.gameState.inventory = this.gameState.inventory.filter(item => item !== 'bird');
        
        // Set up conversation state for the bird
        this.gameState.inConversation = true;
        this.gameState.currentDialogueNpc = 'bird';
        this.gameState.currentDialogueIndex = 0;
        this.gameState.conversationState = 'bird_forest';
        
        return {
            type: 'success',
            message: 'Bird: "This place feels so unfamiliar… I\'m a little scared."\n\n(Type \'respond\' to comfort and encourage her, \'end\' to step back, or \'talk bird\' to restart the conversation)'
        };
    }

    handlePushStone() {
        if (this.gameState.currentRoom !== 'stone_circle') {
            return { type: 'error', message: "There is no stone to push here." };
        }

        this.gameState.stoneCirclePushCount++;
        
        if (this.gameState.stoneCirclePushCount < 5) {
            const messages = [
                "You push with all your might, but the stone immediately rolls back down.",
                "You feel a wave of fatigue coursing through your body.",
                "The stone shifts upward slightly, but it remains unbearably heavy.",
                "The stone slips again and crashes downward, as if mocking your persistence."
            ];
            
            return {
                type: 'success',
                message: messages[this.gameState.stoneCirclePushCount - 1] + "\n(Type 'push stone' to continue, or leave to walk away.)"
            };
        } else {
            this.gameState.stoneCircleTrialFinished = true;
            this.gameState.stoneCircleStoneOnGround = true;
            
            // Add stone to room items
            const room = this.rooms[this.gameState.currentRoom];
            if (!room.items.includes('stone_of_grit')) {
                room.items.push('stone_of_grit');
            }
            
            return {
                type: 'success',
                message: "You have obtained the token: Stone Fragment of Grit 🪨. Please put it away.\n(Type 'take stone' to add it to your inventory.)"
            };
        }
    }

    handleLeave() {
        if (this.gameState.currentRoom !== 'stone_circle') {
            return { type: 'error', message: "You can't leave now." };
        }
        
        if (this.gameState.stoneCircleTrialFinished) {
            return { type: 'error', message: "You can't leave now." };
        }
        
        if (this.gameState.stoneCirclePushCount < 5) {
            this.gameState.stoneCirclePushCount = 0;
        return {
            type: 'success',
                message: "The trial is unfinished. Without persistence, the stone grants you nothing."
        };
        }
        
        return { type: 'error', message: "You can't leave now." };
    }

    handleChoose(choice) {
        if (this.gameState.currentRoom !== 'garden') {
            return { type: 'error', message: "You can't choose anything here." };
        }

        if (this.gameState.gardenRoseChosen) {
            return { type: 'error', message: "You have already made your choice. The other roses have faded away." };
        }

        if (!['red', 'white', 'purple'].includes(choice)) {
            return { type: 'error', message: "You can only choose: red, white, or purple." };
        }

        this.gameState.gardenRoseChosen = choice;
        this.gameState.gardenPlantingStep = 0; // Start planting sequence

        const choiceMessages = {
            red: "The Red Rose flares, and sparks scatter into the air. From its fiery heart, a glowing ember drifts into your hand—it cools into a ruby-like gem, pulsing faintly with warmth. The White and Purple Roses wither into ash and mist, carried away by the wind.\n\n(Type 'water' to water your own flower.)",
            white: "The White Rose unfolds in a silent shimmer. Its petals dissolve into countless motes of light that swirl and condense into a transparent crystal resting in your hand—cool, pure, and still. The Red and Purple Roses fade into mist, their colors melting into the horizon.\n\n(Type 'water' to water your own flower.)",
            purple: "The Purple Rose blooms, releasing a gentle light. From its petals, a crystal dew forms and drifts into your palm, becoming a small shining seed. The Red and White Roses dissolve into stardust, scattering across the night sky.\n\n(Type 'water' to water your own flower.)"
        };

        return {
            type: 'success',
            message: choiceMessages[choice]
        };
    }

    handleRepairDisk() {
        if (this.gameState.currentRoom !== 'courtyard_finale') {
            return { type: 'error', message: "You can't repair the disk now." };
        }

        const requiredItems = ['flame_of_courage', 'feather_of_freedom', 'shield_of_wisdom', 'orb_of_creation', 'stone_of_grit', 'seed_of_love'];
        
        if (!requiredItems.every(item => this.gameState.inventory.includes(item))) {
            return { type: 'error', message: "You don't have all the required symbols to repair the disk." };
        }

        this.gameState.courtyardFinalRepaired = true;

        return {
            type: 'success',
            message: `The six tokens rise from your hands and orbit above the disk.
Streams of light converge, fusing into the fractured stone.
The Hexagram ascends, suspended in the sky, radiant and whole.
The courtyard floods with light, shadows dispelled, the path ahead revealed.

「Final Guide: 
"Congratulations, traveler. You have walked through trials of courage, freedom, wisdom, creation, grit, and love—
and from each, you have gained more than symbols: you have gained yourself.

Remember, these six powers are not the end, but companions for your road ahead.
True completeness lies not in collecting, but in living them every day.
May the light you have kindled here guide your journey,
and may every step beyond this courtyard bring you strength, wonder, and joy."」`,
            gameComplete: true
        };
    }

    handleLook() {
        const room = this.rooms[this.gameState.currentRoom];
        
        // Special handling for cave room
        if (this.gameState.currentRoom === 'cave') {
            if (!this.gameState.itemStates.torch_lit) {
                // Before lighting torch
                return {
                    type: 'look',
                    room: this.gameState.currentRoom,
                    description: `Cold stone walls, oppressive air. Firelight casts twisted shadows on the walls, as if living beings are swaying.\n\nYou can only see shadows swaying on the wall. They seem to mock you in whispers.\nYou begin to doubt… is this all of reality?\nThere is a torch on the ground. Pick it up, and try to light it!`,
                    npcs: [],
                    items: ['torch'],
                    exits: room.exits
                };
            } else {
                // After lighting torch
                return {
                    type: 'look',
                    room: this.gameState.currentRoom,
                    description: `Cold stone walls, oppressive air. Firelight casts twisted shadows on the walls, as if living beings are swaying.`,
                    npcs: room.npcs,
                    items: room.items,
                    exits: room.exits
                };
            }
        }
        
        // Special handling for forest room
        if (this.gameState.currentRoom === 'forest') {
            if (this.gameState.inventory.includes('bird') && !this.gameState.birdReleased) {
                // Has bird but not released yet
                return {
                    type: 'look',
                    room: this.gameState.currentRoom,
                    description: `${room.description}\n\nPlease release the little bird here.`,
                    npcs: [],
                    items: [],
                    exits: room.exits
                };
            }
        }
        
        // Special handling for garden room
        if (this.gameState.currentRoom === 'garden') {
            return {
                type: 'look',
                room: this.gameState.currentRoom,
                description: room.description,
                npcs: [], // Always show "no one here" for garden
                items: room.items,
                exits: room.exits,
                extraText: !this.gameState.gardenRoseChosen ? "At the center of a circular stone path, three roses bloom together: one red like flame, one white like morning dew, and one purple like a dream of night.\nTry\n\n(Type 'talk red'/'talk white'/'talk purple' to speaking to them)" : ""
            };
        }
        
        // Special handling for courtyard_finale - no exits shown
        if (this.gameState.currentRoom === 'courtyard_finale') {
            return {
                type: 'look',
                room: this.gameState.currentRoom,
                description: room.description,
                npcs: room.npcs,
                items: room.items,
                exits: {} // No exits shown for final courtyard
            };
        }
        
        // Default handling for other rooms
        return {
            type: 'look',
            room: this.gameState.currentRoom,
            description: room.description,
            npcs: room.npcs,
            items: room.items,
            exits: room.exits
        };
    }

    handleTake(item) {
        const room = this.rooms[this.gameState.currentRoom];
        
        // Handle item aliases
        const itemAliases = {
            'feather': 'feather_of_freedom',
            'stone': 'stone_of_grit',
            'seed': 'seed_of_love',
            'orb': 'orb_of_creation',
            'shield': 'shield_of_wisdom',
            'torch': 'torch',
            'bird': 'bird',
            'disk': 'hexagram_disk',
            'hexagram': 'hexagram_disk'
        };
        
        // Check if the input is an alias and convert to actual item ID
        const actualItem = itemAliases[item] || item;
        
        if (!room.items.includes(actualItem)) {
            return { type: 'error', message: "There is no such item here." };
        }
        
        if (this.gameState.inventory.includes(actualItem)) {
            return { type: 'error', message: "You already have that item." };
        }
        
        this.gameState.inventory.push(actualItem);
        room.items = room.items.filter(i => i !== actualItem);
        
        const itemData = this.items[actualItem];
        let message = `You take the ${itemData.name}.`;
        
        // Add special messages for specific items
        if (actualItem === 'torch') {
            message += ` Maybe you can try to light it.\n(Type 'use <item>' to use an item. For example, 'use torch'.)`;
        }
        
        // Add special messages for symbolic items
        if (actualItem === 'feather_of_freedom') {
            message += `\n\nYou have obtained the Feather of Freedom! 🪶\nDo not be afraid to try. Not every door is locked, and not every window is closed. There will always be new strength, warmth, support, and wonder waiting in places you have not yet seen. They are outside the doors, in the wind, under the sun—waiting only for you to step out bravely. Do not remain trapped in the past, nor in rigid beliefs. When you push open the window, when you step out the door, freedom and hope will walk with you.\n(Type 'look' to check the exit and type 'go <direction>' to go to the next room)`;
        } else if (actualItem === 'stone_of_grit') {
            message += `\n\nItem added to inventory: Stone Fragment of Grit 🪨.\n\n「Everyone is pushing their own stone—work, love, dreams… They may all roll down, yet we still must push again.\n\nThe hero who conquers inner despair is more precious than one who conquers the world.\n\nPerhaps happiness is hidden in the intervals of repetition. In these moments, we think, order, and rebuild ourselves, so that next time, or in some future facing of the stone, we may be a little more skillful, a little lighter, with stronger inner strength.」\n\n(Type 'look' to check the exit and type 'go <direction>' to go to the next room)`;
        } else if (actualItem === 'seed_of_love') {
            message += `\n\nItem added to inventory: Seed of Love 🌱\n\n「The meaning of choice does not lie in embracing all possibilities,\nBut in choosing one among countless possibilities,\nAnd bravely accepting the cost of giving up the others.\n\nOnly by devoting your life to those you want to guard,\nTo care, to love, to listen, to respect,\nCan you possibly receive trust and love,\nAnd possibly find the meaning and value of living.\n\nThese roses may be your lover,\nOr may be friends, vocation, hobby, home,\nEven yourself.」\n\n(Type 'look' to check the exit and type 'go <direction>' to go to the next room)`;
        } else if (actualItem === 'bird') {
            message += `\n\nYou gently pick up the small bird. She looks at you with hope.\n(Type 'look' to check the exit and type 'go <direction>' to go to the next room)\n(Type 'inventory' to check the items in your inventory)`;
        } else if (actualItem === 'shield_of_wisdom') {
            message += `\n\nYou have obtained the Shield of Wisdom! 🛡️\nLearning lets you begin, dialogue broadens your sight, experience gives depth, reflection guides growth. You have gathered the four paths of wisdom, and obtained the Shield of Wisdom. Whether in smooth or adverse times, you can respond calmly.\n(Type 'look' to check the exit and type 'go <direction>' to go to the next room)`;
        } else if (actualItem === 'orb_of_creation') {
            message += `\n\nYou have obtained the token: Crystal Ball—it carries vision and future, condensing infinite possibilities into your palm. Listen to the truest voice in your heart, first create the vision of your own life. The aid of the universe will follow your mind. The power of belief will make the impossible gradually possible.\n(Type 'look' to check the exit and type 'go <direction>' to go to the next room)`;
        }
        
        return {
            type: 'success',
            message: message,
            item: actualItem
        };
    }

    handleUse(item) {
        // Handle item aliases
        const itemAliases = {
            'feather': 'feather_of_freedom',
            'stone': 'stone_of_grit',
            'seed': 'seed_of_love',
            'orb': 'orb_of_creation',
            'shield': 'shield_of_wisdom',
            'torch': 'torch',
            'bird': 'bird',
            'disk': 'hexagram_disk',
            'hexagram': 'hexagram_disk'
        };
        
        // Check if the input is an alias and convert to actual item ID
        const actualItem = itemAliases[item] || item;
        
        if (!this.gameState.inventory.includes(actualItem)) {
            return { type: 'error', message: "You don't have that item." };
        }
        
        switch (actualItem) {
            case 'torch':
                if (!this.gameState.itemStates.torch_lit) {
                    this.gameState.itemStates.torch_lit = true;
                    
                    // Add NPCs and bird to cave after lighting torch
                    const room = this.rooms['cave'];
                    room.npcs = ['prisoner', 'watcher', 'philosopher'];
                    room.items.push('bird');
                    
                    return {
                        type: 'success',
                        message: "You light the torch. The cave is now illuminated!\nThe firelight reveals the truth: the shadows on the wall are merely puppets, the fire pile is artificial. You realize you have been deceived by illusions. Now you can clearly see the cave: you find the Prisoner in Chains, the Watcher of Shadows, and the Guide at the Cave Entrance. Go talk to them!\n(Type 'look' to look around again and type 'talk <NPC>' to get more information)"
                    };
                } else {
                    return { type: 'info', message: "The torch is already lit." };
                }
            default:
                return { type: 'error', message: "You can't use that right now." };
        }
    }

    handleInventory() {
        if (this.gameState.inventory.length === 0) {
            return { type: 'info', message: "Inventory: (empty)" };
        } else {
            const inventoryList = this.gameState.inventory.map(item => {
                const itemData = this.items[item];
                return `- ${itemData.name}: ${itemData.description}`;
            }).join('\n');
            
            let message = `Inventory:\n${inventoryList}`;
            
            // Special handling for courtyard finale
            if (this.gameState.currentRoom === 'courtyard_finale') {
                const requiredItems = ['flame_of_courage', 'feather_of_freedom', 'shield_of_wisdom', 'orb_of_creation', 'stone_of_grit', 'seed_of_love'];
                const hasAllItems = requiredItems.every(item => this.gameState.inventory.includes(item));
                
                if (hasAllItems) {
                    message += "\n\nGuide: I believe you've gathered everything needed to restore the Hexagram! Try placing them onto the disk one by one and see what happens.\n(Type 'repair disk' to place your six tokens into the Hexagram.)";
                }
            }
            
            return { type: 'info', message: message };
        }
    }

    handlePath(path) {
        if (this.gameState.currentRoom !== 'library') {
            return { type: 'error', message: "You can't do that here." };
        }
        
        this.gameState.libraryPaths.add(path);
        
        const pathMessages = {
            learn: "You walk into a corridor shrouded in brilliance.\n\nIn front of you, multiple paths of knowledge appear: school gates, expert lectures, online resources, and towers of books.\n\n'No matter the form, only by loving and actively seeking to learn can wisdom begin.'\n\nYou obtain Light of Wisdom [Learning · Understanding].",
            live: "A crack opens in the bookshelf, pulling you into an illusion—a miniature world of society and life: bustling markets, craftsman's workshops, journeys afar, entertainment worlds, and job markets.\n\n'With curiosity and critical eyes, fully immersing in society, your experiences will eventually become wisdom.'\n\nYou obtain Light of Wisdom [Living · Experience].",
            dialogue: "Voices echo through the corridor.\n\nAs you approach, phantoms take shape one by one: friends' chats, sincere voices, fierce debates, and co-creation.\n\n'Meeting, exchanging, understanding—social interaction too is an important path toward wisdom.'\n\nYou obtain Light of Wisdom [Dialogue · Communication].",
            reflect: "In the center of the hall appears a water mirror, reflecting your past choices and experiences: mirrors of reflection, corridors of memory, abysses of thought, and torn diary pages.\n\n'Only by constantly revising oneself in thought can one continue to grow.'\n\nYou obtain Light of Wisdom [Thinking · Reflection]."
        };
        
        let message = pathMessages[path];
        
        // Check if all paths are completed
        if (this.gameState.libraryPaths.size === 4) {
            this.gameState.gameFlags.shield_ready = true;
            const room = this.rooms[this.gameState.currentRoom];
            room.items = room.items.filter(item => item !== '4 paths of wisdom');
            room.items.push('shield_of_wisdom');
            
            message += "\n\nThe dome's stars suddenly blaze, streams of light flow through the library. Pages fly open, thousands of thoughts awaken simultaneously. Corridors echo with voices of reading, debate, song, and heartfelt speech. The water mirror shatters, its fragments rising to merge with the stars into a vast galaxy. The galaxy condenses into a crystal shield, descending slowly into your hands.\n\nTake it now—the wisdom you have earned.\n(Type 'take shield' to claim your reward.)";
        }
        
        return { type: 'success', message: message };
    }

    handleStage() {
        if (this.gameState.currentRoom !== 'theater') {
            return { type: 'error', message: "You are not on the stage." };
        }
        
        if (!['einstein', 'marx'].every(npc => this.gameState.theaterTalked.has(npc))) {
            return { type: 'error', message: "You should talk to both Einstein and Marx before stepping onto the stage." };
        }
        
        this.gameState.stageMode = true;
        this.gameState.createStep = 0;
        this.gameState.createChoice = null;
        
        return {
            type: 'success',
            message: "As you set foot upon the stage, the spotlight snaps on — this moment, you are the creator.\nChoose the symbol you wish to create on stage.\n(Type 'create star', 'create tree', or 'create castle')"
        };
    }

    handleCreate(choice) {
        if (!this.gameState.stageMode) {
            return { type: 'error', message: "You are not on the stage." };
        }
        
        if (!['star', 'tree', 'castle'].includes(choice)) {
            return { type: 'error', message: "You can only create: star, tree, or castle." };
        }
        
        this.gameState.createChoice = choice;
        this.gameState.createStep = 1;
        
        const creationMessages = {
            star: "A lonely speck of light appears on the dome, faint yet stubbornly shining.\n(Type 'continue' to proceed or 'cancel' to choose again)",
            tree: "A tiny seed sprouts at your feet, growing into a sapling, then a towering tree.\n(Type 'continue' to proceed or 'cancel' to choose again)",
            castle: "A faint outline of a castle emerges, stone by stone, reaching for the sky.\n(Type 'continue' to proceed or 'cancel' to choose again)"
        };
        
        return { type: 'success', message: creationMessages[choice] };
    }

    handleContinue() {
        if (!this.gameState.stageMode || !this.gameState.createChoice) {
            return { type: 'error', message: "Nothing to continue." };
        }
        
        this.gameState.createStep++;
        const choice = this.gameState.createChoice;
        
        if (this.gameState.createStep === 2) {
            const step2Messages = {
                star: "The speck expands into a nebula; stars breathe, lighting up the surroundings.\n(Type 'continue' to proceed or 'cancel' to choose again)",
                tree: "The tree's branches stretch, leaves unfurl, roots dig deep into the stage.\n(Type 'continue' to proceed or 'cancel' to choose again)",
                castle: "The castle walls rise, towers spiral upward, banners flutter in unseen wind.\n(Type 'continue' to proceed or 'cancel' to choose again)"
            };
            return { type: 'success', message: step2Messages[choice] };
        } else if (this.gameState.createStep === 3) {
            const step3Messages = {
                star: "A vast galaxy spans the stage; the theater becomes endless cosmos.\n(Symbol: Infinity · Exploration · Imagination)",
                tree: "The tree bursts into bloom, fruits shining like jewels; the theater is filled with life.\n(Symbol: Growth · Vitality · Hope)",
                castle: "The castle stands complete, a beacon of protection and dreams.\n(Symbol: Shelter · Aspiration · Creation)"
            };
            
            // Add orb to room
            const room = this.rooms[this.gameState.currentRoom];
            if (!room.items.includes('orb_of_creation')) {
                room.items.push('orb_of_creation');
            }
            
            this.gameState.stageMode = false;
            
            return {
                type: 'success',
                message: `${step3Messages[choice]}\n\nThe stage light converges at your feet. Your vision crystallizes into a radiant orb.\n(Type 'take orb' to claim your reward.)`
            };
        }
        
        return { type: 'error', message: "Nothing to continue." };
    }

    handleCancel() {
        if (!this.gameState.stageMode) {
            return { type: 'error', message: "Nothing to cancel." };
        }
        
        this.gameState.createStep = 0;
        this.gameState.createChoice = null;
        
        return {
            type: 'success',
            message: "You step back. Choose again: (Type 'create star', 'create tree', or 'create castle')"
        };
    }

    handleRelease() {
        if (this.gameState.currentRoom !== 'forest') {
            return { type: 'error', message: "You can only release the bird in the forest." };
        }
        
        if (!this.gameState.inventory.includes('bird')) {
            return { type: 'error', message: "You don't have the bird." };
        }
        
        if (this.gameState.birdReleased) {
            return { type: 'error', message: "You have already released the bird." };
        }
        
        // Remove bird from inventory and set released state
        this.gameState.inventory = this.gameState.inventory.filter(item => item !== 'bird');
        this.gameState.birdReleased = true;
        
        // Add bird to forest room as NPC
        const room = this.rooms[this.gameState.currentRoom];
        if (!room.npcs.includes('bird')) {
            room.npcs.push('bird');
        }
        
        return {
            type: 'success',
            message: "You gently open your hands. The little bird hesitates for a moment, then flutters its wings and lands on a nearby branch, looking at you with curiosity and a hint of fear.\n\n(Type 'talk bird' to start a conversation with her, or click on the bird icon.)"
        };
    }

    handleHelp() {
        return {
            type: 'info',
            message: `🌟 六芒星游戏帮助 🌟

📖 基本命令：
• look - 查看当前房间
• go <方向> - 移动（north, south, east, west）
• take <物品> - 拾取物品
• use <物品> - 使用物品
• inventory - 查看背包
• talk <NPC> - 与NPC对话
• respond - 回应对话
• end - 结束对话

🎯 特殊命令：
• release - 在森林中释放小鸟
• choose <颜色> - 在花园中选择玫瑰（red, white, purple）
• water/fertilize/weed/wish/wait - 在花园中照料花朵
• take seed - 拾取爱的种子
• push stone - 在山坡推动石头
• learn/live/dialogue/reflect - 在图书馆探索智慧之路
• stage - 在剧院登上舞台
• create <选择> - 创造（star, tree, castle）
• continue - 继续创造过程
• repair disk - 修复六芒星圆盘

🖱️ 交互提示：
• 双击背包中的手电筒 - 在洞穴中使用
• 双击背包中的小鸟 - 在森林中释放
• 点击场景中的对象进行互动
• 点击NPC图标开始对话

💡 游戏目标：
收集六个象征：勇气、自由、智慧、创造、坚韧、爱
修复破碎的六芒星圆盘，完成自我救赎之旅！`
        };
    }

    handleGardenAction(action) {
        if (this.gameState.currentRoom !== 'garden') {
            return { type: 'error', message: "You can't do that here." };
        }

        if (!this.gameState.gardenRoseChosen) {
            return { type: 'error', message: "You must first choose a rose." };
        }

        const currentStep = this.gameState.gardenPlantingStep || 0;
        const expectedActions = ['water', 'fertilize', 'weed', 'wish', 'wait'];
        
        if (action !== expectedActions[currentStep]) {
            return { type: 'error', message: `You should ${expectedActions[currentStep]} next.` };
        }

        this.gameState.gardenPlantingStep = currentStep + 1;

        const actionMessages = {
            water: "You pour the crystal dew over the soil. The seed swells and quivers—one pale root reaches down, a tender shoot presses up. The surface of the soil lifts and splits.\n\n(Type 'fertilize' to nourish it.)",
            fertilize: "You sprinkle luminous dust over the soil. The sprout straightens; the first soft leaves unfurl like tiny sails, catching the night air. Its color deepens, drinking strength.\n\n(Type 'weed' to clear away what hinders its growth.)",
            weed: "You kneel beside the young plant, gently pulling away the choking vines and brittle weeds. Light reaches it cleanly now; the stem thickens, and at its tip a tight bud begins to form.\n\n(Type 'wish' to whisper your blessing to it.)",
            wish: "You whisper softly, \"May you grow strong and bloom with grace.\"\nThe flower glows faintly, as if quietly returning your blessing.\n\n(Type 'wait' to watch it grow.)",
            wait: "You sit beside the budding plant, hands resting softly on your knees. The night is quiet—only the hum of the earth answers you.\nTime drifts. The bud drinks the moonlight, loosens, and turns toward the sky. At last, the petals unfold—slow, certain, breathtaking. What patience and care began now opens in full, living beauty.\n\nCongratulations—you have obtained the token: Seed of Love! Please take it and keep it safe.\n(Type 'take seed' to add it to your inventory.)"
        };

        return {
            type: 'success',
            message: actionMessages[action]
        };
    }

    handleTakeSeed() {
        if (this.gameState.currentRoom !== 'garden') {
            return { type: 'error', message: "You can't take that here." };
        }

        if (!this.gameState.gardenRoseChosen || this.gameState.gardenPlantingStep < 5) {
            return { type: 'error', message: "The seed is not ready yet." };
        }

        if (this.gameState.inventory.includes('seed_of_love')) {
            return { type: 'error', message: "You already have the seed." };
        }

        this.gameState.inventory.push('seed_of_love');

        return {
            type: 'success',
            message: "Item added to inventory: Seed of Love 🌱\n\nThe meaning of choice does not lie in embracing all possibilities,\nBut in choosing one among countless possibilities,\nAnd bravely accepting the cost of giving up the others.\n\nOnly by devoting your life to those you want to guard,\nTo care, to love, to listen, to respect,\nCan you possibly receive trust and love,\nAnd possibly find the meaning and value of living.\n\nThese roses may be your lover,\nOr may be friends, vocation, hobby, home,\nEven yourself.\n\n(Type 'look' to check the exit and type 'go <direction>' to go to the next room)",
            item: 'seed_of_love'
        };
    }

    handleLibraryPath(pathType) {
        if (this.gameState.currentRoom !== 'library') {
            return { type: 'error', message: "You can only explore wisdom paths in the library." };
        }

        // Add the path to completed paths
        this.gameState.libraryPaths.add(pathType);

        const pathMessages = {
            learn: "You have completed the Learning Path! 📚\n\nYou walk into a corridor shrouded in brilliance. In front of you, multiple paths of knowledge appear:\n\n• [school] School gate — bells echo, scholars walk into halls\n• [expert] Expert lecture — phantom sages speak gently\n• [online] Online resources — countless screens flicker, knowledge flows at your fingertips\n• [book] Tower of books — scrolls piled high, whispering softly\n\n\"No matter the form, only by loving and actively seeking to learn can wisdom begin.\"\n\nYou obtain Light of Wisdom [Learning · Understanding].",
            live: "You have completed the Living Path! 🌍\n\nA crack opens in the bookshelf, pulling you into an illusion—a miniature world of society and life:\n\n• [market] Bustling market — voices rise and fall in bargaining\n• [workshop] Craftsman's workshop — sparks fly, skills tempered in hands\n• [journey] Journey afar — mountains and strangers await\n• [entertainment] Entertainment world — behind laughter hides joy and sorrow\n• [career] Job market — surging crowds, each soul seeking a place\n\n\"With curiosity and critical eyes, fully immersing in society, your experiences will eventually become wisdom.\"\n\nYou obtain Light of Wisdom [Living · Experience].",
            dialogue: "You have completed the Dialogue Path! 💬\n\nVoices echo through the corridor. As you approach, phantoms take shape one by one:\n\n• [chat] Friends' chat — cheerful laughter dispels loneliness\n• [talk] Sincere voice — speaking and listening draw closer hearts\n• [debate] Fierce debate — logic and viewpoints clash like swords\n• [co-create] Co-creation — minds intertwine, igniting sparks\n\n\"Meeting, exchanging, understanding—social interaction too is an important path toward wisdom.\"\n\nYou obtain Light of Wisdom [Dialogue · Communication].",
            reflect: "You have completed the Reflection Path! 🤔\n\nIn the center of the hall appears a water mirror, reflecting your past choices and experiences:\n\n• [mirror] Mirror of reflection — see shadows and regrets of the past\n• [memory] Corridor of memory — old scenes replay, awaiting review\n• [thought] Abyss of thought — inner whispers and unresolved questions\n• [diary] Torn diary pages — true voices hidden in writing\n\n\"Only by constantly revising oneself in thought can one continue to grow.\"\n\nYou obtain Light of Wisdom [Thinking · Reflection]."
        };

        return {
            type: 'success',
            message: pathMessages[pathType]
        };
    }
}

// Export for use in HTML
window.HexagramGame = HexagramGame;
