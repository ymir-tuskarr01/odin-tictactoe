const drawBoard = (() => {
    // ---  variable start  --- //
    // object value is inclusive except:
    // - player.playerInfo().num
    let _board = [
        0 , 0 , 0, 0, 0, 0, 0, 0, 0
    ];

    // player is inserted with index 0, while its num property is not 0 based
    let _player = [];
    let _gameRule = {
        "winCondition" : [],
        "playerType": ["pvp", "pvc"],
    };
    let _checkFieldValidation = {
        player: {}
    };
    let _session = {
        currentPlayerTurn: 0,
        currentGameRound: 0,
        currentGame: 0,
        currentBox: "",
        lastGameResult: {
            win: "",
            lose : "",
            tie: 0
        },
        winInRow: 0,
        playerScore: {},
    };
    // ---  variable end    --- //

    // ---- function start  --- //
    let init = (size) => {
        _gameRule.boardSide = size;

        _cacheDom();
        _loadConfig();
        _bindEvents();
    };

    let _loadConfig = () => {
        const size = _gameRule.boardSide;
        document.documentElement.style.setProperty('--boxNum', size);

        _board = [];
        for (let n = 0; n < (size * size); n++) {
            _board.push(0);
        }

        _updateMode();
        _generateWinTemplate();
    };

    let _cacheDom = () => {
        gameMode = document.getElementById("gameMode");
        gameModeInput = gameMode.querySelectorAll('input[name="mode"]');
        playerStats = document.getElementById("playerStats");
        nextGameDialog = document.getElementById("nextGameDialog");
        playerDetails = document.getElementById("playerDetails");
        playersField = playerDetails.querySelectorAll("#playerDetails input");
        player2Details = document.getElementById("p2Details");
        el = document.getElementById("gameModule");
        ulBoard = el.querySelector("ul#board");
        paragBtn = el.querySelector("#gameInitBtn");
        paragAnnounce = el.querySelector("#announceBoard");
        paragAlert = el.querySelector("#alertBoard");
        paragNextGame = nextGameDialog.querySelector("p");
        playerStatsRow = document.getElementById("playerStatsRow");
        templateBoard = el.querySelector("#board-template").innerHTML;
        templateButton = document.querySelector("#startbtn-template").innerHTML;
        templateAnnounce = document.querySelector("#announceboard-template").innerHTML;
        templateAlert = document.querySelector("#alertboard-template").innerHTML;
        templateNextGameStatement = document.querySelector("#nextgamestatement-template").innerHTML;
        templatePlayerStatsRow = document.querySelector("#playerstatsrow-template").innerHTML;
    };

    let _render = () => {
        const data = {
            "board" : [
                // {
                //     dataBoardNumber: 0,
                //     dataPlayerTick: 0,
                // },
                // {
                //     dataBoardNumber: 1,
                //     dataPlayerTick: 0,
                // },
                // {
                //     dataBoardNumber: 2,
                //     dataPlayerTick: 0,
                // }
            ],
            "startbtn" : [],
            "announceboard" : [],
            "playerstatsrow" : [],
            "alertboard" : [],
        }
        const indNotInclusive = 1;
        let newObject = {};

        // process data for append
        Object.keys(_board).forEach(key => {
            newObject = {}
            newObject["dataBoardNumber"] = key;
            newObject["dataPlayerTick"] = _board[key];

            switch(_board[key]) {
                case 1 :
                    newObject["dataCross"] = "visible";
                    delete newObject["dataRound"];
                    break;
                case 2:
                    newObject["dataRound"] = "visible";
                    delete newObject["dataCross"];
                    break;
                default:
                    break;
            };
            data.board.push(newObject);
        });

        _board.map((value, index) => {
            if (value == 0) {
                data.board[index]["dataBoardEditable"] = "editable";
            }
        })

        if (_session.winMove) {
            Object.keys(_board).forEach((index, key) => {
                if (Object.values(_session.winMove)[0].includes(Number(index))) {
                    data.board[index][`data${Object.keys(_session.winMove)[0]}`] = "visible";
                }
            })
        }

        try {
            Object.keys(_session).forEach(key => {
                newObject = {};
                if (key == "currentGame") {
                    if (_session[key] == 0)  {
                        newObject["dataStart"] = "visible";
                        delete newObject["dataReset"];
                        delete newObject["dataNew"];
                        if (_player.length > 0) {
                            newObject["dataReset"] = "visible";
                            newObject["dataNew"] = "visible";
                            delete newObject["dataStart"];
                        }
                    } else {
                        newObject["dataReset"] = "visible";
                        newObject["dataNew"] = "visible";
                        delete newObject["dataStart"];
                    }
                    data.startbtn.push(newObject);
                }
            })
        } catch (error) {
            console.warn(`render startbtn ${error}`);
        }

        try {
            Object.keys(_session).forEach(key => {
                newObject = {};
                if (key == "playerScore") {
                    if (Object.keys(_session[key]).length == 0) {
                        newObject["dataText"] = "Enjoy The Game";
                    } else {
                        const lastPlayerWin = _session.lastGameResult.win.playerInfo();
                        let playerScore = _session.playerScore;

                        if (playerScore[lastPlayerWin.num] !=  0) {
                            let value = `${lastPlayerWin.name} win.`;

                            if (playerScore[lastPlayerWin.num] == 3) {
                                if (_session.winInRow == 2) {
                                    value = `congratulations to ${lastPlayerWin.name} for winning 3 in a row.`;
                                }
                            }

                            if (_session.lastGameResult.tie != 0) {
                                value = "Tie";
                            }

                            newObject["dataText"] = value;
                        }
                    }
                    data.announceboard.push(newObject);
                }
            })
        } catch (error) {
            console.warn(`render announceboard : ${error}`);
        }

        try {
            Object.keys(_player).forEach(key => {
                newObject = {};

                newObject["dataPlayerLength"] = (key * 1 ) + indNotInclusive;
                newObject["dataPlayerName"] = _player[key].playerInfo().name;
                if (!_session.playerScore[(key * 1 ) + indNotInclusive]) newObject["dataPlayerCurrentScore"] = 0;
                else newObject["dataPlayerCurrentScore"] = _session.playerScore[(key * 1 ) + indNotInclusive];
                if (!_player[key].win) {
                    newObject["dataPlayerTotalScore"] = 0;
                }
                else {
                    newObject["dataPlayerTotalScore"] = _player[key].win
                }

                data.playerstatsrow.push(newObject);
            })
        } catch (error) {
            console.warn(`render playerstatsrow : ${error}`);
        }

        try {
            Object.keys(_checkFieldValidation).forEach(key => {
                if (key == "player") {
                    Object.keys(_checkFieldValidation[key]).forEach(obj => {
                        newObject = {};
                        newObject["dataText"] = _checkFieldValidation[key][obj];

                        data.alertboard.push(newObject);
                    });
                }
            });
        } catch (error) {
            console.warn(`render alertboard : ${error}`);
        }

        // append to dom
        // used Mustache as createElement --> appendChild happens much later
        paragAlert.innerHTML = Mustache.render(templateAlert, data);
        ulBoard.innerHTML = Mustache.render(templateBoard, data);
        paragBtn.innerHTML = Mustache.render(templateButton, data);
        paragAnnounce.innerHTML = Mustache.render(templateAnnounce, data);
        paragNextGame.innerHTML = Mustache.render(templateNextGameStatement, data);
        playerStatsRow.innerHTML = Mustache.render(templatePlayerStatsRow, data);
        paragAlert.innerHTML = Mustache.render(templateAlert, data);

        // open modal
        if (Object.keys(_session["playerScore"]).length != 0) {
            const lastPlayerWin = _session.lastGameResult.win.playerInfo();
            let playerScore = _session.playerScore;

            if (playerScore[lastPlayerWin.num] !=  0 &&
                playerScore[lastPlayerWin.num] == 3) {
                nextGameDialog.showModal();
            }
        }

        if (_session["playerType"] == "pvp") {
            player2Details.classList.add("visible");
        } else {
            player2Details.classList.remove("visible");
        }

        if (_session.currentGame == 0) {
            gameMode.classList.add("visible");
            playerDetails.classList.add("visible");
            playerStats.classList.remove("visible");

            if (_player.length > 0) {
                gameMode.classList.remove("visible");
                playerDetails.classList.remove("visible");
                playerStats.classList.add("visible");
            }
        } else {
            gameMode.classList.remove("visible");
            playerDetails.classList.remove("visible");
        }
    };

    let _bindEvents = () => {
        gameMode.addEventListener("change", (event) => {
            let input = event.target.closest("input");

            if (!input) return;

            if (!gameMode.contains(input)) return;

            _updateMode();
        });
        // the catch event is on the whole board
        ulBoard.onclick = (event) => {
            let li = event.target.closest('li');

            if (!li) return;

            if (!ulBoard.contains(li)) return;

            _session.currentBox = li;
            _updateBoard();
        };

        el.onclick = (event) => {
            let button = event.target.closest("button");

            if (!button) return;

            if (!el.contains(button)) return;

            if (button.id == "startBtn") _startGame();

            if (button.id == "resetBtn") _resetGame("hard");

            if (button.id == "newBtn") _newGame();
        };

        nextGameDialog.onclick = (event) => {
            let confirmBtn = event.target.closest(".confirm");
            let cancelBtn = event.target.closest(".cancel");

            if (!confirmBtn && !cancelBtn) return;

            if (!nextGameDialog.contains(confirmBtn) && !nextGameDialog.contains(cancelBtn)) return;

            if (confirmBtn) {
                _resetGame();
                nextGameDialog.close();
            }

            if (cancelBtn) {
                _dispose();
                nextGameDialog.close();
                return;
            }
        }
    };

    let _generateWinTemplate = () => {
        _winTemplateHelper("horizontal");
        _winTemplateHelper("vertical");
        _winTemplateHelper("diagonal");
    }

    let _winTemplateHelper = (token) => {
        let winArr = [];
        let indexArg;
        let boardSide = Math.sqrt(_board.length);
        let limit = boardSide;

        if (token == "diagonal") {
            limit = 2;
        }

        for (let n = 0; n < limit; n++) {
            winArr = [];
            for (let m = 0; m < boardSide; m++) {

                if (token == "horizontal") {
                    indexArg = (n*boardSide)+m;
                } else if (token == "vertical") {
                    indexArg = n+(boardSide*m);
                } else if (token == "diagonal") {
                    limit = 2;

                    indexArg = (boardSide + 1) * m;
                    if (n != 0) {
                        indexArg = (boardSide - 1) * (1 + m);
                    }
                }

                let index = indexArg;

                winArr.push(index);
            }
            _gameRule.winCondition.push(winArr);
        }
    }

    let _startGame = () => {
        _resetGame();
        _getPlayer();
        _render();
    };

    let _getPlayer = () => {
        const resultCheck = _checkPlayerField();

        if (!resultCheck) {
            _clearAlert();
            _promptRequiredField();
            _render();
            return;
        }

        _clearAlert();

        const player1 = Player({
            name: playersField[0].value,
            num: 1,
        });

        let player2 = Player({
            name: playersField[1].value,
            num: 2,
        });

        if (_session["playerType"] != "pvp") {
            player2.setProp("name", "computer");
        }

        _player = [];
        _player.push(player1);
        _player.push(player2);
    };

    let _checkPlayerField = () => {
        const condPlayer1 = playersField[0].value != null && playersField[0].value != "";
        let condPlayer2 = playersField[1].value != null && playersField[1].value != "";

        if (_session["playerType"] != "pvp") {
            condPlayer2 = true;
        }

        return (condPlayer1) && (condPlayer2);
    }

    let _promptRequiredField = () => {

        if (playersField[0].value == null || playersField[0].value == "") {
            _checkFieldValidation["player"][0] = "Please enter player 1 name.";
        }

        if (_session["playerType"] == "pvp" && (playersField[1].value == null || playersField[1].value == "")) {
            _checkFieldValidation["player"][1] = "Please enter player 2 name.";
        }
    };

    let _clearAlert = () => {
        if (_checkFieldValidation["player"][0]) delete _checkFieldValidation["player"][0];
        if (_checkFieldValidation["player"][1]) delete _checkFieldValidation["player"][1];
    };

    let _updateMode = () => {
        gameModeInput.forEach(node => {
            node.toggleAttribute("checked");
            if (node.checked) _session["playerType"] = node.value;
        })
        _render();
    };

    let _updateBoard = () => {
        let moveable = _moveable();
        if (!moveable) return;

        const boardNo = _session.currentBox.dataset.boardNo;

        _board[boardNo] = _player[_session["currentPlayerTurn"]].playerInfo().num;    // player[0] need to based on current user turn

        if (_board.filter(value => value != 0).length == 1) {
            _session.currentGame++;
        }

        _checkMove();
    };

    let _moveable = () => {

        if (_player.length == 0) {
            _checkFieldValidation["player"][0] = "Click the Start button";
            _render();
            return false;
        }

        const boardNotEditable = _session.currentBox.dataset.playerTick == 0 ? false : true;
        if (boardNotEditable) return false;

        if (_session.winMove) return false;

        return true;
    }


    let _checkMove = () => {
        const nextPlayerNum = _session.currentPlayerTurn == 0 ? 1 : 0;
        const indNotInclusive = 1;

        const sameCurrentPlayer = (currentvalue) => _board[currentvalue] == _session.currentPlayerTurn + indNotInclusive;
        const sameNextPlayer = (currentvalue) => _board[currentvalue] == nextPlayerNum + indNotInclusive;

        try {

            for (const [index, element] of _gameRule.winCondition.entries()) {
                if (element.every(sameCurrentPlayer) || element.every(sameNextPlayer)) {
                    _session.winMove = {Horizontal : element};

                    if (index >= 3 && index <= 5) {
                        _session.winMove = {Vertical : element};
                    } else if (index >= 6 && index <= 7) {
                        if (element[0] == 0) {
                            _session.winMove = {DiagonalOne : element};
                        } else {
                            _session.winMove = {DiagonalTwo : element};
                        }
                    }

                    return _sessionResult("win");
                }
            }
            return _sessionResult("tie");

        } catch (error) {
            console.warn(`checkMove WinMove : ${error}`);
        };
    };

    let _sessionResult = (token) => {
        const currentPlayer = _player[_session.currentPlayerTurn];
        const currentPlayerNum = currentPlayer.playerInfo().num;
        const nextPlayerNum = currentPlayerNum == 1 ? 2 : 1;
        const nextPlayer = _player[nextPlayerNum];
        const indNotInclusive = 1;
        const currentPlayerRealIndex = currentPlayerNum - indNotInclusive;
        const nextPlayerRealIndex = nextPlayerNum - indNotInclusive;
        let currentPlayerScore = _session.playerScore;

        if (token == "win") {
            if (!currentPlayerScore[currentPlayerNum]) {
                currentPlayerScore[currentPlayerNum] = 1;
                if (!currentPlayerScore[nextPlayerNum]) {
                    currentPlayerScore[nextPlayerNum] = 0;
                }
            }
            else {
                currentPlayerScore[currentPlayerNum] += 1;
            }

            // maybe later can use player.id
            if (_session.lastGameResult == "" || _session.lastGameResult.win != currentPlayer) {
                _session.lastGameResult.win = currentPlayer;
                _session.lastGameResult.lose = nextPlayer;
                _session.lastGameResult.tie = 0;
                _session.winInRow = 0;
            } else {
                _session.lastGameResult.tie = 0;
                _session.winInRow = ++_session.winInRow;
            };

            // console.log(currentPlayerScore[currentPlayerNum]);
            if (currentPlayerScore[currentPlayerNum] == 3) {
                if (!_player[currentPlayerRealIndex].win) {
                    _player[currentPlayerRealIndex].win = 1;
                    if (!_player[nextPlayerRealIndex].win) _player[nextPlayerRealIndex].win = 0;
                }
                else _player[currentPlayerRealIndex].win++;

                _render();
                return;
            }

            _render();
            setTimeout(() => {
                _resetRound();
            }, 1000);
        } else if (token == "tie") {
            _render();

            if (_board.every(obj => obj != 0)) {

                _session.lastGameResult.tie = 1;
                ++_session.currentGameRound;

                setTimeout(() => {
                    _resetRound();
                }, 100);
            }
            else {
                _sessionResult("nextTurn");
            };
        } else if (token == "nextTurn") {
            _nextPlayerTurn();
        };
    };

    let _nextPlayerTurn = () => {
        const currentPlayerTurn = _session.currentPlayerTurn == 0 ? 1 : 0;
        _session.currentPlayerTurn = currentPlayerTurn;

        _render();
        if (_session["playerType"] != "pvp" && _session.currentPlayerTurn != 0) boardNo = _computerMove();
    };

    let _computerMove = () => {
        const currentPlayerNum = _session.currentPlayerTurn;
        const nextPlayerNum = currentPlayerNum == 0 ? 1 : 0;
        // const evaluate = Minimax(_board, currentPlayerNum, nextPlayerNum).main();
        const evaluate = MinimaxPruning(_board, _gameRule.winCondition, currentPlayerNum, nextPlayerNum).main();

        _session.currentBox = ulBoard.querySelector(`li[data-board-no="${evaluate}"]`);

        _updateBoard();
        // let moveAble = [];
        // let randomIndex;

        // _board.filter((item, ind) => {
        //     if (item == 0) moveAble.push(ind);
        // });

        // let currentIndex = moveAble.length;
        // while (currentIndex != 0) {
        //     randomIndex = Math.floor(Math.random() * currentIndex);
        //     currentIndex--;

        //     [moveAble[currentIndex], moveAble[randomIndex]] = [moveAble[randomIndex], moveAble[currentIndex]];
        // }

        // let li = ulBoard.querySelector(`li[data-board-no="${moveAble[0]}"]`);

        // _updateBoard(li);
    }

    let _resetRound = () => {
        _session.currentPlayerTurn = 0;
        _session.currentGameRound = 0;
        delete _session.winMove;

        try {
            Object.keys(_board).forEach(key => {
                _board[key] = 0;
            });
        } catch (error){
            console.warn (`resetRound gameboardKey : ${error}`)
        };

        _render();
    };

    // check this everytime adding new property to object
    let _resetGame = (token) => {
        let value = 0;

        try {
            Object.keys(_session).forEach(key => {
                value = 0;
                if (key == "lastGameResult") {
                    const emptyLastGameResult = {
                        win: "",
                        lose: "",
                        tie: 0
                    }

                    value = emptyLastGameResult;
                } else if (key == "playerScore") value = {};
                else if (key == "playerType") value = _session[key];
                else if (key == "currentGame" && token != "hard") value = _session[key];
                _session[key] = value;
            });
        } catch (error) {
            console.warn (`resetGame sessionKey: ${error}`);
        };

        _resetRound();
    };

    let _newGame = () => {
        _player = [];
        _resetGame("hard");

    };

    let _dispose = () => {
        console.log("tet tet tet: dispose");
    }
    // ---- function end    --- //

    return {
        init
    };
})();

