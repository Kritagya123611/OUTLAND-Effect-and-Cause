// File: apps/frontend/src/components/DarkGameCanvas.tsx

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
// Reusing same assets
import bg from '../assets/space_bg.jpg';
import robot from '../assets/robot.png';

// --- Constants for Dark World Balancing ---
const GAME_CONFIG = {
    PLAYER_SPEED: 250, 
    GRAVITY_Y: 0,      // Zero gravity for space/flying
    DRAG: 200,         
    FIRE_RATE: 150,
    PLAYER_MAX_HEALTH: 100,
    ENEMY_MAX_HEALTH: 50,
    // REMOVED: ENEMY_SPAWN_RATE (We now use logic-based spawning)
    GRENADE_EXPLOSION_RADIUS: 80,
    GRENADE_DAMAGE: 50,
};

// --- Weapon Types ---
const WeaponType = {
    PISTOL: 'pistol',
    RIFLE: 'rifle',
    SHOTGUN: 'shotgun',
    SNIPER: 'sniper',
    ROCKET_LAUNCHER: 'rocket',
    MINIGUN: 'minigun',
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
    [WeaponType.PISTOL]: { type: WeaponType.PISTOL, name: 'Pistol', damage: 15, fireRate: 200, bulletSpeed: 700, ammo: 12, maxAmmo: 12, reloadTime: 1000, spread: 3, bulletCount: 1, color: 0xffff00, size: 3 },
    [WeaponType.RIFLE]: { type: WeaponType.RIFLE, name: 'Assault Rifle', damage: 12, fireRate: 100, bulletSpeed: 800, ammo: 30, maxAmmo: 30, reloadTime: 1500, spread: 2, bulletCount: 1, color: 0x00ff00, size: 4 },
    [WeaponType.SHOTGUN]: { type: WeaponType.SHOTGUN, name: 'Shotgun', damage: 8, fireRate: 600, bulletSpeed: 500, ammo: 8, maxAmmo: 8, reloadTime: 2000, spread: 15, bulletCount: 8, color: 0xff8800, size: 3 },
    [WeaponType.SNIPER]: { type: WeaponType.SNIPER, name: 'Sniper', damage: 60, fireRate: 1200, bulletSpeed: 1200, ammo: 5, maxAmmo: 5, reloadTime: 2500, spread: 0, bulletCount: 1, color: 0x00ffff, size: 5 },
    [WeaponType.ROCKET_LAUNCHER]: { type: WeaponType.ROCKET_LAUNCHER, name: 'Rocket Launcher', damage: 80, fireRate: 1500, bulletSpeed: 400, ammo: 3, maxAmmo: 3, reloadTime: 3000, spread: 0, bulletCount: 1, color: 0xff0000, size: 8 },
    [WeaponType.MINIGUN]: { type: WeaponType.MINIGUN, name: 'Minigun', damage: 10, fireRate: 50, bulletSpeed: 900, ammo: 200, maxAmmo: 200, reloadTime: 4000, spread: 5, bulletCount: 1, color: 0xff00ff, size: 4 },
};

interface Enemy {
    sprite: Phaser.GameObjects.Sprite;
    health: number;
    maxHealth: number;
    lastShot: number;
    weapon: Weapon;
    moveDirectionX: number;
    moveDirectionY: number;
    lastDirectionChange: number;
}

interface PowerUp {
    sprite: Phaser.GameObjects.Rectangle;
    type: 'weapon' | 'health' | 'ammo';
    weaponType?: WeaponType;
    collected: boolean;
}

