// 0  1  2  3  4  5  6  7
// 8  9  10 11 12 13 14 15
// 16 17 18 19 20 21 22 23
// 24 25 26 27 28 29 30 31
// 32 33 34 35 36 37 38 39
// 40 41 42 43 44 45 46 47
// 48 49 50 51 52 53 54 55
// 56 57 58 59 60 61 62 63
import * as _ from './pieceMethods'

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

    // returns legal moves after accounting for checks and friendly pinned pieces
    legalMoves(board: number[], selectedLocation: number, selectedPiece: number, lastMove: number, canCastle: boolean[]){
        const isSelectedPieceWhite = selectedPiece < this.Black ? true : false
        const selectedPieceMoves = this.possibleMoves(board, selectedLocation, selectedPiece, lastMove)
        let enemyMoves: number[] = []
        // find all enemy pieces
        const enemyPieceLocations = _.findAllEnemyPieces(board, isSelectedPieceWhite)
            
        // play a move on the board, if the friendly king is not in check after that move the move is legal
        const trueLegalMoves = selectedPieceMoves.filter((move) => {
            const boardCopy = [...board]
            boardCopy[selectedLocation] = this.None
            boardCopy[move] = selectedPiece

            enemyMoves = _.getEnemyPieceMoves(boardCopy, enemyPieceLocations, move, lastMove)

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

    // returns piece moves, not including rules for check
    possibleMoves(board: number[], startSquare: number, selectedPiece: number, lastMove: number): number[] {
        const binary = (selectedPiece).toString(2)
        const pieceColor = binary.length === 5 ? 'Black' : 'White';
        const piece = binary.substring(binary.length-3)

        switch(piece){
            case ('001')://pawn
                return _.pawnMoves(board, startSquare, selectedPiece, pieceColor, lastMove)
            case ('010')://knight
                return _.knightMoves(board, startSquare, pieceColor)
            case ('011')://bishop
                return _.bishopMoves(board, startSquare, pieceColor)
            case ('100')://rook
                return _.rookMoves(board, startSquare, pieceColor)               
            case ('101')://queen
                return _.queenMoves(board, startSquare, pieceColor)
            case ('110')://king
                return _.kingMoves(board, startSquare, pieceColor)
            default:
                return []    
        }
    }

}