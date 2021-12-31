import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import chessReducer from '../chess/chessSlice';

export const store = configureStore({
  reducer: {
    chess: chessReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
