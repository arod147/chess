import { useAppSelector, useAppDispatch } from '../app/hooks'
import { promotePawn, selectPromotion, selectCurrentPlayer } from './chessSlice'

const Promotion = () => {
    const dispatch = useAppDispatch()
    const currentPlayerColor = useAppSelector(selectCurrentPlayer)
    const blackPromoPieces = ['_20', '_18', '_19', '_21']
    const whitePromoPieces = ['_10', '_11', '_13', '_12']
    const promotion = useAppSelector(selectPromotion)

    const getPromoPieces = () => {
        if(promotion === true && currentPlayerColor === 'White') {
            return whitePromoPieces.map(value => {
                return <div key={value} onClick={() => dispatch(promotePawn(parseInt(value.slice(1))))} className={value + ' ' + 'piece'}></div>
            })
        }
        if(promotion === true && currentPlayerColor === 'Black') {
            return blackPromoPieces.map(value => {
                return <div key={value} onClick={() => dispatch(promotePawn(parseInt(value.slice(1))))} className={value + ' ' + 'piece'}></div>
            })
        }
    } 

    const promotionContainer = getPromoPieces()
    return (
        <div id='promoBox' style={{display: promotion === true ? 'flex' : 'none'}}>
            <h3>Which piece would you like to promote to?</h3>
            <div id='promoContainer'>
                {promotionContainer}
            </div>
        </div>
        
    )
}

export default Promotion