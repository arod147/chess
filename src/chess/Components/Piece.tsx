
type PieceProps = {
    name: number;
} &typeof defaultProps

const defaultProps = {
    name: 0
}

const Piece = ({name}: PieceProps) => {
    return (
        <div className={'_' + name + ' ' + 'piece'}>
        </div>
    )
}

export default Piece
