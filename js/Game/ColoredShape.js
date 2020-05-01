class ColoredShape extends Shape{
    constructor(x,y,width,height, context, color){
        super(x,y,width,height, context)
        this.color = color
    }

    draw(){
        this.context.fillStyle = this.color
        this.context.fillRect(this.x, this.y, this.width, this.height)
    }
}
