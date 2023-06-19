const drawBoard = (() => {
    let gameboard = [
        0 , 0 , 0, 0, 0, 0, 0, 0, 0
    ];

    let init = () => {
        cacheDom();
        render();
        bindEvents();
    };

    let cacheDom = () => {
        el = document.getElementById("gameModule");
        ul = el.querySelector("ul");
        template = el.querySelector("#gameboard-template").innerHTML;
    };

    let bindEvents = () => {
        // the catch is on the whole board
        ul.onclick = (event) => {
            let li = event.target.closest('li');

            if (!li) return;

            if (!ul.contains(li)) return;

            updateBoard(li);
        }
        // addEventListener to each li
        // ul.querySelectorAll("li").forEach(elem => {
        //     elem.addEventListener("click", (event) => {
        //         console.log(event.target)
        //     })
        // })
    };

    let render = () => {
        const data = {
            "gameboard" : [
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
            ]
        }

        Object.keys(gameboard).forEach(key => {
            const newObject = {}
            newObject["dataBoardNumber"] = key;
            newObject["dataPlayerTick"] = gameboard[key];
            data.gameboard.push(newObject);
        })

        // need to find ways to do in js itself without relying on 3rd party library
        // used Mustache as createElement --> appendChild happens much later
        ul.innerHTML = Mustache.render(template, data);
    };

    let updateBoard = (li) => {
        const image = li.querySelector("i");
        const boardNo = image.dataset.boardNo;
        gameboard[boardNo] = 1; // need to based on which player

        render();
    };

    return {
        init
    }
})();

drawBoard.init();