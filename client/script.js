const url = window.location.origin;
let socket = io.connect(url);

var myTurn = true;
var symbol; 
var draw = 0;

function getBoardState(){
    var obj = {};

    $(".board button").each(function(){
        obj[$(this).attr("id")] = $(this).text() || "";
    });

    return obj;
}

function isGameOver(){
    var state = getBoardState();
    var matches = ["XXX", "OOO"];
    console.log(state);
    var rows = [
        state.r0c0 + state.r0c1 + state.r0c2, 
        state.r1c0 + state.r1c1 + state.r1c2, 
        state.r2c0 + state.r2c1 + state.r2c2, 
        state.r0c0 + state.r1c0 + state.r2c0, 
        state.r0c1 + state.r1c1 + state.r2c1, 
        state.r0c2 + state.r1c2 + state.r2c2, 
        state.r0c0 + state.r1c1 + state.r2c2, 
        state.r0c2 + state.r1c1 + state.r2c0
    ];
    var pole = [
        state.r0c0, state.r0c1, state.r0c2, 
        state.r1c0, state.r1c1, state.r1c2, 
        state.r2c0, state.r2c1, state.r2c2, 
    ]

    for(var i = 0; i< rows.length; i++){
        if(rows[i] === matches[0] || rows[i] === matches[1]){
            return 1;
        }
    }
    
    //костыль для ничьей
    for(var i = 0; i < pole.length; i++){
        if(pole[i] == "X" || pole[i] == "O"){
            draw = draw+1;
        } 
    }
    if(draw === 135) return 2;

    return 0;

}


function renderTurnMessage(){
    if(!myTurn){
        $("#message").text("Ход опонента");
        $(".board button").removeAttr("disabled");
    }else{
        $("#message").text("Ваш ход");
        $(".board button").removeAttr("disabled");
    }
}

function drawMessaage(){
    $("#message").text("Ничья!");
    $(".board button").removeAttr("disabled");
}

function makeMove(e){
    if(!myTurn){
        return;
    }

    if($(this).text().length){
        return; 
    }

    socket.emit("make.move",{
        symbol: symbol,
        position: $(this).attr("id")
    });
}

socket.on("move.made", function(data){
    $("#" + data.position).text(data.symbol);
    myTurn = data.symbol !== symbol;
    
    //проверка на продолжение игры/победу/проигрыш/ничью
    if(isGameOver() === 0){
        renderTurnMessage();
    }if(isGameOver() === 1){
        if(myTurn){
            $("#message").text("Вы проиграли.");
        }else{
            $("#message").text("Вы выиграли!");
        }

        $(".board button").attr("disabled", true);
    }if(isGameOver() === 2){
        drawMessaage();
    }
});

socket.on("game.begin", function(data){
    symbol = data.symbol;
    myTurn = symbol ==="X";
    renderTurnMessage();
})

socket.on("opponent.left", function(){
    $("#message").text("Опонент вышел из игры.");
    $(".board button").attr("disabled", true);
});

$(function(){
    $(".board button").attr("disabled", true);
    $(".board> button").on("click", makeMove);
});
