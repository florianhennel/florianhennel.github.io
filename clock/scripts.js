document.addEventListener("DOMContentLoaded",main);
function main(){
const hourHand = document.getElementById("hour");
const minuteHand = document.getElementById("minute");
const secondHand = document.getElementById("second");
const analogClock = document.getElementById("analogClock");
const digitalClock = document.getElementById("digitalClock");
const cities = document.querySelectorAll("#cityTimes");
let hourDegree;
let minuteDegree;
let secondDegree;
let hour;
let minute;
let second;
let analog = true;
const timezones = document.querySelector(".timezones").childNodes;
const changers = document.querySelectorAll(".changer");
let curretTimeZone = "Budpest";

changers.forEach(c=>{
    c.addEventListener("click",()=>{
        if (event.target.innerHTML == "Digital" && analog) {
            analogClock.style.display = "none"; analog = false;
            digitalClock.style.display = "block";
        }
        else if(event.target.innerHTML == "Analog" && !analog){
            digitalClock.style.display = "none"; analog = true;
            analogClock.style.display = "block";
        }
    })
});
timezones.forEach(zone=>{
    zone.addEventListener("click",()=>{
        let cityName = event.target.innerHTML.split('<')[0];
        getTime(cityName).then(t=>{
            console.log(t);
            let timeDiff = t.slice(26,29);
            let time = new Date(t);
            time.setHours(time.getHours()+Number(timeDiff)-2);
            setTime(time);
        });
    });
});
getTimeForTimezone("Europe/Budapest").then(time =>{
    if (time) {
        let currentTime = new Date(time);
        console.log(time);
        setTime(currentTime);
    }
    else{
        console.log("Failed to retreive time!");
    }
});
function getTimeForTimezone(timezone) {
    const url = `https://worldtimeapi.org/api/timezone/${timezone}`;
    return fetch(url)
      .then(response => response.json())
      .then(data => data.datetime)
      .catch(error => {
        console.log('Error:', error);
        return null;
      });
}
async function getTime(cityName){
    switch (cityName) {
        case "Los Angeles":
            return await getTimeForTimezone("America/Los_Angeles");
        case "New York":
            return await getTimeForTimezone("America/New_York");
        case "London":
            return await getTimeForTimezone("Europe/London");
        case "Kyiv":
            return await getTimeForTimezone("Europe/Kyiv");
        case "Hong Kong":
            return await getTimeForTimezone("Asia/Hong_Kong");
        case "Tokyo":
            return await getTimeForTimezone("Asia/Tokyo");
        case "Paris" || "Budapest":
            return await getTimeForTimezone("Europe/Paris");
        default:
            break;
    }
}
cityTimes();
function cityTimes(){
    cities.forEach(city => {
        let cityName = city.parentElement.innerHTML.split('<')[0];
        getTime(cityName).then(t=>{
            city.innerHTML = t.slice(11,16) || "Fail";
        });
    });
}
setInterval(oneSecondPassed,1000);
function setTime(time){
    hour = time.getHours();
    minute = time.getMinutes();
    second = time.getSeconds();
    let allSeconds = hour*3600+minute*60+second;
    digitalClock.innerHTML = `${hour<10?"0"+hour:hour}:${minute<10?"0"+minute:minute}:${second<10?"0"+second:second}`;
    hourDegree = 270 + (allSeconds/120);
    minuteDegree = 270 + (allSeconds/10);
    secondDegree = 270 + (second*6);
    hourHand.style.transform = `rotateZ(${hourDegree}deg)`;
    minuteHand.style.transform = `rotateZ(${minuteDegree}deg)`;
    secondHand.style.transform = `rotateZ(${secondDegree}deg)`;
}
function oneSecondPassed(){
    secondHand.style.transform = `rotateZ(${secondDegree+6}deg)`;
    minuteHand.style.transform = `rotateZ(${minuteDegree+(1/10)}deg)`;
    hourHand.style.transform = `rotateZ(${hourDegree+(1/120)}deg)`;
    hourDegree += (1/120);
    minuteDegree += (1/10);
    secondDegree += 6;

    if (++second == 60) {
        second = 0;
        cityTimes();
        if (++minute == 60) {
            minute = 0;
            if (++hour == 24) {
                hour = 0;
            }
        }
    }
        
    
    digitalClock.innerHTML = `${hour<10?"0"+hour:hour}:${minute<10?"0"+minute:minute}:${second<10?"0"+second:second}`;


}
function changeTimeZone(date, timeZone) {
    if (typeof date === 'string') {
      return new Date(
        new Date(date).toLocaleString('en-US', {
          timeZone,
        }),
      );
    }
}
}