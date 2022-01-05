import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch, AppThunk } from '../app/store';
import { Piece } from './pieceClass';
import {castle, updateCastleStates} from './pieceMethods'

export interface State {
  board: number[]
  gameStatus: 'InProgress' | 'Ended' | 'Draw' | null
  currentPlayer: 'White' | 'Black'
  humanColor: 'White' | 'Black' | null
  cpuColor: 'White' | 'Black' | null
  selectedPiece: number | null
  selectedPieceLocation: number | null 
  desiredMove: number | null
  possibleMoves: number[]
  promotion: boolean
  check: boolean
  lastMove: number
  canCastle: boolean[]
};

const initialState: State = {
  board: new Array(64),
  gameStatus: null,
  currentPlayer: 'White',
  humanColor: null,
  cpuColor: null,
  selectedPiece: null,
  selectedPieceLocation: null,
  desiredMove: null,
  possibleMoves: [],
  promotion: false,
  check: false,
  lastMove: 0,
  // castle indexies follow order:
  // 0: white's queenside
  // 1: white's kingside
  // 2: black's queenside
  // 3: black's kingside
  canCastle: [true, true, true, true]
};

export const getPieceTypeAndColor = (num: number) => {
  const binary = (num).toString(2) 
  return {
    type: binary.substring(binary.length-3),
    color: binary.length === 5 ? 'Black' : 'White'
  }
}

//Returns an array of objects whith information about each piece
const getAllPieceDetails = (getState: RootState, color: string | null) => {
    const piecesList: {type: number, location: number, moves: number[]}[] = []
    
    getState.chess.board.forEach((piece, square) => {
      const pieceDetails = getPieceTypeAndColor(piece)
      if(piece !== 0 && pieceDetails.color === color) {
        const moveList = new Piece().legalMoves(getState.chess.board, square, piece, getState.chess.lastMove, getState.chess.canCastle)
        piecesList.push({type: piece, location: square, moves: moveList})
      }
    })
    
    return piecesList.filter(piece => {
      return piece.moves.length > 0
    })
}

export const humanMoveHandler = (location: number) : AppThunk => {
  return (dispatch: AppDispatch, getState) => {
    dispatch(setPlayerMove(location))
    dispatch(movePiece())
    const opponentMoveablePieces = getAllPieceDetails(getState(), getState().chess.cpuColor)
    dispatch(updateCheckStatus())
    if(opponentMoveablePieces.length < 1) {
      dispatch(endGame())
    }
  }
}


export const cpuMoveHandler = () : AppThunk => {
   return (dispatch: AppDispatch, getState) => {
      const myCpuPieces = getAllPieceDetails(getState(), getState().chess.cpuColor)

      const myRandomPiece = myCpuPieces[Math.floor(Math.random() * myCpuPieces.length)]
      if(myRandomPiece !== undefined) {
        dispatch(setCpuMove(
          {
          piece: myRandomPiece.type, 
          pieceLocation: myRandomPiece.location, 
          move: myRandomPiece.moves[Math.floor(Math.random() * myRandomPiece.moves.length)]
        }))

        dispatch(movePiece())

        const opponentMoveablePieces = getAllPieceDetails(getState(), getState().chess.humanColor)
        dispatch(updateCheckStatus())

        if(opponentMoveablePieces.length < 1 && getState().chess.check === true ) {
          dispatch(endGame())
        }
        if(opponentMoveablePieces.length < 1 && getState().chess.check !== true ) {
          dispatch(drawGame())
        }
      }
   }
}

