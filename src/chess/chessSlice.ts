import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch, AppThunk } from '../app/store';
import { Piece } from './pieceClasses';


export interface State {
  board: number[]
  currentPlayer: 'White' | 'Black'
  selectedPiece: number | null
  selectedPieceLocation: number | null 
  desiredMove: number | null
  possibleMoves: number[]
  promotion: boolean
  check: boolean
  lastMove: number
};

const initialState: State = {
  board: new Array(64),
  currentPlayer: 'White',
  selectedPiece: null,
  selectedPieceLocation: null,
  desiredMove: null,
  possibleMoves: [],
  promotion: false,
  check: false,
  lastMove: 0
};

export const createBoard = () => {
  return (dispatch: AppDispatch) => {
    return new Promise<string>((resolve, reject) => {
      dispatch(setEmptyBoard())
      resolve("Empty board created")
      reject("Failed to create empty board")
    })
  }
}

const getPieceTypeAndColor = (num: number) => {
  const binary = (num).toString(2) 
  return {
    type: binary.substring(binary.length-3),
    color: binary.length === 5 ? 'Black' : 'White'
  }
}

const getAllCpuPieces = (getState: RootState) => {
    const myPieces: {type: number, location: number, moves: number[]}[] = []
    getState.chess.board.forEach((piece, square) => {
      const pieceDetails = getPieceTypeAndColor(piece)
      if(piece !== 0 && pieceDetails.color === getState.chess.currentPlayer) {
        const currentMoves = new Piece().legalMoves(getState.chess.board, square, piece, getState.chess.lastMove)
        //const filterOutUndifined = currentMoves.filter(move => {return move !== undefined})
        //console.log(currentMoves)
        myPieces.push({type: piece, location: square, moves: currentMoves})
      }
    })
    return myPieces
  }

//note if a piece has no moves it returns a array with undefined
export const cpuMoveHandler = () : AppThunk => {
   return (dispatch: AppDispatch, getState) => {
       const myCpuPieces = getAllCpuPieces(getState())
       const myNewPieces = myCpuPieces.filter((object) => {
        return object.moves.length > 0
       })
       console.log(myNewPieces)
       const myPiece = myNewPieces[Math.floor(Math.random() * myNewPieces.length)]
       //console.log(myPiece)
       if(myPiece !== undefined) {
        dispatch(setCpuMove({piece: myPiece.type, pieceLocation: myPiece.location, move: myPiece.moves[Math.floor(Math.random() * myPiece.moves.length)]}))
        dispatch(move())
       }
   }
}

//will be assigned setInterval to wait for player move, in global scope to be manipulated later
let currentInterval: NodeJS.Timeout 

export const moveFinder = createAsyncThunk<
//our promise will return a boolean
  boolean, number, {
    state: RootState
  }>
  ('moveFinder', 
    async (location, thunkApi) =>  {
      thunkApi.dispatch(selectPiece(location))

      const pieceSelected = new Promise<boolean>((resolve, reject) => {
        if(thunkApi.getState().chess.selectedPiece != null) {
          clearInterval(currentInterval)
          currentInterval = setInterval(() => {
            console.log('waiting for move')
            if(thunkApi.getState().chess.desiredMove != null ) {
              resolve(true)
            }
          }, 300)
        } else {
          console.log('Invalid piece selected')
          reject(false)
        }
      })
      const move = await pieceSelected
      return move
    }
  )

export const moveHandler = (location: number) : AppThunk =>
  async (dispatch: AppDispatch) => {
    const response = await dispatch(moveFinder(location))
    if(response.meta.requestStatus === 'fulfilled') {
      clearInterval(currentInterval)
      console.log('Promise returned true')
      dispatch(move())
      //dispatch(updateCheck())
      return true
    } 
    if(response.meta.requestStatus === 'rejected') {
      console.log('Promise returned false')
      clearInterval(currentInterval)
    }
  }

