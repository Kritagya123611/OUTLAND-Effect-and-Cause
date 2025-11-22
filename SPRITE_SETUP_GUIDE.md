# Character Sprite Setup Guide

## Step 1: Prepare Your Sprite Sheets

### Sprite Sheet Format
Your sprite sheet should be a **horizontal strip** of frames, like this:

```
[Frame 0][Frame 1][Frame 2][Frame 3][Frame 4][Frame 5][Frame 6][Frame 7]...
```

### Recommended Layout
- **Idle animation**: Frames 0-3 (4 frames)
- **Walk animation**: Frames 4-7 (4 frames)  
- **Jump animation**: Frames 8-10 (3 frames)

### File Requirements
- **Format**: PNG (with transparency)
- **Recommended size per frame**: 32x48 pixels (or 64x96 for HD)
- **All frames must be the same size**

### Where to Place Files
Place your sprite sheet files in:
```
apps/frontend/src/assets/
```

Example:
- `apps/frontend/src/assets/player-spritesheet.png`
- `apps/frontend/src/assets/enemy-spritesheet.png`

---

## Step 2: Load Sprite Sheets in `preload()` Method

**Location**: Around **line 236-260** in `GameCanvas.tsx`

Find this section:
```typescript
preload() {
    this.load.image('bg', bg);
    
    // ============================================
    // ANIMATED SPRITE SETUP
    // ============================================
```

**Replace the commented code with your actual sprite loading:**

### Option A: Using `import` (Recommended for React/TypeScript)

1. **First, add imports at the top of the file** (around line 5):
```typescript
import playerSprite from '../assets/player-spritesheet.png';
import enemySprite from '../assets/enemy-spritesheet.png';
```

2. **Then in `preload()` method, add:**
```typescript
preload() {
    this.load.image('bg', bg);
    
    // Load player sprite sheet
    this.load.spritesheet('player', playerSprite, {
        frameWidth: 32,   // Width of each frame in pixels
        frameHeight: 48,  // Height of each frame in pixels
    });
    
    // Load enemy sprite sheet
    this.load.spritesheet('enemy', enemySprite, {
        frameWidth: 32,
        frameHeight: 48,
    });
    
    // ... rest of the code
}
```

### Option B: Using Direct Path (Alternative)

If import doesn't work, use direct path:
```typescript
preload() {
    this.load.image('bg', bg);
    
    // Load player sprite sheet
    this.load.spritesheet('player', 'assets/player-spritesheet.png', {
        frameWidth: 32,
        frameHeight: 48,
    });
    
    // Load enemy sprite sheet
    this.load.spritesheet('enemy', 'assets/enemy-spritesheet.png', {
        frameWidth: 32,
        frameHeight: 48,
    });
    
    // ... rest of the code
}
```

**Important**: Adjust `frameWidth` and `frameHeight` to match your actual sprite frame size!

---

## Step 3: Create Animations in `create()` Method

**Location**: Around **line 290-331** in `GameCanvas.tsx`

Find this section:
```typescript
create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // ============================================
    // CREATE ANIMATIONS (if using sprite sheets)
    // ============================================
```

**Uncomment and adjust the animation code:**

```typescript
create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // ============================================
    // CREATE ANIMATIONS
    // ============================================
    
    // Player animations
    this.anims.create({
        key: 'player-idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 8,      // Frames per second
        repeat: -1          // Loop forever
    });
    
    this.anims.create({
        key: 'player-walk',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'player-jump',
        frames: this.anims.generateFrameNumbers('player', { start: 8, end: 10 }),
        frameRate: 10,
        repeat: 0           // Play once (no loop)
    });
    
    // Enemy animations
    this.anims.create({
        key: 'enemy-idle',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
    });
    
    this.anims.create({
        key: 'enemy-walk',
        frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    // 1. World Setup
    this.setupWorldAndCamera();
    // ... rest of the code
}
```

**Adjust frame numbers** (`start` and `end`) to match your sprite sheet layout!

---

## Step 4: Verify Everything Works

1. **Make sure your sprite files are in the correct location**
2. **Check that frameWidth and frameHeight match your sprite size**
3. **Verify frame numbers match your sprite sheet layout**
4. **Run the game** - if sprites are loaded, you'll see animated characters instead of colored rectangles!

---

## Troubleshooting

### Sprites Not Showing?
- Check browser console for errors
- Verify file paths are correct
- Make sure sprite sheets are loaded before `create()` runs
- Check that frameWidth/Height match your actual sprite size

### Wrong Animation Playing?
- Adjust the `start` and `end` frame numbers in animation definitions
- Check your sprite sheet layout matches the frame numbers

### Sprites Too Big/Small?
- Adjust `frameWidth` and `frameHeight` in the `spritesheet` loading
- Or scale the sprite in code: `sprite.setScale(0.5)` for half size

### Using Different Frame Layout?
If your sprite sheet has a different layout, adjust the frame numbers:
```typescript
// Example: If idle is frames 0-5, walk is 6-11, jump is 12-14
frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }), // idle
frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }), // walk
frames: this.anims.generateFrameNumbers('player', { start: 12, end: 14 }), // jump
```

---

## Quick Reference: Code Locations

| Step | File | Line Range |
|------|------|------------|
| Add imports | `GameCanvas.tsx` | ~Line 5 |
| Load sprites | `GameCanvas.tsx` | ~Line 236-260 |
| Create animations | `GameCanvas.tsx` | ~Line 290-331 |

---

## Example: Complete Setup

**At top of file:**
```typescript
import playerSprite from '../assets/player-spritesheet.png';
import enemySprite from '../assets/enemy-spritesheet.png';
```

**In preload():**
```typescript
this.load.spritesheet('player', playerSprite, {
    frameWidth: 32,
    frameHeight: 48,
});
this.load.spritesheet('enemy', enemySprite, {
    frameWidth: 32,
    frameHeight: 48,
});
```

**In create():**
```typescript
this.anims.create({
    key: 'player-idle',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1
});
// ... add other animations
```

That's it! The game will automatically use your sprites when loaded. 🎮

