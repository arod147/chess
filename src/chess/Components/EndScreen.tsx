import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { resetGame, selectCurrentPlayer, selectGameStatus } from "../chessSlice"





const EndScreen = () => {
    const dispatch = useAppDispatch()
    const gameStatus = useAppSelector(selectGameStatus)
    const playerColor = useAppSelector(selectCurrentPlayer)
    let displayeStyle: string = 'none'
    const message = () => {
        if(gameStatus === 'Ended' && playerColor === 'White') {
            displayeStyle = 'Block'
            return <h1>Black player wins! CheckMate</h1>
        }
        if(gameStatus === 'Ended' && playerColor === 'Black') {
            displayeStyle = 'Block'
            return <h1>White player wins! CheckMate</h1>
        }
        if(gameStatus === 'Draw') {
            displayeStyle = 'Block'
            return <h1>Draw!</h1>
        }
    }

    const endMessage = message()

    return (
        <div className='menu' style={{display: displayeStyle}}>
            {endMessage}
            <h2>Would you like to play again?</h2>
            <button onClick={() => dispatch(resetGame())}>Yes!</button>
        </div>
    )
}




export default EndScreen