export const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    setEmptyBoard: (state) => {
      for(let i = 0; i < state.board.length; i++) {
        state.board[i] = new Piece().None
      }
    },
    setPieces: (state) => {
      for(let i = 0; i < state.board.length; i++) {
        if(i === 0) {
          state.board[0] = new Piece().Rook | new Piece().Black
          state.board[1] = new Piece().Knight | new Piece().Black
          state.board[2] = new Piece().Bishop | new Piece().Black
          state.board[3] = new Piece().Queen | new Piece().Black
          state.board[4] = new Piece().King | new Piece().Black
          state.board[5] = new Piece().Bishop | new Piece().Black
          state.board[6] = new Piece().Knight | new Piece().Black
          state.board[7] = new Piece().Rook | new Piece().Black
        }
        if(i >= 8 && i < 16) {
          state.board[i] = new Piece().Pawn | new Piece().Black
        }
        if(i >= 16 && i < 48) {
          state.board[i] = new Piece().None
        }
        if(i >= 48 && i < 56) {
          state.board[i] = new Piece().Pawn | new Piece().White
        }
        if(i === 56) {
          state.board[56] = new Piece().Rook | new Piece().White
          state.board[57] = new Piece().Knight | new Piece().White
          state.board[58] = new Piece().Bishop | new Piece().White
          state.board[59] = new Piece().Queen | new Piece().White
          state.board[60] = new Piece().King | new Piece().White
          state.board[61] = new Piece().Bishop | new Piece().White
          state.board[62] = new Piece().Knight | new Piece().White
          state.board[63] = new Piece().Rook | new Piece().White
        }
      }
      console.log('board set with pieces')
    },
    selectPiece: (state, location: PayloadAction<number>) => {
      const piece = state.board[location.payload]
      const pieceDetails = getPieceTypeAndColor(piece)
      if(pieceDetails.color === state.currentPlayer){
        state.selectedPieceLocation = location.payload
        state.selectedPiece = piece
        //Get possible moves for selected piece
        state.possibleMoves = new Piece().legalMoves(state.board, state.selectedPieceLocation, state.selectedPiece, state.lastMove)
      }
    },
    setCpuMove: (state, object: PayloadAction<{piece: number, pieceLocation: number, move: number}>) => {
      state.selectedPiece = object.payload.piece
      state.selectedPieceLocation = object.payload.pieceLocation
      state.desiredMove = object.payload.move
    },
    move: (state) => {
      if(state.desiredMove !== null && state.selectedPiece !== null && state.selectedPieceLocation !== null) {
        state.board[state.desiredMove] = state.selectedPiece
        state.board[state.selectedPieceLocation] = new Piece().None
        state.lastMove = state.desiredMove
        // Reset
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
    },
    playerMove: (state, location: PayloadAction<number>) => {
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
        }
        if(square > 55 && square <= 63 && pieceDetails.type === '001') {
          state.board[square] = piece.payload
          state.promotion = false
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
        //Check each enemy piece to see if the opposing king is in check
        if(piece !== 0 && pieceDetails.color !== state.currentPlayer) {
          pieceMoves = new Piece().legalMoves(state.board, square, piece, state.lastMove)
          const playerInCheck = pieceMoves.find(move => {
          const attackedPieceDetails = getPieceTypeAndColor(state.board[move])
          return attackedPieceDetails.type === '110'
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

export const { setPieces, setEmptyBoard, selectPiece, move, playerMove, promotePawn, allowPromotion, updateCheck, setCpuMove  } = chessSlice.actions;

export const selectBoard = (state: RootState) => state.chess.board
export const selectCurrentPlayer = (state: RootState) => state.chess.currentPlayer
export const selectCurrentPiece = (state: RootState) => state.chess.selectedPiece
export const selectCurrentPieceLocation = (state: RootState) => state.chess.selectedPieceLocation
export const selectPossibleMoves = (state: RootState) => state.chess.possibleMoves
export const selectPromotion = (state: RootState) => state.chess.promotion
export const selectCheck = (state: RootState) => state.chess.check

export default chessSlice.reducer;


