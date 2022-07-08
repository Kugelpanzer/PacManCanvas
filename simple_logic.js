const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext('2d');

canvas.width = 820;
canvas.height = 640;

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



const level ={
    layout:[
        ["w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w"],
        ["w","sp","p","p","p","p","p","p","p","w","p","p","p","p","p","p","p","p","sp","w"],
        ["w","p","w","w","w","w","w","w","p","w","p","w","w","w","w","w","w","w","p","w"],
        ["w","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","w"],
        ["w","p","w","p","w","w","w","w","p","w","w","w","w","p","w","w","w","w","p","w"],
        ["w","p","w","p","w","e","e","w","p","w","e","e","w","p","w","g","e","w","p","w"],
        ["w","p","w","p","w","w","w","w","p","w","w","w","w","p","e","gs","e","w","p","w"],
        ["w","p","w","p","p","p","p","w","p","w","e","e","w","p","w","gh","e","w","p","w"],
        ["w","sp","w","p","p","p","p","w","p","w","w","w","w","p","w","w","w","w","sp","w"],
        ["w","p","p","p","p","p","p","p","p","p","pc","p","p","p","p","p","p","p","p","w"],
        ["w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w"]
    ],
    info:"w->wall , p->pallet, sp->supper_pallet, e->empty, g->ghost, gs->ghost spot, pc->pacman"
}

const standartSize = 40;


const ghostType ={ 
    rand:0,
    spot:1,
    chase:2
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
    width:standartSize-2,
    height:standartSize-2,

}
const ghostSpriteData1 ={
    src:"Assets/ghost.png",
    spriteX:240,
    spriteY:20,
    sprite_width:110,
    sprite_height:110,
    width:standartSize-2,
    height:standartSize-2,

}

const allObjects = [];
const allGhosts = [];

function ParseLevel(){
    let logicalMap = [];
    let wallList = []; // contains data which will be used to create walls
    let currWallData = null ;
    let crossList = [ ]; // 

    for(let i=0 ;i<level.layout.length;i++)
    {
        let ll = []
        logicalMap.push(ll);
        currWallData = null ;
        for(let j=0;j<level.layout[i].length;j++)
            switch(level.layout[i][j])
            {
                case "w":
                    ll.push(1);
                    if(currWallData != null)
                    {
                        currWallData.len ++ ;
                    }
                    else
                    {
                        currWallData ={x:j*standartSize,y:i*standartSize,len:1}
                        wallList.push(currWallData);
                    }
                break;
                default:
                    ll.push(0);
                    currWallData = null;
                break;

            }
    }
    function checkCross (x,y){
        let c= 0;
        let dirList =[];
        if(logicalMap[y][x+1]==0) {c++; dirList.push(dir.right);}
        if(logicalMap[y][x-1]==0) {c++; dirList.push(dir.left);}
        if(logicalMap[y+1][x]==0) {c++; dirList.push(dir.down);}
        if(logicalMap[y-1][x]==0) {c++; dirList.push(dir.up);}

        if(c==0) return null;
        else if(c == 2)
        { 
            if(logicalMap[y][x+1]==0 && logicalMap[y][x-1]==0) return null;
            if(logicalMap[y+1][x]==0 && logicalMap[y-1][x]==0) return null;
            return {cross: new CrossroadObject(x*standartSize+1,y*standartSize+1,standartSize,standartSize), dir:dirList,x:x,y:y};
        }
        else
        {
            return {cross: new CrossroadObject(x*standartSize+1,y*standartSize+1,standartSize,standartSize), dir:dirList,x:x,y:y};
        }
    }

    let crossMap =[];
    for( let i =0 ; i<logicalMap.length; i++){
        crossMap.push([]);
    for(let j = 0; j<logicalMap[i].length;j++){
        crossMap[i].push(null)
    }
}

    for( let i =0 ; i<logicalMap.length; i++)
        for(let j = 0; j<logicalMap[i].length;j++)
        {
            if(logicalMap[i][j]== 0)
            {
                crossMap[i][j]=checkCross(j,i);
                if (crossMap[i][j]!= null)
                    {
                        allObjects.push(crossMap[i][j].cross);
                        crossList.push(crossMap[i][j]);
                    }
            }
        }
    
    function crossAdj(crossData)
    {
        let cl =[];
        if(crossData.dir.includes(dir.up))
        {
            for(let i = crossData.y-1 ; i>0;i--)
            {
                if(logicalMap[i][crossData.x] ==1) break;
                if(crossMap[i][crossData.x]!=null){
                    cl.push({cross:crossMap[i][crossData.x].cross,dir:dir.up});
                    break;  
                }
            }
        }
        if(crossData.dir.includes(dir.left))
        {
            for(let i = crossData.x-1 ; i>0;i--)
            {
                if(logicalMap[crossData.y][i] ==1) break;
                if(crossMap[crossData.y][i]!=null){
                    cl.push({cross:crossMap[crossData.y][i].cross,dir:dir.left});
                    break;
                }
            }
        }
        if(crossData.dir.includes(dir.right))
        {
            for(let i = crossData.x+1 ; i<crossMap[0].length;i++)
            {
                if(logicalMap[crossData.y][i] ==1) break;
                if(crossMap[crossData.y][i]!=null){
                    cl.push({cross:crossMap[crossData.y][i].cross,dir:dir.right} );
                    break;
                }
            }
        }
        if(crossData.dir.includes(dir.down))
        {
            for(let i = crossData.y+1 ; i<crossMap.length;i++)
            {
                if(logicalMap[i][crossData.x] ==1) break;
                if(crossMap[i][crossData.x]!=null){
                    cl.push({cross:crossMap[i][crossData.x].cross,dir:dir.down});
                    break;
                }
            }
        }
        return cl;
    }
    for(let i in crossList)
    {
       let ca= crossAdj( crossList[i]);

       crossList[i].cross.dirList = crossList[i].dir;
       for(let j in ca)
       {
        
           crossList[i].cross.crossDir[ca[j].cross]=ca[j].dir;
            crossList[i].cross.crossList.push(ca[j].cross);            
       }

    }
    for(let i in wallList)
    {
        allObjects.push(new WallObject(wallList[i].x,wallList[i].y,wallList[i].len*standartSize,standartSize));
    }
    for(let i=0 ;i<level.layout.length;i++)
    {
        for(let j=0;j<level.layout[i].length;j++)
        {
            let c = level.layout[i][j];
            switch(c)
            {
                case "pc":
                    allObjects.push(new PlayerObject(j*standartSize+1,i*standartSize+1,playerSpriteData,2));
                    break;
                case "p":
                    //add pallet object
                    break;
                case "sp":
                    //add super pallet object
                    break;
                case "g":
                    let g = new GhostBase(j*standartSize+1,i*standartSize+1,ghostSpriteData1,2,0);
                    allObjects.push(g)
                    allGhosts.push(g);
                    break;
                case "gs":
                    let gs = new GhostBase(j*standartSize+1,i*standartSize+1,ghostSpriteData1,2,1);
                    allObjects.push(gs)
                    allGhosts.push(gs);
                    break;
                case "gh":
                    let gh = new GhostBase(j*standartSize+1,i*standartSize+1,ghostSpriteData1,2,2);
                    allObjects.push(gh)
                    allGhosts.push(gh);
                    break;

                

            }
        }
    }
}

