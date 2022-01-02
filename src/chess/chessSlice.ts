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
};

const initialState: State = {
  board: new Array(64),
  currentPlayer: 'White',
  selectedPiece: null,
  selectedPieceLocation: null,
  desiredMove: null,
  possibleMoves: [],
  promotion: false,
  check: false
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
      dispatch(updateCheck())
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
      let binary = (piece).toString(2)
      let pieceColor = binary.length === 5 ? 'Black' : 'White';
      //Get possible moves for selected piece
      if(pieceColor === state.currentPlayer){
        state.selectedPieceLocation = location.payload
        state.selectedPiece = piece
        //console.log('Selected piece and location: ' + state.selectedPiece + " " + state.selectedPieceLocation)
        state.possibleMoves = new Piece().trueLegalMoves(state.board, state.selectedPieceLocation, state.selectedPiece)
        //console.log('above Pieces true legal moves ' + state.possibleMoves)
      }
      //console.log('Here are my selected piece moves: ' + state.possibleMoves)
    },
    move: (state) => {
      if(state.desiredMove !== null && state.selectedPiece !== null && state.selectedPieceLocation !== null) {
        console.log('moving piece')
        state.board[state.desiredMove] = state.selectedPiece
        state.board[state.selectedPieceLocation] = new Piece().None
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
    //this action may be deleted was created incase we need to reset these three states manually
    clear: (state) => {
      state.selectedPiece = null
      state.desiredMove = null
      state.possibleMoves = []
    },
    allowPromotion: (state) => {
      state.promotion = true
    },
    promotePawn: (state, piece: PayloadAction<number>) => {
      state.board.find((currentPiece, square) => {
        const binary = (currentPiece).toString(2)
        const piece_color = binary.length === 5 ? binary.slice(2) : binary.slice(1) 
        if(square <= 7 && piece_color === '001') {
          state.board[square] = piece.payload
          state.promotion = false
        }
        if(square > 55 && square <= 63 && piece_color === '001') {
          state.board[square] = piece.payload
          state.promotion = false
        }
        return currentPiece
      })
    },
    //This action will check after each move to see if a player is in check
    updateCheck: (state) => {
      const isPlayerInCheck = state.board.find((piece, square) => {
        const pieceBinary = (piece).toString(2)
        const pieceColor = pieceBinary.length === 5 ? 'Black' : 'White'
        var pieceMoves: number[]
        var move: number| undefined
        if(piece !== 0 && pieceColor !== state.currentPlayer) {
          pieceMoves = new Piece().legalMoves(state.board, square, piece)
          const playerInCheck = pieceMoves.find(move => {
          const attackedPieceBinary = (state.board[move]).toString(2)
          const attackPieceType = attackedPieceBinary.substring(attackedPieceBinary.length-3)
          return attackPieceType === '110'
          })
          move = playerInCheck
          console.log(playerInCheck)
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

export const { setPieces, setEmptyBoard, selectPiece, move, playerMove, promotePawn, clear, allowPromotion, updateCheck } = chessSlice.actions;

export const selectBoard = (state: RootState) => state.chess.board
export const selectCurrentPlayer = (state: RootState) => state.chess.currentPlayer
export const selectCurrentPiece = (state: RootState) => state.chess.selectedPiece
export const selectCurrentPieceLocation = (state: RootState) => state.chess.selectedPieceLocation
export const selectPossibleMoves = (state: RootState) => state.chess.possibleMoves
export const selectPromotion = (state: RootState) => state.chess.promotion
export const selectCheck = (state: RootState) => state.chess.check

export default chessSlice.reducer;


