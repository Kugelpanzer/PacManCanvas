const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext('2d');

canvas.width = 520;
canvas.height = 520;

class WallObject{
    constructor(x,y){
        
    }

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

class MovableObject{
    constructor(x,y,image_data){
        this.image_data = image_data;
        this.image = new Image();
        this.image.src = this.image_data.src;
        this.move(x,y);
        this.x = x;
        this.y = y;
        this.moving = false;
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

const player =new MovableObject(50,50,playerSpriteData);
function start(){


}

function update(){
    //console.log("update");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    player.render();
    requestAnimationFrame(update);
}

start();
update();