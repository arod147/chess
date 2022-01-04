import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectGameStated, setPlayerColors } from '../chessSlice'

const PreGameMenu = () => {
    const dispatch = useAppDispatch()
    const gameStarted = useAppSelector(selectGameStated)
    return (
        <div id='menu' style={{display: gameStarted === true ? 'none' : 'block'}}>
            <h1>Who would you like to play as white or black?</h1>
            <button onClick={() =>{dispatch(setPlayerColors('White'))}}>White</button>
            <button onClick={() =>{dispatch(setPlayerColors('Black'))}}>Black</button>
        </div>
    )
}

export default PreGameMenu
