let audioContext;
let mic;
let pitch;

const noteFrequencies = {
    "c": [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01],
   "d-flat":   [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
    "d":   [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
   "e-flat":   [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
    "e":   [20.60, 41.20, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
    "f":   [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
   "g-flat":   [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
    "g":   [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
   "a-flat":   [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
    "a":   [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
   "b-flat":   [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
    "b":   [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
}


let frequenciesArray = Object.values(noteFrequencies)
    .reduce(function(a, b) {
        return a.concat(b)
    }, [])


console.log(frequenciesArray)


let noteLookup = {}
for (const [note, frequencies] of Object.entries(noteFrequencies)) {
    for (const f of frequencies) {
        noteLookup[f] = note;
    }
}

function findClosestNoteToFrequency(freq) {
    let closestNote;
    let closestFreq;
    let minDiff = 10000000000.0;
    for (const [dataFreq, note] of Object.entries(noteLookup)) {
        let diff = freq - dataFreq;
        if (Math.abs(diff) < Math.abs(minDiff)) {
            closestNote = note;
            closestFreq = dataFreq;
            minDiff = diff;
        }
    }
    return [closestNote, closestFreq, minDiff];
}

document.querySelector(".record").addEventListener("click", e => {
    console.log("click");
    setup();
})

async function setup() {
    console.log("recording audio")
    audioContext = new AudioContext();
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    startPitch(stream, audioContext);
}

function startPitch(stream, audioContext) {
    pitch = ml5.pitchDetection('./model', audioContext , stream, modelLoaded);
    console.log(pitch);
}

function modelLoaded() {
    console.log("model loaded");
    setInterval(getPitch, 2000);
}

function getNoteQuality (
    diff
) {
    // returns good, flat, or sharp
    console.log("diff: ", diff)
    if (Math.abs(diff) < .75) {
        return "good";
    }
    return diff < 0 ? "flat" : "sharp";
}

function getPitch() {
    pitch.getPitch(function(err, frequency) {
        if (frequency) {
            [closestNote, closestFreq, diff] = findClosestNoteToFrequency(frequency);
            document.querySelectorAll('.active').forEach(el => {
                el.classList.remove("active");
            })
            document.querySelectorAll('.note').forEach(el => {
                el.classList.remove("sharp");
                el.classList.remove("flat");
                el.classList.remove("good");
            })

            let note = document.querySelector(`.${closestNote}`);
            note.classList.add("active");

            let noteQuality = getNoteQuality(diff);
            note.classList.add(noteQuality);

            document.querySelector(`.note-quality.${noteQuality}`).classList.add("active");
        } else {
            document.querySelectorAll('.active').forEach(el => {
                el.classList.remove("active");
            })
            document.querySelectorAll('.no-note').forEach(el => {
                el.classList.add("active");
            })
        }
    })
}

