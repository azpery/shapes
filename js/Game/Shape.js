class Shape{
    constructor(x,y,width,height, context){
        this.x = x
        this.y = y
        this.width = width 
        this.height = height
        this.context = context
        this.id = new Random(0, 1000000000, 1).get()
    }

    draw(){
        this.context.rect(this.x, this.y, this.width, this.height)
        this.context.stroke();
    }
}