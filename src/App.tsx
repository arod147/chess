import { useEffect } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { 
  cpuMoveHandler, 
  selectCpuColor, 
  selectCurrentPlayer, 
  selectGameStatus, 
  setPieces } from './chess/chessSlice';
import Chessboard from './chess/Components/Chessboard';
import EndScreen from './chess/Components/EndScreen';
import PreGameMenu from './chess/Components/PreGameMenu';
import Promotion from './chess/Promotion';

function App() {
  const dispatch = useAppDispatch()
  const playerTurn = useAppSelector(selectCurrentPlayer)
  const cpuColor = useAppSelector(selectCpuColor)
  const gameStatus = useAppSelector(selectGameStatus)

  useEffect(() => {
    if(gameStatus === 'InProgress') {
      dispatch(setPieces())
    }
    }, [gameStatus, dispatch])

  useEffect(() => {
    //if(playerTurn === cpuColor && gameStatus === 'InProgress') {
      //setTimeout(() => {dispatch(cpuMoveHandler())}, 300)
    //}
  }, [playerTurn, gameStatus, dispatch, cpuColor])  
    
  return (
    <div className="App">
      <Chessboard />
      <Promotion />
      <PreGameMenu />
      <EndScreen />
    </div>
  );
}

export default App;
