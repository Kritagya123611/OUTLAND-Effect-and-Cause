// File: apps/frontend/src/components/DarkGameCanvas.tsx

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import bg from '../assets/space_bg.jpg';
import robot from '../assets/robot.png';
import { useGameStore } from '../stores/useGameStore';

// --- Constants ---
const GAME_CONFIG = {
    PLAYER_SPEED: 300, // Faster for more intense movement
    GRAVITY_Y: 0,
    DRAG: 200,
    PLAYER_MAX_HEALTH: 100,
    ENEMY_MAX_HEALTH: 50,
    METEOR_DAMAGE: 30, // Environmental hazard damage
};

// --- Weapon Types (Kept same, adjusted colors for Neon Glow) ---
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
    glowColor: number; // New: Specific glow for bloom effect
}

const WEAPONS: Record<WeaponType, Weapon> = {
    [WeaponType.PISTOL]: { type: WeaponType.PISTOL, name: 'Pistol', damage: 15, fireRate: 200, bulletSpeed: 700, ammo: 12, maxAmmo: 12, reloadTime: 1000, spread: 3, bulletCount: 1, color: 0xffff00, size: 3, glowColor: 0xffaa00 },
    [WeaponType.RIFLE]: { type: WeaponType.RIFLE, name: 'Assault Rifle', damage: 12, fireRate: 100, bulletSpeed: 800, ammo: 30, maxAmmo: 30, reloadTime: 1500, spread: 2, bulletCount: 1, color: 0x00ff00, size: 4, glowColor: 0x00ffaa },
    [WeaponType.SHOTGUN]: { type: WeaponType.SHOTGUN, name: 'Shotgun', damage: 8, fireRate: 600, bulletSpeed: 500, ammo: 8, maxAmmo: 8, reloadTime: 2000, spread: 15, bulletCount: 8, color: 0xff8800, size: 3, glowColor: 0xff4400 },
    [WeaponType.SNIPER]: { type: WeaponType.SNIPER, name: 'Sniper', damage: 60, fireRate: 1200, bulletSpeed: 1200, ammo: 5, maxAmmo: 5, reloadTime: 2500, spread: 0, bulletCount: 1, color: 0x00ffff, size: 5, glowColor: 0x00ffff },
    [WeaponType.ROCKET_LAUNCHER]: { type: WeaponType.ROCKET_LAUNCHER, name: 'Rocket Launcher', damage: 80, fireRate: 1500, bulletSpeed: 400, ammo: 3, maxAmmo: 3, reloadTime: 3000, spread: 0, bulletCount: 1, color: 0xff0000, size: 8, glowColor: 0xff0055 },
    [WeaponType.MINIGUN]: { type: WeaponType.MINIGUN, name: 'Minigun', damage: 10, fireRate: 50, bulletSpeed: 900, ammo: 200, maxAmmo: 200, reloadTime: 4000, spread: 5, bulletCount: 1, color: 0xff00ff, size: 4, glowColor: 0xff00ff },
};

