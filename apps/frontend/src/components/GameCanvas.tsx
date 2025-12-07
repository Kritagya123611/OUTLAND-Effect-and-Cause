// File: apps/frontend/src/components/GameCanvas.tsx

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import bg from '../assets/bg.png';
import robot from '../assets/robot.png';
import { useGameStore } from '../stores/useGameStore';

const GAME_CONFIG = {
    PLAYER_SPEED: 180,
    JETPACK_THRUST: -380,
    GRAVITY_Y: 650,
    FIRE_RATE: 150, 
    PLAYER_MAX_HEALTH: 100,
    ENEMY_MAX_HEALTH: 50,
    ENEMY_SPAWN_RATE: 3000, // ms
    GRENADE_EXPLOSION_RADIUS: 80,
    GRENADE_DAMAGE: 50,
};

const WeaponType = {
    PISTOL: 'pistol',
    RIFLE: 'rifle',
    SHOTGUN: 'shotgun',
    SNIPER: 'sniper',
    ROCKET_LAUNCHER: 'rocket',
    MINIGUN: 'minigun',
    BANISHER: 'banisher',
} as const;

type WeaponType = typeof WeaponType[keyof typeof WeaponType];

interface Weapon {
    type: WeaponType;
    name: string;
    damage: number;
    fireRate: number;
    bulletSpeed: number;
    ammo: number;
    maxAmmo: number;
    reloadTime: number;
    spread: number; 
    bulletCount: number; 
    color: number;
    size: number;
}

const WEAPONS: Record<WeaponType, Weapon> = {
    [WeaponType.PISTOL]: {
        type: WeaponType.PISTOL,
        name: 'Pistol',
        damage: 15,
        fireRate: 200,
        bulletSpeed: 700,
        ammo: 12,
        maxAmmo: 12,
        reloadTime: 1000,
        spread: 3,
        bulletCount: 1,
        color: 0xffff00,
        size: 3,
    },
    [WeaponType.BANISHER]: {
    type: WeaponType.BANISHER,
    name: 'Void Caster',
    damage: 0, 
    fireRate: 400,
    bulletSpeed: 900,
    ammo: 50,
    maxAmmo: 50,
    reloadTime: 2000,
    spread: 0,
    bulletCount: 1,
    color: 0x9b26b6, 
    size: 6,
},
    [WeaponType.RIFLE]: {
        type: WeaponType.RIFLE,
        name: 'Assault Rifle',
        damage: 12,
        fireRate: 100,
        bulletSpeed: 800,
        ammo: 30,
        maxAmmo: 30,
        reloadTime: 1500,
        spread: 2,
        bulletCount: 1,
        color: 0x00ff00,
        size: 4,
    },
    [WeaponType.SHOTGUN]: {
        type: WeaponType.SHOTGUN,
        name: 'Shotgun',
        damage: 8,
        fireRate: 600,
        bulletSpeed: 500,
        ammo: 8,
        maxAmmo: 8,
        reloadTime: 2000,
        spread: 15,
        bulletCount: 8,
        color: 0xff8800,
        size: 3,
    },
    [WeaponType.SNIPER]: {
        type: WeaponType.SNIPER,
        name: 'Sniper',
        damage: 60,
        fireRate: 1200,
        bulletSpeed: 1200,
        ammo: 5,
        maxAmmo: 5,
        reloadTime: 2500,
        spread: 0,
        bulletCount: 1,
        color: 0x00ffff,
        size: 5,
    },
    [WeaponType.ROCKET_LAUNCHER]: {
        type: WeaponType.ROCKET_LAUNCHER,
        name: 'Rocket Launcher',
        damage: 80,
        fireRate: 1500,
        bulletSpeed: 400,
        ammo: 3,
        maxAmmo: 3,
        reloadTime: 3000,
        spread: 0,
        bulletCount: 1,
        color: 0xff0000,
        size: 8,
    },
    [WeaponType.MINIGUN]: {
        type: WeaponType.MINIGUN,
        name: 'Minigun',
        damage: 10,
        fireRate: 50,
        bulletSpeed: 900,
        ammo: 200,
        maxAmmo: 200,
        reloadTime: 4000,
        spread: 5,
        bulletCount: 1,
        color: 0xff00ff,
        size: 4,
    },
};

interface Enemy {
    sprite: Phaser.GameObjects.Sprite;
    health: number;
    maxHealth: number;
    lastShot: number;
    weapon: Weapon;
    targetAngle: number;
    moveDirection: number; 
    lastDirectionChange: number;
}

interface PowerUp {
    sprite: Phaser.GameObjects.Rectangle;
    type: 'weapon' | 'health' | 'ammo';
    weaponType?: WeaponType;
    collected: boolean;
}