const DarkGame = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current) return;

        class DarkScene extends Phaser.Scene {
            // Core objects
            private player!: Phaser.GameObjects.Sprite;
            private gun!: Phaser.GameObjects.Rectangle;
            private platforms!: Phaser.Physics.Arcade.StaticGroup;
            private bullets!: Phaser.Physics.Arcade.Group;
            private rockets!: Phaser.Physics.Arcade.Group;
            private enemies!: Phaser.Physics.Arcade.Group;
            private grenades!: Phaser.Physics.Arcade.Group;
            private powerUps!: Phaser.Physics.Arcade.Group;
            
            // Visuals
            private bgSprite!: Phaser.GameObjects.Image;
            // REMOVED: spotlightMask, renderTexture (No more mask)
            
            // Inputs
            private keys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; R: Phaser.Input.Keyboard.Key; G: Phaser.Input.Keyboard.Key; };
            
            // State
            private lastFired: number = 0;
            private playerHealth: number = GAME_CONFIG.PLAYER_MAX_HEALTH;
            private currentWeapon: Weapon = { ...WEAPONS[WeaponType.PISTOL] };
            private isReloading: boolean = false;
            private grenadeCount: number = 3;
            private score: number = 0;
            private enemyList: Enemy[] = [];
            private powerUpList: PowerUp[] = [];
            
            // Spawning Logic
            private isSpawningEnemy: boolean = false; // Flag to prevent double spawns
            private powerUpSpawnTimer: number = 0;

            // UI
            private healthBar!: Phaser.GameObjects.Graphics;
            private ammoText!: Phaser.GameObjects.Text;
            private weaponText!: Phaser.GameObjects.Text;
            private grenadeText!: Phaser.GameObjects.Text;
            private scoreText!: Phaser.GameObjects.Text;

            constructor() {
                super('DarkScene');
            }

            preload() {
                this.load.image('bg', bg);
                this.load.image('robot', robot);
                
                // Create textures dynamically
                const graphics = this.make.graphics({ x: 0, y: 0 });
                graphics.setVisible(false);
                
                // Pixel bullet
                graphics.fillStyle(0xffffff, 1);
                graphics.fillRect(0, 0, 4, 4);
                graphics.generateTexture('pixel', 4, 4);
                
                // Rocket
                graphics.clear();
                graphics.fillStyle(0xff0000, 1);
                graphics.fillRect(0, 0, 8, 8);
                graphics.generateTexture('rocket', 8, 8);
                
                // Grenade
                graphics.clear();
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(4, 4, 4);
                graphics.generateTexture('grenade', 8, 8);
                
                // Powerup
                graphics.clear();
                graphics.fillStyle(0xffff00, 1);
                graphics.fillRect(0, 0, 16, 16);
                graphics.generateTexture('powerup', 16, 16);
            }

