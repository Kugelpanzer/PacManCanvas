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
const type={
    wall : 0,
    player :1,
    pallet : 2,
    super_pallet:3,
    ghost:4,
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
const wall_list = [];
class GameObject{
    constructor(x,y,width,height,solid = false){
        //solid var determines wheter movable object can pass threw or not
        //if object is solid movable object cant  threw it
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.solid = solid;
    }

    checkCollision(other_object){
        let x1=this.x;
        let x2=this.x+this.width;
        let x3=other_object.x;
        let x4=other_object.x+ other_object.width;
        let y1=this.y;
        let y2=this.y+this.height;
        let y3= other_object.y;
        let y4= other_object.y+other_object.height
        if(
             (( x1>=x3 && x1<=x4) || (x3>=x1 &&x3<=x2)) 
        &&   ((y1>=y3 && y1<=y4) ||(y3>=y1 && y3<=y2))
        )
        {
            return true;
        }else{
            return false;
        }
    }
    checkCollisionList(check_list){
        for(let ch in check_list){
            if(this.checkCollision( check_list[ch])){
                return true;
            }
        }
        return false;
    }
    showCollider(){
        ctx.beginPath();    
        ctx.rect(this.x,this.y,this.width,this.height);
        ctx.stroke();
    }
    moveRelative(x,y)//moves sprite relative to the current position by x,y
    {
        this.x+=x;
        this.y+=y;
    }

    move(x,y)//moves sprite to x,y
    {
        this.x=x;
        this.y=y;   

    }
    
}

class WallObject extends GameObject{
    constructor(x,y,width,height,solid = true){
        super(x,y,width,height,solid)
        wall_list.push(this);
        
    }

}

class MovableObject extends GameObject{
    constructor(x,y,image_data,solid = false){
        super(x,y,image_data.width,image_data.height,solid)
        this.image_data = image_data;
        this.image = new Image();
        this.image.src = this.image_data.src;
        this.move(x,y);
        this.moving = false;
        this.futureMove = new GameObject(this.x,this.y,this.width,this.height)
        //this.futureMoveChange = new GameObject(this.x, this.y, this.width, this.height); // whenever player wants to change direction
    }
    renderSprite(x,y){
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
        this.renderSprite(this.x,this.y);
    }
    move(x,y)//moves sprite to x,y
    {
        this.x=x;
        this.y=y;
        this.renderSprite(x,y);

    }
    moveRelative(x,y)//moves sprite relative to the current position by x,y
    {
        this.x+=x;
        this.y+=y;
        this.renderSprite(this.x,this.y);
    }

    checkMoveCollision(x,y,check_list)
    {
            //checks if object can move, if solid object is in front moves to solid object and stops
            //check_list is list of game objects that will be checked for collision
            let vertical = true
            let value = y
            if(x!= 0)
            {
            vertical = false;
            value = x;
            }
            this.futureMove.moveRelative(x,y)
            for(let ch in check_list){
                if(this.futureMove.checkCollision(check_list[ch]) && check_list[ch].solid){
                    if(vertical)
                    {
                        this.futureMove.moveRelative(-x,-y);
                        if(y>0)
                        {
                            for(let i =0;i<y;i++)
                            {
                                this.futureMove.moveRelative(x,i);

                                if(this.futureMove.checkCollision(check_list[ch]) && check_list[ch].solid){
                                    this.futureMove.moveRelative(x,-1);
                                    console.log(i);
                                    return i;
                                }
                            }
                        }
                        else
                        {
                            for(let i =0;i>y;i--)
                            {
                                this.futureMove.moveRelative(x,i);

                                if(this.futureMove.checkCollision(check_list[ch]) && check_list[ch].solid){
                                    this.futureMove.moveRelative(x,1);
                                    console.log(i);
                                    return i;
                                }
                            }
                        }
                    }
                    else
                    {
                        this.futureMove.moveRelative(-x,-y);
                        if(x>0)
                        {
                            for(let i=0;i<x;i++)
                            {
                                this.futureMove.moveRelative(i,y);


                                if(this.futureMove.checkCollision(check_list[ch]) && check_list[ch].solid)
                                {

                                    this.futureMove.moveRelative(-1,y);
                                    return i;
                                }

                            }
                        }
                        else
                        {
                            for(let i=0;i>x;i--)
                            {
                                this.futureMove.moveRelative(i,y);


                                if(this.futureMove.checkCollision(check_list[ch]) && check_list[ch].solid)
                                {

                                    this.futureMove.moveRelative(1,y);
                                    return i;
                                }

                            }
                        }
                    }
                }
            }
            return null;
    }

    moveWithCollision(x,y,check_list)
    {
    let dis= this.checkMoveCollision(x,y,check_list);
    /*if(dis!= null)
    {
        
        if(x ==0)
        {
            this.moveRelative(x,dis-1);
        }
        else if(y== 0){
            this.moveRelative(dis-1,y);
        }
    }
    else{*/
    
    this.move(this.futureMove.x,this.futureMove.y);

    }
    
}

class PlayerObject extends MovableObject{
    constructor(x,y,image_data,speed=1,solid = false){
        super(x,y,image_data,solid)
        this.direction=-1
        this.speed = speed;
        PlayerObject.initPlayerMovement(this);
        this.type = type.player;
        this.wantedDirection =-1;

    }

    static initPlayerMovement(instance){
        window.addEventListener("keydown",function(e){
            if(e.key == "d"){
                instance.wantedDirection= dir.right;
            }
            if(e.key == "w"){
                instance.wantedDirection = dir.up;
            }
            if(e.key == "s"){
                instance.wantedDirection = dir.down;
            }

            if(e.key == "a"){
                instance.wantedDirection = dir.left;
            }
        })
        window.addEventListener("keyup",function(e){
           // console.log(e); 
           //instance.direction= dir.idle;
        })
     }

    checkWantedDirection(check_list){
        switch(this.direction)
        {
            case dir.up:


                if(this.wantedDirection == dir.left)
                {
                    //this.futureMove.move(this.x,this.y);
                    this.futureMove.moveRelative(-this.speed,0);
                    let curr = 0;
                    for(let i =0; i<this.speed;i++)
                    {
                        
                        this.futureMove.moveRelative(0,-i);
                        if(!this.futureMove.checkCollisionList(check_list))
                        {
                            this.move(this.futureMove.x,this.futureMove.y);
                            this.direction= this.wantedDirection;
                            curr=i;
                            break;
                        }
                        
                    }
                    console.log(curr);
                    this.futureMove.moveRelative(this.speed,0);
                    
                }
                if(this.wantedDirection == dir.down)
                {
                    this.direction=this.wantedDirection;
                }
                else
                { 
                    this.moveWithCollision(0,-this.speed,wall_list);
                }
                break;
            case dir.down:
                break;
            case dir.left:
                break; 
            case dir.right:
                break;

        }
    }

    executePlayerMovement(){
        if(this.wantedDirection!= this.direction)
        {

            if(this.direction==dir.idle){
                this.direction = this.wantedDirection;

            }
            this.checkWantedDirection(wall_list);
        }
        else
        {
            this.direction =this.wantedDirection;
            if(this.direction==dir.idle){
                this.render();
            }
            else if(this.direction == dir.up){
                this.moveWithCollision(0,-this.speed,wall_list);
            }
            else if(this.direction == dir.right){
                this.moveWithCollision(this.speed,0,wall_list);
            }
            else if(this.direction == dir.down){
                this.moveWithCollision(0,this.speed,wall_list);
            }
            else if(this.direction == dir.left){
                this.moveWithCollision(-this.speed,0,wall_list);
            }
        }
    }
}

const player =new PlayerObject(281,230,playerSpriteData,1);

const testObject =new WallObject(200,50,80,160,true);
const testObject2 =new WallObject(200,213,80,80,true);
function update(){
    //console.log("update");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    player.executePlayerMovement();
    player.showCollider();
    player.futureMove.showCollider();
    testObject.showCollider();
    testObject2.showCollider();
    //console.log(player2.checkCollision(player));
    requestAnimationFrame(update);
}


update();
