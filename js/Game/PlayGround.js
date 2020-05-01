class PlayGround{
    constructor(width, height, context, speed, gridSize){
        this.context = context
        this.width = width
        this.height = height
        this.speed = speed
        this.gridSize = gridSize
    }

    play(){
        var widths = this.width / this.gridSize
        var heights = this.height / this.gridSize

        for (let x = 0; x < this.width; x += widths) {
            for (let y = 0; y < this.height; y += heights) {
                let shape = new Shape(x, y, widths, heights, this.context)
                var speed = this.speed
                
                setTimeout(function(){
                    shape.draw()
                }, 
                1)
            }
        }
    }
}