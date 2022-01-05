import { useEffect } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { 
  cpuMoveHandler,
    createBoard, 
    selectCpuColor, 
    selectCurrentPlayer, 
    selectGameStated, 
    selectHumanColor, 
    setPieces } from './chess/chessSlice';
import Chessboard from './chess/Components/Chessboard';
import PreGameMenu from './chess/Components/PreGameMenu';
import Promotion from './chess/Promotion';

function App() {
  const dispatch = useAppDispatch()
  const playerTurn = useAppSelector(selectCurrentPlayer)
  const cpuColor = useAppSelector(selectCpuColor)
  const humanColor = useAppSelector(selectHumanColor)
  const gameStarted = useAppSelector(selectGameStated)

  useEffect(() => {
    if(gameStarted !== false)
        dispatch(createBoard()).then(() => {
          dispatch(setPieces())
        })
    }, [gameStarted])

  useEffect(() => {
    if(playerTurn === cpuColor && gameStarted !== false) {
      setTimeout(() => {dispatch(cpuMoveHandler())}, 300)
    }
  }, [playerTurn, gameStarted])  
    
  return (
    <div className="App">
      <Chessboard />
      <Promotion />
      <PreGameMenu />
    </div>
  );
}

export default App;