const Player = (values) => {
    let name = values["name"];
    let num = values["num"];

    const playerInfo = () => {
        return {name, num};
    };

    const setProp = (prop, value) => {
        if (Player.hasOwnProperty(prop)) {
            switch(prop) {
                case "name":
                    name = value;
                    break;
                case "num" :
                    num = value;
                    break;
                default:
                    break;
            }
        }
    }

    return {
        playerInfo,
        setProp
    };
};

// function minimax(node, depth, maximizingPlayer) is
// if depth = 0 or node is a terminal node then
//     return the heuristic value of node
// if maximizingPlayer then
//     value := −∞
//     for each child of node do
//         value := max(value, minimax(child, depth − 1, FALSE))
//     return value
// else (* minimizing player *)
//     value := +∞
//     for each child of node do
//         value := min(value, minimax(child, depth − 1, TRUE))
//     return value

let Minimax = (gameboard, currentPlayerNum, nextPlayerNum) => {

    let _defaultBox = 0;
    let _indNotInclusive = 1;
    let _currentPlayer = currentPlayerNum + _indNotInclusive;
    let _nextPlayer = nextPlayerNum + _indNotInclusive;

    let _isMovesLeft = (board) => {
        for (let i = 0; i < board.length; i++) {
            if (board[i] == _defaultBox)  return true;
        }

        return false;
    }

    let _evaluate = (board) => {
        let isBreak = false;
        let score = 0;

        [isBreak, score] = _evaluateHelper("horizontal", board);
        if (isBreak) return score;

        [isBreak, score] = _evaluateHelper("vertical", board);
        if (isBreak) return score;

        [isBreak, score] = _evaluateHelper("diagonal", board);
        if (isBreak) return score;

        // for (let n = 0; n < boardSide; n++) {
        //     fillBoxCurrentPlayer = 0;
        //     fillBoxNextPlayer = 0;
        //     for (let m = 0; m < boardSide; m++) {
        //         let index = (n*boardSide)+m;

        //         if (board[index] == 2) {
        //             fillBoxCurrentPlayer++;
        //         } else if (board[index] == 1) {
        //             fillBoxNextPlayer++;
        //         }

        //         if (fillBoxCurrentPlayer  == boardSide) {
        //             return +10;
        //         }

        //         if (fillBoxNextPlayer == boardSide) {
        //             return -10;
        //         }
        //     }
        // }

        // for (let n = 0; n < boardSide; n++) {
        //     fillBoxCurrentPlayer = 0;
        //     fillBoxNextPlayer = 0;
        //     for (let m = 0; m < boardSide; m++) {
        //         let index = n+(boardSide*m);

        //         if (board[index] == 2) {
        //             fillBoxCurrentPlayer++;
        //         } else if (board[index] == 1) {
        //             fillBoxNextPlayer++;
        //         }

        //         if (fillBoxCurrentPlayer  == boardSide) {
        //             return +10;
        //         }

        //         if (fillBoxNextPlayer == boardSide) {
        //             return -10;
        //         }
        //     }
        // }

        // for (let n = 0; n < 2; n++) {
        //     fillBoxCurrentPlayer = 0;
        //     fillBoxNextPlayer = 0;
        //     for (let m = 0; m < boardSide; m++) {
        //         let index = (boardSide + 1) * m;
        //         if (n != 0) {
        //             index = (boardSide - 1) * (1 + m);
        //         }

        //         if (board[index] == 2) {
        //             fillBoxCurrentPlayer++;
        //         } else if (board[index] == 1) {
        //             fillBoxNextPlayer++;
        //         }

        //         if (fillBoxCurrentPlayer  == boardSide) {
        //             return +10;
        //         }

        //         if (fillBoxNextPlayer == boardSide) {
        //             return -10;
        //         }
        //     }
        // }

        return score;
    }

    let _evaluateHelper = (token, board) => {
        let fillBoxCurrentPlayer;
        let fillBoxNextPlayer;
        let indexArg;
        let boardSide = Math.sqrt(board.length);
        let limit = boardSide;
        let isBreak = false;
        let score = 0;

        if (token == "diagonal") {
            limit = 2;
        }

        for (let n = 0; n < limit; n++) {
            fillBoxCurrentPlayer = 0;
            fillBoxNextPlayer = 0;
            for (let m = 0; m < boardSide; m++) {

                if (token == "horizontal") {
                    indexArg = (n*boardSide)+m;
                } else if (token == "vertical") {
                    indexArg = n+(boardSide*m);
                } else if (token == "diagonal") {
                    limit = 2;

                    indexArg = (boardSide + 1) * m;
                    if (n != 0) {
                        indexArg = (boardSide - 1) * (1 + m);
                    }
                }

                let index = indexArg;

                if (board[index] == _currentPlayer) {
                    fillBoxCurrentPlayer++;
                } else if (board[index] == _nextPlayer) {
                    fillBoxNextPlayer++;
                }

                if (fillBoxCurrentPlayer  == boardSide) {
                    score = 10;
                    isBreak = true;
                    break;
                }

                if (fillBoxNextPlayer == boardSide) {
                    score = -10;
                    isBreak = true;
                    break;
                }
            }
        }

        return [isBreak, score];
    }

    let _minimax = (board, depth, maximizingPlayer) => {
        let score = _evaluate(board);

        if (score == 10 || score == -10) return score;
        if (_isMovesLeft(board) == false) return 0;

        if (maximizingPlayer) {
            let best = -1000;

            board.forEach((value, index) => {
                if (value == _defaultBox) {
                    board.splice(index, 1, _currentPlayer);

                    best = Math.max(best, _minimax(board, depth + 1, !maximizingPlayer));

                    board.splice(index, 1, _defaultBox);
                }
            })

            return best;
        } else {
            let best = 1000;

            board.forEach((value, index) => {
                if (value == _defaultBox) {
                    board.splice(index, 1, _nextPlayer);

                    best = Math.min(best, _minimax(board, depth + 1, !maximizingPlayer));

                    board.splice(index, 1, _defaultBox);
                }
            })

            return best;
        }
    }

    let _findBestMove = (board) => {
        let bestVal = -1000;
        let bestMove = -1;
        let startDepth = 0;

        board.forEach((value, index) => {
            if (value == _defaultBox) {
                board.splice(index, 1, _currentPlayer);

                let moveVal = _minimax(board, startDepth, false);

                board.splice(index, 1, _defaultBox);

                if (moveVal > bestVal) {
                    bestMove = index;
                    bestVal = moveVal;

                }
            }
        });

        console.log(bestMove);
        return bestMove;
    }

    let main = () => {
        return _findBestMove(gameboard);
    }

    return {
        main
    }
}