export const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    setPieces: (state) => {
      state.board[0] = new Piece().Rook | new Piece().Black
      state.board[1] = new Piece().Knight | new Piece().Black
      state.board[2] = new Piece().Bishop | new Piece().Black
      state.board[3] = new Piece().Queen | new Piece().Black
      state.board[4] = new Piece().King | new Piece().Black
      state.board[5] = new Piece().Bishop | new Piece().Black
      state.board[6] = new Piece().Knight | new Piece().Black
      state.board[7] = new Piece().Rook | new Piece().Black
      state.board[56] = new Piece().Rook | new Piece().White
      state.board[57] = new Piece().Knight | new Piece().White
      state.board[58] = new Piece().Bishop | new Piece().White
      state.board[59] = new Piece().Queen | new Piece().White
      state.board[60] = new Piece().King | new Piece().White
      state.board[61] = new Piece().Bishop | new Piece().White
      state.board[62] = new Piece().Knight | new Piece().White
      state.board[63] = new Piece().Rook | new Piece().White
      for(let i = 8; i < 56; i++) {
        if(i >= 8 && i < 16) {
          state.board[i] = new Piece().Pawn | new Piece().Black
        }
        if(i >= 16 && i < 48) {
          state.board[i] = new Piece().None
        }
        if(i >= 48 && i < 56) {
          state.board[i] = new Piece().Pawn | new Piece().White
        }
      }
    },
    setPlayerColors: (state, color: PayloadAction<string>) => {
      if(color.payload === 'White') {
        state.humanColor = 'White'
        state.cpuColor = 'Black'
        state.gameStatus = 'InProgress'
      } else {
        state.humanColor = 'Black'
        state.cpuColor = 'White'
        state.gameStatus = 'InProgress'
      }
    },
    selectPiece: (state, location: PayloadAction<number>) => {
      const piece = state.board[location.payload]
      const pieceDetails = getPieceTypeAndColor(piece)
      if(pieceDetails.color === state.currentPlayer){
        state.selectedPieceLocation = location.payload
        state.selectedPiece = piece
        //Get possible moves for selected piece
        state.possibleMoves = new Piece().legalMoves(state.board, state.selectedPieceLocation, state.selectedPiece, state.lastMove, state.canCastle)
      }
    },
    setPlayerMove: (state, location: PayloadAction<number>) => {
      state.possibleMoves.map(move => {
        if(move === location.payload) {
          state.desiredMove = location.payload
        }
        return move
      })
    },
    setCpuMove: (state, object: PayloadAction<{piece: number, pieceLocation: number, move: number}>) => {
      state.selectedPiece = object.payload.piece
      state.selectedPieceLocation = object.payload.pieceLocation
      state.desiredMove = object.payload.move
    },
    movePiece: (state) => {
      if(state.desiredMove !== null && state.selectedPiece !== null && state.selectedPieceLocation !== null) {
        const piece = getPieceTypeAndColor(state.selectedPiece)
        const king = '110'
        // handles enPassant
        // checks if friendly pawn moved to space behind last-moved enemy pawn
        if(state.lastMove === state.desiredMove + (state.currentPlayer === 'White' ? 8 : -8)
        && state.selectedPiece === new Piece().Pawn + (state.currentPlayer === 'White' ? new Piece().White
        : new Piece().Black)){
          state.board[state.lastMove] = new Piece().None
        }

        //handles castling
        if(piece.type === king){
          if (state.desiredMove === state.selectedPieceLocation + 2 || state.desiredMove === state.selectedPieceLocation-2){
            castle(state.board, state.selectedPiece, state.desiredMove, state.canCastle)
          }
        }

        state.board[state.desiredMove] = state.selectedPiece
        state.board[state.selectedPieceLocation] = new Piece().None
        state.lastMove = state.desiredMove
        //no pawns and either player only has bishop or knight 
        //Player can move but not in check
        if(state.canCastle.includes(true)){
          updateCastleStates(state.board, state.currentPlayer === 'White', state.canCastle)
      }
      const foundPawnToPromote = state.board.find((piece, square) => {
        return (square <= 7  && piece === 9) || (square > 55 && piece === 17)
      })
      if(foundPawnToPromote !== undefined) {
        state.promotion = true
      }

        // Reset
        if(state.promotion !== true) {
          if(state.currentPlayer === 'White') {
            state.currentPlayer = 'Black'
            state.selectedPiece = null
            state.desiredMove = null
          } else {
            state.currentPlayer = 'White'
            state.selectedPiece = null
            state.desiredMove = null
          }
        }
      }
    },
    promotePawn: (state, piece: PayloadAction<number>) => {
      state.board.map((currentPiece, square) => {
        const pieceDetails = getPieceTypeAndColor(currentPiece)
        if(square <= 7 && pieceDetails.type === '001') {
          state.board[square] = piece.payload
          state.promotion = false
          state.currentPlayer = 'Black'
          state.selectedPiece = null
          state.desiredMove = null
        }
        if(square > 55 && square <= 63 && pieceDetails.type === '001') {
          state.board[square] = piece.payload
          state.promotion = false
          state.currentPlayer = 'White'
          state.selectedPiece = null
          state.desiredMove = null
        }
        return currentPiece
      })
    },
    //This action will check after each move to see if a player is in check
    updateCheckStatus: (state) => {
      const isPlayerInCheck = state.board.find((piece, square) => {
        const pieceDetails = getPieceTypeAndColor(piece)
        var pieceMoves: number[]
        var move: number| undefined
        if(piece !== 0 && pieceDetails.color !== state.currentPlayer) {
          pieceMoves = new Piece().legalMoves(state.board, square, piece, state.lastMove, state.canCastle)
          const playerInCheck = pieceMoves.find(move => {
            const attackedPieceBinary = (state.board[move]).toString(2)
            const attackPieceType = attackedPieceBinary.substring(attackedPieceBinary.length-3)
            return attackPieceType === '110'
          })
          move = playerInCheck
        }
        return move !== undefined 
      })
      if(isPlayerInCheck !== undefined) {
        state.check = true 
      } else {
        state.check = false
      }
    },
    endGame: (state) => {
      state.gameStatus = 'Ended'
    },
    drawGame: (state) => {
      state.gameStatus = 'Draw'
    },
    resetGame: () => {
      return initialState
    }
  }
});

export const { 
  setPieces, 
  setPlayerColors,
  selectPiece, 
  setPlayerMove, 
  setCpuMove, 
  movePiece, 
  promotePawn, 
  updateCheckStatus, 
  endGame,
  drawGame,
  resetGame
} = chessSlice.actions;

export const selectBoard = (state: RootState) => state.chess.board
export const selectCurrentPlayer = (state: RootState) => state.chess.currentPlayer
export const selectCurrentPiece = (state: RootState) => state.chess.selectedPiece
export const selectCurrentPieceLocation = (state: RootState) => state.chess.selectedPieceLocation
export const selectPossibleMoves = (state: RootState) => state.chess.possibleMoves
export const selectPromotion = (state: RootState) => state.chess.promotion
export const selectCheck = (state: RootState) => state.chess.check
export const selectHumanColor = (state: RootState) => state.chess.humanColor
export const selectCpuColor = (state: RootState) => state.chess.cpuColor
export const selectGameStatus = (state: RootState) => state.chess.gameStatus

export default chessSlice.reducer;


