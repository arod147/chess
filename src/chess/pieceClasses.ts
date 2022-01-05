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

    getAttackingPieces(board: number[], selectedPiece: number) {
        const attackingPieces: {type: number, location: number}[] = []
        board.forEach((piece, sqaure) => {
            const selectedPieceBinary = (selectedPiece).toString(2)
            const selectedPieceColor = selectedPieceBinary.length === 5 ? 'Black' : 'White'
            const fullPieceBinary = (piece).toString(2)
            const pieceColor = fullPieceBinary.length === 5 ? 'Black' : 'White'
            if(piece !== 0 && pieceColor !== selectedPieceColor) {
                 attackingPieces.push({type: piece, location: sqaure})
            }
        })
        return attackingPieces
    }

    //returns our legal moves
    legalMoves(board: number[], moves: number[], selectedPiece: number, selectedLocation: number){
        //Check to see if any of our moves result in putting our own king in check
        return moves.filter(move => {
            //We create a copy of the current board to see if after executing this move we are in check
            const boardCopy = [...board]
            boardCopy[move] = selectedPiece
            boardCopy[selectedLocation] = new Piece().None
            //Get all oppenents attacking pieces
            const attackingPieces = this.getAttackingPieces(boardCopy, selectedPiece)
            //See if any of our attacking pieces are attacking the king
            const pieceAttackingKing = attackingPieces.find(piece => {
                const attackingPieceMoves = new Piece().moveGenerator(boardCopy, piece.location, piece.type)
                let attackedPieceType: string

                const isKingInCheck = attackingPieceMoves.find(move => {
                    if(boardCopy[move] !== 0) {
                        const attackedPieceBinary = (boardCopy[move]).toString(2)
                        attackedPieceType = attackedPieceBinary.substring(attackedPieceBinary.length-3)
                    } 
                    //We return the move that is attacking our king
                    return attackedPieceType === '110'
                })
                return isKingInCheck !== undefined
            })
            //Only add moves that dont result in self check 
            return pieceAttackingKing === undefined
        })
    }

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

    

    moveGenerator(board: number[], startSquare: number, selectedPiece: number): number[] {
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
                    let boardSpace = startSquare + (isWhite ? -pawnOffsets[i] : pawnOffsets[i])
                    let targetPiece = (board[boardSpace]).toString(2)
                    let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';

                    // prevents overflow issues for edge pawns
                    if ((distanceToEdges[boardSpace][1] + (isWhite ? 1 : -1)) === distanceToEdges[startSquare][1]){
                        if (pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None'){
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