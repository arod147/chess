import { useAppSelector, useAppDispatch } from '../app/hooks'
import { promotePawn, selectBoard, selectPromotion, allowPromotion } from './chessSlice'

const Promotion = () => {
    const dispatch = useAppDispatch()
    const board = useAppSelector(selectBoard)
    const blackPromoPieces = ['_20', '_18', '_19', '_21']
    const whitePromoPieces = ['_10', '_11', '_13', '_12']
    const promotion = useAppSelector(selectPromotion)

    const promotionContainer = board.map((current, index) => {
        if(index <= 7  && current === 9) {
            dispatch(allowPromotion())
            return whitePromoPieces.map(value => {
                 return <div key={value} onClick={() => dispatch(promotePawn(parseInt(value.slice(1))))} className={value + ' ' + 'piece'}></div>
            })
        }
        if(index > 55 && index <= 63 && current === 17) {
            dispatch(allowPromotion())
            return blackPromoPieces.map(value => {
                 return <div key={value} onClick={() => dispatch(promotePawn(parseInt(value.slice(1))))} className={value + ' ' + 'piece'}></div>
            })
        }
        //Fix this error
        return
    }) 

    return (
            <div id='promoContainer' style={{display: promotion === true ? 'flex' : 'none'}}>
                {promotionContainer}
            </div>
        
    )
}

export default Promotion
