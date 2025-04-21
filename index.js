const NUMBER_OF_GUESSES = 6;
const WORD_LENGTH = 5;
let currentGuess = '';
let currentRow = 0;
const letters = document.querySelectorAll(".game-letter");
const loadingDiv = document.querySelectorAll(".loading")
let done = false;
let isLoading = true;

// Fetch word of the day
async function init() {
    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const { word: fetchedWord } = await res.json();
    word = fetchedWord.toUpperCase();
    const wordParts = word.split("");
    isLoading = false;
    console.log("Palavra do dia:", word);


    // function to add letter
    function addLetter(letter) {
        // checking if there's still space to add letter
        if(currentGuess.length < WORD_LENGTH) {
            // while there's space it will keep adding word, until reach limit of word length
            currentGuess += letter;
        } else {
            // change the last word by deleting the last one and replacing for the new one
            current = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        // update what show in screen
        // letters [...] list of divs
        // currentRow * word_length calculate what row the user is in
            // currentRow = 2 (row 3) starts with index = 10 (2 * 5 = 10)
            // index will be the id letter-1,2,3...
        // currentguess.length - 1 which word of the row user is in
        letters[currentRow * WORD_LENGTH + currentGuess.length - 1].innerText = letter;
    }

    // function to enter guess
    async function enter() {
        // checking if all the spots are filled
        if (currentGuess.length !== WORD_LENGTH) {
            // if it's not then do nothing
            return;
        }

        // check the API for valid word
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            // sending data to browser - post
            method: "POST",
            // json format
                // "word" : "currentGuess"
            body: JSON.stringify({ word: currentGuess})
        })

        // wait for the response and then turn into javascript object
            // destruct
            // get validWorld field and store in this variable called validWord
            // await res.json() return {validWord: true} instead of {"validWord": true}
            // so javascript can understand
        const { validWord } = await res.json();

        if(!validWord) {
            // if isn't validWord call the function to mark invalid word
            markInvalidWord();
            // interrupt and do nothing
            return;
        }

        // get what user entered and break in array
            // currentGuess = HELLO
            // guessParts = ["H", "E", "L", "L", "O"]
            // now can work individually with each letter
        const guessParts = currentGuess.split("");
        // call the function makeMap using wordParts as argument
        const map = makeMap(wordParts);
        // will be used to verify if the word is correct
        let allRight = true;

        // first for just for find correct letters and mark them as correct
        // compare each letter
        for (let i = 0; i < WORD_LENGTH; i++) {
            // compare each letter typed with each correct letter in wordParts in same position
                // ex: correct word HELLO
                // pos 0: "H" === "H"
                // pos 1: "E" === "E"
                // pos 2: "L" === "L"
                // pos 3: "L" === "L"
                // pos 4: "O" === "O"
            // if the typed letter by the user is correct add a class in the div called correct
            if(guessParts[i] === wordParts[i]) {
                // 
                letters[currentRow * WORD_LENGTH + i].classList.add("correct");
                // remove quantity of letters in the map of letters
                // cus if player guessed right one letter, we can't consider this letter in others positions (in case there's repetition of letters)
                map[guessParts[i]]--;
            }
        }

        // second for finds clone and wrong letters
        // use map to make sure we mark the correct amount of close letters
        for (let i = 0; i < WORD_LENGTH; i++) {
            if(guessParts[i] === wordParts[i]) {
                // do nothing

            // check if there's still occurrence of one letter
                // like HELLO
                // there's 2 L
                // so if user guessed 1 L there's stil one
                // if user guessed 3 L there's one wrong then
            } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
                // mark as close
                // to tell user not all letters are correct so game still going on
                allRight = false;
                // add class close in the correct div where the letter that exists in the correct word but isn't in the exactly position
                letters[currentRow * WORD_LENGTH + i].classList.add("close");
                // remove count of this letter so it can't be marked as "close" more than once
                map[guessParts[i]]--;
            } else {
                // wrong
                // to tell user not all letters are correct so the game still going on
                allRight = false;
                // add class wrong to the div to show user the letter is wrong
                letters[currentRow * WORD_LENGTH + i].classList.add("wrong");
            }
        }

        // move forward to next row
        currentRow++;
        // reset the word the user typed so the new row have empty space for a new round
        currentGuess = "";

        // win
        if(allRight) {
            // debug
            // console.log("win")
            // add class winner in the brand to do animation
            document.querySelector(".brand").classList.add("winner");
            document.querySelector(".container").classList.add("hidden"); // hide border
            document.getElementById("win-message").classList.remove("hidden"); // show message
            // done mark game as done 
            done = true;
        // lose
        // check if user used all the number of guesses he had
        } else if (currentRow === NUMBER_OF_GUESSES) {
            // debug if he did print he lost
            // console.log(`you lost, the correct word was ${word}`);
            document.querySelector(".container").classList.add("hidden"); // hide border
            document.getElementById("lose-message").classList.remove("hidden"); // show message
            document.getElementById("correct-word").innerText = word.toUpperCase();
            // done mark game as done
            done = true;
        }
    }

    function backspace () {
        // currentGuess = store what user typed so far
        // currentguess.length - 1 get length except for last char
        // substring (0, ...) new string that start in 0 and go untill before last letter
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        // letters - list of all letters divs
        // currentRow * WORD_LENGTH calc the starting index of the current row
        // + currentGuess.length points to index of the last typed letter (now removed)
        // .innerText = "" delete the letter by replacing with empty space ""
        letters[currentRow * WORD_LENGTH + currentGuess.length].innerText = "";
    }

    // check if its a real word
    function markInvalidWord() {
        // loop to goes by each letter
        for (let i = 0; i < WORD_LENGTH; i++) {
            // remove the class invalid first
            // why remove first? to make sure the animation can happen again
            // if don't remove browser can ignore the new effect
            // letters [...] list of all divs
            // currentRow * WORD_LENGTH + i gets the exactly position
            // line 2, letter 1:
                // pos = 2 * 5 + 1 = 11
                // pos = currentRow * WORD_LENGTH + i
                // pos[11] or letters[11] will get me exactly the div that goes by id letter-11
            letters[currentRow * WORD_LENGTH + i].classList.remove("invalid");

            // after 10 ms add class invalid again
            // without that browser could ignore re-aplication of animation thinking nothing changed
            setTimeout(() => 
                letters[currentRow * WORD_LENGTH + i].classList.add("invalid"), 10
            );
        }
    }

    // add event for press key in keyboard
    document.addEventListener("keydown", function handleKeyPress(event) {

        // if game is done (win or lose)
        // or if isLoading (loading the word of the day or waiting for response)
        if(done || isLoading) {
            // do nothing
            // avoid that user keep typing when is not supposed
            return;
        }

        // get the pressed key in keyboard and store in this variable called action
        const action = event.key;

        // if the key pressed is enter call the function commit
        if (action === "Enter") {
            enter();
        // if the key pressed is backspace call the function backspace
        } else if (action === "Backspace") {
            backspace();
        // if the key pressed is a letter (function isLetter check this) call the function addLetter
        } else if(isLetter(action)) {
            // convert to uppercase send to the function addLetter to show in screen
            addLetter(action.toUpperCase());
        } else {
            // do nothing
        }
    });
}

