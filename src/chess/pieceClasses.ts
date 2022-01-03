// 0  1  2  3  4  5  6  7
// 8  9  10 11 12 13 14 15
// 16 17 18 19 20 21 22 23
// 24 25 26 27 28 29 30 31
// 32 33 34 35 36 37 38 39
// 40 41 42 43 44 45 46 47
// 48 49 50 51 52 53 54 55
// 56 57 58 59 60 61 62 63

// When pawns reaches opposite side of board error line 125 of pieceClass
// When pawns at the left or right edge of the board reach the sqaure before the end of top or bottom of the board same error
// Not to sure what is causes this error but a have determined that the problem lies within legal moves only for 
// pawns all other pieces worked fine.
export class Piece {

    None: number = 0
    Pawn: number = 1
    Knight: number = 2
    Bishop: number = 3
    Rook: number = 4
    Queen: number = 5
    King: number = 6

    Black: number = 16
    White: number = 8

    // handles en passant but cannot update the board if the player chooses enpassant
    // enPassant(board: number[], selectedPiece: number, selectedLocation: number, lastMove: number, currentPlayer: 'White' | 'Black'){
    //     const isWhite = currentPlayer === 'White'
    //     const enPassantLocations: number[] = isWhite ? [24, 25, 26, 27, 28, 29, 30, 31] : [32, 33, 34, 35, 36, 37, 38, 39]

    //     const currentSpace = enPassantLocations.indexOf(selectedLocation)
    //     const lastMoveSpace = enPassantLocations.indexOf(lastMove)
        
    //     if((currentSpace+1 === lastMoveSpace || currentSpace-1 === lastMoveSpace)
    //     && board[lastMove] === (isWhite ? (this.Pawn + this.Black) : (this.Pawn + this.White))){
    //         if(selectedPiece === (isWhite ? (this.Pawn + this.White) : (this.Pawn + this.Black))){
    //             return isWhite ? lastMove-8 : lastMove+8
    //         }
    //     }
    // }

    // returns legal moves after accounting for checks and friendly pinned pieces
    legalMoves(board: number[], selectedLocation: number, selectedPiece: number, lastMove: number): number[]{
        const binary = (selectedPiece).toString(2)
        const isSelectedPieceWhite = selectedPiece > 0 ? selectedPiece < this.Black ? true : false : null
        const enemyPieceIndexies: number[] = []
        const selectedPieceMoves = this.possibleMoves(board, selectedLocation, selectedPiece, lastMove)

        // find all enemy pieces
        board.forEach((piece, index) => {
            const isTargetPieceWhite = piece > 0 ? piece < this.Black ? true : false : null
            if(isSelectedPieceWhite !== isTargetPieceWhite && isTargetPieceWhite !== null){
                enemyPieceIndexies.push(index)
            }
        })
            
        // play a move on the board, if the friendly king is not in check after that move the move is legal
        // return an array of all legal moves
        return <number[]>selectedPieceMoves.map((move) => {
            const boardCopy = [...board]
            const targetPiece = boardCopy[move]
            const isTargetPieceWhite = targetPiece > 0 ? targetPiece < this.Black ? true : false : null

            if (isSelectedPieceWhite !== isTargetPieceWhite){
                boardCopy[selectedLocation] = this.None
                boardCopy[move] = selectedPiece

                // gathers all the enemy piece moves and checks if any of them include the friendly king
                const enemyMoves = enemyPieceIndexies.map((location) => {
                    // accounts for if we capture the attacking piece without having to alter the enemyPieceIndexies array
                    if(location === move){
                        return []
                    }
                    return this.possibleMoves(boardCopy, location, boardCopy[location], lastMove)
                }).flat()

                const kingLocation = boardCopy.findIndex((piece) => {
                    return piece === (isSelectedPieceWhite ? (this.King + this.White) : (this.King + this.Black))
                })

                if(!enemyMoves.includes(kingLocation)){
                    return move
                }
            }
            return
        })
       
    }
   
    // returns numbers of squares to the edge of the board per square
    PrecomputedMoveData() {
    const numSquaresToEdge: number[][] = []
    for (let file = 0; file < 8; file ++) {
        for (let rank = 0; rank < 8; rank++) {
            let numDown = 7 - rank;
            let numUp = rank;
            let numLeft = file;
            let numRight = 7 - file;

            let squareIndex = rank * 8 + file;

                numSquaresToEdge[squareIndex] = [
                    numDown,
                    numUp,
                    numLeft,
                    numRight,
                    Math.min(numDown, numLeft),
                    Math.min(numUp, numRight),
                    Math.min(numDown, numRight),
                    Math.min(numUp, numLeft)
                ]
            }
        }
        return numSquaresToEdge
    }
    //BUG**********************
    //Possible moves currently returns moves that should not exist I think this has to do with the order in which you push
    //a new move to an array and then break.

