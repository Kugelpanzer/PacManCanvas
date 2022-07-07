const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext('2d');

canvas.width = 520;
canvas.height = 520;

function Rand(from, to){

    return Math.floor(Math.random() * (to-from)) + from;
}

function DrawLine(x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

//uzeto sa stack overflowa
function LineIntersect (p1, p2, p3, p4) {
    function CCW(p1, p2, p3) {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
}

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
const ghostSpriteData1 ={
    src:"Assets/ghost.png",
    spriteX:240,
    spriteY:20,
    sprite_width:110,
    sprite_height:110,
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
    distance(gameObject){
        return Math.round( Math.sqrt( (this.x-gameObject.x)*(this.x-gameObject.x) + (this.y-gameObject.y)*(this.y-gameObject.y)));
    }
    checkLine(check_list){
        let p1 = {

            x: this.x + (this.width/2),
            y: this.y + (this.height/2)
        }
        let p2 = {

            x: this.playerObj.x + (this.playerObj.width/2),
            y: this.playerObj.y + (this.playerObj.height/2)
        }
        for(let i in check_list){
           if(check_list[i].intersects(p1,p2))
            {
            return false;
            }
        }
        DrawLine(p1.x,p1.y,p2.x,p2.y);
        return true;
    }
}

class WallObject extends GameObject{
    constructor(x,y,width,height,solid = true){
        super(x,y,width,height,solid)
        wall_list.push(this);
        //point of wall
        this.p = []
        this.p.push({x:x,y:y});
        this.p.push({x:x+width,y:y});
        this.p.push({x:x,y:y+height});
        this.p.push({x:x+width,y:y+height});
        
    }
    
    //p1,p2 -> positions of line x,y
    intersects(p1,p2){
        if(LineIntersect(p1,p2,this.p[0],this.p[1]))
            return true;
        else if(LineIntersect(p1,p2,this.p[0],this.p[2]))
            return true;
        else if(LineIntersect(p1,p2,this.p[1],this.p[3]))
            return true;
        else if(LineIntersect(p1,p2,this.p[2],this.p[3]))
            return true;

        return false;
    }

}
class CrossroadObject extends GameObject
{
    constructor(x,y,dirList,width,height,solid=false){
        super(x,y,width,height,solid)
        this.dirList = dirList;
        this.crossList =  [];
        this.crossDist = {};
        this.currDist= null;
        this.crossDir = {}; // contains pointers to cross adjecent cross objects, and directions how to go to them
    }
    getCrossData()//gest list of next crossroads, and available directions
    {
        return {
            dirList:this.dirList,
            crossList:this.crossList
        }
    }

    showCollider(){
        ctx.beginPath();
        ctx.strokeStyle = "green";  
        ctx.rect(this.x,this.y,this.width,this.height);
        ctx.stroke();
        ctx.strokeStyle = "black"; 
    }

    #calcCrossToCrossDis() // calculates every neighbouring crossroad distance
    {
        for(let i in this.crossList)
        {
            this.crossDist[this.crossDist[i]] = this.distance(this.crossDist[i]);
        }
        
    }

    checkDist(dist)
    {
        if(this.currDist == null || this.currDist > dist){
            this.currDist = dist

            for(let i in this.crossList)
            {
                this.crossList[i].checkDist(dist+this.crossList[i].crossDist[this]);
            }
        }
    }

    calcCross() //calculates crossroead distances from pacman
    {
        if(this.checkLine(wall_list))
        {
            let dist = this.distance(PlayerObject.instance);
            this.currDist = dist;
            for(let i in this.crossList)
            { 
                this.crossList[i].checkDist(dist+this.crossList[i].crossDist[this]);
            }
        }

    }
}


class MovableObject extends GameObject{
    constructor(x,y,image_data,speed = 1,solid = false){
        super(x,y,image_data.width,image_data.height,solid)
        this.image_data = image_data;
        this.image = new Image();
        this.image.src = this.image_data.src;
        this.move(x,y);
        this.futureMove = new GameObject(this.x,this.y,this.width,this.height)
        this.speed = speed;
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
                if(this.futureMove.checkCollision(check_list[ch]) && check_list[ch].solid)
                {
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
    this.move(this.futureMove.x,this.futureMove.y);

    }

    
}


class PlayerObject extends MovableObject{
    constructor(x,y,image_data,speed=1,solid = false){
        super(x,y,image_data,speed,solid)
        this.direction=-1
        PlayerObject.initPlayerMovement(this);
        this.type = type.player;
        this.wantedDirection =-1;
        
        if(PlayerObject.instance == null)
            PlayerObject.instance=  this;
    }
    static instance= null;
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
           //instance.direction= dir.idle;
        })
     }


    executePlayerMovement(){

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


class GhostBase extends MovableObject{
    constructor(x,y,image_data,speed=1,solid= false){
        super(x,y,image_data,speed,solid);
        this.crossList = [];
        this.availableDirections =[];
        this.type = type.ghost;
        this.direction = dir.idle;
        this.playerObj= PlayerObject.instance;
    }
    moveDirection(){
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
    checkCross()
    {
        for(let i in this.crossList){
            
            if(this.distance(this.crossList[i])<=this.speed+1){
                
                return this.crossList[i];
            }
        }

        return null;
    }
    setToCross(){
        let cross = this.checkCross();
        this.pastCross = cross ;
        if(cross != null){

            this.move(cross.x,cross.y);
            let crossData = cross.getCrossData();
            this.availableDirections = crossData.dirList;
            this.crossList = crossData.crossList;
            this.direction = dir.idle;
            this.wantedDirection = dir.idle;
        }
    }

    randMove() // moves random regardless of pacman 
    {
        if(this.direction == dir.idle){
            this.render();
            this.direction = this.availableDirections[Rand(0,this.availableDirections.length)];
        }
        this.setToCross();
        this.moveDirection();

    }

    spotMove() // moves random until he spots pacman, moves towards pacman while he sees him
    {
        if(this.checkLine(wall_list)){ 
            this.getWantedDir();
        }
        if(this.direction == dir.idle){
            this.render();
            if(this.availableDirections.includes(this.wantedDirection)&& this.wantedDirection != dir.idle)
            {
                this.direction=this.wantedDirection;
            }
            else
            {
                this.direction = this.availableDirections[Rand(0,this.availableDirections.length)];
            }

        }
        this.setToCross();
        this.moveDirection();

    }

    chaseMove()//always moves closer to pacman
    {

    }

    angle(){
        //return Math.acos((this.x-this.playerObj.x)/this.distance(this.playerObj));
        let sign = Math.sign((Math.asin((this.y-this.playerObj.y)/this.distance(this.playerObj))));
        //console.log(sign);
        return sign*(Math.acos((this.playerObj.x-this.x)/this.distance(this.playerObj)))*(180/Math.PI);
    }

    getWantedDir(){

        let a= this.angle() ;
        if(a>-45 && a<=45){
            this.wantedDirection = dir.right;
        }
        else if(a>45 && a<=135){
            this.wantedDirection=dir.up;
        }
        else if (a>-135 && a <=-45){
            this.wantedDirection = dir.down;
        }else if ( (a>135 && a<=180) ||(a<-135 && a >=-180)){
            this.wantedDirection = dir.left ;
        }
        else{ 
            this.wantedDirection = dir.idle;
        }
    }

}



const player =new PlayerObject(281,230,playerSpriteData,3);

const testObject =new WallObject(200,50,80,80,true);
const testObject2 =new WallObject(200,213,80,80,true);

const ghost1 = new GhostBase(20,100,ghostSpriteData1,5);
ghost1.availableDirections = [dir.up,dir.down];
const cross1 = new CrossroadObject(20,20,[dir.down,dir.right],80,80);
const cross2 = new CrossroadObject(20,300,[dir.up,dir.right],80,80);
const cross3 = new CrossroadObject(380,300,[dir.up,dir.left],80,80);
const cross4 = new CrossroadObject(380,20,[dir.down,dir.left],80,80);
cross1.crossList=[cross2,cross4];
cross2.crossList=[cross1,cross3];
cross3.crossList= [cross2,cross4];
cross4.crossList = [cross1,cross3]
ghost1.crossList =[cross1,cross2];
function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ghost1.spotMove();
    //ghost1.render();
    ghost1.showCollider();
    //ghost1.checkLine(wall_list);
    //console.log(ghost1.distance(ghost1.playerObj));
    ghost1.getWantedDir();
   // console.log(ghost1.wantedDirection);
    //console.log("update");

    player.executePlayerMovement();
    player.showCollider();
    //player.futureMove.showCollider();
    testObject.showCollider();
    testObject2.showCollider();
    cross1.showCollider();
    cross2.showCollider() ;
    cross3.showCollider();
    cross4.showCollider();

    //console.log(player2.checkCollision(player));
    requestAnimationFrame(update);
}


update();