// ... (Enemy and PowerUp interfaces remain same)
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
            private player!: Phaser.GameObjects.Sprite;
            private gun!: Phaser.GameObjects.Rectangle;
            //private platforms!: Phaser.Physics.Arcade.StaticGroup;
            private bullets!: Phaser.Physics.Arcade.Group;
            private rockets!: Phaser.Physics.Arcade.Group;
            private enemies!: Phaser.Physics.Arcade.Group;
            private grenades!: Phaser.Physics.Arcade.Group;
            private powerUps!: Phaser.Physics.Arcade.Group;
            
            // --- NEW: Hazards & FX ---
            private meteors!: Phaser.Physics.Arcade.Group; 
            private meteorTimer: number = 0;
            //private spaceDust!: Phaser.GameObjects.Particles.ParticleEmitter;

            private bgSprite!: Phaser.GameObjects.Image;
            //private vignette!: Phaser.GameObjects.Graphics; // Dark corners

            private keys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; R: Phaser.Input.Keyboard.Key; G: Phaser.Input.Keyboard.Key; };
            
            private lastFired: number = 0;
            private playerHealth: number = GAME_CONFIG.PLAYER_MAX_HEALTH;
            private currentWeapon: Weapon = { ...WEAPONS[WeaponType.PISTOL] };
            private isReloading: boolean = false;
            private grenadeCount: number = 3;
            private enemyList: Enemy[] = [];
            
            private isSpawningEnemy: boolean = false;
            private powerUpSpawnTimer: number = 0;

            constructor() {
                super('DarkScene');
            }

            preload() {
                this.load.image('bg', bg);
                this.load.image('robot', robot);
                
                const graphics = this.make.graphics({ x: 0, y: 0 });
                graphics.setVisible(false);
                
                // Bullet (White center, we will tint and glow it)
                graphics.fillStyle(0xffffff, 1);
                graphics.fillRect(0, 0, 4, 4);
                graphics.generateTexture('pixel', 4, 4);

                // Meteor Texture (Jagged Rock)
                graphics.clear();
                graphics.fillStyle(0x444444, 1);
                graphics.beginPath();
                graphics.moveTo(0, 10); graphics.lineTo(10, 0); graphics.lineTo(30, 5); graphics.lineTo(40, 20); graphics.lineTo(30, 40); graphics.lineTo(10, 35);
                graphics.closePath();
                graphics.fillPath();
                graphics.generateTexture('meteor', 40, 40);
                
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
                this.cameras.main.setBackgroundColor('#050505'); // Deep space black

                // 1. Background Setup
                this.bgSprite = this.add.image(0, 0, 'bg').setOrigin(0);
                this.bgSprite.setTint(0x666666); // Darken the BG slightly to make glowing elements pop
                
                const canvasWidth = this.scale.width;
                const canvasHeight = this.scale.height;
                const scaleX = canvasWidth / this.bgSprite.width;
                const scaleY = canvasHeight / this.bgSprite.height;
                const scale = Math.max(scaleX, scaleY);
                this.bgSprite.setScale(scale);
                
                const worldWidth = this.bgSprite.displayWidth;
                const worldHeight = this.bgSprite.displayHeight;

                this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
                this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

                // 2. Space Dust (Atmosphere)
                // Creates a sense of depth and "drift"
                

                // 3. Physics Groups
                
                this.createPlayer(); 
                this.createGun();
                
                this.bullets = this.physics.add.group({ defaultKey: 'pixel', maxSize: 200 });
                this.rockets = this.physics.add.group({ defaultKey: 'rocket', maxSize: 20 });
                this.grenades = this.physics.add.group({ defaultKey: 'grenade', maxSize: 10 });
                this.enemies = this.physics.add.group();
                this.powerUps = this.physics.add.group();
                this.meteors = this.physics.add.group(); // Hazards

                // 4. Controls
                this.keys = this.input.keyboard!.addKeys("W,A,S,D,R,G") as any;
                this.input.on('pointerdown', this.handleShooting, this);
                this.input.keyboard!.on('keydown-R', this.reloadWeapon, this);
                this.input.keyboard!.on('keydown-G', this.throwGrenade, this);
                for (let i = 1; i <= 6; i++) {
                    this.input.keyboard!.on(`keydown-${i}`, () => this.switchWeapon(i));
                }

                // 5. Collisions
                this.physics.add.overlap(this.rockets, this.enemies, this.onRocketHitEnemy as any, undefined, this);
                this.physics.add.overlap(this.rockets, this.player, this.onRocketHitPlayer as any, undefined, this);
                
                this.physics.add.overlap(this.player, this.powerUps, this.onPowerUpCollect as any, undefined, this);

                // --- Hazard Collisions ---
                // Meteors hit player
                this.physics.add.overlap(this.meteors, this.player, this.onMeteorHitPlayer as any, undefined, this);
                // Meteors destroy bullets (makes them effective cover)
                this.physics.add.overlap(this.meteors, this.bullets, (m: any, b: any) => { b.destroy(); this.createSparks(b.x, b.y, 0xffaa00); }, undefined, this);

                // 6. UI Vignette (Dark Corners - HUD feel)
                //this.createVignette();

                this.spawnEnemy();
            }

            update(time: number, delta: number) {
                if (!this.player || !this.player.active) return;
                
                this.handleFlyingMovement();
                this.handleGunAiming();
                this.updateEnemies(time);
                
                this.createJetpackParticles(); 
                
                this.cleanupBullets();
                this.cleanupRockets();
                this.cleanupMeteors();

                // Enemy Spawning
                if (this.enemies.countActive(true) === 0 && !this.isSpawningEnemy) {
                    this.isSpawningEnemy = true;
                    this.time.delayedCall(800, () => {
                        this.spawnEnemy();
                        // 20% Chance to spawn TWINS for extra difficulty
                        if (Math.random() > 0.8) this.spawnEnemy(); 
                    });
                }
                
                // Powerups
                this.powerUpSpawnTimer += delta;
                if (this.powerUpSpawnTimer > 8000) {
                    this.spawnPowerUp();
                    this.powerUpSpawnTimer = 0;
                }

                // Meteors (Environmental Danger)
                this.meteorTimer += delta;
                if (this.meteorTimer > 2000) { // Spawn one every 2 seconds
                    this.spawnMeteor();
                    this.meteorTimer = 0;
                }

                this.updateUI();

                // Keep Vignette stuck to camera
                //this.vignette.setPosition(this.cameras.main.scrollX, this.cameras.main.scrollY);
            }

            // =======================
            // NEW & UPDATED FEATURES
            // =======================

            

            private createPlayer() {
                this.player = this.add.sprite(200, 400, 'robot');
                this.physics.add.existing(this.player);
                const body = this.player.body as Phaser.Physics.Arcade.Body;
                body.setSize(24, 40);
                body.setCollideWorldBounds(true);
                body.setGravityY(0); 
                body.setDrag(GAME_CONFIG.DRAG); 
                
                // ADD GLOW (Requires Phaser 3.60+ FX)
                if (this.player.preFX) {
                    this.player.preFX.addGlow(0x00ffcc, 4, 0, false, 0.1, 10);
                }

                this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
            }

            private spawnMeteor() {
                // Spawns outside screen, flies across
                const cam = this.cameras.main;
                // Randomly pick a side (Left, Right, Top, Bottom)
                const side = Phaser.Math.Between(0, 3);
                let x, y, velX, velY;
                const speed = Phaser.Math.Between(100, 300);

                const w = this.bgSprite.displayWidth;
                const h = this.bgSprite.displayHeight;

                switch(side) {
                    case 0: // Left
                        x = 0; y = Phaser.Math.Between(0, h);
                        velX = speed; velY = Phaser.Math.Between(-50, 50);
                        break;
                    case 1: // Right
                        x = w; y = Phaser.Math.Between(0, h);
                        velX = -speed; velY = Phaser.Math.Between(-50, 50);
                        break;
                    case 2: // Top
                        x = Phaser.Math.Between(0, w); y = 0;
                        velX = Phaser.Math.Between(-50, 50); velY = speed;
                        break;
                    default: // Bottom
                        x = Phaser.Math.Between(0, w); y = h;
                        velX = Phaser.Math.Between(-50, 50); velY = -speed;
                        break;
                }

                const meteor = this.meteors.get(x, y, 'meteor');
                if (meteor) {
                    meteor.setActive(true);
                    meteor.setVisible(true);
                    meteor.setScale(Phaser.Math.FloatBetween(0.8, 2.0));
                    meteor.setTint(0x886666);
                    if(meteor.body) {
                        meteor.body.reset(x, y);
                        meteor.body.setVelocity(velX, velY);
                        meteor.body.setAngularVelocity(Phaser.Math.Between(-100, 100)); // Spin
                        // Meteors are circular colliders
                        meteor.body.setCircle(15);
                    }
                }
            }

            private onMeteorHitPlayer(player: any, meteor: any) {
                // Knockback
                const angle = Phaser.Math.Angle.Between(meteor.x, meteor.y, player.x, player.y);
                const body = player.body as Phaser.Physics.Arcade.Body;
                this.physics.velocityFromRotation(angle, 500, body.velocity); // Huge knockback
                
                // Damage
                this.takeDamage(GAME_CONFIG.METEOR_DAMAGE);
                
                // Visuals
                this.cameras.main.shake(200, 0.02);
                this.createExplosion(player.x, player.y, 0xffaa00, 10);
                
                meteor.destroy(); // Destroy meteor on impact
            }

            private handleFlyingMovement() {
                const body = this.player.body as Phaser.Physics.Arcade.Body;
                const speed = GAME_CONFIG.PLAYER_SPEED;

                // Added small rotational tilt for realism
                if (this.keys.A.isDown) {
                    body.setVelocityX(-speed);
                    this.player.setAngle(-5);
                } else if (this.keys.D.isDown) {
                    body.setVelocityX(speed);
                    this.player.setAngle(5);
                } else {
                    body.setAccelerationX(0);
                    this.player.setAngle(0);
                }

                if (this.keys.W.isDown) body.setVelocityY(-speed);
                else if (this.keys.S.isDown) body.setVelocityY(speed);
                else body.setAccelerationY(0);
            }

            private createJetpackParticles() {
                // Purple Plasma Engine Look
                const emitter = this.add.particles(this.player.x, this.player.y + 20, 'pixel', {
                    angle: { min: 80, max: 100 }, 
                    speed: { min: 100, max: 200 },
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 150,
                    tint: 0xaa00ff, 
                    emitting: true, 
                    frequency: 30,
                    quantity: 1
                });
                
                // Add a glow to the particles (if FX supported)
                if ((emitter as any).preFX) (emitter as any).preFX.addGlow(0xaa00ff, 2, 0);

                this.time.delayedCall(160, () => emitter.destroy());
            }

            // =======================
            // Standard Game Logic (Optimized)
            // =======================

            

            private createGun() {
                this.gun = this.add.rectangle(this.player.x, this.player.y, 30, 4, 0x888888);
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
                        
                        // FX: Add Glow to Bullet
                        if (bullet.preFX) {
                            bullet.preFX.clear(); // Clear old fx
                            bullet.preFX.addGlow(this.currentWeapon.glowColor, 4, 0);
                        }

                        if (bullet.body) { bullet.body.enable = true; bullet.body.reset(spawnX, spawnY); }
                        this.physics.velocityFromRotation(baseAngle + spread, this.currentWeapon.bulletSpeed, bullet.body.velocity);
                    }
                }
                // Recoil shake
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
                const w = this.bgSprite.displayWidth;
                const h = this.bgSprite.displayHeight;
                const x = Phaser.Math.Between(100, w - 100);
                const y = Phaser.Math.Between(100, h - 200);
                
                const enemySprite = this.add.sprite(x, y, 'robot').setTint(0xff0000);
                this.physics.add.existing(enemySprite);
                const body = enemySprite.body as Phaser.Physics.Arcade.Body;
                body.setSize(24, 40);
                body.setCollideWorldBounds(true);
                body.setGravityY(0);
                
                // FX: Enemy Glow
                if (enemySprite.preFX) enemySprite.preFX.addGlow(0xff0000, 4, 0);
                
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
                
                // Spawn Effect
                this.createExplosion(x, y, 0xffffff, 5); 
            }

            private updateEnemies(time: number) {
                this.enemyList.forEach(enemy => {
                    if (!enemy.sprite.active) return;
                    const body = enemy.sprite.body as Phaser.Physics.Arcade.Body;
                    const distance = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y);
                    
                    if (distance < 600) {
                        this.physics.moveToObject(enemy.sprite, this.player, 120); // Faster enemies
                        if (time - enemy.lastShot > 1500) { // Shoot faster
                            enemy.lastShot = time;
                            // Enemy shoots? (Add logic here if needed, currently they just ram you)
                        }
                    } else {
                        if (time - enemy.lastDirectionChange > 2000) {
                            enemy.moveDirectionX = Phaser.Math.RND.pick([-1, 1]);
                            enemy.moveDirectionY = Phaser.Math.RND.pick([-1, 1]);
                            enemy.lastDirectionChange = time;
                        }
                        body.setVelocity(70 * enemy.moveDirectionX, 70 * enemy.moveDirectionY);
                    }
                });
            }

            private takeDamage(amount: number) {
                this.playerHealth -= amount;
                
                // Screen Glitch Effect on Hit
                this.cameras.main.shake(100, 0.01);
                this.cameras.main.flash(50, 255, 0, 0); // Red flash

                if (this.playerHealth <= 0) {
                    this.playerHealth = 0;
                    // Game Over logic (send to store)
                    this.createExplosion(this.player.x, this.player.y, 0x00ffcc, 50);
                    this.player.setActive(false).setVisible(false);
                }
            }

            private updateUI() {
                useGameStore.getState().setGameStats({
                    health: this.playerHealth,
                    maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
                    ammo: this.currentWeapon.ammo,
                    maxAmmo: this.currentWeapon.maxAmmo,
                    weaponName: this.currentWeapon.name.toUpperCase(),
                    grenades: this.grenadeCount,
                    isReloading: this.isReloading,
                    // High intensity glitch when low health
                    glitchIntensity: this.playerHealth < 30 ? (30 - this.playerHealth) / 20 : 0
                });
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
                const grenade = this.grenades.get(this.player.x + vec.x, this.player.y + vec.y);
                if (grenade) {
                    grenade.setActive(true); grenade.setVisible(true);
                    grenade.setTint(0x00ff00);
                    if (grenade.body) { grenade.body.enable = true; grenade.body.reset(this.player.x + vec.x, this.player.y + vec.y); grenade.body.setBounce(0.6); }
                    this.physics.velocityFromRotation(this.gun.rotation, 400, grenade.body.velocity);
                    this.time.delayedCall(2000, () => { if (grenade.active) { this.explodeGrenade(grenade.x, grenade.y); grenade.setActive(false); grenade.setVisible(false); } });
                }
            }
            private onBulletHitWall(b:any) { b.setActive(false); b.setVisible(false); this.createSparks(b.x, b.y, 0xffff00); }
            private onBulletHitEnemy(b:any, e:any) { 
                b.setActive(false); b.setVisible(false);
                this.createSparks(b.x, b.y, 0xff0000); // Blood/Oil sparks
                const en = this.enemyList.find(x => x.sprite === e);
                if(en) { en.health -= this.currentWeapon.damage; if(en.health <= 0) this.killEnemy(en); }
            }
            private onRocketHitWall(r:any) { this.explodeRocket(r.x, r.y); r.setActive(false); r.setVisible(false); }
            private onRocketHitEnemy(r:any, e:any) { this.explodeRocket(r.x, r.y); r.setActive(false); r.setVisible(false); }
            private onRocketHitPlayer(r:any) { this.explodeRocket(r.x, r.y); r.setActive(false); r.setVisible(false); this.takeDamage(20); } // Self damage
            private onGrenadeHitWall() {}
            private explodeGrenade(x:number, y:number) { 
                this.createExplosion(x,y,0x00ff00, 15); 
                // Check distance to enemies/player and deal damage (simplified)
            }
            private explodeRocket(x:number, y:number) { this.createExplosion(x,y,0xff0000, 20); }
            
            private createExplosion(x:number, y:number, color:number, count:number) {
                 const emitter = this.add.particles(x, y, 'pixel', { 
                     speed: { min: 50, max: 300 }, 
                     scale: { start: 1.5, end: 0 }, 
                     blendMode: 'ADD', 
                     lifespan: 500, 
                     tint: color, 
                     emitting: false 
                });
                // Glow effect for explosion
                if((emitter as any).preFX) (emitter as any).preFX.addGlow(color, 4, 0);
                
                emitter.explode(count); 
                this.time.delayedCall(500, () => emitter.destroy());
            }

            private createSparks(x: number, y: number, color: number) {
                const emitter = this.add.particles(x, y, 'pixel', {
                    speed: { min: 50, max: 150 },
                    scale: { start: 0.5, end: 0 },
                    lifespan: 100,
                    tint: color,
                    blendMode: 'ADD',
                    emitting: false
                });
                emitter.explode(4);
                this.time.delayedCall(150, () => emitter.destroy());
            }

            private killEnemy(en: Enemy) { 
                this.createExplosion(en.sprite.x, en.sprite.y, 0xff3333, 20);
                this.cameras.main.flash(50, 255, 255, 255); // White flash on kill (Impact)
                this.cameras.main.shake(50, 0.005);
                
                en.sprite.destroy(); 
                useGameStore.getState().increaseScore(100);
                this.enemyList = this.enemyList.filter(e => e !== en); 
            }
            
            private spawnPowerUp() { 
                const w = this.bgSprite.displayWidth;
                const h = this.bgSprite.displayHeight;
                const x = Phaser.Math.Between(100, w - 100); 
                const y = Phaser.Math.Between(100, h - 200);
                const pu = this.powerUps.get(x, y);
                if(pu) { 
                    pu.setActive(true); pu.setVisible(true); 
                    // Pulsing glow
                    if (pu.preFX) pu.preFX.addGlow(0xffff00, 2, 0, false, 0.1, 10);
                }
            }
            private onPowerUpCollect(pl:any, pu:any) { 
                pu.destroy(); 
                this.createExplosion(pl.x, pl.y, 0xffff00, 10); // Satisfaction pop
                // Add ammo logic here if needed
            }

            private cleanupBullets() { this.bullets.children.each((b:any) => { if(b.active && (b.y < -100 || b.y > 3000 || b.x < -100 || b.x > 3000)) b.setActive(false); return true; }); }
            private cleanupRockets() { /* Same logic */ }
            private cleanupMeteors() { 
                this.meteors.children.each((m:any) => { 
                    // Allow wide margin for off-screen drift
                    if(m.active && (m.x < -500 || m.x > 3500 || m.y < -500 || m.y > 3500)) m.destroy(); 
                    return true; 
                }); 
            }
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