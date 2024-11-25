const CONFIG = {
    GAME: {
        TOTAL_TIME: 90, // seconds
        PHASES: {
            1: {
                START_TIME: 90,
                END_TIME: 60,
                SPEED: 1.8,
                PREVIEW: true,
                PREVIEW_FREQUENCY: 1
            },
            2: {
                START_TIME: 60,
                END_TIME: 30,
                SPEED: 2.5,
                PREVIEW: true,
                PREVIEW_FREQUENCY: 2
            },
            3: {
                START_TIME: 30,
                END_TIME: 0,
                SPEED: 4,
                PREVIEW: false,
                PREVIEW_FREQUENCY: 0
            }
        }
    },
    BOARD: {
        WIDTH: 10,
        HEIGHT: 20,
        BLOCK_SIZE: 30
    },
    SCORING: {
        LINES: {
            1: 100,  // Single line
            2: 250,  // Double line
            3: 400,  // Triple line
            4: 800   // Tetris
        },
        COMBO_MULTIPLIER: {
            2: 2,    // 2x for 2 consecutive line clears
            3: 3,    // 3x for 3 consecutive line clears
            4: 4     // 4x for 4 consecutive line clears
        },
        PHASE_MULTIPLIER: {
            1: 1,    // Phase 1: normal scoring
            2: 1.2,  // Phase 2: 20% bonus
            3: 1.5   // Phase 3: 50% bonus
        },
        TIME_BONUS_MULTIPLIER: 1 // Points per line cleared * remaining seconds
    },
    COLORS: {
        1: '#00f0f0', // I - Cyan
        2: '#f0f000', // O - Yellow
        3: '#a000f0', // T - Purple
        4: '#00f000', // S - Green
        5: '#f00000', // Z - Red
        6: '#0000f0', // J - Blue
        7: '#f0a000'  // L - Orange
    },
    GRID_LINE_COLOR: 'rgba(255, 255, 255, 0.2)',
    INITIAL_DELAY: 1000,
    SOFT_DROP_MULTIPLIER: 20,
    GHOST_PIECE_OPACITY: 0.3
};
