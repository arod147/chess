import {Piece} from "./pieceClass"

// returns numbers of squares to the edge of the board per square
export const PrecomputedMoveData = () => {
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
const distanceToEdges: number[][] = PrecomputedMoveData()


export const castle = (board: number[], selectedPiece: number, desiredMove: number, canCastle: boolean[]) => {
    const isCurrentPlayerWhite = selectedPiece > new Piece().Black ? false : true
    const kingSideSpaces = isCurrentPlayerWhite ? [61,62] : [5, 6] // white's king side spaces, black's king side spaces
    const queenSideSpaces = isCurrentPlayerWhite ? [57,58,59] : [1, 2, 3]
    
    // checks if piece is king, might be redundant
    if(selectedPiece === new Piece().King + (isCurrentPlayerWhite ? new Piece().White : new Piece().Black)){
        //king's side castling
        if((desiredMove === (isCurrentPlayerWhite ? 62 : 6) && canCastle[(isCurrentPlayerWhite ? 0 : 2)])
        && kingSideSpaces.every((spaceIndex) => {return board[spaceIndex] === new Piece().None})){
            board[desiredMove-1] = isCurrentPlayerWhite ? board[63] : board[7]
            board[isCurrentPlayerWhite ? 63 : 7] = new Piece().None
        }
        //queen's side castling
        if((desiredMove === (isCurrentPlayerWhite ? 58 : 2) && canCastle[(isCurrentPlayerWhite ? 1 : 3)])
        && queenSideSpaces.every((spaceIndex) => {return board[spaceIndex] === new Piece().None})){
            board[desiredMove+1] = isCurrentPlayerWhite ? board[56] : board[0]
            board[isCurrentPlayerWhite ? 56 : 0] = new Piece().None
        }
    }
}

export const castleMovesAvailable = (board: number[], isCurrentPlayerWhite: boolean, enemyMoves: number[], canCastle: boolean[]) => {
    const legalCastleMoves: number[] = []

    for(let castleSide = 0; castleSide < 2; castleSide++){ // castleSide = 0 is queenside, castleSide = 1 is kingside
        if (canCastle[castleSide + (isCurrentPlayerWhite ? 0 : 2)]){
            // spaces that need to be empty to castle
            const kingSideSpaces = isCurrentPlayerWhite ? [61,62]:[5, 6]
            const queenSideSpaces = isCurrentPlayerWhite ? [57,58,59]:[1, 2, 3]

            // indexies account for king's side castle space and then queen's side space
            const whiteCastleSpaces = [58, 62] 
            const blackCastleSpaces = [2, 6] 

            // making sure every space between king and rook (either queen or king side) is empty
            // and ensures theres no checks cutting off
            if (castleSide === 1 ? kingSideSpaces.every((spaceIndex) => {
                return (board[spaceIndex] === new Piece().None && !enemyMoves.includes(spaceIndex))}) 
            : queenSideSpaces.every((spaceIndex) => {
                return board[spaceIndex] === new Piece().None && !enemyMoves.includes(spaceIndex)
            })){
                legalCastleMoves.push(isCurrentPlayerWhite ? whiteCastleSpaces[castleSide] : blackCastleSpaces[castleSide])
            }
        }
    }
    return legalCastleMoves
}

export const updateCastleStates = (board: number[], isCurrentPlayerWhite: boolean, canCastle: boolean[]) => {
    const kingStartingLocation = isCurrentPlayerWhite ? 60 : 4
    const kingRookStartingLocation = isCurrentPlayerWhite ? 63 : 7
    const queenRookStartingLocation = isCurrentPlayerWhite ? 56 : 0
    // canCastle's indexies follow order:
    // 0: white's queenside
    // 1: white's kingside
    // 2: black's queenside
    // 3: black's kingside
    if(board[kingStartingLocation] !== new Piece().King + (isCurrentPlayerWhite ? new Piece().White : new Piece().Black)){
        canCastle[isCurrentPlayerWhite ? 1 : 3] = false
        canCastle[isCurrentPlayerWhite ? 0 : 2] = false
    }
    if(board[kingRookStartingLocation] !== new Piece().Rook + (isCurrentPlayerWhite ? new Piece().White : new Piece().Black)){
        canCastle[isCurrentPlayerWhite ? 1 : 3] = false
    }
    if(board[queenRookStartingLocation] !== new Piece().Rook + (isCurrentPlayerWhite ? new Piece().White : new Piece().Black)){
        canCastle[isCurrentPlayerWhite ? 0 : 2] = false
    }
}

export const findAllEnemyPieces = (board: number[], isCurrentPlayerWhite: boolean) => {
    const enemyPieceLocations: number[] = []
    board.forEach((piece, index) => {
        const isTargetPieceWhite = piece > 0 ? piece < new Piece().Black ? true : false : null
        if(isCurrentPlayerWhite !== isTargetPieceWhite && isTargetPieceWhite !== null){
            enemyPieceLocations.push(index)
        }
    })
    return enemyPieceLocations
}

export const getEnemyPieceMoves = (board: number[], enemyPieceLocations: number[], currentMove: number, lastMove: number) => {
    return enemyPieceLocations.map((location) => {
        // accounts for if we capture the attacking piece without having to alter the enemyPieceLocations array
        if(location === currentMove){
            return []
        }
        return new Piece().possibleMoves(board, location, board[location], lastMove)
    }).flat()
}

export const pawnMoves = (board: number[], startSquare: number, selectedPiece: number, pieceColor: 'White' | 'Black', lastMove: number):number[] => {
    const isCurrentPlayerWhite = pieceColor === 'White'
    const singlePawnMove = isCurrentPlayerWhite ? -8 : 8 
    const pawnOffsets = [9, 7]
    const possibleMoves: number[] = []

    if (board[startSquare + singlePawnMove] === 0){
        if ((startSquare > (isCurrentPlayerWhite ? 47 : 7) && startSquare < (isCurrentPlayerWhite ? 56 : 16))
        && board[startSquare + singlePawnMove*2] === 0){
            possibleMoves.push(startSquare + (singlePawnMove*2))
        }
        possibleMoves.push(startSquare + singlePawnMove)
    }
    for(let i = 0; i < 2; i++){ //check diagonals for enemy pieces
        // prevents overflow when pawn reaches end of the board
        if (board[startSquare + (isCurrentPlayerWhite ? -pawnOffsets[i] : pawnOffsets[i])] !== undefined){
            let boardLocation = startSquare + (isCurrentPlayerWhite ? -pawnOffsets[i] : pawnOffsets[i])
            let targetPiece = board[boardLocation]
            let pieceOnTargetSquareColor = targetPiece > 1 ? targetPiece > 16 ? 'Black' : 'White' : 'None';

            const enPassantLocations: number[] = isCurrentPlayerWhite ? [24, 25, 26, 27, 28, 29, 30, 31] : [32, 33, 34, 35, 36, 37, 38, 39]
            const currentSpace = enPassantLocations.indexOf(startSquare)
            const lastMoveSpace = enPassantLocations.indexOf(lastMove)
            
            if((currentSpace+1 === lastMoveSpace || currentSpace-1 === lastMoveSpace)
            && board[lastMove] === (isCurrentPlayerWhite ? (new Piece().Pawn + new Piece().Black) : (new Piece().Pawn + new Piece().White))){
                if(selectedPiece === (isCurrentPlayerWhite ? (new Piece().Pawn + new Piece().White) : (new Piece().Pawn + new Piece().Black))){
                    possibleMoves.push(isCurrentPlayerWhite ? lastMove-8 : lastMove+8)
                }
            } 

            // prevents overflow issues for edge pawns
            if ((distanceToEdges[boardLocation][1] + (isCurrentPlayerWhite ? 1 : -1)) === distanceToEdges[startSquare][1]){
                if (pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None'){
                    possibleMoves.push(startSquare + (isCurrentPlayerWhite ? -pawnOffsets[i] : pawnOffsets[i]))                   
                }
            }
            
        }
    }
    return possibleMoves
}

export const knightMoves = (board: number[], startSquare: number, pieceColor: 'White' | 'Black'):number[] => {
    const possibleMoves: number[] = []
    const offsets = [[15,17],[-17,-15],[-10,6],[-6,10]]
    for(let i = 0; i < 4; i++){
        for (let j = 0; j < 2; j++){
            let currentOffset = offsets[i][j]
            if(board[startSquare + currentOffset] !== undefined){
                let targetPiece = board[startSquare + currentOffset]
                let pieceOnTargetSquareColor = targetPiece > 1 ? targetPiece > 16 ? 'Black' : 'White' : 'None';
                
                if(distanceToEdges[startSquare+currentOffset][i]+2 === distanceToEdges[startSquare][i]){
                    if(pieceOnTargetSquareColor !== pieceColor){
                        possibleMoves.push(startSquare+currentOffset)
                    }
                }
            }
        }
    }
    return possibleMoves
}

export const bishopMoves = (board: number[], startSquare: number, pieceColor: 'White' | 'Black'):number[] => {
    const possibleMoves: number[] = []
    const bishopOffsets = [7, -7, 9, -9];
    for(let directionIndex = 0; directionIndex < 4; directionIndex++) {
        for(let n = 0; n < distanceToEdges[startSquare][directionIndex+4]; n++) {
            let targetSquare = startSquare + bishopOffsets[directionIndex] * (n + 1);
            let pieceOnTargetSquare = board[targetSquare];
            let targetPiece = pieceOnTargetSquare
            let pieceOnTargetSquareColor = targetPiece > 1 ? targetPiece > 16 ? 'Black' : 'White' : 'None';

            if(pieceOnTargetSquareColor === pieceColor) {
                break;
            }

            possibleMoves.push(targetSquare)

            if(pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None') {
                break;
            }
        }
    }
    return possibleMoves
}

export const rookMoves = (board: number[], startSquare: number, pieceColor: 'White' | 'Black'):number[] => {
    const possibleMoves: number[] = []
    const rookOffsets = [8, -8, -1, 1];
    for(let directionIndex = 0; directionIndex < 4; directionIndex++) {
        for(let n = 0; n < distanceToEdges[startSquare][directionIndex]; n++) {
            let targetSquare = startSquare + rookOffsets[directionIndex] * (n + 1);
            let targetPiece = board[targetSquare]
            let pieceOnTargetSquareColor = targetPiece > 1 ? targetPiece > 16 ? 'Black' : 'White' : 'None';

            if(pieceOnTargetSquareColor === pieceColor) {
                break;
            }

            possibleMoves.push(targetSquare)

            if(pieceOnTargetSquareColor !== pieceColor && pieceOnTargetSquareColor !== 'None') {
                break;
            }
        }
    }
    return possibleMoves
}

export const queenMoves = (board: number[], startSquare: number, pieceColor: 'White' | 'Black'):number[] => {
    const possibleMoves: number[] = []
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
    return possibleMoves
}

export const kingMoves = (board: number[], startSquare: number, pieceColor: 'White' | 'Black'):number[] => {
    const possibleMoves: number[] = []
    const kingOffsets = [8,-8,-1,1,7,-7,9,-9];
    for(let directionIndex = 0; directionIndex < 8; directionIndex++) {
        if(distanceToEdges[startSquare][directionIndex] !== 0) {
            let targetSquare = startSquare + kingOffsets[directionIndex]
            let pieceOnTargetSquare = board[targetSquare];
            let pieceOnTargetSquareColor = pieceOnTargetSquare > 1 ? pieceOnTargetSquare > 16 ? 'Black' : 'White' : 'None';
            
            if(pieceOnTargetSquareColor !== pieceColor) {
                possibleMoves.push(targetSquare)
            }
        }
    }
    return possibleMoves
}