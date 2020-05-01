class Random {
    constructor(from, to, step){
        this.from = from
        this.to = to
        this.step = step
    }

    get(){
        return Math.floor(Math.random()*(this.to/this.step)) * this.step + this.from
    }
}