// regex expression to check if letter pressed by user is a-z or A-Z
// ^ beggin of the string
// $ end of the string
// return true or false
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

// isLoading must be true if its waiting for response from API
// isLoading false if already received the response
function setLoading(isLoading) {
    // loadingDiv access list of classes CSS applied in loadingDiv
    // toggle add or remove a class CSS from element depending of one condition
    // condition true = added
    // condition false = removed
    // if isLoading = true then !isLoading = false so don't add hidden in class so it shows the div
    // isLoading = false then !isLoading = true so add hidden class so don't show the div
    loadingDiv.classList.toggle("hidden", !isLoading);
    /*
        if (isLoading) {
        loadingDiv.classList.remove("hidden"); // mostra o loading
        } else {
        loadingDiv.classList.add("hidden"); // esconde o loading
        }
    */
}

// create a function that received array as argument
// this array will be a list of letters from the secret word
function makeMap(array) {
    // store map of letters, it means it will count how many time a letter appears in the array
    const obj = {};
    // run trough each item (letter) from the array 
    for (let i = 0; i < array.length; i++) {
      // check if the actual letter already exist in the object obj
      if (obj[array[i]]) {
        // if yes then this letter appeared before so sum +1
        obj[array[i]]++;
      } else {
        // if not then add the letter in object obj and define its value as 1
        // meaning the letter appeared for the first time
        obj[array[i]] = 1;
      }
    }
    // return object with how many times a letter apperead 
    return obj;
}

init();