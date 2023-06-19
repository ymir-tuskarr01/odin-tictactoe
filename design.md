# tictactoe

## gameboard
- created based on input (ie. GameBoard(3))
- n x n square of i tag
- i class:
  - (empty, tick_player1, tick_player2)
- save move made by player
- start game
- end game
- game logic
  - current player phase
    - choice -> produce round/cross based on player no
      - 1: cross 2: round
    - after choice -> check is same player fill to win
  - win condition:
    - same player tick:
      - horizontal: (n + 1) * n space
      - vertical: (n + n) * n space
      - diagonal: (n + n + 1) * n space
    - check for win only after n move by same player
    - don't check for win if player hasn't made more than 3 move

## player
- 2 player
  - name
  - shape

## mistake
- when designing, how the system works should be think later
- when designing, first think what it will affect
-