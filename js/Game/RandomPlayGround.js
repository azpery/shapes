class RandomPlayGround extends PlayGround{
    play(){
        var widths = this.width / this.gridSize
        var heights = this.height / this.gridSize

        var colorPicker = new ColorPicker()

        var me = this
        var delayedLoop = new DelayedFor(0, this.gridSize * this.gridSize * this.gridSize, 1, function(){
            var x = new Random(0, me.width, widths).get()
            var y = new Random(0, me.height, heights).get()

            let shape = new ColoredShape(x, y, widths, heights, me.context, colorPicker.pick())
            shape.draw()
        }, 37/this.speed)

        delayedLoop.go()
            
        
    }
}