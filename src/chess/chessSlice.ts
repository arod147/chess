import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useAppSelector } from '../app/hooks';
import { RootState, AppDispatch, AppThunk } from '../app/store';
import { Piece } from './pieceClass';
import {castle, updateCastleStates} from './pieceMethods'

export interface State {
  board: number[]
  gameStarted: boolean
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
  gameStarted: false,
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

export const useBoard = () => {
  return useAppSelector(selectBoard)
}

export const createBoard = () => {
  return (dispatch: AppDispatch) => {
    return new Promise<string>((resolve, reject) => {
      dispatch(setEmptyBoard())
      resolve("Empty board created")
      reject("Failed to create empty board")
    })
  }
}

export const getPieceTypeAndColor = (num: number) => {
  const binary = (num).toString(2) 
  return {
    type: binary.substring(binary.length-3),
    color: binary.length === 5 ? 'Black' : 'White'
  }
}

const getAllPieceDetails = (getState: RootState, color: string | null) => {
    const cpuPieces: {type: number, location: number, moves: number[]}[] = []
    getState.chess.board.forEach((piece, square) => {
      const pieceDetails = getPieceTypeAndColor(piece)
      if(piece !== 0 && pieceDetails.color === color) {
        const moveList = new Piece().legalMoves(getState.chess.board, square, piece, getState.chess.lastMove, getState.chess.canCastle)
        cpuPieces.push({type: piece, location: square, moves: moveList})
      }
    })
    return cpuPieces
}

//note if a piece has no moves it returns a array with undefined
export const cpuMoveHandler = () : AppThunk => {
   return (dispatch: AppDispatch, getState) => {
       const myCpuPieces = getAllPieceDetails(getState(), getState().chess.cpuColor)
       //console.log(myCpuPieces)
       const myCpuPiecesWithMoves = myCpuPieces.filter((object) => {
        return object.moves.length > 0
       })
       const myRandomPiece = myCpuPiecesWithMoves[Math.floor(Math.random() * myCpuPiecesWithMoves.length)]
       if(myRandomPiece !== undefined) {
        dispatch(setCpuMove(
          {
          piece: myRandomPiece.type, 
          pieceLocation: myRandomPiece.location, 
          move: myRandomPiece.moves[Math.floor(Math.random() * myRandomPiece.moves.length)]
        }))
        dispatch(movePiece())
        const pieces = getAllPieceDetails(getState(), getState().chess.humanColor)
        const myPiecesWithMoves = pieces.filter((object) => {
        return object.moves.length > 0
        })
        dispatch(updateCheck())
        if(myPiecesWithMoves.length < 1) {
          dispatch(endGame())
        }
       }
   }
}

export const moveHandler = (location: number) : AppThunk => {
  return (dispatch: AppDispatch, getState) => {
    dispatch(getPlayerSelectedMove(location))
    dispatch(movePiece())
    const pieces = getAllPieceDetails(getState(), getState().chess.cpuColor)
    const myPiecesWithMoves = pieces.filter((object) => {
      return object.moves.length > 0
      })
      dispatch(updateCheck())
      if(myPiecesWithMoves.length < 1) {
        dispatch(endGame())
      }
  }
}
  

export const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    setPlayerColors: (state, color: PayloadAction<string>) => {
      if(color.payload === 'White') {
        state.humanColor = 'White'
        state.cpuColor = 'Black'
        state.gameStarted = true
      } else {
        state.humanColor = 'Black'
        state.cpuColor = 'White'
        state.gameStarted = true
      }
    },
    setEmptyBoard: (state) => {
      for(let i = 0; i < state.board.length; i++) {
        state.board[i] = new Piece().None
      }
    },
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
    setCpuMove: (state, object: PayloadAction<{piece: number, pieceLocation: number, move: number}>) => {
      state.selectedPiece = object.payload.piece
      state.selectedPieceLocation = object.payload.pieceLocation
      state.desiredMove = object.payload.move
    },
    movePiece: (state) => {
      if(state.desiredMove !== null && state.selectedPiece !== null && state.selectedPieceLocation !== null) {
        
        // handles enPassant
        // checks if friendly pawn moved to space behind last-moved enemy pawn
        if(state.lastMove === state.desiredMove + (state.currentPlayer === 'White' ? 8 : -8)
        && state.selectedPiece === new Piece().Pawn + (state.currentPlayer === 'White' ? new Piece().White 
        : new Piece().Black)){
          state.board[state.lastMove] = new Piece().None
        }

        //handles castling
        if(state.selectedPiece === new Piece().King + (state.currentPlayer === 'White' ? new Piece().White : new Piece().Black)){
          if (state.desiredMove === state.selectedPieceLocation + 2 || state.desiredMove === state.selectedPieceLocation-2){
            castle(state.board, state.selectedPiece, state.desiredMove, state.canCastle)
          }
        }

        state.board[state.desiredMove] = state.selectedPiece
        state.board[state.selectedPieceLocation] = new Piece().None
        state.lastMove = state.desiredMove

        if(state.canCastle.includes(true)){
          updateCastleStates(state.board, state.currentPlayer === 'White', state.canCastle)
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
    endGame: () => {
      return initialState
    },
    getPlayerSelectedMove: (state, location: PayloadAction<number>) => {
      state.possibleMoves.map(move => {
        if(move === location.payload) {
          state.desiredMove = location.payload
        }
        return move
      })
    },
    allowPromotion: (state) => {
      state.promotion = true
    },
    promotePawn: (state, piece: PayloadAction<number>) => {
      state.board.map((currentPiece, square) => {
        const pieceDetails = getPieceTypeAndColor(currentPiece)
        if(square <= 7 && pieceDetails.type === '001') {
          state.board[square] = piece.payload
          state.promotion = false
          state.currentPlayer = 'White'
          state.selectedPiece = null
          state.desiredMove = null
        }
        if(square > 55 && square <= 63 && pieceDetails.type === '001') {
          state.board[square] = piece.payload
          state.promotion = false
          state.currentPlayer = 'Black'
          state.selectedPiece = null
          state.desiredMove = null
        }
        return currentPiece
      })
    },
    //This action will check after each move to see if a player is in check
    updateCheck: (state) => {
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
}
});

export const {
  setPieces, 
  setEmptyBoard, 
  selectPiece, 
  movePiece,
  getPlayerSelectedMove, 
  promotePawn, 
  allowPromotion, 
  updateCheck, 
  setCpuMove, 
  setPlayerColors,
  endGame
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
export const selectGameStated = (state: RootState) => state.chess.gameStarted

export default chessSlice.reducer;


