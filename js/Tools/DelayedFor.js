class DelayedFor{
    constructor(from, to, step, next, delay){
        this.next = next
        this.from = from 
        this.to = to
        this.step = step
        this.delay = delay
        this.cursor = from
    }

    go(){
        if(this.cursor < this.to){
            var me = this
            setTimeout(function(){
                me.next()
                me.cursor += me.step
                me.go()
            }, this.delay)
        }
    }
}