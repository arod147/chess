import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectGameStatus, setPlayerColors } from '../chessSlice'

const PreGameMenu = () => {
    const dispatch = useAppDispatch()
    const gameStatus = useAppSelector(selectGameStatus)
    return (
        <div className='menu' style={{display: gameStatus === null ? 'block' : 'none'}}>
            <h2>Who would you like to play as white or black?</h2>
            <button onClick={() =>{dispatch(setPlayerColors('White'))}}>White</button>
            <button onClick={() =>{dispatch(setPlayerColors('Black'))}}>Black</button>
        </div>
    )
}

export default PreGameMenu