const Game = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current) return;

        class MainScene extends Phaser.Scene {

            private banishEnemy(enemy: Enemy) {
                const sprite = enemy.sprite;
                const x = sprite.x;
                const y = sprite.y;

                
                if (sprite.body) {
                    (sprite.body as Phaser.Physics.Arcade.Body).enable = false;
                }

                
                useGameStore.getState().incrementBanished(); 
                useGameStore.getState().increaseScore(500);

                this.tweens.add({
                    targets: sprite,
                    scaleY: 4,       
                    scaleX: 0.05,    
                    alpha: 0,        
                    tint: 0xff00ff,  
                    duration: 250,
                    ease: 'Power2',
                    onComplete: () => {
                        sprite.destroy();
                    }
                });

                
                const emitter = this.add.particles(x, y, 'pixel', {
                    speed: { min: 50, max: 200 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 500,
                    tint: 0x9b26b6, 
                    emitting: false,
                    gravityY: -600  
                });
                emitter.explode(20);
                this.time.delayedCall(600, () => emitter.destroy());
                const text = this.add.text(x, y - 40, "BANISHED", {
                    fontSize: '16px',
                    color: '#d946ef', 
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 3
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: text,
                    y: y - 100,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => text.destroy()
                });

               
                this.enemyList = this.enemyList.filter(e => e !== enemy);
            }

           
            private player!: Phaser.GameObjects.Sprite;
            private gun!: Phaser.GameObjects.Rectangle;
            private platforms!: Phaser.Physics.Arcade.StaticGroup;
            private bullets!: Phaser.Physics.Arcade.Group;
            private rockets!: Phaser.Physics.Arcade.Group;
            private enemies!: Phaser.Physics.Arcade.Group;
            private grenades!: Phaser.Physics.Arcade.Group;
            private powerUps!: Phaser.Physics.Arcade.Group;
            private hasReceivedRocket: boolean = false;
            
            private keys!: { 
                W: Phaser.Input.Keyboard.Key; 
                A: Phaser.Input.Keyboard.Key; 
                S: Phaser.Input.Keyboard.Key; 
                D: Phaser.Input.Keyboard.Key;
                R: Phaser.Input.Keyboard.Key;
                G: Phaser.Input.Keyboard.Key;
            };
            private lastFired: number = 0;
            private bgSprite!: Phaser.GameObjects.Image;
            
            
            private playerHealth: number = GAME_CONFIG.PLAYER_MAX_HEALTH;
            private currentWeapon: Weapon = { ...WEAPONS[WeaponType.PISTOL] };
            private isReloading: boolean = false;
            private grenadeCount: number = 3;
            private enemyList: Enemy[] = [];
            private powerUpList: PowerUp[] = [];
            
            
            private healthBar!: Phaser.GameObjects.Graphics;
            private ammoText!: Phaser.GameObjects.Text;
            private weaponText!: Phaser.GameObjects.Text;
            private grenadeText!: Phaser.GameObjects.Text;
            private scoreText!: Phaser.GameObjects.Text;
            private score: number = 0;
            
            
            private enemySpawnTimer: number = 0;
            private powerUpSpawnTimer: number = 0;

           
            private currentWorld: 'A' | 'B' = 'A'; 
            
            
            private WORLD_CONFIGS = {
                A: {
                    GRAVITY_Y: 650,
                    PLAYER_SPEED: 180,
                    BG_COLOR: '#1a1a2e',
                },
                B: {
                    GRAVITY_Y: 1200, 
                    PLAYER_SPEED: 120, 
                    BG_COLOR: '#16161e', 
                },
            };

            constructor() {
                super('MainScene');
            }

            preload() {
                this.load.image('bg', bg);
                this.load.image('robot', robot);
                
                
                const graphics = this.make.graphics({ x: 0, y: 0 });
                graphics.setVisible(false);
                
                
                graphics.fillStyle(0xffffff, 1);
                graphics.fillRect(0, 0, 4, 4);
                graphics.generateTexture('pixel', 4, 4);
                
                
                graphics.clear();
                graphics.fillStyle(0xff0000, 1);
                graphics.fillRect(0, 0, 8, 8);
                graphics.generateTexture('rocket', 8, 8);
                
                
                graphics.clear();
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(4, 4, 4);
                graphics.generateTexture('grenade', 8, 8);
                
                
                graphics.clear();
                graphics.fillStyle(0xffff00, 1);
                graphics.fillRect(0, 0, 16, 16);
                graphics.generateTexture('powerup', 16, 16);
            }

            create() {
                this.cameras.main.setBackgroundColor('#1a1a2e');

                
                this.setupWorldAndCamera();
                
               
                this.createPlatforms();
                this.createPlayer();
                this.createGun();
                
                
                this.bullets = this.physics.add.group({
                    defaultKey: 'pixel',
                    maxSize: 200
                });
                
                this.rockets = this.physics.add.group({
                    defaultKey: 'rocket',
                    maxSize: 20
                });
                
                this.grenades = this.physics.add.group({
                    defaultKey: 'grenade',
                    maxSize: 10
                });
                
                this.enemies = this.physics.add.group();
                this.powerUps = this.physics.add.group();

               
                this.keys = this.input.keyboard!.addKeys("W,A,S,D,R,G") as any;
                this.input.on('pointerdown', this.handleShooting, this);
                this.input.keyboard!.on('keydown-R', this.reloadWeapon, this);
                this.input.keyboard!.on('keydown-G', this.throwGrenade, this);
                
                // Weapon switching with number keys
                for (let i = 1; i <= 6; i++) {
                    this.input.keyboard!.on(`keydown-${i}`, () => {
                        this.switchWeapon(i);
                    });
                }

                // 5. Collisions
                this.physics.add.collider(this.player, this.platforms);
                this.physics.add.collider(this.enemies, this.platforms);
                this.physics.add.collider(this.grenades, this.platforms, this.onGrenadeHitWall as any, undefined, this);
                
                // Bullet collisions
                this.physics.add.collider(this.bullets, this.platforms, this.onBulletHitWall as any, undefined, this);
                this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitEnemy as any, undefined, this);
                
                // Rocket collisions
                this.physics.add.collider(this.rockets, this.platforms, this.onRocketHitWall as any, undefined, this);
                this.physics.add.overlap(this.rockets, this.enemies, this.onRocketHitEnemy as any, undefined, this);
                this.physics.add.overlap(this.rockets, this.player, this.onRocketHitPlayer as any, undefined, this);
                
                // Power-up collisions
                this.physics.add.overlap(this.player, this.powerUps, this.onPowerUpCollect as any, undefined, this);
                
                
                // 7. Initial spawns
                this.spawnEnemy();
                this.spawnEnemy();

                //initial weapon is BANISHER
                this.currentWeapon = { ...WEAPONS[WeaponType.BANISHER] };
            }

            update(time: number, delta: number) {
                
                if (!this.player || !this.player.active) return;
                
                // Movement & Jetpack
                this.handlePlayerMovement();

                // Aiming
                this.handleGunAiming();

                // Enemy AI
                this.updateEnemies(time);

                // Cleanup
                this.cleanupBullets();
                this.cleanupRockets();
                this.updateGrenades(time);

                const { hasRocketLauncher, ammo: storeAmmo } = useGameStore.getState();

                // Check if player bought the gun but hasn't received it in Phaser yet
                if (hasRocketLauncher && !this.hasReceivedRocket) {
                    this.hasReceivedRocket = true;
                    
                    // Force switch weapon to Rocket Launcher
                    this.currentWeapon = { 
                        ...WEAPONS[WeaponType.ROCKET_LAUNCHER], 
                        ammo: storeAmmo // Sync ammo from the purchase (100)
                    };
                    
                    // Play a sound/effect
                    this.createPickupEffect(this.player.x, this.player.y);
                }
                
                // Spawning
                this.enemySpawnTimer += delta;
                if (this.enemySpawnTimer > GAME_CONFIG.ENEMY_SPAWN_RATE) {
                    this.spawnEnemy();
                    this.enemySpawnTimer = 0;
                }
                
                this.powerUpSpawnTimer += delta;
                if (this.powerUpSpawnTimer > 8000) {
                    this.spawnPowerUp();
                    this.powerUpSpawnTimer = 0;
                }
                
                // Update UI
                this.updateUI();
            }

            // =======================
            // Setup Functions
            // =======================

            private setupWorldAndCamera() {
                this.bgSprite = this.add.image(0, 0, 'bg').setOrigin(0);
                const worldWidth = this.bgSprite.width;
                const worldHeight = this.bgSprite.height;
                this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
                this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
            }

            private createPlatforms() {
                this.platforms = this.physics.add.staticGroup();
                
                // Main floor (invisible for physics, but we can add a visual indicator)
                const floor = this.add.rectangle(
                    this.bgSprite.width / 2, 
                    this.bgSprite.height - 20, 
                    this.bgSprite.width, 
                    40, 
                    0x000000, 
                    0
                );
                this.platforms.add(floor);
                
                // Add some floating platforms for more interesting gameplay
                const platformPositions = [
                    { x: 400, y: 300, w: 150, h: 20 },
                    { x: 800, y: 250, w: 120, h: 20 },
                    { x: 1200, y: 350, w: 100, h: 20 },
                    { x: 600, y: 150, w: 80, h: 20 },
                ];
                
                platformPositions.forEach(pos => {
                    // Create a more visible platform with border and glow effect
                    const platform = this.add.rectangle(pos.x, pos.y, pos.w, pos.h, 0x4a5568, 0.9);
                    
                    // Add a bright border
                    const border = this.add.graphics();
                    border.lineStyle(3, 0x718096, 1);
                    border.strokeRect(pos.x - pos.w/2, pos.y - pos.h/2, pos.w, pos.h);
                    border.setDepth(-1);
                    
                    // Add a subtle glow effect
                    const glow = this.add.rectangle(pos.x, pos.y, pos.w + 4, pos.h + 4, 0x63b3ed, 0.3);
                    glow.setBlendMode(Phaser.BlendModes.ADD);
                    glow.setDepth(-2);
                    
                    // Add platform texture/pattern for better visibility
                    const pattern = this.add.graphics();
                    pattern.fillStyle(0x2d3748, 0.5);
                    // Add some texture lines
                    for (let i = 0; i < pos.w; i += 10) {
                        pattern.fillRect(pos.x - pos.w/2 + i, pos.y - pos.h/2, 2, pos.h);
                    }
                    pattern.setDepth(-1);
                    
                    this.platforms.add(platform);
                });
            }

            private createPlayer() {
                this.player = this.add.sprite(200, 400, 'robot');
                this.physics.add.existing(this.player);
                const body = this.player.body as Phaser.Physics.Arcade.Body;
                body.setSize(24, 40); // Set collision box size
                body.setCollideWorldBounds(true);
                body.setDragX(600);
                
                this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
            }

            private createGun() {
                this.gun = this.add.rectangle(this.player.x, this.player.y, 30, 8, 0x95a5a6);
                this.gun.setOrigin(0, 0.5);
            }

private updateUI() {
                // 1. Sync State to React Store (This fixes the HUD)
                useGameStore.getState().setGameStats({
                    health: this.playerHealth,
                    maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
                    ammo: this.currentWeapon.ammo,
                    maxAmmo: this.currentWeapon.maxAmmo,
                    weaponName: this.currentWeapon.name.toUpperCase(),
                    grenades: this.grenadeCount,
                    isReloading: this.isReloading,
                    // Calculate glitch intensity based on low health
                    glitchIntensity: this.playerHealth < 30 ? (30 - this.playerHealth) / 30 : 0
                });

                // 2. Remove the old Phaser Text objects
                // You should delete these lines from your createUI function entirely 
                // so you don't have duplicate text on screen.
                /*
                this.healthBar.clear();
                this.ammoText.setText(...);
                this.weaponText.setText(...);
                */
            }

            // =======================
            // Player Functions
            // =======================

            private handlePlayerMovement() {
                const body = this.player.body as Phaser.Physics.Arcade.Body;
                const isMoving = this.keys.A.isDown || this.keys.D.isDown;
                const isJumping = body.velocity.y < -50;

                if (this.keys.A.isDown) {
                    body.setVelocityX(-GAME_CONFIG.PLAYER_SPEED);
                } else if (this.keys.D.isDown) {
                    body.setVelocityX(GAME_CONFIG.PLAYER_SPEED);
                }

                if (this.keys.W.isDown) {
                    body.setVelocityY(GAME_CONFIG.JETPACK_THRUST);
                    // Jetpack particles
                    this.createJetpackParticles();
                }

                // Handle animations if sprite exists
                if (this.player instanceof Phaser.GameObjects.Sprite) {
                    if (isJumping && this.anims.exists('player-jump')) {
                        if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'player-jump') {
                            this.player.play('player-jump', true);
                        }
                    } else if (isMoving && this.anims.exists('player-walk')) {
                        if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'player-walk') {
                            this.player.play('player-walk', true);
                        }
                    } else if (this.anims.exists('player-idle')) {
                        if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'player-idle') {
                            this.player.play('player-idle', true);
                        }
                    }
                }
            }

            private handleGunAiming() {
                this.gun.setPosition(this.player.x, this.player.y);

                const activePointer = this.input.activePointer;
                const angle = Phaser.Math.Angle.Between(
                    this.player.x, 
                    this.player.y, 
                    activePointer.worldX, 
                    activePointer.worldY
                );

                this.gun.setRotation(angle);

                if (activePointer.worldX < this.player.x) {
                    this.player.setScale(-1, 1);
                } else {
                    this.player.setScale(1, 1);
                }
            }

            private handleShooting(_pointer: Phaser.Input.Pointer) {
                if (!this.player.active || this.isReloading) return;
                if (this.currentWeapon.ammo <= 0) {
                    this.reloadWeapon();
                    return;
                }

                const now = this.time.now;
                if (now - this.lastFired < this.currentWeapon.fireRate) return;
                this.lastFired = now;

                const baseAngle = this.gun.rotation;
                
                // Handle different weapon types
                if (this.currentWeapon.type === WeaponType.ROCKET_LAUNCHER) {
                    this.fireRocket(baseAngle);
                } else {
                    this.fireBullets(baseAngle);
                }

                this.currentWeapon.ammo--;
                
                // Auto-reload when empty
                if (this.currentWeapon.ammo <= 0) {
                    this.reloadWeapon();
                }
            }

            private fireBullets(baseAngle: number) {
                const vec = new Phaser.Math.Vector2();
                vec.setToPolar(this.gun.rotation, 30);
                const spawnX = this.player.x + vec.x;
                const spawnY = this.player.y + vec.y;

                // Fire multiple bullets for shotgun
                for (let i = 0; i < this.currentWeapon.bulletCount; i++) {
                    const spread = (Math.random() - 0.5) * Phaser.Math.DegToRad(this.currentWeapon.spread);
                    const angle = baseAngle + spread;
                    
                    const bullet = this.bullets.get(spawnX, spawnY);
                    if (bullet) {
                        bullet.setActive(true);
                        bullet.setVisible(true);
                        bullet.setTint(this.currentWeapon.color);
                        bullet.setScale(this.currentWeapon.size / 4);
                        
                        if (bullet.body) {
                            bullet.body.enable = true;
                            bullet.body.reset(spawnX, spawnY);
                        }
                        
                        this.physics.velocityFromRotation(angle, this.currentWeapon.bulletSpeed, bullet.body.velocity);
                    }
                }
                
                this.cameras.main.shake(30, 0.003);
            }

            private fireRocket(baseAngle: number) {
                const vec = new Phaser.Math.Vector2();
                vec.setToPolar(this.gun.rotation, 30);
                const spawnX = this.player.x + vec.x;
                const spawnY = this.player.y + vec.y;

                const rocket = this.rockets.get(spawnX, spawnY);
                if (rocket) {
                    rocket.setActive(true);
                    rocket.setVisible(true);
                    
                    if (rocket.body) {
                        rocket.body.enable = true;
                        rocket.body.reset(spawnX, spawnY);
                    }
                    
                    this.physics.velocityFromRotation(baseAngle, this.currentWeapon.bulletSpeed, rocket.body.velocity);
                }
                
                this.cameras.main.shake(100, 0.01);
            }

            private reloadWeapon() {
                if (this.isReloading || this.currentWeapon.ammo === this.currentWeapon.maxAmmo) return;
                
                this.isReloading = true;
                this.time.delayedCall(this.currentWeapon.reloadTime, () => {
                    this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
                    this.isReloading = false;
                });
            }

            private switchWeapon(num: number) {
                const weaponTypes = [
                    WeaponType.PISTOL,
                    WeaponType.RIFLE,
                    WeaponType.SHOTGUN,
                    WeaponType.SNIPER,
                    WeaponType.ROCKET_LAUNCHER,
                    WeaponType.MINIGUN,
                ];
                
                if (num <= weaponTypes.length) {
                    this.currentWeapon = { ...WEAPONS[weaponTypes[num - 1]] };
                    this.isReloading = false;
                }
            }

            private throwGrenade() {
                if (this.grenadeCount <= 0) return;
                
                this.grenadeCount--;
                const vec = new Phaser.Math.Vector2();
                vec.setToPolar(this.gun.rotation, 30);
                const spawnX = this.player.x + vec.x;
                const spawnY = this.player.y + vec.y;

                const grenade = this.grenades.get(spawnX, spawnY);
                if (grenade) {
                    grenade.setActive(true);
                    grenade.setVisible(true);
                    
                    if (grenade.body) {
                        grenade.body.enable = true;
                        grenade.body.reset(spawnX, spawnY);
                        grenade.body.setBounce(0.6);
                    }
                    
                    const throwSpeed = 400;
                    this.physics.velocityFromRotation(this.gun.rotation, throwSpeed, grenade.body.velocity);
                    grenade.body.velocity.y -= 200; // Add upward arc
                    
                    // Explode after 2 seconds
                    this.time.delayedCall(2000, () => {
                        if (grenade.active) {
                            this.explodeGrenade(grenade.x, grenade.y);
                            grenade.setActive(false);
                            grenade.setVisible(false);
                            if (grenade.body) grenade.body.enable = false;
                        }
                    });
                }
            }

            private explodeGrenade(x: number, y: number) {
                // Visual explosion
                this.createExplosion(x, y, 0x00ff00, 15);
                
                // Damage enemies
                this.enemies.children.each((enemy: any) => {
                    if (!enemy.active) return true;
                    const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                    if (distance < GAME_CONFIG.GRENADE_EXPLOSION_RADIUS) {
                        const enemyData = this.enemyList.find(e => e.sprite === enemy);
                        if (enemyData) {
                            enemyData.health -= GAME_CONFIG.GRENADE_DAMAGE;
                            if (enemyData.health <= 0) {
                                this.killEnemy(enemyData);
                            }
                        }
                    }
                    return true;
                });
                
                // Damage player if too close
                const playerDistance = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
                if (playerDistance < GAME_CONFIG.GRENADE_EXPLOSION_RADIUS) {
                    this.takeDamage(GAME_CONFIG.GRENADE_DAMAGE / 2);
                }
            }

            private takeDamage(amount: number) {
                this.playerHealth -= amount;
                if (this.playerHealth <= 0) {
                    this.playerHealth = 0;
                    this.gameOver();
                }
                this.cameras.main.shake(100, 0.01);
            }

            private gameOver() {
                // Stop the game
                this.physics.pause();
                this.scene.pause();
                
                // Show game over text
                this.add.text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY,
                    'GAME OVER\nPress R to Restart',
                    {
                        fontSize: '48px',
                        color: '#ff0000',
                        fontFamily: 'Arial',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 6
                    }
                ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
                
                this.input.keyboard!.once('keydown-R', () => {
                    this.scene.restart();
                });
            }

            // =======================
            // Enemy Functions
            // =======================

            private spawnEnemy() {
                const x = Phaser.Math.Between(400, this.bgSprite.width - 400);
                const y = Phaser.Math.Between(100, 400);
                
                const enemySprite = this.add.sprite(x, y, 'robot');
                this.physics.add.existing(enemySprite);
                const body = enemySprite.body as Phaser.Physics.Arcade.Body;
                body.setSize(24, 40); // Set collision box size
                body.setCollideWorldBounds(true);
                body.setDragX(500);
                
                this.enemies.add(enemySprite);
                
                const weaponType = Phaser.Math.RND.pick([
                    WeaponType.PISTOL,
                    WeaponType.RIFLE,
                    WeaponType.SHOTGUN,
                ]) as WeaponType;
                
                const enemy: Enemy = {
                    sprite: enemySprite as Phaser.GameObjects.Sprite,
                    health: GAME_CONFIG.ENEMY_MAX_HEALTH,
                    maxHealth: GAME_CONFIG.ENEMY_MAX_HEALTH,
                    lastShot: 0,
                    weapon: { ...WEAPONS[weaponType] },
                    targetAngle: 0,
                    moveDirection: Phaser.Math.RND.pick([-1, 1]),
                    lastDirectionChange: 0,
                };
                
                this.enemyList.push(enemy);
            }

            private updateEnemies(time: number) {
                this.enemyList.forEach(enemy => {
                    if (!enemy.sprite.active) return;
                    
                    const body = enemy.sprite.body as Phaser.Physics.Arcade.Body;
                    const distanceToPlayer = Phaser.Math.Distance.Between(
                        enemy.sprite.x,
                        enemy.sprite.y,
                        this.player.x,
                        this.player.y
                    );
                    
                    const isMoving = Math.abs(body.velocity.x) > 10;
                    const isJumping = body.velocity.y < -50;
                    
                    // Simple AI: move towards player and shoot
                    if (distanceToPlayer < 600) {
                        // Move towards player
                        if (enemy.sprite.x < this.player.x - 50) {
                            body.setVelocityX(100);
                            // Flip sprite to face direction
                            enemy.sprite.setScale(1, 1);
                        } else if (enemy.sprite.x > this.player.x + 50) {
                            body.setVelocityX(-100);
                            // Flip sprite to face direction
                            enemy.sprite.setScale(-1, 1);
                        }
                        
                        // Jump/jetpack occasionally
                        if (Math.random() < 0.01) {
                            body.setVelocityY(-300);
                        }
                        
                        // Shoot at player
                        if (time - enemy.lastShot > enemy.weapon.fireRate && distanceToPlayer < 500) {
                            this.enemyShoot(enemy);
                            enemy.lastShot = time;
                        }
                    } else {
                        // Wander around
                        if (time - enemy.lastDirectionChange > 2000) {
                            enemy.moveDirection *= -1;
                            enemy.lastDirectionChange = time;
                        }
                        body.setVelocityX(50 * enemy.moveDirection);
                        enemy.sprite.setScale(enemy.moveDirection > 0 ? 1 : -1, 1);
                    }
                    
                    // Handle enemy animations if sprite exists
                    if (enemy.sprite instanceof Phaser.GameObjects.Sprite) {
                        if (isJumping && this.anims.exists('enemy-jump')) {
                            if (!enemy.sprite.anims.isPlaying || enemy.sprite.anims.currentAnim?.key !== 'enemy-jump') {
                                enemy.sprite.play('enemy-jump', true);
                            }
                        } else if (isMoving && this.anims.exists('enemy-walk')) {
                            if (!enemy.sprite.anims.isPlaying || enemy.sprite.anims.currentAnim?.key !== 'enemy-walk') {
                                enemy.sprite.play('enemy-walk', true);
                            }
                        } else if (this.anims.exists('enemy-idle')) {
                            if (!enemy.sprite.anims.isPlaying || enemy.sprite.anims.currentAnim?.key !== 'enemy-idle') {
                                enemy.sprite.play('enemy-idle', true);
                            }
                        }
                    }
                });
            }

            private enemyShoot(enemy: Enemy) {
                const angle = Phaser.Math.Angle.Between(
                    enemy.sprite.x,
                    enemy.sprite.y,
                    this.player.x,
                    this.player.y
                );
                
                const vec = new Phaser.Math.Vector2();
                vec.setToPolar(angle, 20);
                const spawnX = enemy.sprite.x + vec.x;
                const spawnY = enemy.sprite.y + vec.y;
                
                const bullet = this.bullets.get(spawnX, spawnY);
                if (bullet) {
                    bullet.setActive(true);
                    bullet.setVisible(true);
                    bullet.setTint(0xff0000); // Red for enemy bullets
                    bullet.setScale(enemy.weapon.size / 4);
                    
                    if (bullet.body) {
                        bullet.body.enable = true;
                        bullet.body.reset(spawnX, spawnY);
                    }
                    
                    this.physics.velocityFromRotation(angle, enemy.weapon.bulletSpeed, bullet.body.velocity);
                }
            }

            private killEnemy(enemy: Enemy) {
                this.createExplosion(enemy.sprite.x, enemy.sprite.y, 0xe74c3c, 10);
                enemy.sprite.destroy();
                useGameStore.getState().increaseScore(100);
                this.enemyList = this.enemyList.filter(e => e !== enemy);
            }

            // =======================
            // Power-up Functions
            // =======================

            private spawnPowerUp() {
                const x = Phaser.Math.Between(200, this.bgSprite.width - 200);
                const y = Phaser.Math.Between(100, this.bgSprite.height - 200);
                
                const powerUpType = Phaser.Math.RND.pick(['weapon', 'health', 'ammo']);
                const weaponType = powerUpType === 'weapon' 
                    ? Phaser.Math.RND.pick([
                        WeaponType.RIFLE,
                        WeaponType.SHOTGUN,
                        WeaponType.SNIPER,
                        WeaponType.ROCKET_LAUNCHER,
                        WeaponType.MINIGUN,
                    ]) as WeaponType
                    : undefined;
                
                const powerUpSprite = this.add.rectangle(x, y, 16, 16, 0xffff00);
                this.powerUps.add(powerUpSprite);
                
                // Add pulsing animation
                this.tweens.add({
                    targets: powerUpSprite,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                
                const powerUp: PowerUp = {
                    sprite: powerUpSprite,
                    type: powerUpType as any,
                    weaponType,
                    collected: false,
                };
                
                this.powerUpList.push(powerUp);
            }

            private onPowerUpCollect(_player: Phaser.GameObjects.Rectangle, powerUp: Phaser.GameObjects.Rectangle) {
                const powerUpData = this.powerUpList.find(p => p.sprite === powerUp && !p.collected);
                if (!powerUpData) return;
                
                powerUpData.collected = true;
                
                if (powerUpData.type === 'weapon' && powerUpData.weaponType) {
                    this.currentWeapon = { ...WEAPONS[powerUpData.weaponType] };
                } else if (powerUpData.type === 'health') {
                    this.playerHealth = Math.min(GAME_CONFIG.PLAYER_MAX_HEALTH, this.playerHealth + 30);
                } else if (powerUpData.type === 'ammo') {
                    this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
                }
                
                this.createPickupEffect(powerUp.x, powerUp.y);
                powerUp.destroy();
                this.powerUpList = this.powerUpList.filter(p => p !== powerUpData);
            }

            // =======================
            // Collision Handlers
            // =======================

            private onBulletHitWall(bullet: Phaser.GameObjects.Image, _wall: Phaser.GameObjects.Rectangle) {
                this.createImpactEffect(bullet.x, bullet.y, bullet.tintTopLeft);
                if (bullet.body) {
                    (bullet.body as Phaser.Physics.Arcade.Body).enable = false;
                }
                bullet.setActive(false);
                bullet.setVisible(false);
            }

            private onBulletHitEnemy(bullet: Phaser.GameObjects.Image, enemy: Phaser.GameObjects.Rectangle) {
                // Disable bullet physics immediately so it doesn't hit multiple times
                // When bullet hits enemy:
useGameStore.getState().addKill();
                if (bullet.body) {
                    (bullet.body as Phaser.Physics.Arcade.Body).enable = false;
                }
                bullet.setActive(false);
                bullet.setVisible(false);

                const enemyData = this.enemyList.find(e => e.sprite === enemy);
                if (!enemyData) return;

                // --- NEW: CHECK FOR BANISHMENT ---
                if (this.currentWeapon.type === WeaponType.BANISHER) {
                    this.banishEnemy(enemyData); // <--- Trigger the glitch effect
                    return; // Stop here, do not deal normal damage
                }
                // ---------------------------------

                // Standard Damage Logic
                enemyData.health -= this.currentWeapon.damage;
                this.createImpactEffect(bullet.x, bullet.y, 0xe74c3c);
                
                if (enemyData.health <= 0) {
                    this.killEnemy(enemyData);
                }
            }

            private onRocketHitWall(rocket: Phaser.GameObjects.Image, _wall: Phaser.GameObjects.Rectangle) {
                this.explodeRocket(rocket.x, rocket.y);
                if (rocket.body) {
                    (rocket.body as Phaser.Physics.Arcade.Body).enable = false;
                }
                rocket.setActive(false);
                rocket.setVisible(false);
            }

            private onRocketHitEnemy(rocket: Phaser.GameObjects.Image, enemy: Phaser.GameObjects.Rectangle) {
                this.explodeRocket(rocket.x, rocket.y);
                const enemyData = this.enemyList.find(e => e.sprite === enemy);
                if (enemyData) {
                    enemyData.health -= this.currentWeapon.damage;
                    if (enemyData.health <= 0) {
                        this.killEnemy(enemyData);
                    }
                }
                
                if (rocket.body) {
                    (rocket.body as Phaser.Physics.Arcade.Body).enable = false;
                }
                rocket.setActive(false);
                rocket.setVisible(false);
            }

            private onRocketHitPlayer(rocket: Phaser.GameObjects.Image, _player: Phaser.GameObjects.Rectangle) {
                this.explodeRocket(rocket.x, rocket.y);
                if (rocket.body) {
                    (rocket.body as Phaser.Physics.Arcade.Body).enable = false;
                }
                rocket.setActive(false);
                rocket.setVisible(false);
            }

            private explodeRocket(x: number, y: number) {
                this.createExplosion(x, y, 0xff0000, 20);
                
                // Area damage
                this.enemies.children.each((enemy: any) => {
                    if (!enemy.active) return true;
                    const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                    if (distance < 100) {
                        const enemyData = this.enemyList.find(e => e.sprite === enemy);
                        if (enemyData) {
                            enemyData.health -= this.currentWeapon.damage * (1 - distance / 100);
                            if (enemyData.health <= 0) {
                                this.killEnemy(enemyData);
                            }
                        }
                    }
                    return true;
                });
                
                const playerDistance = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
                if (playerDistance < 100) {
                    this.takeDamage(this.currentWeapon.damage * 0.5 * (1 - playerDistance / 100));
                }
            }

            private onGrenadeHitWall(_grenade: Phaser.GameObjects.Image, _wall: Phaser.GameObjects.Rectangle) {
                // Grenades bounce, handled in throwGrenade
            }

            // =======================
            // Effect Functions
            // =======================

            private createImpactEffect(x: number, y: number, color: number) {
                const emitter = this.add.particles(x, y, 'pixel', {
                    speed: { min: 30, max: 100 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.6, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 150,
                    tint: color,
                    emitting: false
                });
                emitter.explode(3);
                this.time.delayedCall(200, () => emitter.destroy());
            }

            private createExplosion(x: number, y: number, color: number, particleCount: number) {
                const emitter = this.add.particles(x, y, 'pixel', {
                    speed: { min: 100, max: 300 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1.5, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 400,
                    tint: color,
                    emitting: false
                });
                emitter.explode(particleCount);
                this.time.delayedCall(450, () => emitter.destroy());
                
                // Screen shake
                this.cameras.main.shake(200, 0.02);
            }

            private createPickupEffect(x: number, y: number) {
                const emitter = this.add.particles(x, y, 'pixel', {
                    speed: { min: 50, max: 150 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 300,
                    tint: 0xffff00,
                    emitting: false
                });
                emitter.explode(10);
                this.time.delayedCall(350, () => emitter.destroy());
            }

            private createJetpackParticles() {
                const emitter = this.add.particles(this.player.x, this.player.y + 20, 'pixel', {
                    speed: { min: 50, max: 100 },
                    angle: { min: 80, max: 100 },
                    scale: { start: 0.4, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 200,
                    tint: 0x00ffff,
                    emitting: true,
                    frequency: 50
                });
                
                this.time.delayedCall(100, () => {
                    emitter.stop();
                    this.time.delayedCall(300, () => emitter.destroy());
                });
            }

            // =======================
            // Cleanup Functions
            // =======================

            private cleanupBullets() {
                this.bullets.children.each((b: any) => {
                    if (b.active && (
                        b.y < 0 || 
                        b.y > this.physics.world.bounds.height || 
                        b.x < 0 || 
                        b.x > this.physics.world.bounds.width
                    )) {
                        if (b.body) b.body.enable = false;
                        b.setActive(false);
                        b.setVisible(false);
                    }
                    return true;
                });
            }

            private cleanupRockets() {
                this.rockets.children.each((r: any) => {
                    if (r.active && (
                        r.y < 0 || 
                        r.y > this.physics.world.bounds.height || 
                        r.x < 0 || 
                        r.x > this.physics.world.bounds.width
                    )) {
                        if (r.body) r.body.enable = false;
                        r.setActive(false);
                        r.setVisible(false);
                    }
                    return true;
                });
            }

            private updateGrenades(_time: number) {
                // Grenades are handled in throwGrenade with delayed calls
            }
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: '100%',
                height: '100%',
            },
            parent: 'phaser-game',
            physics: {
                default: 'arcade',
                arcade: { 
                    gravity: { x: 0, y: GAME_CONFIG.GRAVITY_Y }, 
                    debug: false
                }
            },
            scene: MainScene
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        return () => {
            game.destroy(true);
            gameRef.current = null;
        };
    }, []);

    return (
        <div 
            id="phaser-game" 
            className="w-screen h-screen overflow-hidden m-0 p-0 block cursor-crosshair"
        />
    );
};

export default Game;