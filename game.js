// Створюємо сцену
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 170 },
            debug: false,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Змінні
var game = new Phaser.Game(config);
var cursors;
var platforms;
var player;
var bombs;
var stars;
var score = 0;
var scoreText;
var life = 5;
var lifeText;
var worldWidth = 9600;
var enemy;
var enemyLives = 5;
var enemyText;

function preload() {
    // Додаємо клавіші керування
    cursors = this.input.keyboard.createCursorKeys();
    // Завантажуємо спрайти
    this.load.image('sky', 'assets/sky.png');
    this.load.image('platform1', 'assets/10.png');
    this.load.image('platform2', 'assets/11.png');
    this.load.image('platform3', 'assets/12.png');
    this.load.image('ground', 'assets/1.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('tree', 'assets/3.png');
    this.load.image('ts', 'assets/5.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.spritesheet('dude', 'assets/2.png', { frameWidth: 32, frameHeight: 48 });
}

// Додаємо спрайти до сцени
function create() {
    this.add.tileSprite(0, 0, worldWidth, 1080, "sky")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0);

    // Додаємо генерацію платформ
    platforms = this.physics.add.staticGroup();

    for (var x = 0; x < worldWidth; x = x + 128) {
        platforms
            .create(x, 1050, "ground")
            .setOrigin(0, 0)
            .refreshBody(1);
    }

    // Летючі платформи
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(3000, 800)) {
        platforms.create(x, 850, 'platform1');

        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, 850, 'platform2');
        }

        platforms.create(x + 128 * i, 850, 'platform3');
    }

    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(1000, 800)) {
        platforms.create(x, 650, 'platform1');

        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, 650, 'platform2');
        }

        platforms.create(x + 128 * i, 650, 'platform3');
    }

    // Додаємо кущі
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(1700, 100)) {
        var ts = this.physics.add.staticGroup();
        ts.create(x, 1080 - 25, 'ts')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(1, 1.5))
            .setDepth(Phaser.Math.Between(9, 10));
    }

    // Додаємо дерева
    var tree = this.physics.add.staticGroup();
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(2000, 500)) {
        tree.create(x, 1080 - 25, 'tree')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(1.5, 1.7))
            .setDepth(Phaser.Math.Between(1, 2));
    }

    // Гравець
    player = this.physics.add.sprite(100, 700, 'dude');
    player.setBounce(0.2)
        .setDepth(Phaser.Math.Between(4, 5))
        .setCollideWorldBounds(true);
    player.body.setGravityY(300);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Камера
    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);
    this.cameras.main.startFollow(player);

    // Текст "Enemy Lives"
    enemyText = this.add.text(50, 150, 'Enemy Lives: ' + enemyLives, { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0);

    // Додаємо очки рахунку
    stars = this.physics.add.group({
        key: 'star',
        repeat: 50,
        setXY: { x: 12, y: 0, stepX: 500 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // Додаємо рахунок і життя
    scoreText = this.add.text(100, 100, 'Score: 0', { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0);

    lifeText = this.add.text(1500, 100, showLife(), { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0);

    // Кнопка рестарту
    var resetButton = this.add.text(938, 70, '♻️', { fontSize: '60px', fill: '#FFF' })
        .setInteractive()
        .setScrollFactor(0);

    resetButton.on('pointerdown', function () {
        console.log('restart');
        location.reload();
    });

    // Додаємо ворога
    enemy = this.physics.add.sprite(1000, 1080 - 150, 'enemy');
    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, hitEnemy, null, this);

    // Додаємо слухача подій для клавіші "Space"
    this.input.keyboard.on('keydown-SPACE', shootBullet);

    // Ініціалізуємо групу куль
    bullets = this.physics.add.group();
}

function update() {
    // Додаємо керування гравцем
    if (cursors.left.isDown) {
        player.setVelocityX(-500);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(500);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-520);
    }

    // Перевіряємо зіткнення гравця з ворогом
    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), enemy.getBounds())) {
        player.setVelocityX(0);
    }
}

// function hitEnemy(player, enemy) {
//     enemyLives--;
//     let enemyLifeIcons = '';
//     for (let i = 0; i < enemyLives; i++) {
//         enemyLifeIcons += '👾';
//     }
//     enemyText.setText('Enemy Lives: ' + enemyLifeIcons);
    
//     player.setVelocityX(Phaser.Math.FloatBetween(-200, 200));
//     player.setVelocityY(-100);
// }

function hitEnemy(player, enemy) {
    enemyLives--;
    let enemyLifeIcons = '';
    for (let i = 0; i < enemyLives; i++) {
        enemyLifeIcons += '👾';
    }
    enemyText.setText('Enemy Lives: ' + enemyLifeIcons);
    
    // Відкидаємо гравця вгору та трохи в протилежну сторону
    if (player.x < enemy.x) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(-200);
    }
    player.setVelocityY(-400);
}
function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
}

function showLife() {
    var lifeLine = 'Life: ';
    for (var i = 0; i < life; i++) {
        lifeLine += '❤️';
    }
    return lifeLine;
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
}

function shootBullet() {
    var bullet = bullets.create(player.x, player.y, 'bullet');
    if (player.body.velocity.x < 0) {
        bullet.setVelocityX(-2000);
    } else {
        bullet.setVelocityX(2000);
    }
}
