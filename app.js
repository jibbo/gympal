// HTML elements
const setsSpan = document.getElementById("setsSpan");
const alarm = document.getElementById("alarmSound");
const source = alarm.querySelector('source');
const timerSpan = document.getElementById("timerSpan");
const audioToggle = document.getElementById("audioToggle");
const speakerWave = document.getElementById("speakerWave");
const speakerNone = document.getElementById("speakerNone");
const customTimersContainer = document.getElementById("customTimers");
const standardTimersContainer = document.getElementById("standardTimers");
const addTimerBtn = document.getElementById("addTimer");
const iphoneNote = document.getElementById("iphoneNote");
const canvas = document.getElementById("canvas");
const totalWeight = document.getElementById("totalWeight");
const weightInput = document.getElementById("weight");
const percentWeightInput = document.getElementById("percentWeight");

// Browser functionalities
const supportsLocalStorage = typeof Storage !== "undefined";

// iPhone shit
function isIOS() {
	return (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document));
}

	if (isIOS()) {
		iphoneNote.classList.remove("hidden");
}

// Theme
const storedTheme = supportsLocalStorage ? localStorage.getItem("theme") : null;
let theme = storedTheme != null ? storedTheme : "green";

function setGreenTheme() {
	document.documentElement.style.setProperty("--primaryColor", "#CFFF04");
	document.documentElement.style.setProperty("--accentColor", "#EFFF04");
	document.documentElement.style.setProperty("--buttonTextColor", "black");
	if (supportsLocalStorage) {
		localStorage.setItem("theme", "green");
	}
}

function setOrangeTheme() {
	document.documentElement.style.setProperty("--primaryColor", "#ee7620");
	document.documentElement.style.setProperty("--accentColor", "#ef7620");
	document.documentElement.style.setProperty("--buttonTextColor", "white");
	if (supportsLocalStorage) {
		localStorage.setItem("theme", "orange");
	}
}

function setPurpleTheme() {
	document.documentElement.style.setProperty("--primaryColor", "#8800E7");
	document.documentElement.style.setProperty("--accentColor", "#9d4fff");
	document.documentElement.style.setProperty("--buttonTextColor", "white");
	if (supportsLocalStorage) {
		localStorage.setItem("theme", "purple");
	}
}

if (theme == "green") {
	setGreenTheme();
} else if (theme == "orange") {
	setOrangeTheme();
} else {
	setPurpleTheme();
}

// Sets
const stored = supportsLocalStorage ? localStorage.getItem("sets") : null;
let sets = stored !== null ? parseInt(stored, 10) : 0;
function incSets() {
	sets++;
	if (supportsLocalStorage) {
		localStorage.setItem("sets", sets);
	}
	setsSpan.textContent = sets;
}
function resetSets() {
	sets = 0;
	if (supportsLocalStorage) {
		localStorage.setItem("sets", sets);
	}
	setsSpan.textContent = sets;
}
setsSpan.textContent = sets;

// Timer
let alarmMs = null;
let timerId = -1;
let wakeLock = null;

