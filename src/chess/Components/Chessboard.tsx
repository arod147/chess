import { useAppDispatch, useAppSelector } from '../../app/hooks';

import { 
    moveHandler, 
    selectBoard, 
    selectCurrentPiece, 
    selectCurrentPieceLocation,
    selectCheck,
    selectCurrentPlayer, 
    playerMove, 
    selectPossibleMoves,
    getPieceTypeAndColor,
    selectHumanColor,
    selectCpuColor, } from '../chessSlice';
import Tile from './Tiles';
import Piece from './Piece';

const Chessboard = () => {
    const dispatch = useAppDispatch()
    const selectedPiece = useAppSelector(selectCurrentPiece)
    const selectedPieceLocation = useAppSelector(selectCurrentPieceLocation)
    const currentPlayer = useAppSelector(selectCurrentPlayer)
    const humanColor = useAppSelector(selectHumanColor)
    const cpuColor = useAppSelector(selectCpuColor)
    const board = useAppSelector(selectBoard)
    const possibleMoves = useAppSelector(selectPossibleMoves)
    const inCheck = useAppSelector(selectCheck)
    
    var currentRow = 0;
    const chessBoard = board.map((piece, square)=> {
    const pieceDetails = dispatch(getPieceTypeAndColor(piece))
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
     if(inCheck === true ) {
      if(currentPlayer === 'White' && piece === 14) {
        backGroundColor = 'check'
      }
      if(currentPlayer === 'Black' && piece === 22) {
        backGroundColor = 'check'
      }
     }

      if(piece !== 0) {

        //Display our pieces on the board
        return <Tile key={square} tileColor={backGroundColor} 
            onClick={() =>{
              if(pieceDetails.color === humanColor) {
                if(selectedPiece === null ) {
                  dispatch(moveHandler(square))
                }
                if(selectedPiece !== null && square !== selectedPieceLocation) {
                  dispatch(moveHandler(square))
                }
                if(selectedPiece !== null) {
                  dispatch(playerMove(square))
                }
              } else {
                if(selectedPiece !== null) {
                  dispatch(playerMove(square))
                }
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
        <div className={humanColor === 'White' ? 'game' : 'flipBoard'}>
            {chessBoard}
        </div>
    )
}

export default Chessboard