function ResetGame(){
    allObjects = [];
    allGhosts = [];
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
    constructor(x,y,width,height,solid=false){
        super(x,y,width,height,solid)
        this.dirList = [];
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

    calcCrossToCrossDis() // calculates every neighbouring crossroad distance
    {
        for(let i in this.crossList)
        {
            this.crossDist[this.crossDist[i]] = this.distance(this.crossDist[i]);
        }
        
    }
    reset()
    {
        this.currDist = null ;
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
    constructor(x,y,image_data,speed=1,ghostType = ghostType.rand,solid= false){
        super(x,y,image_data,speed,solid);
        this.crossList = [];
        this.availableDirections =[];
        this.type = type.ghost;
        this.direction = dir.idle;
        this.playerObj= PlayerObject.instance;
        this.ghostType = ghostType;
        this.flee = false;
        this.startX = x;
        this.startY = y;
    }

    exec()
    {
        switch(this.ghostType)
        {
            case ghostType.rand:
                if(!this.flee)
                    this.randMove();
                else
                    this.fleeMove();
                break;
            case ghostType.chase:
                if(!this.flee)
                    this.chaseMove();
                else
                    this.fleeMove();
                break;
            case ghostType.spot:
                if(!this.flee)
                    this.spotMove();
                else
                    this.fleeMove();
                break;
            default:
                if(!this.flee)
                    this.randMove();
                else
                    this.fleeMove();
                break;

        }
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

    fleeMove()
    {

    }

}






ParseLevel();

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i = 0; i <allObjects.length ; i ++){
        allObjects[i].showCollider();
    }
    PlayerObject.instance.executePlayerMovement();
    /*for(let i in allGhosts)
    {
        allGhosts[i].exec();
    }*/
    //console.log(player2.checkCollision(player));
    requestAnimationFrame(update);
}


update();
