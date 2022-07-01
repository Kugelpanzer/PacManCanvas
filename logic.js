const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext('2d');

canvas.width = 520;
canvas.height = 520;



const dir = {
    idle:-1,
    up:0,
    right:1,
    down:2,
    left:3
}
const playerSpriteData = {
    src:"Assets/pacman.png",
    spriteX:200,
    spriteY:35,
    sprite_width:300,
    sprite_height:300,
    width:80,
    height:80,

}

class GameObject{
    constructor(x,y,width,height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    
}

class WallObject extends GameObject{
    constructor(x,y,width,height){
        super(x,y,width,height)
        
    }

}

class MovableObject extends GameObject{
    constructor(x,y,image_data){
        this.image_data = image_data;
        this.image = new Image();
        this.image.src = this.image_data.src;
        this.move(x,y);
        this.x = x;
        this.y = y;
        this.moving = false;
        this.width = image_data.width;
        this.height = image_data.height;
    }
    #renderSprite(x,y){
        ctx.drawImage(this.image,
            this.image_data.spriteX,
            this.image_data.spriteY,
            this.image_data.sprite_width,
            this.image_data.sprite_height,
            x,
            y,
            this.image_data.width,
            this.image_data.height,
        );  
    }
    render()//renders sprite at current location
    {
        this.#renderSprite(this.x,this.y);
    }
    move(x,y)//moves sprite to x,y
    {
        this.x=x;
        this.y=y;
        this.#renderSprite(x,y);

    }
    moveRelative(x,y)//moves sprite relative to the current position by x,y
    {
        this.x+=x;
        this.y+=y;
        this.#renderSprite(this.x,this.y);
    }
}

class PlayerObject extends MovableObject{
    constructor(x,y,image_data,speed=1){
        super(x,y,image_data)
        this.direction=-1
        this.speed = speed;
        PlayerObject.initPlayerMovement(this);

    }

    static initPlayerMovement(instance){
        window.addEventListener("keydown",function(e){
            if(e.key == "d"){
                instance.direction= dir.right;
            }
            if(e.key == "w"){
                instance.direction = dir.up;
            }
            if(e.key == "s"){
                instance.direction = dir.down;
            }

            if(e.key == "a"){
                instance.direction = dir.left;
            }
        })
        window.addEventListener("keyup",function(e){
            console.log(e); 
        })
     }
    executePlayerMovement(){
        if(this.direction==dir.idle){
            this.render();
        }
        else if(this.direction == dir.up){
            this.moveRelative(0,-this.speed);
        }
        else if(this.direction == dir.right){
            this.moveRelative(this.speed,0);
        }
        else if(this.direction == dir.down){
            this.moveRelative(0,this.speed);
        }
        else if(this.direction == dir.left){
            this.moveRelative(-this.speed,0);
        }
    }
}

const player =new PlayerObject(60,50,playerSpriteData,5);
//const player2 =new PlayerObject(200,50,playerSpriteData);

function update(){
    //console.log("update");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    player.executePlayerMovement();
    //player2.render();
    requestAnimationFrame(update);
}


update();
