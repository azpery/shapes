class Shape{
    constructor(x,y,width,height, context){
        this.x = x
        this.y = y
        this.width = width 
        this.height = height
        this.context = context
    }

    draw(){
        this.context.rect(this.x, this.y, this.width, this.height)
        this.context.stroke();
    }
}