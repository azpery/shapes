class DelayedFor {
    constructor(from, to, step, next, delay) {
        this.next = next
        this.from = from
        this.to = to
        this.step = step
        this.delay = delay
        this.cursor = from
        this.continue = true
    }

    go() {

        var me = this
        this.timeout = setInterval(function () {
            if (me.cursor < me.to && me.continue) {
                me.next()
                me.cursor += me.step
            }else{
                me.timeout = null
            }
        }, this.delay)

    }

    stop() {
        this.continue = false
    }
}