let MinimaxPruning  = (gameboard, winTemplate, currentPlayerNum, nextPlayerNum) => {

    let _defaultBox = 0;
    let _indNotInclusive = 1;
    let _currentPlayer = currentPlayerNum + _indNotInclusive;
    let _nextPlayer = nextPlayerNum + _indNotInclusive;
    let MAX = 1000;
    let MIN = -1000;

    let _generateMoves = (board) => {
        let nextMoves = [];

        if (_hasWon(board, _currentPlayer) || _hasWon(board, _nextPlayer)) {
            return nextMoves;
        }

        for (let i = 0; i < board.length; i++) {
            if (board[i] == _defaultBox) {
                nextMoves.push(i);
            }
        }

        return nextMoves;
    }

    let _hasWon = (board, player) => {
        const sameAsPlayer = (currentvalue) => board[currentvalue] == player;

        for (const [index, element] of winTemplate.entries()) {
            if (element.every(sameAsPlayer)) return true;
        }

        return false;
    }

    let _evaluate = (board) => {
        let score = 0;
        const sameCurrentPlayer = (currentvalue) => board[currentvalue] == _currentPlayer;
        const sameNextPlayer = (currentvalue) => board[currentvalue] == _nextPlayer;

        for (const [index, element] of winTemplate.entries()) {
            score = 0;
            if (element.every(sameCurrentPlayer)) {
                return 10;
            } else if (element.every(sameNextPlayer)) {
                return -10;
            }
        }

        return score;
    }

    let _minimaxPruning = (maximizingPlayer, board, alpha, beta) => {
        let nextMoves = _generateMoves(board);
        let best;
        let bestInd = -1;

        if (nextMoves.length == 0) {
            // console.log(board);
            best = _evaluate(board);
            return [best, bestInd];
        } else {

            for (let i = 0; i < nextMoves.length; i++) {

                if (maximizingPlayer) {
                    board.splice(nextMoves[i], 1, _currentPlayer);

                    best = _minimaxPruning(false, board, alpha, beta)[0];

                    if (best > alpha) {
                        alpha = best;
                        bestInd = nextMoves[i];
                    }

                } else {
                    board.splice(nextMoves[i], 1, _nextPlayer);

                    best = _minimaxPruning(true, board, alpha, beta)[0];

                    if (best < beta) {
                        beta = best;
                        bestInd = nextMoves[i];
                    }

                }
                board.splice(nextMoves[i], 1, _defaultBox);

                if (alpha >= beta) break;
            }

            return [(maximizingPlayer) ? alpha : beta, bestInd];
        }
    };

    let _findBestMove = (board) => {
        let bestMove = _minimaxPruning(true, board, MIN, MAX)[1];

        return bestMove;
    }

    let main = () => {
        return _findBestMove(gameboard);
    }

    return {
        main
    }
}

drawBoard.init(3);

// let board = [ [ 'x', 'o', 'x' ],
// [ 'o', 'o', 'x' ],
// [ '_', '_', '_' ] ];

// let currentPlayer = 'o';
// let nextPlayer = 'x';

// // let board = [1, 2, 1, 2, 2, 1, 0, 0, 0];

// // let currentPlayer = 2;
// // let nextPlayer = 1;

// console.log(Minimax(board, currentPlayer, nextPlayer).main());
// console.log(MinimaxPruning(board, currentPlayer, nextPlayer).main());