var MAXPOINTS = 100;
var MAXROUNDS = 10;

function team(name){
    this.name = name;
    this.points = 0;
}

function historyItem(title){
    this.title = title;
    this.failure = false;
}

var teams = [new team("Team 1"), new team("Team 2")];
var round = 1;
var currentTeam = 0;
var playToPoints = true;
var cards;
var currentCard;
var history;
var historyIndex = 0;

hideAll();
showPage($("#setup"));

$(document).ready(init());

function hideAll(){
    $("#setup").hide();
    $("#ready").hide();
    $("#play").hide();
    $("#countdown").hide();
    $("#history").hide();  
    $("#gameover").hide();
}

function showPage(tag){
    hideAll();
    tag.show();
}

function init(){

    // On the setup page, this button starts the game
    $("#startbtn").click( 
        function(){
            MAXROUNDS = $("#condition").val();
            MAXPOINTS = $("#condition").val();
            if($(".active > #roundsCheck").length > 0)
                playToPoints = false;
            cards = readFile("cars.txt");
            ready();
        });
    $("#rdybtn").click( 
        function(){
            countdown(1);
        });
    $("#nextbtn").click(
        function(){
            history[historyIndex] = new historyItem(currentCard[0]);
            historyIndex++;
            loadCard();  
        });
    $("#skipbtn").click(
        function(){
            history[historyIndex] = new historyItem(currentCard[0]);
            history[historyIndex].failure = true;
            historyIndex++;
            loadCard();  
        });
    $("#donehistory").click(
        function(){
            var points = $("#historyList > .btn-success").length;
            teams[currentTeam].points += points;
            check();
        });
}

/*****************************************
 * Countdown Page
 *****************************************/ 

function countdown(n){
    if(n > 0){
        var counter = $("#countdown");
        showPage(counter);
        counter.html(n);
        counter.show();
        counter.fadeOut(1000, function(){
                            n--;
                            countdown(n);
                        }
                       );
    } 
    else {
        play();
    }
}

/*****************************************
 * Play / Card Phase Page
 *****************************************/ 

function play(){
    showPage($("#play"));
    history = new Array();
    historyIndex = 0;
    loadCard();
    cleanAnimate(15);  // 300
}

function cleanAnimate(n){
    var target = n - 1;
    var timerBar = $( "#play .progress-bar");
    if(target >= 0){
        timerBar.css("width",target + "px");
        setTimeout( function(){
                        cleanAnimate(target);}, "200");
    }
    else {
        timerBar.css("width", "300px");

        history[historyIndex] = new historyItem(currentCard[0]);
        history[historyIndex].failure = true;
        historyIndex++;

        historyPage();        
    }
}

/*****************************************
 * LOADCARD :: TODO Fix this maybe?? 
 * Proper random wouldn't do the same card
 * --- > Load a list of cards, scramble it, load cards in order
 *****************************************/
var flipFont = false;
function loadCard(){
    var random = Math.floor((Math.random() * 10));
    currentCard = cards[random].split(/\,/g); 
    var cardSpace = $("#play").find(".card");

    if(flipFont){
        cardSpace.find(".title").css("font-size", "50px");
        flipFont = false;        
    }
    if(currentCard[0].length > 10){
        cardSpace.find(".title").css("font-size", "30px");        
        flipFont = true;
    }

    //cardSpace.find(".title").html(currentCard[0]);
   // cardSpace.find(".ban1").html(currentCard[1]);
    //cardSpace.find(".ban2").html(currentCard[2]);
    //cardSpace.find(".ban3").html(currentCard[3]);
   // cardSpace.find(".ban4").html(currentCard[4]);
   // cardSpace.find(".ban5").html(currentCard[5]);
}

/*****************************************
 *   Ready/Score Page
 *****************************************/ 

function ready(){
    showPage($("#ready"));

    $("#ready h3").html("ROUND " + round);
    $("#ready h1").html(teams[currentTeam].name);

    var r = getPoints(teams[0].points, teams[1].points);
    $(".progress-bar#0").width(r[0]);
    $(".progress-bar#1").width(r[1]);
}

function getPoints(i,j){
    if(playToPoints)
        return pointsAsPercentage(i,j);
    return pointsAsDifference(i,j);
}

function pointsAsPercentage(i,j){
    i = ((i / MAXPOINTS) * 100) + "%"; 
    j = ((j / MAXPOINTS) * 100) + "%"; 
    return [i,j];
}

function pointsAsDifference(i,j){
    var total = i + j;
    i = (i / total) * 100 + "%"; 
    j = (j / total) * 100 + "%";
    return [i,j];
}

/*****************************************
 *  Round End
 *****************************************/

function check(){
    if(currentTeam == 1)
        round++;

    if(playToPoints){
        if(teams[0].points > MAXPOINTS || teams[1].points > MAXPOINTS){
            win();
            return;
        }
    }
    else if(round > MAXROUNDS){
            win();
            return;
    }

    switchTeam();
    ready();
}

function switchTeam(){
    if(currentTeam == 0)
        currentTeam = 1;
    else
        currentTeam = 0;
}

function win(){   //TODO: Placeholder
    showPage($("#gameover"));
    var winner = teams[1];
    if(teams[0].points > teams[1].points)
        winner = teams[0];
    $("#gameover div div").html("<br><br><br><h1 class='text-center'>" +
                   winner.name + "</h1>" +
                   "<h3 class='text-center'>wins.</h3>");
}

/*****************************************
 * History Page
 *****************************************/

function historyPage(){
    $("#historyList > button").remove();
    var historyTag = $("#history");
    showPage(historyTag);
    for(i in history){
        if(history[i].failure != true){
            var test = $("#historyList").append("<button type=\"button\" id=\"historybtn\" "
                                     + "class=\"btn btn-success btn-lg "
                                     + "btn-block text-center\">" 
                                     + history[i].title + "</button>"); 
        }
        else {
            $("#historyList").append("<button type=\"button\" id=\"historybtn\" "
                                     + "class=\"btn btn-failure btn-lg "
                                     + "btn-block text-center\">" 
                                     + history[i].title + "</button>"); 
        }
    }
    $("#historyList > button").click(
        function(){
            $(this).toggleClass( "btn-failure btn-success" );
        });
  }

/*****************************************
 *  FILE READING
 *****************************************/

function split(line){
    return line.split(/\,/g);    
}

function readFile(file) {
    var req = new XMLHttpRequest();
    req.open("GET",file,false);
    req.send("");
    return req.responseText.split(/\n/g);
}

/***************
 * Unused functions for better card loading
 */

function loadDeck(file){
    cards = shuffle(readFile(file));
}

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

/************************
 * Knockout Tests
 */

function CardViewModel() {
    var self = this;
    self.title = ko.observable(currentCard[0]);
    self.banned = ko.observableArray([currentCard[1], currentCard[2],currentCard[3],currentCard[4],currentCard[5]]);
}

ko.applyBindings(new CardViewModel());

