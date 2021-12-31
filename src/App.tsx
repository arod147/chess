import { useEffect } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { 
    createBoard, 
    moveHandler, 
    selectBoard, 
    selectCurrentPiece, 
    selectCurrentPieceLocation, 
    selectCurrentPlayer, 
    playerMove, 
    selectPossibleMoves, 
    setPieces } from './chess/chessSlice';
import Promotion from './chess/Promotion';

function App() {
  const dispatch = useAppDispatch()
  const selectedPiece = useAppSelector(selectCurrentPiece)
  const selectedPieceLocation = useAppSelector(selectCurrentPieceLocation)
  const board = useAppSelector(selectBoard)
  const playerTurn = useAppSelector(selectCurrentPlayer)
  const possibleMoves = useAppSelector(selectPossibleMoves)

  useEffect(() => {
        dispatch(createBoard()).then(() => {
          console.log('Board created filling board with pieces')
          dispatch(setPieces())
        })
    }, [])

  useEffect(() => {
    console.log(playerTurn + ' it is now your turn')
  }, [playerTurn])  
    
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
      return<div key={square}  className={backGroundColor}
      onClick={() => {
        if(selectedPiece === null ) {
          dispatch(moveHandler(square))
        }
        if(selectedPiece !== null && square !== selectedPieceLocation) {
          dispatch(moveHandler(square))
        }
        if(selectedPiece !== null) {
          dispatch(playerMove(square))
        }
      }} 
      style={{color: pieceColor}}>
        <div className={'_' + piece + ' ' + 'piece'}></div>
      </div>
    }
    //Display an empty square
    return <div key={square} className={backGroundColor}
    onClick={() =>{
      if(selectedPiece !== null){
        dispatch(playerMove(square))
      }
    }} 
    >
    </div>
  })

  return (
    <div className="App">
      <div className='game'>
        {chessBoard}
        <Promotion />
      </div>
    </div>
  );
}

export default App;
