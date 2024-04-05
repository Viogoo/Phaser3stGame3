// Ініціалізація Phaser
var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 500,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

var game = new Phaser.Game(config);
var spaceship;
var collectTrash;
var gameOver;
var updateTimer;
var trash;
var inputx;
var inputy;





// Попереднє завантаження ресурсів
function preload() {
    this.load.image('space', 'assets/space.jpg');
    this.load.image('spaceship', 'assets/spaceship.png');
    this.load.image('trash', 'assets/tresh.png');
    this.load.image('lasers', 'assets/lasers.png');
}



// Основна функція гри
function create() {
   
   
   
   
    // Додавання фону
    this.add.image(0, 0, 'space').setOrigin(0);

    
    
    // Додавання космічного корабля
    spaceship = this.physics.add.sprite(50, 250, 'spaceship').setScale(0.2).setCollideWorldBounds(true);



//додавання космічного сміття
    trash = this.physics.add.group({
        key: 'trash',
        repeat: 11,
        setXY: { x: 900, y: 100, stepX: 70 } 
    });



       // Додавання лазерів
       lasers = this.physics.add.group( {key: ' lasers'});
    


     // Генерування сміття з різних сторін
     generateTrash();
    
    
    
   
   
   
    // Збір сміття
    this.physics.add.collider(spaceship, trash, collectTrash, null, this);

   
   
    // Перевірка колізії космічного корабля з лазерами
    this.physics.add.overlap(spaceship, lasers, gameOver, null, this);
   
    // Рахунок зібраного сміття
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });





   
    // Таймер або час гри
    this.timeText = this.add.text(800, 16, 'Time: 60', { fontSize: '32px', fill: '#fff' });
    this.endTime = this.time.addEvent({ delay: 60000, callback: gameOver, callbackScope: this });
    this.timer = this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, repeat: 59 });
 

     // Генерування лазерів
     this.time.addEvent({ delay: 1000, callback: generateLasers, callbackScope: this, loop: true });
    }


// Генерування сміття з різних сторін
function generateTrash() {
    for (let i = 0; i < 12; i++) {
        let x = Phaser.Math.Between(0, game.config.width);
        let y = Phaser.Math.Between(0, game.config.height);
        let trashPiece = trash.create(x, y, 'trash');
        trashPiece.setVelocityX(Phaser.Math.Between(-200, 200)); // Додано хаотичний рух
    }
}

// Генерування лазерів
function generateLasers() {
    let x = Phaser.Math.Between(0, game.config.width);
    let y = Phaser.Math.Between(0, game.config.height);
    let laser = lasers.create(x, y, 'lasers');
    laser.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-300, 300)); // Додано хаотичний рух
}


// Функція оновлення
function update() {

   
    this.physics.moveTo(spaceship, game.input.mousePointer.x, game.input.mousePointer.y, 400);
    // Рух космічного корабля
    if (this.input.activePointer.isDown) {}
   
    
    
    // Видалення сміття, яке виходить за межі екрану
    trash.children.iterate(function(child) {
        if (child.x < -50) {
            child.x = 1100;
        }
    });
}




// Функція збору сміття
function collectTrash(spaceship, trash) {
    trash.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
}





// // Функція оновлення таймера
// function updateTimer() {
//     this.timeText.setText('Time: ' + (this.timer.repeatCount - this.timer.getOverallProgress()));
// }


 // Функція оновлення таймера
 function updateTimer() {
    this.timeText.setText('Time: ' + this.timer.repeatCount);
}





// Функція завершення гри
function gameOver() {
    this.add.text(400, 250, 'GAME OVER', { fontSize: '64px', fill: '#fff' });
    this.physics.pause();
   
}