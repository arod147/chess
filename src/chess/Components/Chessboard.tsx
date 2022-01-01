import { useAppDispatch, useAppSelector } from '../../app/hooks';

import { 
    moveHandler, 
    selectBoard, 
    selectCurrentPiece, 
    selectCurrentPieceLocation, 
    selectCurrentPlayer, 
    playerMove, 
    selectPossibleMoves, } from '../chessSlice';
import Promotion from '../Promotion';
import Tile from './Tiles';
import Piece from './Piece';

const Chessboard = () => {
    const dispatch = useAppDispatch()
    const selectedPiece = useAppSelector(selectCurrentPiece)
    const selectedPieceLocation = useAppSelector(selectCurrentPieceLocation)
    const board = useAppSelector(selectBoard)
    const possibleMoves = useAppSelector(selectPossibleMoves)


    var currentRow = 0;
    const chessBoard = board.map((piece, square)=> {
    let binary = (piece).toString(2)
    let pieceColor = binary.length === 5 ? 'Black' : 'White';
    let moves = possibleMoves
    var backGroundColor = 'none'
    
      if(square % 8 === 0 && square !== 0) {
        currentRow = currentRow + 1
      }
      if((square % 8 + currentRow) % 2 === 0) {
        backGroundColor = 'tan'
      } else {
        backGroundColor = 'brown'
      }
      if(selectedPiece != null) {
        moves.map(move => {
          if(move===square) {
            backGroundColor = 'highlight'
          }
          return move
        })
      }

      if(piece !== 0) {

        //Display our pieces on the board
        return <Tile key={square} tileColor={backGroundColor} 
            onClick={() =>{
            if(selectedPiece === null ) {
                dispatch(moveHandler(square))
              }
              if(selectedPiece !== null && square !== selectedPieceLocation) {
                dispatch(moveHandler(square))
              }
              if(selectedPiece !== null) {
                dispatch(playerMove(square))
              }
            }}>
                <Piece name={piece}/>
                </Tile>
      }
      //Display an empty square
      return <Tile key={square} tileColor={backGroundColor}
      onClick={() =>{
        if(selectedPiece !== null){
          dispatch(playerMove(square))
        }
      }} 
      >
      </Tile>
    })

    return (
        <div className="game">
            {chessBoard}
        </div>
    )
}

export default Chessboard
