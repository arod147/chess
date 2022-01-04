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
        const isCurrentPlayerWhite: boolean = selectedPiece < this.Black ? true : false
        const selectedPieceMoves = this.possibleMoves(board, selectedLocation, selectedPiece, lastMove)
        let enemyMoves: number[] = []
        // find all enemy pieces
        const enemyPieceLocations = _.findAllEnemyPieces(board, isCurrentPlayerWhite)
            
        // play a move on the board, if the friendly king is not in check after that move the move is legal
        const trueLegalMoves = selectedPieceMoves.filter((move) => {
            const boardCopy = [...board]
            boardCopy[selectedLocation] = this.None
            boardCopy[move] = selectedPiece

            enemyMoves = _.getEnemyPieceMoves(boardCopy, enemyPieceLocations, move, lastMove)

            const kingLocation = boardCopy.findIndex((piece) => {
                return piece === (isCurrentPlayerWhite ? (this.King + this.White) : (this.King + this.Black))
            })

            return !enemyMoves.includes(kingLocation)
                  
        })

        // adds castling moves (if available) to trueLegalMoves array
        if(selectedPiece === this.King + (isCurrentPlayerWhite ? this.White : this.Black)){
            _.castleMovesAvailable(board, isCurrentPlayerWhite, enemyMoves, canCastle).forEach((move) =>{
                trueLegalMoves.push(move)
            })
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