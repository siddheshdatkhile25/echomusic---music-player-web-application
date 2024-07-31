


let currentSong = new Audio();
let songs
let currFolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingseconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingseconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`)
    let response = await a.text()
    
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    images = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }

    }

    //play the first song


    // show all the songs in playlist

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = " ";

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img src="img/music.svg" alt="">
                            <div class="info">
                                <div class="title">${song.replaceAll("%20", " ")}</div>
                                <div class="artist">Siddhesh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="play">
                            </div> </li>`;
    }

    //attach an event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    return songs;
}

//function for playing the song

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    //for automatic loading the first song
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00" ;

     

}

async function displayAlbums(){
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-1)[0];

            //get the medadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML +
                   `<div data-folder='${folder}' class="card rounded">
                        <div class="playBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
                                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="black"/>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
        
    }

    //load the respective playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs =  await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}



async function main() {

    //get the list of songs
    await getSongs("songs/hindi");
    playMusic(songs[0], true)

    //display album playlist
    await displayAlbums()

    // add event listener to play
    let play = document.getElementById("play");
    let pervious = document.getElementById("previous");
    let next = document.getElementById("next");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    // add event listener to previous button
    pervious.addEventListener("click", () => {
        console.log("clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index-1) >= 0) {
            playMusic(songs[index-1]);
        }
        else {
            playMusic(songs[songs.length - 1]); // loop back to the last song
        }

    });

    // add event listener to next button
    next.addEventListener("click", () => {
        console.log("clicked");
        console.log(songs);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        console.log(index);
        if ((index+1) < songs.length) {
            playMusic(songs[index+1]);
        }
        else {
            playMusic(songs[0]); // loop back to the first song
        }
    
    });

    //listen for time update
    currentSong.addEventListener("timeupdate", () => {
        let currentTime = currentSong.currentTime;
        let duration = currentSong.duration;
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentTime)
            }/${secondsToMinutesSeconds(duration)}`;


        //moving seekbar
        // Calculate the progress percentage
        const progress = (currentTime / duration) * 100;

        // Update the seekbar front and circle styles
        document.querySelector(".circle").style.left = `${progress}%`;


        //background color of seekbar
        document.querySelector(".seekbarfront").style.background = `linear-gradient(to right, #01a860 ${progress}%, #ccc 0%)`;
    });


    // listeing seekbar action to move forwrd and backward
    document.querySelector(".seekbarfront").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100


        document.querySelector(".seekbar").style.background = `linear-gradient(to right, green ${percent}%, #ccc 0%)`;
    })

    //add am eventlistner to hamburger
    let hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", () => {
        document.querySelector(".left").style.left ="0";
    });

    //add an eventlistener to cancel button
    let cancel = document.querySelector(".close");
    cancel.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{

        currentSong.volume = parseInt(e.target.value)/100;

        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volumebutton.svg");
        } else {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/volumebutton.svg","img/mute.svg");
        }


    })

    // Get the plus and minus buttons
let volumePlus = document.querySelector(".plus");
let volumeMinus = document.querySelector(".minus");

// Add event listeners to the plus and minus buttons
volumePlus.addEventListener("click", () => {
  // Increase the volume by 10%
  let currentVolume = currentSong.volume;
  currentVolume += 0.1;
  if (currentVolume > 1) {
    currentVolume = 1;
  }
  currentSong.volume = currentVolume;
  document.querySelector(".range input").value = currentVolume * 100;

  // Update the mute button to volume button if volume is greater than 0
  if (currentSong.volume > 0) {
    document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg","img/volumebutton.svg");
}

});

volumeMinus.addEventListener("click", () => {
  // Decrease the volume by 10%
  let currentVolume = currentSong.volume;
  currentVolume -= 0.1;
  if (currentVolume < 0) {
    currentVolume = 0;
  }
  currentSong.volume = currentVolume;
  document.querySelector(".range input").value = currentVolume * 100;

  // Update the mute button to volume button if volume is 0
  if (currentSong.volume === 0) {
    document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/volumebutton.svg","img/mute.svg");
}
});

//add eventlistner to mute the track
document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("img/volumebutton.svg")) {
        e.target.src = e.target.src.replace("img/volumebutton.svg","img/mute.svg");
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;
    }
    else {
        e.target.src = e.target.src.replace("img/mute.svg","img/volumebutton.svg");
        currentSong.volume = 0.1;
        document.querySelector(".range input").value = currentSong.volume * 100;
    }
})




}

main();


