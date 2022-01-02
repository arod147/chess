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

    allMoves(board: number[]) {
        const pieceMoves: number[][] = []
            board.map((piece, squareIndex) => {
                if(piece === 0){
                    pieceMoves.push([])
                }
                else{
                    pieceMoves.push(this.legalMoves(board, squareIndex, piece))
                }
            })
        return pieceMoves
    }

    // NOTE: this does not cover pinned cases at all. need to figure out how to implement that better
    trueLegalMoves(board: number[], selectedLocation: number, selectedPiece: number){
        const binary = (selectedPiece).toString(2)
        const isWhite = binary.length === 4 ? true : false
        const enemyPieceIndexies: number[] = []

        const allMoves = this.allMoves(board)

        const kingSpace = board.findIndex((piece) => {
            return piece === (isWhite ? 14 : 22)
        })

        console.log('kingSpace = ' + kingSpace)

        // find all pieces attacking the friendly king
        // and all enemy pieces
        const threatIndexies: number[] = []
        for(let index = 0; index < 64; index++){
            const pieceBinaryLength = board[index].toString(2).length
            const isWhitePiece = pieceBinaryLength > 1 ? pieceBinaryLength === 4 ? true : false : null
            if(isWhite !== isWhitePiece){
                enemyPieceIndexies.push(index)
            }
            if (allMoves[index].includes(kingSpace) && isWhite !== isWhitePiece){
                threatIndexies.push(index)
            }
        }

        // gathers all the possible moves of the enemy pieces and the enemy pieces attacking the friendly king 
        const threatendSpaces = threatIndexies.map((location) => {
            return allMoves[location]
        }).flat()

        const enemyMoves = enemyPieceIndexies.map((location) => {
            return allMoves[location]
        }).flat()

        // can only move the king if there is more than 1 attacker checking
        if(threatIndexies.length > 1 && selectedPiece !== (isWhite ? 14 : 22)){
            return <number[]>[]
        }

        // king can always move away from check, whether there is 1 or 2 attackers
        // if king cant move this will return nothing
        // king cannot move into check, or capture protected pieces
        // BUG: king cannot move right now at all
        if(selectedPiece === (isWhite ? 14 : 22)){
            return <number[]>allMoves[selectedLocation].map((move) => {
                if (!enemyMoves && board[move].toString(2).length !== (isWhite ? 4 : 5)){
                    return move
                }
            })
        }

        // if our move is includes in the threatened spaces we can move there to block
        // BUG: threatened spaces include all enemy moves, not simply the ones directed at the king
        // BUG: cannot capture pieces threatening king
        if (threatIndexies.length > 0){
            return <number[]>allMoves[selectedLocation].map((move) => {
                if(threatendSpaces.includes(move) && board[move].toString(2).length !== (isWhite ? 4 : 5)){
                    return move
                }
            })
        }
        
        return <number[]>allMoves[selectedLocation].map((move) => {
            if(board[move].toString(2).length !== (isWhite ? 4 : 5)){
                return move
            }
        }) 
    }

    //returns our true legal moves
    // pinnedLegalMoves(board: number[], legalMoves: number[], selectedPiece: number, selectedLocation: number){
    //     const selectedPieceBinary = (selectedPiece).toString(2)
    //     const selectedPieceColor = selectedPieceBinary.length === 5 ? 'Black' : 'White'
    //     const trueLegalMoves: number[] = []

    //     //Checks to see if any of our legal moves result in putting our own king in check
    //     legalMoves.forEach(move => {
    //         //We create a copy of the current board to see if after executing this move we are in check
    //         const boardCopy = [...board]
    //         boardCopy[move] = selectedPiece
    //         boardCopy[selectedLocation] = new Piece().None
    //         //Used to keep track of attacking pieces
    //         const attackingPieces: {type: number, location: number}[] = []

    //         //Get all our oppenents attacking pieces
    //         boardCopy.forEach((piece, sqaure) => {
    //             if(piece !== 0) {
    //                 const fullPieceBinary = (piece).toString(2)
    //                 const pieceColor = fullPieceBinary.length === 5 ? 'Black' : 'White'
    //                 if(pieceColor !== selectedPieceColor) {
    //                         attackingPieces.push({type: piece, location: sqaure})
    //                 }
    //             }
    //         })
            
    //         //See if any of our attacking pieces are attacking the king
    //         const x = attackingPieces.find(piece => {
    //             const attackMoves = new Piece().legalMoves(boardCopy, piece.location, piece.type)
    //             let attackedPieceBinary: string | null = null
    //             let attackedPieceType: string | null = null

    //             const foundMove = attackMoves.find(move => {
    //                 if(boardCopy[move] !== 0) {
    //                     attackedPieceBinary = (boardCopy[move]).toString(2)
    //                     attackedPieceType = attackedPieceBinary.substring(attackedPieceBinary.length-3)
    //                 } 
    //                 //We return the move that is attacking our king
    //                 return attackedPieceType === '110'
    //             })
    //             return foundMove !== undefined
    //         })
    //         //Only add moves that dont result in self check 
    //         if(x === undefined) {
    //             trueLegalMoves.push(move)
    //         }
    //     })
    //     return trueLegalMoves
    // }

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

    
    legalMoves(board: number[], startSquare: number, selectedPiece: number): number[] {
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
                        if (pieceOnTargetSquareColor !== 'None'){ // && pieceOnTargetSquareColor !== pieceColor (removed to allow friendly piece protection)
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
                                // if(pieceOnTargetSquareColor !== pieceColor){
                                    possibleMoves.push(startSquare+currentOffset)
                                // }
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

                        // if(pieceOnTargetSquareColor === pieceColor) {
                        //     break;
                        // }

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
                        
                        // if(pieceOnTargetSquareColor === pieceColor) {
                        //     break;
                        // }

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

                        // if(pieceOnTargetSquareColor === pieceColor) {
                        //     break;
                        // }
    
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
                        let pieceOnTargetSquare = board[targetSquare];
                        let targetPiece = (pieceOnTargetSquare).toString(2)
                        let pieceOnTargetSquareColor = targetPiece.length > 1 ? targetPiece.length === 5 ? 'Black' : 'White' : 'None';
                        
                        // if(pieceOnTargetSquareColor !== pieceColor) {
                            possibleMoves.push(targetSquare)
                        // }
                    }
                }
                break;
        // end of switch case
        }

    //Return all our possible moves for given piece    
    return possibleMoves

    }// end of legalMoves
}