    // returns piece moves, not including rules for check
    possibleMoves(board: number[], startSquare: number, selectedPiece: number, lastMove: number): number[] {
        const distanceToEdges: number[][] = this.PrecomputedMoveData()
        const possibleMoves: number[] = []
        const binary = (selectedPiece).toString(2)
        const pieceColor = binary.length === 5 ? 'Black' : 'White';
        const piece = binary.substring(binary.length-3)

        
        switch(piece){
            case ('001')://pawn
                const isWhite = pieceColor === 'White'
                let singlePawnMove = isWhite ? -8 : 8 
                const pawnOffsets = [9, 7]

                if (board[startSquare + singlePawnMove] === 0){
                    if ((startSquare > (isWhite ? 47 : 7) && startSquare < (isWhite ? 56 : 16))
                    && board[startSquare + singlePawnMove*2] === 0){
                        possibleMoves.push(startSquare + (singlePawnMove*2))
                    }
                    possibleMoves.push(startSquare + singlePawnMove)
                }
                for(let i = 0; i < 2; i++){ //check diagonals for enemy pieces
                    // prevents overflow when pawn reaches end of the board
                    if (board[startSquare + (isWhite ? -pawnOffsets[i] : pawnOffsets[i])] !== undefined){
                        let boardSpace = startSquare + (isWhite ? -pawnOffsets[i] : pawnOffsets[i])
                        let targetPiece = (board[boardSpace]).toString(2)
                        let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';

                        // NOTE: en passant testing
                        // NOTE: moves properly but cannot get rid of the enemy pawn if player choose en passant
                        // const enPassantLocations: number[] = isWhite ? [24, 25, 26, 27, 28, 29, 30, 31] : [32, 33, 34, 35, 36, 37, 38, 39]
                        // const currentSpace = enPassantLocations.indexOf(startSquare)
                        // const lastMoveSpace = enPassantLocations.indexOf(lastMove)
                        
                        // if((currentSpace+1 === lastMoveSpace || currentSpace-1 === lastMoveSpace)
                        // && board[lastMove] === (isWhite ? (this.Pawn + this.Black) : (this.Pawn + this.White))){
                        //     if(selectedPiece === (isWhite ? (this.Pawn + this.White) : (this.Pawn + this.Black))){
                        //         possibleMoves.push(isWhite ? lastMove-8 : lastMove+8)
                        //     }
                        // } 

                        // prevents overflow issues for edge pawns
                        if ((distanceToEdges[boardSpace][1] + (isWhite ? 1 : -1)) === distanceToEdges[startSquare][1]
                        && pieceOnTargetSquareColor !== 'None'){
                            possibleMoves.push(startSquare + (isWhite ? -pawnOffsets[i] : pawnOffsets[i]))                  
                        }
                        
                    }
                }
                break;

            case ('010')://knight
                const offsets = [[15,17],[-17,-15],[-10,6],[-6,10]]
                for(let i = 0; i < 4; i++){
                    for (let j = 0; j < 2; j++){
                        let currentOffset = offsets[i][j]
                        if(board[startSquare + currentOffset] !== undefined){
                            let targetSquare = startSquare + currentOffset
                                                       
                            if(distanceToEdges[targetSquare][i]+2 === distanceToEdges[startSquare][i]){
                                possibleMoves.push(targetSquare)
                            }
                        }
                    }
                }
                break;

            case ('011')://bishop
                const bishopOffsets = [7, -7, 9, -9];
                for(let directionIndex = 0; directionIndex < 4; directionIndex++) {
                    for(let n = 0; n < distanceToEdges[startSquare][directionIndex+4]; n++) {
                        let targetSquare = startSquare + bishopOffsets[directionIndex] * (n + 1);
                        let pieceOnTargetSquare = board[targetSquare];
                        let targetPiece = (pieceOnTargetSquare).toString(2)
                        let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';

                        possibleMoves.push(targetSquare)

                        if(pieceOnTargetSquareColor === pieceColor) {
                            break;
                        }

                        if(pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None') {
                            break;
                        }
                    }
                }
                break;

            case ('100')://rook
                const rookOffsets = [8, -8, -1, 1];
                for(let directionIndex = 0; directionIndex < 4; directionIndex++) {
                    for(let n = 0; n < distanceToEdges[startSquare][directionIndex]; n++) {
                        let targetSquare = startSquare + rookOffsets[directionIndex] * (n + 1);
                        let targetPiece = (board[targetSquare]).toString(2); // convert piece to binary
                        let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';

                        possibleMoves.push(targetSquare)

                        if(pieceOnTargetSquareColor === pieceColor) {
                            break;
                        }
                        if(pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None') {
                            break;
                        }
                    }
                }
                
                break;

            case ('101')://queen
                const queenOffsets = [ 8, -8, -1, 1, 7, -7, 9, -9];
                for(let directionIndex = 0; directionIndex < 8; directionIndex++) {
                    for(let n = 0; n < distanceToEdges[startSquare][directionIndex]; n++) {
                        let targetSquare = startSquare + queenOffsets[directionIndex] * (n + 1);
                        let pieceOnTargetSquare = board[targetSquare];
                        let targetPiece = (pieceOnTargetSquare).toString(2)
                        let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';
    
                        possibleMoves.push(targetSquare)

                        if(pieceOnTargetSquareColor === pieceColor) {
                            break;
                        }
                        if(pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None') {
                            break;
                        }
                    }
                }
                break;

            case ('110')://king
                const kingOffsets = [8,-8,-1,1,7,-7,9,-9];
                for(let directionIndex = 0; directionIndex < 8; directionIndex++) {
                    if(distanceToEdges[startSquare][directionIndex] !== 0) {
                        let targetSquare = startSquare + kingOffsets[directionIndex]

                        possibleMoves.push(targetSquare)
                    }
                }
                break;
        // end of switch case
        }

    //Return all our possible moves for given piece    
    return possibleMoves

    }// end of legalMoves
}