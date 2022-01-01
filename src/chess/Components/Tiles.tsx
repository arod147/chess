import { FunctionComponent } from 'react'


type TileProps = {
    tileColor: string;
    onClick: Function;
} &typeof defaultProps;

const defaultProps = {
    tileColor: 'white',
    onClick: () => {console.log('No Function Provided')}
}

const Tile: FunctionComponent<TileProps> = ({ tileColor, onClick, children}) => {
    return (
        <div className={tileColor} onClick={onClick}>
            { children }
        </div>
    )
}

export default Tile
