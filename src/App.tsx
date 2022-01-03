import { useEffect } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { 
  cpuMoveHandler,
    createBoard, 
    selectCurrentPlayer, 
    setPieces } from './chess/chessSlice';
import Chessboard from './chess/Components/Chessboard';
import Promotion from './chess/Promotion';

function App() {
  const dispatch = useAppDispatch()
  const playerTurn = useAppSelector(selectCurrentPlayer)
  
  useEffect(() => {
        dispatch(createBoard()).then(() => {
          console.log('Board created filling board with pieces')
          dispatch(setPieces())
        })
    }, [])

  useEffect(() => {
    console.log(playerTurn + ' it is now your turn')
    if(playerTurn === 'Black') {
      setTimeout(() => {dispatch(cpuMoveHandler())}, 1000)
    }
  }, [playerTurn])  
    
  return (
    <div className="App">
      <Chessboard />
      <Promotion />
    </div>
  );
}

export default App;
