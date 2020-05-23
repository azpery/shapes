class DelayedFor{
    constructor(from, to, step, next, delay){
        this.next = next
        this.from = from 
        this.to = to
        this.step = step
        this.delay = delay
        this.cursor = from
        this.continue = true
    }

    go(){
        if(this.cursor < this.to && this.continue){
            var me = this
            this.timeout = setTimeout(function(){
                me.next()
                me.cursor += me.step
                me.go()
            }, this.delay)
        }
    }

    stop(){
        this.continue = false
    }
}