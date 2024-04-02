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
var  collectTrash;
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
}

// Основна функція гри
function create() {
    
    // Додавання фону
this.add.image(0, 0, 'space').setOrigin(0);

    




    // Додавання космічного корабля
    spaceship = this.physics.add.sprite(50, 250, 'spaceship')
        .setScale(0.2);
    spaceship
        .setCollideWorldBounds(true);

    
    
    
    
        // Додавання космічного сміття
    this.trash = this.physics.add.group({
        key: 'trash',
        repeat: 11,
        setXY: { x: 1100, y: 12, stepX: 70 }
    });

    
    
    
    
    // Збір сміття
    this.physics.add.collider(spaceship,trash, collectTrash, null, this);

    
    
    
    
    // Рахунок зібраного сміття
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

   
   
    
    
    // Таймер або час гри
    this.timeText = this.add.text(800, 16, 'Time: 60', { fontSize: '32px', fill: '#fff' });
    this.endTime = this.time.addEvent({ delay: 60000, callback: gameOver, callbackScope: this });
    this.timer = this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, repeat: 59 });
 

// Додавання сміття
this.time.addEvent({
    delay: 1000, // кожні 1 секунди
    loop: true,
    callback: function () {
        var side = Phaser.Math.Between(0, 3); // вибираємо випадкову сторону
        var x;
        var y;

        if (side === 0) { // зліва
            x = 0;
            y = Phaser.Math.Between(0, game.config.height);
        } else if (side === 1) { // зверху
            x = Phaser.Math.Between(0, game.config.width);
            y = 0;
        } else if (side === 2) { // справа
            x = game.config.width;
            y = Phaser.Math.Between(0, game.config.height);
        } else { // знизу
            x = Phaser.Math.Between(0, game.config.width);
            y = game.config.height;
        }

        var trash = this.trash.create(x, y, 'trash'); 
        this.physics.moveToObject(trash, this.spaceship, 200); 
 
    },
    callbackScope: this
});



}





 // Функція оновлення
function update() {
    
    this.physics.moveTo(spaceship, game.input.mousePointer.x, game.input.mousePointer.y, 400);
    
    // Рух космічного корабля
    if (this.input.activePointer.isDown) {
       
    }

   
   
   
    
    
    //Видалення сміття, яке виходить за межі екрану
    this.trash.children.iterate(function (child) {
        if (child.x < -50) {
            child.x = 1100;
        }
    });

}

// // Додавання сміття
// this.time.addEvent({
//     delay: 1000, // кожні 1 секунди
//     loop: true,
//     callback: function () {
//         var side = Phaser.Math.Between(0, 3); // вибираємо випадкову сторону
//         var x;
//         var y;

//         if (side === 0) { // зліва
//             x = 0;
//             y = Phaser.Math.Between(0, game.config.height);
//         } else if (side === 1) { // зверху
//             x = Phaser.Math.Between(0, game.config.width);
//             y = 0;
//         } else if (side === 2) { // справа
//             x = game.config.width;
//             y = Phaser.Math.Between(0, game.config.height);
//         } else { // знизу
//             x = Phaser.Math.Between(0, game.config.width);
//             y = game.config.height;
//         }

//         var trash = this.trash.create(x, y, 'trash'); 
//         this.physics.moveToObject(trash, this.spaceship, 200); 
 
//     },
//     callbackScope: this
// });



// Функція збору сміття
function collectTrash(spaceship, trash) {
    trash.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
 }




 // Функція оновлення таймера
function updateTimer() {
    this.timeText.setText('Time: ' + this.timer.repeatCount);
}




// Функція завершення гри
function gameOver() {
    this.add.text(400, 250, 'Game Over', { fontSize: '64px', fill: '#fff' });
    this.physics.pause();
    this.timer.paused = true;
}