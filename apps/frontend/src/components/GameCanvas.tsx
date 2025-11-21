// File: apps/frontend/src/components/GameCanvas.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import bg from '../assets/bg.png';

// --- Constants for Game Balancing ---
const GAME_CONFIG = {
    PLAYER_SPEED: 160,
    JETPACK_THRUST: -350,
    GRAVITY_Y: 600,
    BULLET_SPEED: 600,
    FIRE_RATE: 150, // ms between shots
};

const Game = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current) return;

        class MainScene extends Phaser.Scene {
            // Core objects
            private player!: Phaser.GameObjects.Rectangle;
            private gun!: Phaser.GameObjects.Rectangle;
            private platforms!: Phaser.Physics.Arcade.StaticGroup;
            private bullets!: Phaser.Physics.Arcade.Group;
            private enemies!: Phaser.Physics.Arcade.Group;
            
            // State and Inputs
            private keys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
            private lastFired: number = 0;
            private bgSprite!: Phaser.GameObjects.Image;
            private particleManager!: any;

            constructor() {
                super('MainScene');
            }

            preload() {
                this.load.image('bg', bg);
                // Create a tiny white texture on the fly for bullets/particles
                const graphics = this.make.graphics({ x: 0, y: 0 });
                graphics.setVisible(false);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillRect(0, 0, 4, 4);
                graphics.generateTexture('pixel', 4, 4);
            }

            create() {
                this.cameras.main.setBackgroundColor('#1a1a2e');

                // 1. World Setup
                this.setupWorldAndCamera();
                
                // 2. Physics Objects
                this.createPlatforms();
                this.createPlayer();
                this.createGun();
                this.createEnemies();
                
                // 3. Weapon Systems
                this.bullets = this.physics.add.group({
                    defaultKey: 'pixel',
                    maxSize: 20
                });

                // 4. FX
                this.particleManager = this.add.particles('pixel', {});

                // 5. Inputs
                this.keys = this.input.keyboard!.addKeys("W,A,S,D") as any;
                this.input.on('pointerdown', this.handleShooting, this);

                // 6. Collisions
                this.physics.add.collider(this.player, this.platforms);
                this.physics.add.collider(this.enemies, this.platforms);
                // Bullet hits platforms
                this.physics.add.collider(this.bullets, this.platforms, this.onBulletHitWall as any, undefined, this);
                // Bullet hits enemies
                this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitEnemy as any, undefined, this);
            }

            update(time: number, delta: number) {
                if (!this.player || !this.player.active) return;
                
                // Movement & Jetpack
                this.handlePlayerMovement();

                // Aiming
                this.handleGunAiming();

                // Cleanup
                this.cleanupBullets();
            }

            // =======================
            // Helper Functions
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
                
                // Create an invisible floor based on the image roughly near y=550
                // Using a transparent rect for physics
                const floor = this.add.rectangle(this.bgSprite.width / 2, this.bgSprite.height - 20, this.bgSprite.width, 40, 0x000000, 0);
                this.platforms.add(floor);
            }

            private createPlayer() {
                // Green body
                this.player = this.add.rectangle(200, 400, 24, 40, 0x2ecc71);
                this.physics.add.existing(this.player);
                const body = this.player.body as Phaser.Physics.Arcade.Body;
                body.setCollideWorldBounds(true);
                // Add some drag so horizontal movement feels tighter
                body.setDragX(600);
                
                this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
            }

            private createGun() {
                // A grey stick representing the weapon arm
                this.gun = this.add.rectangle(this.player.x, this.player.y, 30, 8, 0x95a5a6);
                // Set pivot point to the left side of the gun so it rotates around the player
                this.gun.setOrigin(0, 0.5);
            }

            private createEnemies() {
                this.enemies = this.physics.add.group();
                // Add a dummy target
                const target = this.add.rectangle(600, 400, 24, 40, 0xe74c3c); // Red enemy
                this.enemies.add(target);
                const body = target.body as Phaser.Physics.Arcade.Body;
                body.setCollideWorldBounds(true);
            }

            private handlePlayerMovement() {
                const body = this.player.body as Phaser.Physics.Arcade.Body;

                // Horizontal movement (Velocity based instead of setting position directly)
                if (this.keys.A.isDown) {
                    body.setVelocityX(-GAME_CONFIG.PLAYER_SPEED);
                } else if (this.keys.D.isDown) {
                    body.setVelocityX(GAME_CONFIG.PLAYER_SPEED);
                } else {
                    // Rely on DragX set in creation to slow down
                    // Or explicitly set 0 for instant stop: body.setVelocityX(0);
                }

                // Jetpack thrust
                if (this.keys.W.isDown) {
                    body.setVelocityY(GAME_CONFIG.JETPACK_THRUST);
                }
            }

            private handleGunAiming() {
                 // Ensure gun follows player position
                 this.gun.setPosition(this.player.x, this.player.y);

                 const activePointer = this.input.activePointer;
                 // Calculate angle between player center and mouse in world coordinates
                 const angle = Phaser.Math.Angle.Between(
                     this.player.x, 
                     this.player.y, 
                     activePointer.worldX, 
                     activePointer.worldY
                 );
 
                 // Rotation applied to the gun object
                 this.gun.setRotation(angle);
 
                 // Optional: Flip player body sprite based on aim direction for better visuals
                 if (activePointer.worldX < this.player.x) {
                    this.player.setScale(-1, 1); // Face Left
                 } else {
                     this.player.setScale(1, 1); // Face Right
                 }
            }

            private handleShooting(pointer: Phaser.Input.Pointer) {
                if (!this.player.active) return;

                const now = this.time.now;
                // Rate limiting
                if (now - this.lastFired < GAME_CONFIG.FIRE_RATE) {
                    return;
                }
                this.lastFired = now;

                // Get the end of the gun barrel for spawn position
                const vec = new Phaser.Math.Vector2();
                // Length of gun (30) * cosine/sine of angle
                vec.setToPolar(this.gun.rotation, 30); 
                const bulletSpawnX = this.player.x + vec.x;
                const bulletSpawnY = this.player.y + vec.y;

                // Get a dead bullet from the pool
                const bullet = this.bullets.get(bulletSpawnX, bulletSpawnY);

                if (bullet) {
                    bullet.setActive(true);
                    bullet.setVisible(true);
                    // Set bullet color to yellow
                    bullet.setTint(0xffff00);
                    
                    // Calculate velocity vector based on aim angle
                    this.physics.velocityFromRotation(this.gun.rotation, GAME_CONFIG.BULLET_SPEED, bullet.body.velocity);
                    
                    // Tiny camera shake for "juice"
                    this.cameras.main.shake(50, 0.005);
                }
            }

            private onBulletHitWall(bullet: Phaser.GameObjects.Image, wall: Phaser.GameObjects.Rectangle) {
                this.createImpactEffect(bullet.x, bullet.y, 0xffffff);
                bullet.setActive(false);
                bullet.setVisible(false);
            }

            private onBulletHitEnemy(bullet: Phaser.GameObjects.Image, enemy: Phaser.GameObjects.Rectangle) {
                this.createImpactEffect(bullet.x, bullet.y, 0xe74c3c); // Red impact
                bullet.setActive(false);
                bullet.setVisible(false);
                // Destroy enemy for now (later add health)
                enemy.destroy();
            }

            private createImpactEffect(x: number, y: number, color: number) {
                const emitter = this.particleManager.createEmitter({
                    x: x,
                    y: y,
                    speed: { min: 50, max: 150 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.8, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 200,
                    quantity: 5,
                    tint: color,
                });
                // Auto destroy emitter after a short time so it doesn't loop forever
                this.time.delayedCall(250, () => { emitter.remove(); });
            }

            private cleanupBullets() {
                this.bullets.children.each((b: any) => {
                    if (b.active && (b.y < 0 || b.y > this.physics.world.bounds.height || b.x < 0 || b.x > this.physics.world.bounds.width)) {
                        b.setActive(false);
                        b.setVisible(false);
                    }
                    return true;
                });
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
                    // Gravity restored for side-scroller feel
                    gravity: { x: 0, y: GAME_CONFIG.GRAVITY_Y }, 
                    debug: false // Set true to see the invisible floor platform
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