function formatSeconds(seconds, suffix) {
	if (seconds >= 60) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}` + (suffix == true ? " min" : "");
	}
	return seconds + (suffix == true ? " sec" : "");
}

function startTimer(seconds) {
	if (timerId >= 0) {
		clearInterval(timerId); // prevent multiple timers
	}
	alarmMs = new Date();
	alarmMs.setTime(alarmMs.getTime() + seconds * 1000);
	timerId = setInterval(() => {
		requestWakeLock();
		let tempDate = new Date();
		let diffTime = (alarmMs.getTime() - tempDate.getTime()) / 1000;
		timerSpan.textContent = formatSeconds(parseInt(diffTime));
		if (diffTime <= 0) {
			timerSpan.textContent = formatSeconds(0);
			clearInterval(timerId);
			alarm.play();
			releaseWakeLock();
		}
	}, 500);

	timerSpan.textContent = formatSeconds(seconds);
}

function clearTimer() {
	clearInterval(timerId);
	alarmMs = null;
	timerSpan.textContent = "0:00";
	alarm.pause();
	alarm.currentTime = 0;
	releaseWakeLock();
}

function addTimer() {
	let timer = prompt("Timer in seconds");
	if (timer != null && parseInt(timer) > 0) {
		saveCustomTimer(parseInt(timer));
		displayCustomTimer(timer);
	}
}

function requestWakeLock() {
	if ("wakeLock" in navigator) {
		try {
			if (wakeLock == null) {
				wakeLock = navigator.wakeLock.request();
			}
		} catch (err) {
			console.error(err);
		}
	}
}

function releaseWakeLock() {
	if (wakeLock != null) {
		try {
			wakeLock.then(wls => wls.release());
			wakeLock = null;
		} catch (err) {
			console.error(err);
		}
	}
}

timerSpan.textContent = "0:00";

// Custom Timers
const storedTimers = supportsLocalStorage ? localStorage.getItem("timers") : [];
let customTimers = storedTimers == null ? [] : JSON.parse(storedTimers);

if (!supportsLocalStorage) {
	standardTimers.classList.remove("hidden");
}
else if (supportsLocalStorage && (customTimers.length == 0)) {
	saveCustomTimer(30);
	saveCustomTimer(60);
	saveCustomTimer(120);
	saveCustomTimer(180);
	customTimers = [30, 60, 120, 180];
} else {
	customTimers.sort((a, b) => a - b);
}

function saveCustomTimer(timer) {
	if (supportsLocalStorage) {
		let list = localStorage.getItem("timers");
		if (list != null) {
			list = JSON.parse(list);
			list.push(timer);
			list.sort((a, b) => a - b);
		} else {
			list = [timer];
		}
		localStorage.setItem("timers", JSON.stringify(list));
	}
}

function removeCustomTimer(timer) {
	if (supportsLocalStorage) {
		let list = localStorage.getItem("timers");
		if (list != null) {
			list = JSON.parse(list);
			const index = list.indexOf(timer);
			if (index > -1) {
				list.splice(index, 1);
				localStorage.setItem("timers", JSON.stringify(list));
			}
		}
	}
}

function displayCustomTimer(timer) {
	let button = document.createElement("button");
	let timerLabel = formatSeconds(timer, true);
	button.innerHTML = timerLabel;
	button.classList.add("round");
	button.classList.add("col");
	button.addEventListener("click", () => {
		startTimer(timer);
	});
	onLongPress(button, () => {
		let confirmation = confirm("Delete?")
		if (confirmation) {
			removeCustomTimer(timer);
			customTimersContainer.removeChild(button);
		}
		return false;
	})
	button.addEventListener("contextmenu", () => {
		let confirmation = confirm("Delete?")
		if (confirmation) {
			removeCustomTimer(timer);
			customTimersContainer.removeChild(button);
		}
		return false;
	});
	customTimersContainer.insertBefore(button, addTimerBtn);
}



customTimers.forEach((item, index) => {
	displayCustomTimer(item);
});

// Audio
const storedAudio = supportsLocalStorage ? localStorage.getItem("audio") : true;
let audioOn = storedAudio == null ? true : storedAudio;
if (isIOS()) {
	audioOn = false;
}

function updateAudioToggleBtn() {
	if (audioOn == true) {
		speakerNone.classList.add("hidden");
		speakerWave.classList.remove("hidden");
	} else {
		speakerNone.classList.remove("hidden");
		speakerWave.classList.add("hidden")
	}
}

function toggleAudio() {
	audioOn = !audioOn;
	if (supportsLocalStorage) {
		localStorage.setItem("audio", audioOn);
	}
	if (audioOn && isIOS()) {
		alarm.play();
	}
	updateAudioToggleBtn();
}

updateAudioToggleBtn();

// mobile support
function onLongPress(element, callback) {
	let timer;

	element.addEventListener('touchstart', () => {
		timer = setTimeout(() => {
			timer = null;
			callback();
			return false;
		}, 500);
	});

	function cancel() {
		clearTimeout(timer);
	}

	element.addEventListener('touchend', cancel);
	element.addEventListener('touchmove', cancel);
}

// testing
function test() {
	alarm.play();
}

// weights counter
let weights = [];

function addWeight(weight) {
	weights.push(weight);
	weights.sort((a, b) => b - a);
	draw();
	updateTotalWeight();
}

function updateTotalWeight() {
	let total = weights.reduce((acc, val) => acc + val, 0)*2+20;
	totalWeight.textContent = total.toFixed(2);
}

function resetWeight() {
	weights = [];
	draw();
	updateTotalWeight();
}

function loadWeight() {
	let w = parseFloat(weightInput.value);
	let p = parseFloat(percentWeightInput.value);
	if (isNaN(w) || isNaN(p) || w < 20 || w > 500 || p < 0 || p > 100) {
		alert("Invalid values");
		return;
	}
	let target = ((w * (p / 100) - 20) / 2);
	resetWeight();
	const availableWeights = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25];
	for (let i = 0; i < availableWeights.length; i++) {
		while (target >= availableWeights[i]) {
			addWeight(availableWeights[i]);
			target -= availableWeights[i];
			target = Math.round(target * 100) / 100; // avoid floating point issues
		}
	}
}

function getColor(weight) {
	const colorMap = {
		0.25: [getComputedStyle(document.documentElement).getPropertyValue('--gray') || "#333", "white"],
		0.5: [getComputedStyle(document.documentElement).getPropertyValue('--gray') || "#333", "white"],
		5: [getComputedStyle(document.documentElement).getPropertyValue('--white') || "#ffffff", "black"],
		10: [getComputedStyle(document.documentElement).getPropertyValue('--green') || "#2ecc71", "white"],
		15: [getComputedStyle(document.documentElement).getPropertyValue('--yellow') || "#f39c12", "white"],
		20: [getComputedStyle(document.documentElement).getPropertyValue('--blue') || "#3498db", "white"],
		25: [getComputedStyle(document.documentElement).getPropertyValue('--red') || "#e74c3c", "white"]
	};
	return colorMap[weight] || colorMap[5];
}

function draw() {
	if (canvas.getContext) {
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "rgb(200 200 200)";
		ctx.fillRect(0, 75, 50, 28);
		ctx.fillRect(51, 65, 10, 50);

		let outX = 62;
		weights.forEach((item, index) => {
			let x = 62 + (index * 32);
			let [fillStyle, textColor] = getColor(item);
			ctx.fillStyle = fillStyle;
			ctx.fillRect(x, 50.5, 30, 80);
			ctx.fillStyle = textColor;
			ctx.font = "16px Arial";
			ctx.textAlign = "center";
			ctx.fillText(item.toString(), x + 15, 98);
			outX = x+32;
		});

		ctx.fillStyle = "rgb(200 200 200)";
		let remainingWidth = 300 - weights.length * 32 - 62;
		if (remainingWidth < 0) {
			remainingWidth = 0;
		}
		ctx.fillRect(outX, 72.5, remainingWidth, 35);
	}
}
window.addEventListener("load", draw);

updateTotalWeight()
