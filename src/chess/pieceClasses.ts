// 0  1  2  3  4  5  6  7
// 8  9  10 11 12 13 14 15
// 16 17 18 19 20 21 22 23
// 24 25 26 27 28 29 30 31
// 32 33 34 35 36 37 38 39
// 40 41 42 43 44 45 46 47
// 48 49 50 51 52 53 54 55
// 56 57 58 59 60 61 62 63

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

    castle(board: number[], selectedPiece: number, desiredMove: number, canCastle: boolean[]){
        const isCurrentPlayerWhite = selectedPiece > this.Black ? false : true
        const kingSideSpaces = isCurrentPlayerWhite ? [61,62] : [5, 6] // white's king side spaces, black's king side spaces
        const queenSideSpaces = isCurrentPlayerWhite ? [57,58,59] : [1, 2, 3]
        
        // checks if piece is king, might be redundant
        if(selectedPiece === this.King + (isCurrentPlayerWhite ? this.White : this.Black)){
            //king's side castling
            if((desiredMove === (isCurrentPlayerWhite ? 62 : 6) && canCastle[(isCurrentPlayerWhite ? 0 : 2)])
            && kingSideSpaces.every((spaceIndex) => {return board[spaceIndex] === this.None})){
                board[desiredMove-1] = isCurrentPlayerWhite ? board[63] : board[7]
                board[isCurrentPlayerWhite ? 63 : 7] = this.None
            }
            //queen's side castling
            if((desiredMove === (isCurrentPlayerWhite ? 58 : 2) && canCastle[(isCurrentPlayerWhite ? 1 : 3)])
            && queenSideSpaces.every((spaceIndex) => {return board[spaceIndex] === this.None})){
                board[desiredMove+1] = isCurrentPlayerWhite ? board[56] : board[0]
                board[isCurrentPlayerWhite ? 56 : 0] = this.None
            }
        }
    }

    findAllEnemyPieces(board: number[], isSelectedPieceWhite: boolean){
        const enemyPieceLocations: number[] = []
        board.forEach((piece, index) => {
            const isTargetPieceWhite = piece > 0 ? piece < this.Black ? true : false : null
            if(isSelectedPieceWhite !== isTargetPieceWhite && isTargetPieceWhite !== null){
                enemyPieceLocations.push(index)
            }
        })
        return enemyPieceLocations
    }

    getEnemyPieceMoves(board: number[], enemyPieceLocations: number[], currentMove: number, lastMove: number){
        return enemyPieceLocations.map((location) => {
                // accounts for if we capture the attacking piece without having to alter the enemyPieceLocations array
                if(location === currentMove){
                    return []
                }
                return this.possibleMoves(board, location, board[location], lastMove)
            }).flat()
    }

    // returns legal moves after accounting for checks and friendly pinned pieces
    legalMoves(board: number[], selectedLocation: number, selectedPiece: number, lastMove: number, canCastle: boolean[]){
        const isSelectedPieceWhite = selectedPiece < this.Black ? true : false
        const selectedPieceMoves = this.possibleMoves(board, selectedLocation, selectedPiece, lastMove)
        let enemyMoves: number[] = []
        // find all enemy pieces
        const enemyPieceLocations = this.findAllEnemyPieces(board, isSelectedPieceWhite)
            
        // play a move on the board, if the friendly king is not in check after that move the move is legal
        const trueLegalMoves = selectedPieceMoves.filter((move) => {
            const boardCopy = [...board]
            boardCopy[selectedLocation] = this.None
            boardCopy[move] = selectedPiece

            enemyMoves = this.getEnemyPieceMoves(boardCopy, enemyPieceLocations, move, lastMove)

            const kingLocation = boardCopy.findIndex((piece) => {
                return piece === (isSelectedPieceWhite ? (this.King + this.White) : (this.King + this.Black))
            })

            return !enemyMoves.includes(kingLocation)
                  
        })

        // adds castling moves (if available) to trueLegalMoves array
        if(selectedPiece === this.King + (isSelectedPieceWhite ? this.White : this.Black)){
            for(let castleSide = 0; castleSide < 2; castleSide++){ // castleSide = 0 is kingside, castleSide 1 = queenside
                if (canCastle[castleSide + (isSelectedPieceWhite ? 2 : 0)]){
                    // spaces that need to be empty to castle
                    const kingSideSpaces = isSelectedPieceWhite ? [61,62]:[5, 6]
                    const queenSideSpaces = isSelectedPieceWhite ? [57,58,59]:[1, 2, 3]

                    // indexies account for king's side castle space and then queen's side space
                    const whiteCastleSpaces = [62, 58] 
                    const blackCastleSpaces = [6, 2] 

                    // making sure every space between king and rook (either queen or king side) is empty
                    // and ensures theres no checks cutting off
                    if (castleSide === 0 ? kingSideSpaces.every((spaceIndex) => {
                        return (board[spaceIndex] === this.None && !enemyMoves.includes(spaceIndex))}) 
                    : queenSideSpaces.every((spaceIndex) => {
                        return board[spaceIndex] === this.None && !enemyMoves.includes(spaceIndex)
                    })){
                        trueLegalMoves.push(isSelectedPieceWhite ? whiteCastleSpaces[castleSide] : blackCastleSpaces[castleSide])
                    }
                }
            }
        }
        return trueLegalMoves
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
                        const enPassantLocations: number[] = isWhite ? [24, 25, 26, 27, 28, 29, 30, 31] : [32, 33, 34, 35, 36, 37, 38, 39]
                        const currentSpace = enPassantLocations.indexOf(startSquare)
                        const lastMoveSpace = enPassantLocations.indexOf(lastMove)
                        
                        if((currentSpace+1 === lastMoveSpace || currentSpace-1 === lastMoveSpace)
                        && board[lastMove] === (isWhite ? (this.Pawn + this.Black) : (this.Pawn + this.White))){
                            if(selectedPiece === (isWhite ? (this.Pawn + this.White) : (this.Pawn + this.Black))){
                                possibleMoves.push(isWhite ? lastMove-8 : lastMove+8)
                            }
                        } 

                        // prevents overflow issues for edge pawns
                        if ((distanceToEdges[boardSpace][1] + (isWhite ? 1 : -1)) === distanceToEdges[startSquare][1]){
                            if (pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None'){
                                possibleMoves.push(startSquare + (isWhite ? -pawnOffsets[i] : pawnOffsets[i]))                   
                            }
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
                            let targetPiece = (board[startSquare + currentOffset]).toString(2)
                            let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';
                            
                            if(distanceToEdges[startSquare+currentOffset][i]+2 === distanceToEdges[startSquare][i]){
                                if(pieceOnTargetSquareColor !== pieceColor){
                                    possibleMoves.push(startSquare+currentOffset)
                                }
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

                        if(pieceOnTargetSquareColor === pieceColor) {
                            break;
                        }

                        possibleMoves.push(targetSquare)

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

                        if(pieceOnTargetSquareColor === pieceColor) {
                            break;
                        }

                        possibleMoves.push(targetSquare)

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
    
                        if(pieceOnTargetSquareColor === pieceColor) {
                            break;
                        }

                        possibleMoves.push(targetSquare)

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
                        let pieceOnTargetSquare = board[targetSquare];
                        let targetPiece = (pieceOnTargetSquare).toString(2)
                        let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';
                        
                        if(pieceOnTargetSquareColor !== pieceColor) {
                            possibleMoves.push(targetSquare)
                        }
                    }
                }
                break;
        // end of switch case
        }

    //Return all our possible moves for given piece    
    return possibleMoves
    }// end of legalMoves
}