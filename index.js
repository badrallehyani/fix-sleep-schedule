class TimeObject{
    /**
     * 
     * @param {number} hours 
     * @param {number} minutes
     */
    constructor(hours, minutes){
        this.hours   = hours
        this.minutes = minutes
    }

    afterMinutes(minutes){
        let currentTotalMinutes = this.hours *  60 + this.minutes
        let newTotalMinutes = currentTotalMinutes + minutes

        let newHours = Math.floor(newTotalMinutes / 60) % 24
        let newMinutes = newTotalMinutes % 60

        return new TimeObject(newHours, newMinutes)
    }

    beforeMinutes(minutes){
        let currentTotalMinutes = this.hours *  60 + this.minutes
        let newTotalMinutes = currentTotalMinutes - minutes

        let newHours = mod( Math.floor(newTotalMinutes / 60), 24 )
        let newMinutes = mod( newTotalMinutes, 60)

        return new TimeObject(newHours, newMinutes)
    }

    afterHours(hours){
        let newHrs = (this.hours + hours) % 24
        return new TimeObject(newHrs, this.minutes)
    }

    toMinutes(){
        return this.hours *  60 + this.minutes
    }

    toString(){
        const formattedHours = String(this.hours).padStart(2, '0');
        const formattedMinutes = String(this.minutes).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`
    }

}

function mod(n, m) {
    return ((n % m) + m) % m;
}

/**
 * @param {string} time %HH:%MM
 * @returns {TimeObject}
 */
function createTimeObjectUsingString(time){
    [hours, minutes] = time.split(":").map(e => parseInt(e))
    return new TimeObject(hours, minutes)
}

function createTimeObjectUsingMinutes(minutes){
    let hours = Math.floor(minutes / 60) % 24
    let _minutes = minutes % 60

    return TimeObject(hours, _minutes)
}

/**
 * 
 * @param {number} hours 
 * @param {number} minutes 
 * @returns {TimeObject}
 */
function createTimeObject(hours, minutes){
    return new TimeObject(hours, minutes)
}




/**
 * 
 * @param {number} start 
 * @param {number} end 
 * @param {number} bound 
 * @returns {number}
*/
function forward(start, end, bound){
    return mod( end - start, bound )
}


/**
 * 
 * @param {number} start 
 * @param {number} end 
 * @param {number} bound 
 * @returns {number}
*/
function backward(start, end, bound){
    return mod( start - end, bound )
}

function backwardAndForward(start, end, bound){
    return {
        backward: backward(start, end, bound),
        forward: forward(start, end, bound)
    }
}

const MAX_MINUTES = 24 * 60 // 24hrs * 60minutes
const CURRENT_INPUT_ID = "current-input"
const TARGET_INPUT_ID = "target-input"
const DURATION_INPUT_ID = "duration-input"

document.querySelector("#show-plans").addEventListener("click", ()=>{

    // restore default div.plan
    document.querySelector("div.plan").innerHTML = `
    <div class="plan-row plan-table-header">
            <strong class="plan-row-day">Day</strong>
            <strong class="plan-row-sleep">Sleep</strong>
            <strong class="plan-row-wakeup">Wake Up</strong>
    </div>
    `

    // Reading Input
    const currentTime = document.querySelector(`#${CURRENT_INPUT_ID}`).value
    const targetTime  = document.querySelector(`#${TARGET_INPUT_ID}`).value

    const duration = document.querySelector(`#${DURATION_INPUT_ID}`).value

    // Create Plan Array Based On Input
    const plan = getPlan(currentTime, targetTime, duration)
    const planLastIndex = plan.length - 1

    // Create HTML Elements Based on Plan
    const planDiv = document.createElement("div"); planDiv.className = "plan";
    
    const planRowFirst = document.createElement("div"); planRowFirst.classList = "plan-row plan-row-first"
    planRowFirst.append(... createPlanRowInnerDivs(0, currentTime, ""))


    const midRows = plan.map( (p, i) =>{
        if(i == 0 || i == plan.length - 1)
            return null;
        
        const div = document.createElement("div"); div.className = "plan-row"
        div.append( ... createPlanRowInnerDivs(i, p, ""))
        return div

    } ).filter( (e) => e != null )


    const planRowLast = document.createElement("div"); planRowLast.classList = "plan-row plan-row-last"
    planRowLast.append( ... createPlanRowInnerDivs(planLastIndex, plan[planLastIndex]) )

    // // Appending the Plan Elements to div.plan
    const divPlan = document.querySelector("div.plan")
    divPlan.appendChild(planRowFirst)
    divPlan.append( ... midRows )
    divPlan.appendChild(planRowLast)
})

/**
 * 
 * @param {string} currentTime 
 * @param {string} targetTime 
 * @param {number} duration 
 * @returns {Array}
 */
function getPlan(currentTime, targetTime, duration){
    const currentTimeObject = createTimeObjectUsingString(currentTime)
    const targetTimeObject  = createTimeObjectUsingString(targetTime)

    const diff = backwardAndForward(currentTimeObject.toMinutes(), targetTimeObject.toMinutes(), MAX_MINUTES)
    const plan = [currentTimeObject.toString()]

    if(diff.backward < diff.forward){
        // go backward
        const steps = Math.round(diff.backward / duration)
        console.log(`Step = ${steps}`)
        var progressCounter = createTimeObjectUsingString(currentTime)
        
        
        console.log(currentTimeObject.toString())
        for(let i = 0; i <= duration; i++){
            progressCounter = progressCounter.beforeMinutes(steps)
            plan.push(progressCounter.toString())
        }
    
    }else{
        // go forward
        const steps = Math.round(diff.forward / duration)
        var progressCounter = createTimeObjectUsingString(currentTime)
        
        
        console.log(currentTimeObject.toString())
        while(progressCounter.toMinutes() < targetTimeObject.toMinutes()){
            progressCounter = progressCounter.afterMinutes(steps)
            plan.push(progressCounter.toString())
        }
    }

    return plan
}

function createPlanRowInnerDivs(day, sleep, wakeup){
    const dayDiv = document.createElement("div"); dayDiv.className = "plan-row-day"
    dayDiv.textContent = day

    const wakeupDiv = document.createElement("div"); wakeupDiv.className = "plan-row-wakeup"
    wakeupDiv.textContent = wakeup
    
    const sleepDiv = document.createElement("div"); sleepDiv.className = "plan-row-sleep"
    sleepDiv.textContent = sleep
    

    return [
        dayDiv, sleepDiv, wakeupDiv
    ]

}
