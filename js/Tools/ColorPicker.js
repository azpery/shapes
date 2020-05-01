class ColorPicker{
    constructor(){
        this.colors=["#3f51b5", "#00bcd4", "#ffeb3b", "#e64a19", "#f57c00", "#689f38"]
    }

    pick(){
        return this.colors[new Random(0, this.colors.length, 1).get()]
    }
}