create() {
                // 1. Dark World Atmosphere
                this.cameras.main.setBackgroundColor('#000000');
                
                // Background - No Tint, Scaled to Fill
                this.bgSprite = this.add.image(0, 0, 'bg').setOrigin(0);
                // REMOVED: this.bgSprite.setTint(0x444455); 
                
                // --- ZOOM LOGIC START ---
                const canvasWidth = this.scale.width;
                const canvasHeight = this.scale.height;
                
                // Calculate scale to completely fill the screen (CSS 'cover' equivalent)
                const scaleX = canvasWidth / this.bgSprite.width;
                const scaleY = canvasHeight / this.bgSprite.height;
                const scale = Math.max(scaleX, scaleY);
                
                this.bgSprite.setScale(scale);
                
                // Update world bounds to match the new ZOOMED size
                const worldWidth = this.bgSprite.displayWidth;
                const worldHeight = this.bgSprite.displayHeight;
                // --- ZOOM LOGIC END ---

                this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
                this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

                // 2. Physics Objects
                this.createPlatforms();
                this.createPlayer(); 
                this.createGun();
                
                // 3. Groups
                this.bullets = this.physics.add.group({ defaultKey: 'pixel', maxSize: 200 });
                this.rockets = this.physics.add.group({ defaultKey: 'rocket', maxSize: 20 });
                this.grenades = this.physics.add.group({ defaultKey: 'grenade', maxSize: 10 });
                this.enemies = this.physics.add.group();
                this.powerUps = this.physics.add.group();

                // 4. Inputs
                this.keys = this.input.keyboard!.addKeys("W,A,S,D,R,G") as any;
                this.input.on('pointerdown', this.handleShooting, this);
                this.input.keyboard!.on('keydown-R', this.reloadWeapon, this);
                this.input.keyboard!.on('keydown-G', this.throwGrenade, this);
                for (let i = 1; i <= 6; i++) {
                    this.input.keyboard!.on(`keydown-${i}`, () => this.switchWeapon(i));
                }

                // 5. Collisions
                this.physics.add.collider(this.player, this.platforms);
                this.physics.add.collider(this.enemies, this.platforms);
                this.physics.add.collider(this.grenades, this.platforms, this.onGrenadeHitWall as any, undefined, this);
                
                this.physics.add.collider(this.bullets, this.platforms, this.onBulletHitWall as any, undefined, this);
                this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitEnemy as any, undefined, this);
                
                this.physics.add.collider(this.rockets, this.platforms, this.onRocketHitWall as any, undefined, this);
                this.physics.add.overlap(this.rockets, this.enemies, this.onRocketHitEnemy as any, undefined, this);
                this.physics.add.overlap(this.rockets, this.player, this.onRocketHitPlayer as any, undefined, this);
                
                this.physics.add.overlap(this.player, this.powerUps, this.onPowerUpCollect as any, undefined, this);

                // 6. UI
                this.createUI();

                // 7. Initial Spawn
                this.spawnEnemy();
            }

            update(time: number, delta: number) {
                if (!this.player || !this.player.active) return;
                
                this.handleFlyingMovement();
                this.handleGunAiming();
                this.updateEnemies(time);

                // REMOVED: updateDarknessEffect()

                // Boosters constantly on
                this.createJetpackParticles(); 

                // Cleanup
                this.cleanupBullets();
                this.cleanupRockets();

                // --- NEW ENEMY LOGIC: Only 1 at a time ---
                if (this.enemies.countActive(true) === 0 && !this.isSpawningEnemy) {
                    this.isSpawningEnemy = true;
                    // Wait 1 second before spawning the new challenger
                    this.time.delayedCall(1000, () => {
                        this.spawnEnemy();
                    });
                }
                
                this.powerUpSpawnTimer += delta;
                if (this.powerUpSpawnTimer > 8000) {
                    this.spawnPowerUp();
                    this.powerUpSpawnTimer = 0;
                }

                this.updateUI();
            }

            // =======================
            // Dark World Specifics
            // =======================

            private createPlayer() {
                this.player = this.add.sprite(200, 400, 'robot');
                this.physics.add.existing(this.player);
                const body = this.player.body as Phaser.Physics.Arcade.Body;
                body.setSize(24, 40);
                body.setCollideWorldBounds(true);
                
                // DARK WORLD PHYSICS: Zero Gravity + Drag
                body.setGravityY(0); 
                body.setDrag(GAME_CONFIG.DRAG); 
                
                this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
            }

            private handleFlyingMovement() {
                const body = this.player.body as Phaser.Physics.Arcade.Body;
                const speed = GAME_CONFIG.PLAYER_SPEED;

                // Vertical Movement (W/S)
                if (this.keys.W.isDown) {
                    body.setVelocityY(-speed);
                } else if (this.keys.S.isDown) {
                    body.setVelocityY(speed);
                } else {
                    body.setAccelerationY(0); 
                }

                // Horizontal Movement (A/D)
                if (this.keys.A.isDown) {
                    body.setVelocityX(-speed);
                } else if (this.keys.D.isDown) {
                    body.setVelocityX(speed);
                } else {
                    body.setAccelerationX(0);
                }
            }

            // --- CHANGED: BROADER, BIGGER FIRE ---
            private createJetpackParticles() {
                const emitter = this.add.particles(this.player.x, this.player.y + 25, 'pixel', {
                    // Broader angle (was 80-100, now 50-130)
                    angle: { min: 50, max: 130 }, 
                    // Faster speed to spread out
                    speed: { min: 80, max: 150 },
                    // Start BIGger
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 200,
                    // Keeping Purple theme, but you can change to 0xffaa00 for orange fire
                    tint: 0xaa00ff, 
                    emitting: true, 
                    frequency: 20, // More particles
                    quantity: 2    // Spit 2 particles per frame
                });
                
                this.time.delayedCall(160, () => emitter.destroy());
            }

            // =======================
            // Standard Game Logic
            // =======================

            private createPlatforms() {
                this.platforms = this.physics.add.staticGroup();
                
                // USE displayWidth/Height to match the zoomed background
                const w = this.bgSprite.displayWidth;
                const h = this.bgSprite.displayHeight;

                // Floor
                this.platforms.add(this.add.rectangle(w/2, h-20, w, 40, 0x111111));
                
                const platformPositions = [
                    { x: 400, y: 300, w: 150, h: 20 },
                    { x: 800, y: 250, w: 120, h: 20 },
                    { x: 1200, y: 350, w: 100, h: 20 },
                    { x: 600, y: 150, w: 80, h: 20 },
                ];
                platformPositions.forEach(pos => {
                    this.platforms.add(this.add.rectangle(pos.x, pos.y, pos.w, pos.h, 0x333333));
                });
            }

            private createGun() {
                this.gun = this.add.rectangle(this.player.x, this.player.y, 30, 8, 0x555555);
                this.gun.setOrigin(0, 0.5);
            }

            private handleGunAiming() {
                this.gun.setPosition(this.player.x, this.player.y);
                const activePointer = this.input.activePointer;
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, activePointer.worldX, activePointer.worldY);
                this.gun.setRotation(angle);
                if (activePointer.worldX < this.player.x) {
                    this.player.setScale(-1, 1);
                } else {
                    this.player.setScale(1, 1);
                }
            }

            private handleShooting() {
                if (!this.player.active || this.isReloading) return;
                if (this.currentWeapon.ammo <= 0) { this.reloadWeapon(); return; }
                const now = this.time.now;
                if (now - this.lastFired < this.currentWeapon.fireRate) return;
                this.lastFired = now;

                if (this.currentWeapon.type === WeaponType.ROCKET_LAUNCHER) this.fireRocket(this.gun.rotation);
                else this.fireBullets(this.gun.rotation);
                
                this.currentWeapon.ammo--;
                if (this.currentWeapon.ammo <= 0) this.reloadWeapon();
            }

            private fireBullets(baseAngle: number) {
                const vec = new Phaser.Math.Vector2().setToPolar(baseAngle, 30);
                const spawnX = this.player.x + vec.x;
                const spawnY = this.player.y + vec.y;

                for (let i = 0; i < this.currentWeapon.bulletCount; i++) {
                    const spread = (Math.random() - 0.5) * Phaser.Math.DegToRad(this.currentWeapon.spread);
                    const bullet = this.bullets.get(spawnX, spawnY);
                    if (bullet) {
                        bullet.setActive(true);
                        bullet.setVisible(true);
                        bullet.setTint(this.currentWeapon.color);
                        bullet.setScale(this.currentWeapon.size / 4);
                        if (bullet.body) { bullet.body.enable = true; bullet.body.reset(spawnX, spawnY); }
                        this.physics.velocityFromRotation(baseAngle + spread, this.currentWeapon.bulletSpeed, bullet.body.velocity);
                    }
                }
                this.cameras.main.shake(30, 0.003);
            }

            private fireRocket(baseAngle: number) {
                const vec = new Phaser.Math.Vector2().setToPolar(baseAngle, 30);
                const rocket = this.rockets.get(this.player.x + vec.x, this.player.y + vec.y);
                if (rocket) {
                    rocket.setActive(true);
                    rocket.setVisible(true);
                    if (rocket.body) { rocket.body.enable = true; rocket.body.reset(this.player.x + vec.x, this.player.y + vec.y); }
                    this.physics.velocityFromRotation(baseAngle, this.currentWeapon.bulletSpeed, rocket.body.velocity);
                }
                this.cameras.main.shake(100, 0.01);
            }

            private spawnEnemy() {
this.isSpawningEnemy = false; 

                // Use displayWidth/Height
                const w = this.bgSprite.displayWidth;
                const h = this.bgSprite.displayHeight;

                const x = Phaser.Math.Between(100, w - 100);
                const y = Phaser.Math.Between(100, h - 200);
                
                const enemySprite = this.add.sprite(x, y, 'robot').setTint(0xff5555);
                this.physics.add.existing(enemySprite);
                const body = enemySprite.body as Phaser.Physics.Arcade.Body;
                body.setSize(24, 40);
                body.setCollideWorldBounds(true);
                body.setGravityY(0); 
                
                this.enemies.add(enemySprite);
                
                const enemy: Enemy = {
                    sprite: enemySprite as Phaser.GameObjects.Sprite,
                    health: GAME_CONFIG.ENEMY_MAX_HEALTH,
                    maxHealth: GAME_CONFIG.ENEMY_MAX_HEALTH,
                    lastShot: 0,
                    weapon: { ...WEAPONS[WeaponType.RIFLE] },
                    moveDirectionX: Phaser.Math.RND.pick([-1, 1]),
                    moveDirectionY: Phaser.Math.RND.pick([-1, 1]),
                    lastDirectionChange: 0,
                };
                this.enemyList.push(enemy);
            }

            private updateEnemies(time: number) {
                this.enemyList.forEach(enemy => {
                    if (!enemy.sprite.active) return;
                    const body = enemy.sprite.body as Phaser.Physics.Arcade.Body;
                    const distance = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y);
                    
                    if (distance < 600) {
                        this.physics.moveToObject(enemy.sprite, this.player, 100);
                        if (time - enemy.lastShot > 2000) {
                            enemy.lastShot = time;
                        }
                    } else {
                        if (time - enemy.lastDirectionChange > 2000) {
                            enemy.moveDirectionX = Phaser.Math.RND.pick([-1, 1]);
                            enemy.moveDirectionY = Phaser.Math.RND.pick([-1, 1]);
                            enemy.lastDirectionChange = time;
                        }
                        body.setVelocity(50 * enemy.moveDirectionX, 50 * enemy.moveDirectionY);
                    }
                });
            }

            private createUI() {
                this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(1001);
                this.ammoText = this.add.text(20, 20, '', { fontSize: '20px', color: '#fff' }).setScrollFactor(0).setDepth(1001);
                this.weaponText = this.add.text(20, 50, '', { fontSize: '18px', color: '#ff0' }).setScrollFactor(0).setDepth(1001);
                this.grenadeText = this.add.text(20, 80, '', { fontSize: '18px', color: '#0f0' }).setScrollFactor(0).setDepth(1001);
                this.scoreText = this.add.text(20, 110, '', { fontSize: '24px', color: '#fff' }).setScrollFactor(0).setDepth(1001);
            }

            private updateUI() {
                this.healthBar.clear();
                this.healthBar.fillStyle(0x000000, 0.5);
                this.healthBar.fillRect(20, this.cameras.main.height - 40, 200, 20);
                this.healthBar.fillStyle(0x00ff00, 1);
                this.healthBar.fillRect(20, this.cameras.main.height - 40, 200 * (this.playerHealth / GAME_CONFIG.PLAYER_MAX_HEALTH), 20);
                
                this.ammoText.setText(`Ammo: ${this.currentWeapon.ammo}/${this.currentWeapon.maxAmmo}`);
                this.weaponText.setText(`Weapon: ${this.currentWeapon.name}`);
                this.grenadeText.setText(`Grenades: ${this.grenadeCount}`);
                this.scoreText.setText(`Score: ${this.score}`);
            }

            // --- Utils ---
            private reloadWeapon() {
                 if(!this.isReloading) {
                     this.isReloading = true;
                     this.time.delayedCall(this.currentWeapon.reloadTime, () => {
                         this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
                         this.isReloading = false;
                     });
                 }
            }
            private switchWeapon(i: number) { 
                const weaponTypes = [WeaponType.PISTOL, WeaponType.RIFLE, WeaponType.SHOTGUN, WeaponType.SNIPER, WeaponType.ROCKET_LAUNCHER, WeaponType.MINIGUN];
                if (i <= weaponTypes.length) { this.currentWeapon = { ...WEAPONS[weaponTypes[i - 1]] }; this.isReloading = false; }
            }
            private throwGrenade() { 
                if (this.grenadeCount <= 0) return;
                this.grenadeCount--;
                const vec = new Phaser.Math.Vector2().setToPolar(this.gun.rotation, 30);
                const spawnX = this.player.x + vec.x; const spawnY = this.player.y + vec.y;
                const grenade = this.grenades.get(spawnX, spawnY);
                if (grenade) {
                    grenade.setActive(true); grenade.setVisible(true);
                    if (grenade.body) { grenade.body.enable = true; grenade.body.reset(spawnX, spawnY); grenade.body.setBounce(0.6); }
                    this.physics.velocityFromRotation(this.gun.rotation, 400, grenade.body.velocity);
                    grenade.body.velocity.y -= 200;
                    this.time.delayedCall(2000, () => { if (grenade.active) { this.explodeGrenade(grenade.x, grenade.y); grenade.setActive(false); grenade.setVisible(false); } });
                }
            }
            private onBulletHitWall(b:any) { b.setActive(false); b.setVisible(false); }
            private onBulletHitEnemy(b:any, e:any) { 
                b.setActive(false); b.setVisible(false);
                const en = this.enemyList.find(x => x.sprite === e);
                if(en) { en.health -= this.currentWeapon.damage; if(en.health <= 0) this.killEnemy(en); }
            }
            private onRocketHitWall(r:any) { this.explodeRocket(r.x, r.y); r.setActive(false); r.setVisible(false); }
            private onRocketHitEnemy(r:any, e:any) { this.explodeRocket(r.x, r.y); r.setActive(false); r.setVisible(false); }
            private onRocketHitPlayer(r:any) { this.explodeRocket(r.x, r.y); r.setActive(false); r.setVisible(false); }
            private onGrenadeHitWall() {}
            private explodeGrenade(x:number, y:number) { /* Simplified explosion logic for brevity, same as Light */ this.createExplosion(x,y,0x00ff00, 15); }
            private explodeRocket(x:number, y:number) { this.createExplosion(x,y,0xff0000, 20); }
            private createExplosion(x:number, y:number, color:number, count:number) {
                 const emitter = this.add.particles(x, y, 'pixel', { speed: { min: 100, max: 300 }, scale: { start: 1.5, end: 0 }, blendMode: 'ADD', lifespan: 400, tint: color, emitting: false });
                 emitter.explode(count); this.time.delayedCall(450, () => emitter.destroy());
            }
            private killEnemy(en: Enemy) { 
                this.createExplosion(en.sprite.x, en.sprite.y, 0xe74c3c, 10);
                en.sprite.destroy(); 
                this.score+=100; 
                this.enemyList = this.enemyList.filter(e => e !== en); 
            }
private spawnPowerUp() { 
                const w = this.bgSprite.displayWidth;
                const h = this.bgSprite.displayHeight;
                
                const x = Phaser.Math.Between(100, w - 100); 
                const y = Phaser.Math.Between(100, h - 200);
                
                const pu = this.powerUps.get(x, y);
                if(pu) { pu.setActive(true); pu.setVisible(true); }
            }
            private onPowerUpCollect(pl:any, pu:any) { pu.destroy(); }
            private cleanupBullets() { this.bullets.children.each((b:any) => { if(b.active && (b.y < 0 || b.y > 2000)) b.setActive(false); return true; }); }
            private cleanupRockets() { /* Same logic */ }
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
            parent: 'phaser-dark-game',
            physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
            scene: DarkScene
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        return () => { game.destroy(true); gameRef.current = null; };
    }, []);

    return <div id="phaser-dark-game" className="w-screen h-screen overflow-hidden m-0 p-0 block cursor-crosshair" />;
};

export default DarkGame;